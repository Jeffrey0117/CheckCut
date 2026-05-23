/**
 * CheckCut Server
 * Curated video platform
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import session from 'express-session'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

import apiRoutes from './routes/api.js'
import authRoutes from './routes/auth.js'
import favoritesRoutes from './routes/favorites.js'
import embedRoutes from './routes/embed.js'
import { createUser, getUserByUsername } from './services/database.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 4010

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
  hsts: false,
  crossOriginOpenerPolicy: false,
}))

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CLIENT_URL || 'http://localhost:5175', ...allowedOrigins].filter(Boolean)
    : true,
  credentials: true,
}))

// Parse JSON bodies
app.use(express.json())

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'checkcut-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/embed', embedRoutes)
app.use('/api/v1', apiRoutes)
app.use('/auth', authRoutes)
app.use('/api/favorites', favoritesRoutes)

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist')
  app.use(express.static(clientDist))

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message)
  res.status(500).json({ error: err.message })
})

// Create default user if not exists
async function ensureDefaultUser() {
  const defaultUsername = 'jeff'
  const defaultPassword = 'checkcut2025'

  try {
    const existing = await getUserByUsername(defaultUsername)
    if (!existing) {
      await createUser(defaultUsername, defaultPassword)
      console.log('[AUTH] Default user created: jeff')
    }
  } catch (error) {
    if (error.message !== 'Username already exists') {
      console.error('[AUTH] Failed to create default user:', error.message)
    }
  }
}

// Start server
async function start() {
  try {
    await ensureDefaultUser()

    app.listen(PORT, '0.0.0.0', () => {
      console.log('')
      console.log('='.repeat(50))
      console.log('  CheckCut Server')
      console.log('='.repeat(50))
      console.log('')
      console.log(`  URL: http://localhost:${PORT}`)
      console.log(`  Mode: ${process.env.NODE_ENV || 'development'}`)
      console.log('')
      console.log('  API Endpoints:')
      console.log('    /api/v1/videos')
      console.log('    /api/v1/videos/:id')
      console.log('    /api/v1/persons')
      console.log('    /api/v1/persons/:slug')
      console.log('    /api/v1/search?q=...')
      console.log('    /api/v1/categories')
      console.log('    /api/v1/featured')
      console.log('')
      console.log('  Stream & Embed:')
      console.log('    /api/v1/stream/:videoId')
      console.log('    /embed/:videoId')
      console.log('')
      console.log('  SeedBlog Integration:')
      console.log('    /api/v1/seedblog/config')
      console.log('    /api/v1/seedblog/authors/:id')
      console.log('    /api/v1/seedblog/authors/:id/articles')
      console.log('')
      console.log('  Admin Endpoints:')
      console.log('    /api/v1/admin/videos')
      console.log('    /api/v1/admin/persons')
      console.log('')
      console.log('  Auth Endpoints:')
      console.log('    /auth/register')
      console.log('    /auth/login')
      console.log('    /auth/logout')
      console.log('    /auth/me')
      console.log('')
      console.log('='.repeat(50))
      console.log('')
    })
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
