import { RequestHandler } from 'express'
import session from 'express-session'
import connectPgSimple from 'connect-pg-simple'

export const SESSION_COOKIE_NAME = 'sa_church_finder.sid'

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30

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

export const createSessionMiddleware = (): RequestHandler => {
  const isProduction = process.env.NODE_ENV === 'production'
  const sessionSecret = process.env.SESSION_SECRET || 'dev-session-secret'
  const config: session.SessionOptions = {
    name: SESSION_COOKIE_NAME,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      maxAge: SESSION_MAX_AGE_MS,
    },
  }

  if (process.env.NODE_ENV !== 'test' && process.env.DATABASE_URL) {
    const PgStore = connectPgSimple(session)

    config.store = new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      tableName: 'user_sessions',
    })
  }

  return session(config)
}
