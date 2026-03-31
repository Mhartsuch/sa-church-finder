import { RequestHandler } from 'express'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'

export const SESSION_COOKIE_NAME = 'sa_church_finder.sid'
export const SESSION_TABLE_NAME = 'user_sessions'

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

function shouldCreateSessionTableAtRuntime(): boolean {
  return process.env.NODE_ENV !== 'production'
}

export const createSessionMiddleware = (): RequestHandler => {
  const isProduction = process.env.NODE_ENV === 'production'
  const sessionSecret = process.env.SESSION_SECRET || 'dev-session-secret'
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

  if (process.env.NODE_ENV !== 'test' && process.env.DATABASE_URL) {
    const PgStore = connectPgSimple(session)

    config.store = new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: shouldCreateSessionTableAtRuntime(),
      tableName: SESSION_TABLE_NAME,
    })
  }

  return session(config)
}
