#!/usr/bin/env node

/**
 * Seed Script — populate CheckCut database with test data
 *
 * Usage:
 *   node server/scripts/seed.js          # seed (skip if data exists)
 *   node server/scripts/seed.js --force  # clear + reseed
 *   node server/scripts/seed.js --clear  # clear all seed data
 */

import Database from 'better-sqlite3'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../data/checkcut.db')
const db = new Database(dbPath)

const args = process.argv.slice(2)
const force = args.includes('--force')
const clearOnly = args.includes('--clear')

// ─── Seed Data ────────────────────────────────────────────

const persons = [
  {
    name: '張偉',
    slug: 'zhang-wei',
    avatar: 'https://duk.tw/seed-avatar-01.jpg',
    bio: '科技趨勢觀察家，專注 AI 與數位轉型議題。',
    seedblog_author_id: '',
  },
  {
    name: '林小芳',
    slug: 'lin-xiaofang',
    avatar: 'https://duk.tw/seed-avatar-02.jpg',
    bio: '生活風格創作者，分享極簡主義與自我成長。',
    seedblog_author_id: '',
  },
  {
    name: '陳大明',
    slug: 'chen-daming',
    avatar: 'https://duk.tw/seed-avatar-03.jpg',
    bio: '獨立開發者，分享 side project 與創業心得。',
    seedblog_author_id: '',
  },
  {
    name: 'Alex Chen',
    slug: 'alex-chen',
    avatar: 'https://duk.tw/seed-avatar-04.jpg',
    bio: 'UI/UX designer sharing design thinking and product insights.',
    seedblog_author_id: '',
  },
]

// Videos reference persons by index (resolved at seed time)
const videos = [
  // ── 張偉 (index 0) ──
  {
    title: 'AI 會取代工程師嗎？2025 趨勢分析',
    description: '深入探討 AI coding assistant 的現狀與未來，工程師該如何應對。',
    pokkit_url: 'https://pokkit.example.com/files/seed-video-01.mp4',
    thumbnail_url: 'https://duk.tw/seed-thumb-01.jpg',
    duration: 842,
    personIndex: 0,
    category: '科技',
    tags: ['AI', '工程師', '趨勢'],
    source_url: '',
    status: 'published',
    sort_order: 100,
  },
  {
    title: '為什麼我從大公司離職做獨立開發',
    description: '離開穩定薪水的決定背後，分享真實的心路歷程與財務考量。',
    pokkit_url: 'https://pokkit.example.com/files/seed-video-02.mp4',
    thumbnail_url: 'https://duk.tw/seed-thumb-02.jpg',
    duration: 1205,
    personIndex: 0,
    category: '職涯',
    tags: ['獨立開發', '離職', '職涯'],
    source_url: '',
    status: 'published',
    sort_order: 90,
  },
  {
    title: 'Self-hosting 入門：你真的需要雲端嗎？',
    description: '用一台舊筆電架設自己的服務，從 DNS 到反向代理完整教學。',
    pokkit_url: 'https://pokkit.example.com/files/seed-video-03.mp4',
    thumbnail_url: 'https://duk.tw/seed-thumb-03.jpg',
    duration: 1530,
    personIndex: 0,
    category: '科技',
    tags: ['self-hosting', '教學', 'homelab'],
    source_url: '',
    status: 'published',
    sort_order: 80,
  },

  // ── 林小芳 (index 1) ──
  {
    title: '極簡生活 30 天挑戰：我丟掉了什麼',
    description: '記錄一個月的斷捨離過程，以及意想不到的心態變化。',
    pokkit_url: 'https://pokkit.example.com/files/seed-video-04.mp4',
    thumbnail_url: 'https://duk.tw/seed-thumb-04.jpg',
    duration: 654,
    personIndex: 1,
    category: '生活',
    tags: ['極簡', '斷捨離', '挑戰'],
    source_url: '',
    status: 'published',
    sort_order: 70,
  },
  {
    title: '早起的人生不會更好，但會更安靜',
    description: '五點起床三個月後的真實感受，不是雞湯，是數據。',
    pokkit_url: 'https://pokkit.example.com/files/seed-video-05.mp4',
    thumbnail_url: 'https://duk.tw/seed-thumb-05.jpg',
    duration: 487,
    personIndex: 1,
    category: '生活',
    tags: ['早起', '習慣', '自律'],
    source_url: '',
    status: 'published',
    sort_order: 60,
  },

  // ── 陳大明 (index 2) ──
  {
    title: '我的 Side Project 月收入報告（第 6 個月）',
    description: '公開收入數字、流量來源、技術架構，完全透明。',
    pokkit_url: 'https://pokkit.example.com/files/seed-video-06.mp4',
    thumbnail_url: 'https://duk.tw/seed-thumb-06.jpg',
    duration: 960,
    personIndex: 2,
    category: '創業',
    tags: ['side project', '收入', '獨立開發'],
    source_url: '',
    status: 'published',
    sort_order: 50,
  },
  {
    title: '從零到上線：72 小時 Hackathon 紀錄',
    description: '三天內從想法到部署的完整過程，包含所有踩過的坑。',
    pokkit_url: 'https://pokkit.example.com/files/seed-video-07.mp4',
    thumbnail_url: 'https://duk.tw/seed-thumb-07.jpg',
    duration: 1820,
    personIndex: 2,
    category: '科技',
    tags: ['hackathon', '開發', '紀錄'],
    source_url: '',
    status: 'published',
    sort_order: 40,
  },

  // ── Alex Chen (index 3) ──
  {
    title: 'Design System 實戰：一個人也能建立',
    description: 'How I built a design system from scratch as a solo designer, with Figma tokens and automated docs.',
    pokkit_url: 'https://pokkit.example.com/files/seed-video-08.mp4',
    thumbnail_url: 'https://duk.tw/seed-thumb-08.jpg',
    duration: 1100,
    personIndex: 3,
    category: '設計',
    tags: ['design system', 'Figma', 'UI'],
    source_url: '',
    status: 'published',
    sort_order: 30,
  },
  {
    title: 'Why Most Landing Pages Fail (and how to fix yours)',
    description: 'Common conversion killers I see in startup landing pages, with before/after redesign examples.',
    pokkit_url: 'https://pokkit.example.com/files/seed-video-09.mp4',
    thumbnail_url: 'https://duk.tw/seed-thumb-09.jpg',
    duration: 738,
    personIndex: 3,
    category: '設計',
    tags: ['landing page', 'conversion', 'UX'],
    source_url: '',
    status: 'published',
    sort_order: 20,
  },

  // ── Draft video (not published) ──
  {
    title: '[草稿] 2025 年度回顧',
    description: '年度回顧影片，尚未完成剪輯。',
    pokkit_url: 'https://pokkit.example.com/files/seed-video-10.mp4',
    thumbnail_url: '',
    duration: 0,
    personIndex: 0,
    category: '',
    tags: [],
    source_url: '',
    status: 'draft',
    sort_order: 0,
  },
]

// ─── Helpers ──────────────────────────────────────────────

function slugify(name) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return slug || uuidv4().slice(0, 8)
}

function clearSeedData() {
  db.prepare('DELETE FROM videos').run()
  db.prepare('DELETE FROM persons').run()
  console.log('[SEED] Cleared all persons and videos')
}

function countRecords() {
  const personCount = db.prepare('SELECT COUNT(*) as c FROM persons').get().c
  const videoCount = db.prepare('SELECT COUNT(*) as c FROM videos').get().c
  return { personCount, videoCount }
}

// ─── Main ─────────────────────────────────────────────────

function seed() {
  const { personCount, videoCount } = countRecords()

  if (clearOnly) {
    clearSeedData()
    return
  }

  if (personCount > 0 || videoCount > 0) {
    if (!force) {
      console.log(`[SEED] Database already has data (${personCount} persons, ${videoCount} videos)`)
      console.log('[SEED] Use --force to clear and reseed')
      return
    }
    clearSeedData()
  }

  // Insert persons
  const insertPerson = db.prepare(`
    INSERT INTO persons (id, name, slug, avatar, bio, seedblog_author_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const personIds = []

  const insertPersons = db.transaction(() => {
    for (const p of persons) {
      const id = uuidv4()
      const slug = p.slug || slugify(p.name)
      insertPerson.run(id, p.name, slug, p.avatar, p.bio, p.seedblog_author_id)
      personIds.push(id)
      console.log(`  + Person: ${p.name} (${slug})`)
    }
  })

  insertPersons()
  console.log(`[SEED] Created ${persons.length} persons`)

  // Insert videos
  const insertVideo = db.prepare(`
    INSERT INTO videos (id, title, description, pokkit_url, thumbnail_url, duration, person_id, category, tags, source_url, status, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const insertVideos = db.transaction(() => {
    for (const v of videos) {
      const id = uuidv4()
      const personId = personIds[v.personIndex] || null
      const tagsStr = JSON.stringify(v.tags)
      insertVideo.run(
        id, v.title, v.description, v.pokkit_url, v.thumbnail_url,
        v.duration, personId, v.category, tagsStr, v.source_url,
        v.status, v.sort_order
      )
      console.log(`  + Video: ${v.title} [${v.status}]`)
    }
  })

  insertVideos()
  console.log(`[SEED] Created ${videos.length} videos`)

  // Summary
  const final = countRecords()
  console.log(`[SEED] Done — ${final.personCount} persons, ${final.videoCount} videos`)
}

try {
  seed()
} catch (error) {
  console.error('[SEED] Failed:', error.message)
  process.exit(1)
} finally {
  db.close()
}
