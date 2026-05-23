/**
 * Stream Routes
 * Video proxy with hotlink protection
 * Streams video from Pokkit while enforcing referer checks
 */

import { Router } from 'express'
import { validateReferer } from '../services/hotlink.js'
import { getVideoByIdRaw } from '../services/database.js'

const router = Router()

// GET /:videoId — stream video with hotlink protection
router.get('/:videoId', async (req, res) => {
  try {
    const video = getVideoByIdRaw(req.params.videoId)
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    const { allowed, reason } = validateReferer(req)
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden', reason })
    }

    // Build upstream request headers
    const headers = {}
    if (req.headers.range) {
      headers.Range = req.headers.range
    }

    const upstream = await fetch(video.pokkit_url, { headers })

    if (!upstream.ok && upstream.status !== 206) {
      return res.status(upstream.status).json({ error: 'Upstream fetch failed' })
    }

    // Forward status (200 or 206 for Range)
    res.status(upstream.status)

    // Forward relevant headers
    const forwardHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'etag',
      'last-modified',
    ]
    for (const header of forwardHeaders) {
      const value = upstream.headers.get(header)
      if (value) {
        res.setHeader(header, value)
      }
    }

    // Cache for 1 hour
    res.setHeader('Cache-Control', 'public, max-age=3600')

    // Pipe upstream body to response
    const reader = upstream.body.getReader()
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          res.end()
          return
        }
        if (!res.write(value)) {
          await new Promise((resolve) => res.once('drain', resolve))
        }
      }
    }

    req.on('close', () => {
      reader.cancel().catch(() => {})
    })

    await pump()
  } catch (error) {
    if (!res.headersSent) {
      console.error('[STREAM]', error.message)
      res.status(500).json({ error: 'Stream failed' })
    }
  }
})

export default router
