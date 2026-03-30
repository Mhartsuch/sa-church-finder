import express from 'express'
import request from 'supertest'

import { createSessionMiddleware, SESSION_COOKIE_NAME } from './session.js'

const originalNodeEnv = process.env.NODE_ENV
const originalSessionCookieSameSite = process.env.SESSION_COOKIE_SAME_SITE

const createTestApp = () => {
  const app = express()

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

  app.use(createSessionMiddleware())
  app.get('/session', (req, res) => {
    req.session.userId = 'user-1'
    res.json({ ok: true })
  })

  return app
}

const findSessionCookie = (setCookieHeader: string | string[] | undefined) => {
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : setCookieHeader
      ? [setCookieHeader]
      : []

  return cookies.find((value) => value.startsWith(`${SESSION_COOKIE_NAME}=`))
}

describe('session middleware', () => {
  beforeEach(() => {
    delete process.env.SESSION_COOKIE_SAME_SITE
    delete process.env.NODE_ENV
  })

  afterAll(() => {
    if (originalSessionCookieSameSite === undefined) {
      delete process.env.SESSION_COOKIE_SAME_SITE
    } else {
      process.env.SESSION_COOKIE_SAME_SITE = originalSessionCookieSameSite
    }

    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = originalNodeEnv
    }
  })

  it('uses SameSite=Lax without Secure during local development', async () => {
    const response = await request(createTestApp()).get('/session')

    expect(response.status).toBe(200)

    const sessionCookie = findSessionCookie(response.headers['set-cookie'])

    expect(sessionCookie).toBeDefined()
    expect(sessionCookie).toContain('SameSite=Lax')
    expect(sessionCookie).not.toContain('Secure')
  })

  it('uses SameSite=None with Secure in production so split-origin auth can persist', async () => {
    process.env.NODE_ENV = 'production'

    const response = await request(createTestApp())
      .get('/session')
      .set('X-Forwarded-Proto', 'https')

    expect(response.status).toBe(200)

    const sessionCookie = findSessionCookie(response.headers['set-cookie'])

    expect(sessionCookie).toBeDefined()
    expect(sessionCookie).toContain('SameSite=None')
    expect(sessionCookie).toContain('Secure')
  })

  it('honors an explicit SameSite override for environments that stay same-site in production', async () => {
    process.env.NODE_ENV = 'production'
    process.env.SESSION_COOKIE_SAME_SITE = 'lax'

    const response = await request(createTestApp())
      .get('/session')
      .set('X-Forwarded-Proto', 'https')

    expect(response.status).toBe(200)

    const sessionCookie = findSessionCookie(response.headers['set-cookie'])

    expect(sessionCookie).toBeDefined()
    expect(sessionCookie).toContain('SameSite=Lax')
    expect(sessionCookie).toContain('Secure')
  })
})
