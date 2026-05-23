/**
 * Database Service
 * SQLite database for CheckCut
 */

import Database from 'better-sqlite3'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let db = null

// Initialize database
export function initDatabase() {
  try {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/checkcut.db')
    const dbDir = path.dirname(dbPath)

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    db = new Database(dbPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      PRIMARY KEY (user_id, key),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      title TEXT,
      author TEXT,
      author_id TEXT,
      length_seconds INTEGER,
      watch_progress INTEGER DEFAULT 0,
      watched_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_history_user ON history(user_id);
    CREATE INDEX IF NOT EXISTS idx_history_video ON history(user_id, video_id);

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      title TEXT,
      author TEXT,
      author_id TEXT,
      length_seconds INTEGER,
      added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      UNIQUE(user_id, video_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS playlist_items (
      id TEXT PRIMARY KEY,
      playlist_id TEXT NOT NULL,
      video_id TEXT NOT NULL,
      title TEXT,
      author TEXT,
      author_id TEXT,
      length_seconds INTEGER,
      position INTEGER NOT NULL DEFAULT 0,
      added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_playlist_items ON playlist_items(playlist_id);

    CREATE TABLE IF NOT EXISTS persons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      avatar TEXT DEFAULT '',
      bio TEXT DEFAULT '',
      seedblog_author_id TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_persons_slug ON persons(slug);

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      pokkit_url TEXT NOT NULL,
      thumbnail_url TEXT DEFAULT '',
      duration INTEGER DEFAULT 0,
      person_id TEXT REFERENCES persons(id),
      category TEXT DEFAULT '',
      tags TEXT DEFAULT '[]',
      source_url TEXT DEFAULT '',
      view_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'published',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_videos_person ON videos(person_id);
    CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
    CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
  `)

    console.log('[DATABASE] Initialized:', dbPath)
    return db
  } catch (error) {
    console.error('[DATABASE] Initialization failed:', error.message)
    console.error('[DATABASE] Running in memory-only mode')
    // Fallback to in-memory database
    db = new Database(':memory:')
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );

      CREATE TABLE IF NOT EXISTS settings (
        user_id TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT,
        PRIMARY KEY (user_id, key),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        title TEXT,
        author TEXT,
        author_id TEXT,
        length_seconds INTEGER,
        watch_progress INTEGER DEFAULT 0,
        watched_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_history_user ON history(user_id);
      CREATE INDEX IF NOT EXISTS idx_history_video ON history(user_id, video_id);

      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        title TEXT,
        author TEXT,
        author_id TEXT,
        length_seconds INTEGER,
        added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        UNIQUE(user_id, video_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

      CREATE TABLE IF NOT EXISTS playlists (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS playlist_items (
        id TEXT PRIMARY KEY,
        playlist_id TEXT NOT NULL,
        video_id TEXT NOT NULL,
        title TEXT,
        author TEXT,
        author_id TEXT,
        length_seconds INTEGER,
        position INTEGER NOT NULL DEFAULT 0,
        added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_playlist_items ON playlist_items(playlist_id);

      CREATE TABLE IF NOT EXISTS persons (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        avatar TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        seedblog_author_id TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_persons_slug ON persons(slug);

      CREATE TABLE IF NOT EXISTS videos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        pokkit_url TEXT NOT NULL,
        thumbnail_url TEXT DEFAULT '',
        duration INTEGER DEFAULT 0,
        person_id TEXT REFERENCES persons(id),
        category TEXT DEFAULT '',
        tags TEXT DEFAULT '[]',
        source_url TEXT DEFAULT '',
        view_count INTEGER DEFAULT 0,
        status TEXT DEFAULT 'published',
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_videos_person ON videos(person_id);
      CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
      CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
    `)
    console.log('[DATABASE] In-memory database initialized')
    return db
  }
}

export function getDatabase() {
  if (!db) {
    initDatabase()
  }
  return db
}

// ─── User functions ──────────────────────────────────────

export async function createUser(username, password) {
  const database = getDatabase()
  const existing = database.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    throw new Error('Username already exists')
  }

  const id = uuidv4()
  const passwordHash = await bcrypt.hash(password, 10)

  database.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)')
    .run(id, username, passwordHash)

  return { id, username }
}

export async function getUserByUsername(username) {
  const database = getDatabase()
  return database.prepare('SELECT * FROM users WHERE username = ?').get(username)
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

// ─── Settings functions ──────────────────────────────────

export function getUserSettings(userId) {
  const database = getDatabase()
  const rows = database.prepare('SELECT key, value FROM settings WHERE user_id = ?').all(userId)
  const settings = {}
  for (const row of rows) {
    try {
      settings[row.key] = JSON.parse(row.value)
    } catch {
      settings[row.key] = row.value
    }
  }
  return settings
}

export function setUserSetting(userId, key, value) {
  const database = getDatabase()
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value)
  database.prepare('INSERT OR REPLACE INTO settings (user_id, key, value) VALUES (?, ?, ?)')
    .run(userId, key, valueStr)
}

// ─── History functions ───────────────────────────────────

export function addToHistory(userId, video) {
  const database = getDatabase()
  const id = uuidv4()
  database.prepare(`
    INSERT INTO history (id, user_id, video_id, title, author, author_id, length_seconds, watch_progress)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, video.videoId, video.title, video.author, video.authorId, video.lengthSeconds, video.watchProgress || 0)
  return { id }
}

export function getHistory(userId, limit = 100) {
  const database = getDatabase()
  return database.prepare(`
    SELECT * FROM history WHERE user_id = ? ORDER BY watched_at DESC LIMIT ?
  `).all(userId, limit)
}

// ─── Favorites functions ─────────────────────────────────

export function addToFavorites(userId, video) {
  const database = getDatabase()
  const id = uuidv4()
  database.prepare(`
    INSERT OR REPLACE INTO favorites (id, user_id, video_id, title, author, author_id, length_seconds)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, userId, video.videoId, video.title, video.author, video.authorId, video.lengthSeconds)
  return { id }
}

export function removeFromFavorites(userId, videoId) {
  const database = getDatabase()
  database.prepare('DELETE FROM favorites WHERE user_id = ? AND video_id = ?').run(userId, videoId)
}

export function getFavorites(userId) {
  const database = getDatabase()
  return database.prepare('SELECT * FROM favorites WHERE user_id = ? ORDER BY added_at DESC').all(userId)
}

export function isFavorite(userId, videoId) {
  const database = getDatabase()
  const row = database.prepare('SELECT id FROM favorites WHERE user_id = ? AND video_id = ?').get(userId, videoId)
  return !!row
}

// ─── Persons functions ───────────────────────────────────

function slugify(name) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  // Fallback: if slug is empty after processing, use a short random id
  return slug || uuidv4().slice(0, 8)
}

export function createPerson({ name, avatar, bio, seedblog_author_id }) {
  const database = getDatabase()
  const id = uuidv4()
  const slug = slugify(name)

  database.prepare(`
    INSERT INTO persons (id, name, slug, avatar, bio, seedblog_author_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, slug, avatar || '', bio || '', seedblog_author_id || '')

  return { id, name, slug, avatar: avatar || '', bio: bio || '', seedblog_author_id: seedblog_author_id || '' }
}

export function updatePerson(id, data) {
  const database = getDatabase()
  const existing = database.prepare('SELECT * FROM persons WHERE id = ?').get(id)
  if (!existing) {
    throw new Error('Person not found')
  }

  const updated = {
    name: data.name ?? existing.name,
    slug: data.name ? slugify(data.name) : existing.slug,
    avatar: data.avatar ?? existing.avatar,
    bio: data.bio ?? existing.bio,
    seedblog_author_id: data.seedblog_author_id ?? existing.seedblog_author_id,
  }

  database.prepare(`
    UPDATE persons SET name = ?, slug = ?, avatar = ?, bio = ?, seedblog_author_id = ?
    WHERE id = ?
  `).run(updated.name, updated.slug, updated.avatar, updated.bio, updated.seedblog_author_id, id)

  return { id, ...updated }
}

export function deletePerson(id) {
  const database = getDatabase()
  database.prepare('DELETE FROM persons WHERE id = ?').run(id)
}

export function getPersons() {
  const database = getDatabase()
  return database.prepare('SELECT * FROM persons ORDER BY name ASC').all()
}

export function getPersonBySlug(slug) {
  const database = getDatabase()
  return database.prepare('SELECT * FROM persons WHERE slug = ?').get(slug)
}

export function getPersonById(id) {
  const database = getDatabase()
  return database.prepare('SELECT * FROM persons WHERE id = ?').get(id)
}

// ─── Videos functions ────────────────────────────────────

export function createVideo({ title, description, pokkit_url, thumbnail_url, duration, person_id, category, tags, source_url, status, sort_order }) {
  const database = getDatabase()
  const id = uuidv4()
  const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]')

  database.prepare(`
    INSERT INTO videos (id, title, description, pokkit_url, thumbnail_url, duration, person_id, category, tags, source_url, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    title,
    description || '',
    pokkit_url,
    thumbnail_url || '',
    duration || 0,
    person_id || null,
    category || '',
    tagsStr,
    source_url || '',
    status || 'published',
    sort_order || 0
  )

  return { id, title, pokkit_url }
}

export function updateVideo(id, data) {
  const database = getDatabase()
  const existing = database.prepare('SELECT * FROM videos WHERE id = ?').get(id)
  if (!existing) {
    throw new Error('Video not found')
  }

  const updated = {
    title: data.title ?? existing.title,
    description: data.description ?? existing.description,
    pokkit_url: data.pokkit_url ?? existing.pokkit_url,
    thumbnail_url: data.thumbnail_url ?? existing.thumbnail_url,
    duration: data.duration ?? existing.duration,
    person_id: data.person_id ?? existing.person_id,
    category: data.category ?? existing.category,
    tags: data.tags ? (Array.isArray(data.tags) ? JSON.stringify(data.tags) : data.tags) : existing.tags,
    source_url: data.source_url ?? existing.source_url,
    status: data.status ?? existing.status,
    sort_order: data.sort_order ?? existing.sort_order,
  }

  database.prepare(`
    UPDATE videos SET title = ?, description = ?, pokkit_url = ?, thumbnail_url = ?, duration = ?,
    person_id = ?, category = ?, tags = ?, source_url = ?, status = ?, sort_order = ?,
    updated_at = datetime('now')
    WHERE id = ?
  `).run(
    updated.title, updated.description, updated.pokkit_url, updated.thumbnail_url, updated.duration,
    updated.person_id, updated.category, updated.tags, updated.source_url, updated.status, updated.sort_order,
    id
  )

  return { id, ...updated }
}

export function deleteVideo(id) {
  const database = getDatabase()
  database.prepare('DELETE FROM videos WHERE id = ?').run(id)
}

export function getVideos({ page = 1, limit = 20, person_id, category, status = 'published' } = {}) {
  const database = getDatabase()
  const offset = (page - 1) * limit
  const conditions = []
  const params = []

  if (status) {
    conditions.push('v.status = ?')
    params.push(status)
  }
  if (person_id) {
    conditions.push('v.person_id = ?')
    params.push(person_id)
  }
  if (category) {
    conditions.push('v.category = ?')
    params.push(category)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const total = database.prepare(`SELECT COUNT(*) as count FROM videos v ${where}`).get(...params).count

  const videos = database.prepare(`
    SELECT v.*, p.name as person_name, p.slug as person_slug, p.avatar as person_avatar
    FROM videos v
    LEFT JOIN persons p ON v.person_id = p.id
    ${where}
    ORDER BY v.sort_order DESC, v.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset)

  return { videos, total, page, limit }
}

export function getVideoByIdRaw(id) {
  const database = getDatabase()
  return database.prepare(`
    SELECT v.*, p.name as person_name, p.slug as person_slug, p.avatar as person_avatar
    FROM videos v
    LEFT JOIN persons p ON v.person_id = p.id
    WHERE v.id = ?
  `).get(id)
}

export function getVideoById(id) {
  const database = getDatabase()
  const video = database.prepare(`
    SELECT v.*, p.name as person_name, p.slug as person_slug, p.avatar as person_avatar
    FROM videos v
    LEFT JOIN persons p ON v.person_id = p.id
    WHERE v.id = ?
  `).get(id)

  if (video) {
    database.prepare('UPDATE videos SET view_count = view_count + 1 WHERE id = ?').run(id)
  }

  return video
}

export function searchVideos(query, limit = 20) {
  const database = getDatabase()
  const pattern = `%${query}%`
  return database.prepare(`
    SELECT v.*, p.name as person_name, p.slug as person_slug, p.avatar as person_avatar
    FROM videos v
    LEFT JOIN persons p ON v.person_id = p.id
    WHERE v.status = 'published' AND (v.title LIKE ? OR v.description LIKE ?)
    ORDER BY v.sort_order DESC, v.created_at DESC
    LIMIT ?
  `).all(pattern, pattern, limit)
}

export function getCategories() {
  const database = getDatabase()
  return database.prepare(`
    SELECT category, COUNT(*) as count
    FROM videos
    WHERE status = 'published' AND category != ''
    GROUP BY category
    ORDER BY count DESC
  `).all()
}

export function getFeaturedVideos(limit = 20) {
  const database = getDatabase()

  const featured = database.prepare(`
    SELECT v.*, p.name as person_name, p.slug as person_slug, p.avatar as person_avatar
    FROM videos v
    LEFT JOIN persons p ON v.person_id = p.id
    WHERE v.status = 'published' AND v.sort_order > 0
    ORDER BY v.sort_order DESC
    LIMIT ?
  `).all(limit)

  const latest = database.prepare(`
    SELECT v.*, p.name as person_name, p.slug as person_slug, p.avatar as person_avatar
    FROM videos v
    LEFT JOIN persons p ON v.person_id = p.id
    WHERE v.status = 'published'
    ORDER BY v.created_at DESC
    LIMIT ?
  `).all(limit)

  return { featured, latest }
}

export function getVideosByPerson(personId) {
  const database = getDatabase()
  return database.prepare(`
    SELECT v.*, p.name as person_name, p.slug as person_slug, p.avatar as person_avatar
    FROM videos v
    LEFT JOIN persons p ON v.person_id = p.id
    WHERE v.person_id = ? AND v.status = 'published'
    ORDER BY v.sort_order DESC, v.created_at DESC
  `).all(personId)
}

// Initialize on import
initDatabase()
