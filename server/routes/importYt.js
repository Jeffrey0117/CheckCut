/**
 * YouTube Import Route (server-to-server)
 * Async job flavor of the studio import: consumers (e.g. CourseBloom) kick off
 * an import and poll for the result instead of holding a 10-minute request.
 *
 *   POST /api/v1/import-yt          { url, title?, visibility? } → 202 { job_id }
 *   GET  /api/v1/import-yt/:jobId   → { status, error?, video? }
 *
 * Auth: X-API-Key (CHECKCUT_API_KEY) — NOT the browser session.
 */

import { Router } from 'express'
import { requireApiKey } from '../middleware/apikey.js'
import { startImportJob, getImportJob, isYoutubeUrl } from '../services/ytImport.js'

const router = Router()
router.use(requireApiKey)

/** Public-facing base URL for embed/stream links (same logic as upload route). */
function getPublicBaseUrl(req) {
  const configured = (process.env.PUBLIC_URL || '').replace(/\/$/, '')
  if (configured) return configured
  const proto = req.get('x-forwarded-proto') || req.protocol || 'http'
  const host = req.get('host')
  return `${proto}://${host}`
}

// ── POST / : start an import job ──
router.post('/', (req, res) => {
  const url = (req.body?.url || '').toString().trim()
  if (!isYoutubeUrl(url)) {
    return res.status(400).json({ error: '請提供有效的 YouTube 網址' })
  }

  try {
    const jobId = startImportJob({
      url,
      title: req.body?.title,
      visibility: req.body?.visibility,
    })
    return res.status(202).json({ success: true, data: { job_id: jobId } })
  } catch (err) {
    if (err.code === 'TOO_MANY_IMPORTS') {
      return res.status(429).json({ error: err.message })
    }
    console.error('[IMPORT-YT start]', err.message)
    return res.status(500).json({ error: err.message || 'YouTube 匯入失敗' })
  }
})

// ── GET /:jobId : poll job status ──
router.get('/:jobId', (req, res) => {
  const job = getImportJob(req.params.jobId)
  if (!job) return res.status(404).json({ error: '找不到匯入工作（可能已過期）' })

  const payload = { status: job.status }
  if (job.status === 'error') payload.error = job.error

  if (job.status === 'done' && job.video) {
    const base = getPublicBaseUrl(req)
    payload.video = {
      id: job.video.id,
      embed_url: `${base}/embed/${job.video.id}`,
      stream_url: `${base}/api/v1/stream/${job.video.id}`,
      status: job.video.pokkitStatus,
    }
  }

  return res.json({ success: true, data: payload })
})

export default router
