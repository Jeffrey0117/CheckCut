/**
 * YouTube Import Service
 * Shared pipeline: yt-dlp download (≤720p mp4) → Pokkit upload → CheckCut video record.
 * Used by:
 *  - /api/v1/studio/import-yt  (browser-session admin, synchronous)
 *  - /api/v1/import-yt         (X-API-Key, async job — consumers like CourseBloom poll)
 *
 * The async job store is in-memory (single-process pm2 app): jobs live 1h after
 * completion, active imports are capped so a burst of teachers can't fork-bomb yt-dlp.
 */

import { spawn, execFileSync } from 'node:child_process'
import { promises as fsp } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { uploadToPokkit } from './pokkit.js'
import { createVideo } from './database.js'

export function isYoutubeUrl(url) {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url || '')
}

// yt-dlp invocation: `py -m yt_dlp` by default (override with YT_DLP_CMD, space-separated)
function ytDlpCmd() {
  const cmd = (process.env.YT_DLP_CMD || 'py -m yt_dlp').split(' ')
  return { bin: cmd[0], baseArgs: cmd.slice(1) }
}

export function statusFromVisibility(v) {
  const s = (v || '').toString().toLowerCase()
  return (s === 'private' || s === 'embed_only') ? 'private' : 'published'
}

/**
 * Download a YouTube video with yt-dlp (cap ~1080p, mp4). Resolves to the temp
 * file path — caller is responsible for deleting it. Times out after 10 min.
 *
 * ⚠️ 格式 fallback 血淚(2026-07-11 蝦皮課實案):bestvideo+bestaudio 需要 ffmpeg 合流,
 * PM2 環境 ffmpeg 常不在 PATH → yt-dlp 靜默退到唯一 premuxed mp4 = itag18(640×360),
 * 整批課程糊到看不見字。所以:(1) 上限提到 1080;(2) fallback 不再掛 premuxed 360p,
 * 抓完由呼叫端驗高度;(3) 部署端務必確保 ffmpeg 在 PATH(參考 pokkit ensureFfmpegInPath)。
 */
export async function downloadYoutube(url) {
  const tmp = path.join(os.tmpdir(), `ytimport-${crypto.randomBytes(6).toString('hex')}.mp4`)
  const { bin, baseArgs } = ytDlpCmd()
  const args = [
    ...baseArgs,
    '-f', 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]',
    '--merge-output-format', 'mp4',
    '--no-playlist',
    '-o', tmp,
    url,
  ]

  await new Promise((resolve, reject) => {
    const proc = spawn(bin, args, { windowsHide: true })
    let stderr = ''
    proc.stderr.on('data', (d) => { stderr += d.toString() })
    const killTimer = setTimeout(() => { proc.kill(); reject(new Error('yt-dlp timeout (10m)')) }, 10 * 60 * 1000)
    proc.on('error', (e) => { clearTimeout(killTimer); reject(new Error(`yt-dlp spawn failed: ${e.message}`)) })
    proc.on('close', (code) => {
      clearTimeout(killTimer)
      code === 0 ? resolve() : reject(new Error(`yt-dlp exited ${code}: ${stderr.slice(-300)}`))
    })
  })

  // 抓完驗高度:<480p 直接大聲失敗(寧可匯入失敗,不要靜默收下 360p 垃圾)
  const height = probeVideoHeight(tmp)
  if (height > 0 && height < 480) {
    await fsp.rm(tmp, { force: true }).catch(() => {})
    throw new Error(`下載結果只有 ${height}p(可能 ffmpeg 不在 PATH 導致無法合流高畫質)——已中止匯入`)
  }
  if (height === 0) {
    console.warn('[ytImport] ffprobe 不可用,略過畫質驗證(建議確保 ffmpeg/ffprobe 在 PATH)')
  }

  return tmp
}

/** ffprobe 影片高度;probe 失敗回 0(不擋流程,只記警告) */
function probeVideoHeight(file) {
  try {
    const out = execFileSync('ffprobe', [
      '-v', 'error', '-select_streams', 'v:0',
      '-show_entries', 'stream=height', '-of', 'csv=p=0', file,
    ], { timeout: 60000, windowsHide: true }).toString().trim()
    return parseInt(out, 10) || 0
  } catch {
    return 0
  }
}

/**
 * Full import pipeline. Returns { video, pokkit } on success.
 * `onProgress(phase)` is optional: 'downloading' | 'uploading'.
 */
export async function importYoutubeVideo({ url, title, visibility }, onProgress) {
  if (!isYoutubeUrl(url)) throw new Error('請提供有效的 YouTube 網址')

  let tmp = null
  try {
    if (onProgress) onProgress('downloading')
    tmp = await downloadYoutube(url)

    if (onProgress) onProgress('uploading')
    const buffer = await fsp.readFile(tmp)
    const pokkit = await uploadToPokkit(buffer, 'yt-import.mp4', 'video/mp4')

    const video = createVideo({
      title: (title || 'YouTube import').toString().slice(0, 300),
      description: '',
      pokkit_url: pokkit.mediaUrl,
      thumbnail_url: pokkit.thumbUrl,
      source_url: url,
      status: statusFromVisibility(visibility),
    })

    return { video, pokkit }
  } finally {
    if (tmp) fsp.unlink(tmp).catch(() => {})
  }
}

// ── Async job store (for the X-API-Key import endpoint) ──────────────────────

const jobs = new Map() // jobId -> { status, error, video, createdAt, finishedAt }
const JOB_TTL_MS = 60 * 60 * 1000 // finished jobs stay queryable for 1h
const MAX_ACTIVE = 2 // concurrent yt-dlp downloads cap

function sweepJobs() {
  const now = Date.now()
  for (const [id, job] of jobs) {
    if (job.finishedAt && now - job.finishedAt > JOB_TTL_MS) jobs.delete(id)
    // safety net: runaway jobs older than 30 min are marked failed
    if (!job.finishedAt && now - job.createdAt > 30 * 60 * 1000) {
      job.status = 'error'
      job.error = '匯入逾時'
      job.finishedAt = now
    }
  }
}

export function activeImportCount() {
  sweepJobs()
  let n = 0
  for (const job of jobs.values()) {
    if (job.status === 'downloading' || job.status === 'uploading' || job.status === 'queued') n++
  }
  return n
}

/**
 * Kick off a background import. Returns the job id immediately.
 * Throws if the concurrent-import cap is reached.
 */
export function startImportJob({ url, title, visibility }) {
  if (!isYoutubeUrl(url)) throw new Error('請提供有效的 YouTube 網址')
  if (activeImportCount() >= MAX_ACTIVE) {
    const err = new Error('同時匯入的影片太多，請稍後再試')
    err.code = 'TOO_MANY_IMPORTS'
    throw err
  }

  const jobId = crypto.randomBytes(12).toString('hex')
  const job = { status: 'queued', error: null, video: null, createdAt: Date.now(), finishedAt: null }
  jobs.set(jobId, job)

  // fire and forget — status is polled via getImportJob
  importYoutubeVideo({ url, title, visibility }, (phase) => { job.status = phase })
    .then(({ video, pokkit }) => {
      job.status = 'done'
      job.video = { id: video.id, pokkitStatus: pokkit.status }
      job.finishedAt = Date.now()
    })
    .catch((err) => {
      console.error('[IMPORT-YT job]', err.message)
      job.status = 'error'
      job.error = err.message || 'YouTube 匯入失敗'
      job.finishedAt = Date.now()
    })

  return jobId
}

export function getImportJob(jobId) {
  sweepJobs()
  return jobs.get(jobId) || null
}
