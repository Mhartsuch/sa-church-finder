import express from 'express'
import type { Express } from 'express'
import request from 'supertest'

import { createRateLimiter } from './rate-limit.js'

const createTestApp = (limiter: ReturnType<typeof createRateLimiter>): Express => {
  const app = express()
  app.use(limiter)
  app.get('/limited', (_req, res) => {
    res.json({ ok: true })
  })
  return app
}

describe('createRateLimiter', () => {
  it('allows requests up to the limit and rejects the overflow with 429', async () => {
    const app = createTestApp(createRateLimiter({ windowMs: 60_000, max: 2, enabled: true }))

    const first = await request(app).get('/limited')
    const second = await request(app).get('/limited')
    const third = await request(app).get('/limited')

    expect(first.status).toBe(200)
    expect(first.headers['ratelimit-limit']).toBe('2')
    expect(first.headers['ratelimit-remaining']).toBe('1')

    expect(second.status).toBe(200)
    expect(second.headers['ratelimit-remaining']).toBe('0')

    expect(third.status).toBe(429)
    expect(third.headers['retry-after']).toBeDefined()
    expect(third.body.error.code).toBe('RATE_LIMITED')
  })

  it('opens a fresh window after the previous one expires', async () => {
    const app = createTestApp(createRateLimiter({ windowMs: 150, max: 1, enabled: true }))

    const first = await request(app).get('/limited')
    const blocked = await request(app).get('/limited')

    expect(first.status).toBe(200)
    expect(blocked.status).toBe(429)

    await new Promise((resolve) => setTimeout(resolve, 200))

    const afterReset = await request(app).get('/limited')

    expect(afterReset.status).toBe(200)
  })

  it('is disabled by default while running under Jest', async () => {
    const app = createTestApp(createRateLimiter({ windowMs: 60_000, max: 1 }))

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await request(app).get('/limited')
      expect(response.status).toBe(200)
      expect(response.headers['ratelimit-limit']).toBeUndefined()
    }
  })
})
