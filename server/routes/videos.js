/**
 * Videos Routes
 * Public video listing and detail endpoints
 * Note: pokkit_url is hidden from public API, replaced with stream_url
 */

import { Router } from 'express'
import { getVideos, getVideoById } from '../services/database.js'
import { toPublicVideo } from '../helpers/video.js'

const router = Router()

// GET / — list videos with pagination, filters
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const { person_id, category } = req.query
    const status = req.query.status || 'published'

    const result = getVideos({ page, limit, person_id, category, status })

    res.json({
      success: true,
      data: result.videos.map(toPublicVideo),
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    })
  } catch (error) {
    console.error('[VIDEOS]', error.message)
    res.status(500).json({ error: 'Failed to fetch videos' })
  }
})

// GET /:id — single video detail (increments view_count)
router.get('/:id', (req, res) => {
  try {
    const video = getVideoById(req.params.id)
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }

    res.json({ success: true, data: toPublicVideo(video) })
  } catch (error) {
    console.error('[VIDEO]', error.message)
    res.status(500).json({ error: 'Failed to fetch video' })
  }
})

export default router
