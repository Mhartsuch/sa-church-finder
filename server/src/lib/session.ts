import { RequestHandler } from 'express'
import session from 'express-session'

import { PrismaSessionStore } from './prisma-session-store.js'

export const SESSION_COOKIE_NAME = 'sa_church_finder.sid'

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30
const VALID_SESSION_COOKIE_SAME_SITE_VALUES = ['lax', 'strict', 'none'] as const

type SessionCookieSameSite = (typeof VALID_SESSION_COOKIE_SAME_SITE_VALUES)[number]

export const resolveClientUrls = (): string[] | '*' => {
  const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

  if (rawClientUrl === '*') {
    return '*'
  }

  return rawClientUrl
    .split(',')
    .map((url) => url.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

function resolveSessionCookieSameSite(): session.CookieOptions['sameSite'] {
  const configuredValue = process.env.SESSION_COOKIE_SAME_SITE?.trim().toLowerCase()

  if (
    configuredValue &&
    VALID_SESSION_COOKIE_SAME_SITE_VALUES.includes(configuredValue as SessionCookieSameSite)
  ) {
    return configuredValue as SessionCookieSameSite
  }

  return process.env.NODE_ENV === 'production' ? 'none' : 'lax'
}

function shouldUseDatabaseSessionStore(): boolean {
  return (
    Boolean(process.env.DATABASE_URL) &&
    process.env.NODE_ENV !== 'test' &&
    !process.env.JEST_WORKER_ID
  )
}

export const createSessionMiddleware = (): RequestHandler => {
  const isProduction = process.env.NODE_ENV === 'production'
  const sessionSecret = process.env.SESSION_SECRET || 'dev-session-secret'

  if (isProduction && sessionSecret === 'dev-session-secret') {
    throw new Error(
      'SESSION_SECRET must be set in production — sessions are insecure with the default value',
    )
  }
  const sameSite = resolveSessionCookieSameSite()
  const config: session.SessionOptions = {
    name: SESSION_COOKIE_NAME,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
    cookie: {
      httpOnly: true,
      sameSite,
      secure: isProduction,
      maxAge: SESSION_MAX_AGE_MS,
    },
  }

  if (shouldUseDatabaseSessionStore()) {
    config.store = new PrismaSessionStore()
  }

  return session(config)
}
