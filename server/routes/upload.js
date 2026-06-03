/**
 * Upload Route (server-to-server)
 * Accepts a multipart video file, forwards it to Pokkit storage, then creates
 * a CheckCut video record pointing at the stored file. Returns the embed and
 * stream URLs a consumer (e.g. CourseBloom) can use directly.
 *
 * Auth: X-API-Key (CHECKCUT_API_KEY) — NOT the browser session.
 * Mounted at: POST /api/v1/upload
 */

import { Router } from 'express'
import multer from 'multer'
import { requireApiKey } from '../middleware/apikey.js'
import { uploadToPokkit } from '../services/pokkit.js'
import { createVideo } from '../services/database.js'

const router = Router()

const MAX_FILE_SIZE = Number(process.env.MAX_UPLOAD_SIZE) || 500 * 1024 * 1024 // 500MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
})

/**
 * Build the public-facing base URL for embed/stream links.
 * Prefers PUBLIC_URL, otherwise derives from the incoming request.
 */
function getPublicBaseUrl(req) {
  const configured = (process.env.PUBLIC_URL || '').replace(/\/$/, '')
  if (configured) return configured
  const proto = req.get('x-forwarded-proto') || req.protocol || 'http'
  const host = req.get('host')
  return `${proto}://${host}`
}

router.post('/', requireApiKey, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided. Use multipart field "file".' })
    }

    const { originalname, mimetype, buffer } = req.file

    // Only videos are supported through this endpoint for now.
    if (!mimetype || !mimetype.startsWith('video/')) {
      return res.status(400).json({ error: `Unsupported file type: ${mimetype || 'unknown'}. Expected a video.` })
    }

    // 1. Push bytes to Pokkit (handles transcoding + thumbnail).
    const pokkit = await uploadToPokkit(buffer, originalname, mimetype)

    // 2. Create the CheckCut video record.
    const title = (req.body?.title || originalname || 'Untitled').toString().slice(0, 300)
    const description = (req.body?.description || '').toString()

    const video = createVideo({
      title,
      description,
      pokkit_url: pokkit.mediaUrl,
      thumbnail_url: pokkit.thumbUrl,
      duration: 0,
      source_url: '',
      status: 'published',
    })

    // 3. Return consumer-friendly URLs.
    const base = getPublicBaseUrl(req)
    return res.status(201).json({
      success: true,
      data: {
        id: video.id,
        embed_url: `${base}/embed/${video.id}`,
        stream_url: `${base}/api/v1/stream/${video.id}`,
        thumbnail_url: pokkit.thumbUrl,
        duration: 0,
        status: pokkit.status,
      },
    })
  } catch (error) {
    console.error('[UPLOAD]', error.message)
    if (error instanceof multer.MulterError) {
      const msg = error.code === 'LIMIT_FILE_SIZE'
        ? `File too large (max ${Math.floor(MAX_FILE_SIZE / 1024 / 1024)}MB)`
        : error.message
      return res.status(400).json({ error: msg })
    }
    return res.status(500).json({ error: error.message || 'Upload failed' })
  }
})

export default router
