/**
 * API Key middleware for server-to-server routes.
 * Used by trusted callers (e.g. CourseBloom) that cannot present a browser
 * session. The key is compared against process.env.CHECKCUT_API_KEY.
 *
 * Accepts the key via the `X-API-Key` header or `Authorization: Bearer <key>`.
 */

export function requireApiKey(req, res, next) {
  const expected = process.env.CHECKCUT_API_KEY || ''

  if (!expected) {
    // Fail closed: if no key is configured, the endpoint is unusable rather
    // than open to the world.
    return res.status(503).json({ error: 'Upload API not configured (CHECKCUT_API_KEY missing)' })
  }

  const headerKey = req.get('x-api-key')
  const auth = req.get('authorization') || ''
  const bearerKey = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  const provided = headerKey || bearerKey

  if (!provided || provided !== expected) {
    return res.status(401).json({ error: 'Invalid or missing API key' })
  }

  next()
}
