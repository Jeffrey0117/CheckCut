/**
 * Admin Videos Routes
 * CRUD operations for video management (requires auth)
 * Note: Admin routes return pokkit_url (unlike public routes)
 */

import { Router } from 'express'
import { getVideos, getVideoByIdRaw, createVideo, updateVideo, deleteVideo } from '../services/database.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)

// GET / — list all videos (including drafts)
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 200
    const result = getVideos({ page, limit, status: null })
    res.json({
      success: true,
      data: result.videos,
      meta: { total: result.total, page, limit },
    })
  } catch (error) {
    console.error('[ADMIN-VIDEOS]', error.message)
    res.status(500).json({ error: 'Failed to fetch videos' })
  }
})

// GET /:id — single video with pokkit_url
router.get('/:id', (req, res) => {
  try {
    const video = getVideoByIdRaw(req.params.id)
    if (!video) {
      return res.status(404).json({ error: 'Video not found' })
    }
    res.json({ success: true, data: video })
  } catch (error) {
    console.error('[ADMIN-VIDEO]', error.message)
    res.status(500).json({ error: 'Failed to fetch video' })
  }
})

// POST / — create video
router.post('/', (req, res) => {
  try {
    const { title, description, pokkit_url, thumbnail_url, duration, person_id, category, tags, source_url, status, sort_order } = req.body

    if (!pokkit_url) {
      return res.status(400).json({ error: 'pokkit_url is required' })
    }
    if (!title) {
      return res.status(400).json({ error: 'title is required' })
    }

    const video = createVideo({ title, description, pokkit_url, thumbnail_url, duration, person_id, category, tags, source_url, status, sort_order })
    res.status(201).json({ success: true, data: video })
  } catch (error) {
    console.error('[ADMIN-VIDEO CREATE]', error.message)
    res.status(500).json({ error: 'Failed to create video' })
  }
})

// PUT /:id — update video
router.put('/:id', (req, res) => {
  try {
    const video = updateVideo(req.params.id, req.body)
    res.json({ success: true, data: video })
  } catch (error) {
    if (error.message === 'Video not found') {
      return res.status(404).json({ error: error.message })
    }
    console.error('[ADMIN-VIDEO UPDATE]', error.message)
    res.status(500).json({ error: 'Failed to update video' })
  }
})

// DELETE /:id — delete video
router.delete('/:id', (req, res) => {
  try {
    deleteVideo(req.params.id)
    res.json({ success: true })
  } catch (error) {
    console.error('[ADMIN-VIDEO DELETE]', error.message)
    res.status(500).json({ error: 'Failed to delete video' })
  }
})

export default router
