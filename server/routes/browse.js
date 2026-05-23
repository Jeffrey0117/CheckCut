/**
 * Browse Routes
 * Search, categories, and featured content
 */

import { Router } from 'express'
import { searchVideos, getCategories, getFeaturedVideos } from '../services/database.js'
import { toPublicVideo } from '../helpers/video.js'

const router = Router()

// GET /search?q= — full text search on videos
router.get('/search', (req, res) => {
  try {
    const query = req.query.q || ''
    if (!query.trim()) {
      return res.json({ success: true, data: [] })
    }

    const videos = searchVideos(query)
    res.json({ success: true, data: videos.map(toPublicVideo) })
  } catch (error) {
    console.error('[SEARCH]', error.message)
    res.status(500).json({ error: 'Search failed' })
  }
})

// GET /categories — distinct categories with count
router.get('/categories', (req, res) => {
  try {
    const categories = getCategories()
    res.json({ success: true, data: categories })
  } catch (error) {
    console.error('[CATEGORIES]', error.message)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /featured — featured videos + latest 20
router.get('/featured', (req, res) => {
  try {
    const result = getFeaturedVideos(20)
    res.json({
      success: true,
      data: {
        featured: result.featured.map(toPublicVideo),
        latest: result.latest.map(toPublicVideo),
      },
    })
  } catch (error) {
    console.error('[FEATURED]', error.message)
    res.status(500).json({ error: 'Failed to fetch featured videos' })
  }
})

export default router
