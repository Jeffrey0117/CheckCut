import { test, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { uploadToPokkit } from './pokkit.js'

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
  delete process.env.POKKIT_URL
  delete process.env.POKKIT_API_KEY
})

function setEnv() {
  process.env.POKKIT_URL = 'https://pokkit.test'
  process.env.POKKIT_API_KEY = 'pk-key'
}

test('uploadToPokkit: throws when env not configured', async () => {
  delete process.env.POKKIT_URL
  delete process.env.POKKIT_API_KEY
  await assert.rejects(
    () => uploadToPokkit(Buffer.from('x'), 'a.mp4', 'video/mp4'),
    /POKKIT_URL is not configured/,
  )
})

test('uploadToPokkit: parses video response shape', async () => {
  setEnv()
  let capturedUrl, capturedAuth
  globalThis.fetch = async (url, opts) => {
    capturedUrl = url
    capturedAuth = opts.headers.Authorization
    return {
      ok: true,
      status: 200,
      json: async () => ({
        id: 'vid123',
        status: 'processing',
        videoUrl: 'https://pokkit.test/photos/vid123/video.mp4',
        thumbUrl: 'https://pokkit.test/photos/vid123/thumb.webp',
        statusUrl: 'https://pokkit.test/api/photos/vid123/status',
      }),
    }
  }

  const result = await uploadToPokkit(Buffer.from('bytes'), 'lesson.mp4', 'video/mp4')

  assert.equal(capturedUrl, 'https://pokkit.test/upload')
  assert.equal(capturedAuth, 'Bearer pk-key')
  assert.equal(result.id, 'vid123')
  assert.equal(result.status, 'processing')
  assert.equal(result.mediaUrl, 'https://pokkit.test/photos/vid123/video.mp4')
  assert.equal(result.thumbUrl, 'https://pokkit.test/photos/vid123/thumb.webp')
})

test('uploadToPokkit: falls back to directUrl/url for plain files', async () => {
  setEnv()
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ id: 'f1', url: 'https://pokkit.test/f/f1', directUrl: 'https://pokkit.test/files/f1/a.mp4' }),
  })
  const result = await uploadToPokkit(Buffer.from('bytes'), 'a.mp4', 'video/mp4')
  assert.equal(result.mediaUrl, 'https://pokkit.test/files/f1/a.mp4')
})

test('uploadToPokkit: throws on non-ok response with detail', async () => {
  setEnv()
  globalThis.fetch = async () => ({
    ok: false,
    status: 413,
    json: async () => ({ error: 'Photo limit reached' }),
  })
  await assert.rejects(
    () => uploadToPokkit(Buffer.from('bytes'), 'a.mp4', 'video/mp4'),
    /Pokkit upload failed \(413\): Photo limit reached/,
  )
})

test('uploadToPokkit: throws when response has no usable url', async () => {
  setEnv()
  globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ id: 'x' }) })
  await assert.rejects(
    () => uploadToPokkit(Buffer.from('bytes'), 'a.mp4', 'video/mp4'),
    /missing a usable media URL/,
  )
})
