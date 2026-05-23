const API_BASE = '/api/v1'

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json
}

// ─── Public APIs ──────────────────────────────

export async function getVideos(params = {}) {
  const qs = new URLSearchParams(params).toString()
  const json = await request(`/videos${qs ? '?' + qs : ''}`)
  return { videos: json.data || [], total: json.meta?.total ?? 0 }
}

export async function getVideo(id) {
  const json = await request(`/videos/${id}`)
  return { video: json.data || null }
}

export async function getPersons() {
  const json = await request('/persons')
  return { persons: json.data || [] }
}

export async function getPerson(slug) {
  const json = await request(`/persons/${slug}`)
  return { person: json.data || null }
}

export async function getPersonById(id) {
  const json = await request(`/admin/persons/${id}`)
  return { person: json.data || null }
}

export async function search(query) {
  const json = await request(`/search?q=${encodeURIComponent(query)}`)
  return { results: json.data || [] }
}

export async function getCategories() {
  const json = await request('/categories')
  return { categories: (json.data || []).map((c) => c.category || c) }
}

export async function getFeatured() {
  const json = await request('/featured')
  return json.data || { featured: [], latest: [] }
}

// ─── Admin APIs ──────────────────────────────

export async function createVideo(data) {
  return request('/admin/videos', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateVideo(id, data) {
  return request(`/admin/videos/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteVideo(id) {
  return request(`/admin/videos/${id}`, { method: 'DELETE' })
}

export async function createPerson(data) {
  return request('/admin/persons', { method: 'POST', body: JSON.stringify(data) })
}

export async function updatePerson(id, data) {
  return request(`/admin/persons/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deletePerson(id) {
  return request(`/admin/persons/${id}`, { method: 'DELETE' })
}

// ─── SeedBlog Integration ──────────────────────

export async function getSeedblogConfig() {
  const json = await request('/seedblog/config')
  return json.data || { base_url: '' }
}

export async function getSeedblogArticles(authorId, params = {}) {
  const qs = new URLSearchParams(params).toString()
  const json = await request(`/seedblog/authors/${authorId}/articles${qs ? '?' + qs : ''}`)
  return json.data || []
}
