/**
 * Embed Routes
 * Self-contained video player page for iframe embedding
 * Used by 狂人說 (SeedBlog) to embed CheckCut videos
 */

import { Router } from 'express'
import { getVideoByIdRaw } from '../services/database.js'
import { validateReferer } from '../services/hotlink.js'

const router = Router()

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// GET /:videoId — embedded video player page
router.get('/:videoId', (req, res) => {
  try {
    const video = getVideoByIdRaw(req.params.videoId)
    if (!video) {
      const html404 = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Not Found</title>
<style>*{margin:0;padding:0}body{background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui}</style>
</head><body><p>Video not found</p></body></html>`
      return res.status(404).type('html').send(html404)
    }

    // Private (embed-only) videos: only render when the request comes from an
    // allowed origin (e.g. classroo). A leaked URL opened directly (no/foreign
    // referer) is refused, so the video can't be viewed outside the host site.
    if (video.status === 'private') {
      const { allowed } = validateReferer(req)
      if (!allowed) {
        const html403 = `<!DOCTYPE html>
<html lang="zh-TW"><head><meta charset="utf-8"><title>無法播放</title>
<style>*{margin:0;padding:0}body{background:#0f0f0f;color:#bbb;display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:center;height:100vh;font-family:system-ui;text-align:center;padding:24px}b{color:#fff}</style>
</head><body><b>此影片為私人內容</b><p>只能在授權的網站內觀看。</p></body></html>`
        res.setHeader('Content-Security-Policy', "frame-ancestors 'self' " + (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean).join(' '))
        res.removeHeader('X-Frame-Options')
        return res.status(403).type('html').send(html403)
      }
    }

    const title = escapeHtml(video.title)
    const thumbnail = escapeHtml(video.thumbnail_url || '')
    const personName = escapeHtml(video.person_name || '')

    const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} - CheckCut</title>
  <meta property="og:title" content="${title}">
  <meta property="og:type" content="video.other">
  ${thumbnail ? `<meta property="og:image" content="${thumbnail}">` : ''}
  ${personName ? `<meta name="author" content="${personName}">` : ''}
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#000;overflow:hidden;font-family:system-ui}
    video{width:100vw;height:100vh;object-fit:contain}
    .watermark{position:fixed;bottom:12px;right:12px;color:rgba(255,255,255,0.3);font-size:12px;pointer-events:none;z-index:10}
  </style>
</head>
<body>
  <video
    controls
    autoplay
    playsinline
    preload="auto"
    ${thumbnail ? `poster="${thumbnail}"` : ''}
    src="/api/v1/stream/${escapeHtml(video.id)}"
  >
  </video>
  <div class="watermark">CheckCut</div>
</body>
</html>`

    // Allow iframe embedding from allowed origins
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    const frameAncestors = ["'self'", ...allowedOrigins].join(' ')
    res.setHeader('Content-Security-Policy', `frame-ancestors ${frameAncestors}`)
    res.removeHeader('X-Frame-Options')
    // Override helmet's global `Referrer-Policy: no-referrer`. The <video> source
    // is same-origin (this embed page → /api/v1/stream), and the stream's hotlink
    // protection needs a Referer to allow it. `same-origin` keeps the Referer on
    // same-origin requests while still hiding it from cross-origin ones.
    res.setHeader('Referrer-Policy', 'same-origin')
    res.type('html').send(html)
  } catch (error) {
    console.error('[EMBED]', error.message)
    res.status(500).type('html').send('<!DOCTYPE html><html><body>Error</body></html>')
  }
})

export default router
