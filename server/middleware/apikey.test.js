import { test } from 'node:test'
import assert from 'node:assert/strict'
import { requireApiKey } from './apikey.js'

function makeReq(headers = {}) {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]))
  return { get: (name) => lower[name.toLowerCase()] }
}

function makeRes() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this },
    json(payload) { this.body = payload; return this },
  }
}

test('requireApiKey: 503 when no key configured', () => {
  delete process.env.CHECKCUT_API_KEY
  const res = makeRes()
  let nextCalled = false
  requireApiKey(makeReq({ 'x-api-key': 'whatever' }), res, () => { nextCalled = true })
  assert.equal(res.statusCode, 503)
  assert.equal(nextCalled, false)
})

test('requireApiKey: 401 when key missing or wrong', () => {
  process.env.CHECKCUT_API_KEY = 'secret'
  const res1 = makeRes()
  requireApiKey(makeReq({}), res1, () => assert.fail('next should not run'))
  assert.equal(res1.statusCode, 401)

  const res2 = makeRes()
  requireApiKey(makeReq({ 'x-api-key': 'nope' }), res2, () => assert.fail('next should not run'))
  assert.equal(res2.statusCode, 401)
})

test('requireApiKey: passes with X-API-Key header', () => {
  process.env.CHECKCUT_API_KEY = 'secret'
  const res = makeRes()
  let nextCalled = false
  requireApiKey(makeReq({ 'x-api-key': 'secret' }), res, () => { nextCalled = true })
  assert.equal(nextCalled, true)
  assert.equal(res.statusCode, null)
})

test('requireApiKey: passes with Authorization Bearer', () => {
  process.env.CHECKCUT_API_KEY = 'secret'
  const res = makeRes()
  let nextCalled = false
  requireApiKey(makeReq({ authorization: 'Bearer secret' }), res, () => { nextCalled = true })
  assert.equal(nextCalled, true)
})
