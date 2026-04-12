import express from 'express'
import request from 'supertest'

import { rateLimit } from './rate-limit.js'

function createTestApp(maxRequests: number, windowMs: number = 60000) {
  const app = express()
  app.use(rateLimit({ windowMs, maxRequests }))
  app.get('/test', (_req, res) => {
    res.json({ ok: true })
  })
  return app
}

describe('rateLimit', () => {
  it('allows requests within the limit', async () => {
    const app = createTestApp(3)

    for (let i = 0; i < 3; i++) {
      const response = await request(app).get('/test')
      expect(response.status).toBe(200)
    }
  })

  it('returns 429 when limit is exceeded', async () => {
    const app = createTestApp(2)

    await request(app).get('/test')
    await request(app).get('/test')

    const response = await request(app).get('/test')
    expect(response.status).toBe(429)
    expect(response.body.error.code).toBe('RATE_LIMITED')
    expect(response.headers['retry-after']).toBeDefined()
  })

  it('uses custom error message', async () => {
    const app = express()
    app.use(rateLimit({ windowMs: 60000, maxRequests: 1, message: 'Slow down!' }))
    app.get('/test', (_req, res) => {
      res.json({ ok: true })
    })

    await request(app).get('/test')
    const response = await request(app).get('/test')

    expect(response.status).toBe(429)
    expect(response.body.error.message).toBe('Slow down!')
  })

  it('resets after the window expires', async () => {
    const app = createTestApp(1, 50) // 50ms window

    await request(app).get('/test')
    const blocked = await request(app).get('/test')
    expect(blocked.status).toBe(429)

    await new Promise((resolve) => setTimeout(resolve, 60))

    const allowed = await request(app).get('/test')
    expect(allowed.status).toBe(200)
  })
})
