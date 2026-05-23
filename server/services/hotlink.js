/**
 * Hotlink Protection Service
 * Validates Referer/Origin headers to prevent unauthorized video access
 */

const DEFAULT_ALLOWED = [
  /^https?:\/\/localhost(:\d+)?/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?/,
  /^https?:\/\/checkcut\./,
]

let allowedPatterns = null

function getPatterns() {
  if (allowedPatterns) return allowedPatterns

  const extra = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((origin) => {
      const escaped = origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(`^https?://(www\\.)?${escaped.replace(/^https?:\/\/(www\\.)?/, '')}`)
    })

  allowedPatterns = [...DEFAULT_ALLOWED, ...extra]
  return allowedPatterns
}

/**
 * Validate request referer/origin against allowed list
 * @param {import('express').Request} req
 * @returns {{ allowed: boolean, reason: string }}
 */
export function validateReferer(req) {
  const referer = req.get('referer') || req.get('origin') || ''

  if (!referer) {
    return { allowed: false, reason: 'no-referer' }
  }

  const patterns = getPatterns()
  const isAllowed = patterns.some((pattern) => pattern.test(referer))

  return isAllowed
    ? { allowed: true, reason: 'matched' }
    : { allowed: false, reason: 'blocked' }
}

/**
 * Reset cached patterns (useful when env changes)
 */
export function resetPatterns() {
  allowedPatterns = null
}
