/**
 * SeedBlog Integration Routes
 * Proxy SeedBlog author/article data for the Person page
 */

import { Router } from 'express'
import { getAuthor, getAuthorArticles, getBaseUrl } from '../services/seedblog.js'

const router = Router()

// GET /config — expose seedblog base URL to client
router.get('/config', (req, res) => {
  res.json({ success: true, data: { base_url: getBaseUrl() } })
})

// GET /authors/:authorId — author profile
router.get('/authors/:authorId', async (req, res) => {
  try {
    const author = await getAuthor(req.params.authorId)
    if (!author) {
      return res.status(404).json({ error: 'Author not found' })
    }
    res.json({ success: true, data: author })
  } catch (error) {
    console.error('[SEEDBLOG] Author fetch failed:', error.message)
    res.status(502).json({ error: 'Failed to fetch author from SeedBlog' })
  }
})

// GET /authors/:authorId/articles — author's published articles
router.get('/authors/:authorId/articles', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const articles = await getAuthorArticles(req.params.authorId, { page, limit })
    res.json({ success: true, data: articles })
  } catch (error) {
    console.error('[SEEDBLOG] Articles fetch failed:', error.message)
    res.status(502).json({ error: 'Failed to fetch articles from SeedBlog' })
  }
})

export default router
