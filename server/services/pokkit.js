/**
 * Pokkit Upload Service
 * Forwards a file buffer to the Pokkit storage server and returns the
 * resulting public media URLs. Pokkit handles ffmpeg transcoding + thumbnail
 * generation for videos (deferred/async), so `videoUrl` may 404 until
 * `status` flips from "processing" to "ready".
 *
 * Env:
 *   POKKIT_URL / POKKIT_BASE_URL  Base URL of the Pokkit server (e.g. https://pokkit.example.com)
 *   POKKIT_API_KEY                Bearer token accepted by Pokkit's requireAuth
 */

function getPokkitConfig() {
  // Accept either POKKIT_URL or the project's existing POKKIT_BASE_URL convention.
  const baseUrl = (process.env.POKKIT_URL || process.env.POKKIT_BASE_URL || '').replace(/\/$/, '')
  const apiKey = process.env.POKKIT_API_KEY || ''
  if (!baseUrl) {
    throw new Error('POKKIT_URL / POKKIT_BASE_URL is not configured')
  }
  if (!apiKey) {
    throw new Error('POKKIT_API_KEY is not configured')
  }
  return { baseUrl, apiKey }
}

/**
 * Upload a file buffer to Pokkit.
 * @param {Buffer} buffer      Raw file bytes
 * @param {string} filename    Original filename (used by Pokkit for extension/mime)
 * @param {string} mimetype    MIME type (e.g. "video/mp4")
 * @returns {Promise<{ id: string, status: string, mediaUrl: string, thumbUrl: string, statusUrl: string }>}
 */
export async function uploadToPokkit(buffer, filename, mimetype) {
  const { baseUrl, apiKey } = getPokkitConfig()

  const form = new FormData()
  form.append('file', new Blob([buffer], { type: mimetype || 'application/octet-stream' }), filename)

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  })

  if (!response.ok) {
    let detail = ''
    try {
      const body = await response.json()
      detail = body?.error || JSON.stringify(body)
    } catch {
      detail = await response.text().catch(() => '')
    }
    throw new Error(`Pokkit upload failed (${response.status}): ${detail}`)
  }

  const data = await response.json()

  // Pokkit returns different shapes per branch:
  //   video → { id, status, videoUrl, thumbUrl, statusUrl }
  //   image → { id, status, photoUrl, thumbUrl, statusUrl }
  //   file  → { id, url, directUrl, ... }
  const mediaUrl = data.videoUrl || data.photoUrl || data.directUrl || data.url
  if (!mediaUrl) {
    throw new Error('Pokkit response missing a usable media URL')
  }

  return {
    id: data.id,
    status: data.status || 'ready',
    mediaUrl,
    thumbUrl: data.thumbUrl || '',
    statusUrl: data.statusUrl || '',
  }
}
