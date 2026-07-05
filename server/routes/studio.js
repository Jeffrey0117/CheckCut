/**
 * Studio Routes (session-authed, for the logged-in admin in the browser)
 * - POST /upload      : drag-drop a video file → Pokkit → create video
 * - POST /import-yt   : paste a YouTube URL → yt-dlp download → Pokkit → create video
 *
 * Mounted at /api/v1/studio. Auth: browser session (requireAuth).
 * The yt-dlp/Pokkit pipeline lives in services/ytImport.js (shared with the
 * X-API-Key async import route used by CourseBloom).
 */

import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../middleware/auth.js'
import { uploadToPokkit } from '../services/pokkit.js'
import { createVideo } from '../services/database.js'
import { importYoutubeVideo, statusFromVisibility, isYoutubeUrl } from '../services/ytImport.js'

const router = Router()
router.use(requireAuth)

const MAX_FILE_SIZE = Number(process.env.MAX_UPLOAD_SIZE) || 500 * 1024 * 1024
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_SIZE } })

// ── POST /upload : multipart file ──
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file (multipart field "file")' })
    const { originalname, mimetype, buffer } = req.file
    if (!mimetype || !mimetype.startsWith('video/')) {
      return res.status(400).json({ error: `Unsupported type: ${mimetype}` })
    }
    const pokkit = await uploadToPokkit(buffer, originalname, mimetype)
    const video = createVideo({
      title: (req.body?.title || originalname || 'Untitled').toString().slice(0, 300),
      description: (req.body?.description || '').toString(),
      pokkit_url: pokkit.mediaUrl,
      thumbnail_url: pokkit.thumbUrl,
      status: statusFromVisibility(req.body?.visibility),
    })
    res.status(201).json({ success: true, data: { id: video.id, status: pokkit.status } })
  } catch (err) {
    console.error('[STUDIO upload]', err.message)
    res.status(500).json({ error: err.message || 'Upload failed' })
  }
})

// ── POST /import-yt : { url, title?, visibility? } ──
router.post('/import-yt', async (req, res) => {
  const url = (req.body?.url || '').toString().trim()
  if (!isYoutubeUrl(url)) {
    return res.status(400).json({ error: '請提供有效的 YouTube 網址' })
  }

  try {
    const { video, pokkit } = await importYoutubeVideo({
      url,
      title: req.body?.title,
      visibility: req.body?.visibility,
    })
    res.status(201).json({ success: true, data: { id: video.id, status: pokkit.status, source_url: url } })
  } catch (err) {
    console.error('[STUDIO import-yt]', err.message)
    res.status(500).json({ error: err.message || 'YouTube 匯入失敗' })
  }
})

export default router
