/**
 * SeedBlog Integration Service
 * Fetches author profiles and articles from SeedBlog API
 */

const SEEDBLOG_BASE_URL = process.env.SEEDBLOG_BASE_URL || 'http://localhost:4026'
const SEEDBLOG_TOKEN = process.env.SEEDBLOG_TOKEN || ''

async function seedblogFetch(path, params = {}) {
  const url = new URL(path, SEEDBLOG_BASE_URL)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value)
    }
  }

  const headers = {}
  if (SEEDBLOG_TOKEN) {
    headers.Authorization = `Bearer ${SEEDBLOG_TOKEN}`
  }

  const res = await fetch(url, { headers })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`SeedBlog API error ${res.status}: ${text}`)
  }
  return res.json()
}

/**
 * Get author by ID
 */
export async function getAuthor(authorId) {
  const data = await seedblogFetch('/api/admin/authors')
  const authors = data.authors || data || []
  return authors.find((a) => a.id === authorId) || null
}

/**
 * Get published articles for an author
 */
export async function getAuthorArticles(authorId, { page = 1, limit = 10 } = {}) {
  const data = await seedblogFetch('/api/admin/articles', {
    author_id: authorId,
    status: 'published',
    page,
    limit,
  })
  return data.articles || data || []
}

/**
 * Check if SeedBlog is reachable
 */
export async function healthCheck() {
  try {
    const res = await fetch(`${SEEDBLOG_BASE_URL}/api/health`, { signal: AbortSignal.timeout(3000) })
    return res.ok
  } catch {
    return false
  }
}

/**
 * Get the public-facing SeedBlog base URL (for external links)
 */
export function getBaseUrl() {
  return SEEDBLOG_BASE_URL
}
