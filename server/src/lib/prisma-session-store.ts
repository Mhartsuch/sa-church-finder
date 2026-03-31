import session from 'express-session'

import prisma from './prisma.js'

export const SESSION_TABLE_NAME = 'user_sessions'
const SESSION_EXPIRE_INDEX_NAME = 'IDX_user_sessions_expire'
const DEFAULT_SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30

type SessionRow = {
  sess: unknown
}

function resolveSessionExpiry(sess: session.SessionData): Date {
  const expires = sess.cookie?.expires

  if (expires instanceof Date && !Number.isNaN(expires.getTime())) {
    return expires
  }

  if (typeof expires === 'string') {
    const parsedExpires = new Date(expires)

    if (!Number.isNaN(parsedExpires.getTime())) {
      return parsedExpires
    }
  }

  const maxAge =
    typeof sess.cookie?.maxAge === 'number' && Number.isFinite(sess.cookie.maxAge)
      ? sess.cookie.maxAge
      : DEFAULT_SESSION_MAX_AGE_MS

  return new Date(Date.now() + maxAge)
}

function normalizeStoredSession(value: unknown): session.SessionData | null {
  if (!value) {
    return null
  }

  if (typeof value === 'string') {
    return JSON.parse(value) as session.SessionData
  }

  return value as session.SessionData
}

export class PrismaSessionStore extends session.Store {
  private ensureTablePromise?: Promise<void>

  private async ensureTable(): Promise<void> {
    if (!this.ensureTablePromise) {
      this.ensureTablePromise = (async () => {
        await prisma.$executeRawUnsafe(
          `CREATE TABLE IF NOT EXISTS "${SESSION_TABLE_NAME}" (
            "sid" varchar NOT NULL COLLATE "default",
            "sess" json NOT NULL,
            "expire" timestamp(6) NOT NULL,
            CONSTRAINT "${SESSION_TABLE_NAME}_pkey" PRIMARY KEY ("sid")
          )`,
        )

        await prisma.$executeRawUnsafe(
          `CREATE INDEX IF NOT EXISTS "${SESSION_EXPIRE_INDEX_NAME}" ON "${SESSION_TABLE_NAME}"("expire")`,
        )
      })()
    }

    return this.ensureTablePromise
  }

  get(
    sid: string,
    callback: (error: Error | null, sessionData?: session.SessionData | null) => void,
  ): void {
    void this.getSession(sid)
      .then((sessionData) => callback(null, sessionData))
      .catch((error: unknown) => {
        callback(error instanceof Error ? error : new Error('Failed to get session'))
      })
  }

  set(sid: string, sess: session.SessionData, callback?: (error?: unknown) => void): void {
    void this.persistSession(sid, sess)
      .then(() => callback?.())
      .catch((error: unknown) => {
        callback?.(error instanceof Error ? error : new Error('Failed to persist session'))
      })
  }

  destroy(sid: string, callback?: (error?: unknown) => void): void {
    void this.deleteSession(sid)
      .then(() => callback?.())
      .catch((error: unknown) => {
        callback?.(error instanceof Error ? error : new Error('Failed to destroy session'))
      })
  }

  touch(sid: string, sess: session.SessionData, callback?: (error?: unknown) => void): void {
    void this.updateSessionExpiry(sid, sess)
      .then(() => callback?.())
      .catch((error: unknown) => {
        callback?.(error instanceof Error ? error : new Error('Failed to touch session'))
      })
  }

  private async getSession(sid: string): Promise<session.SessionData | null> {
    await this.ensureTable()

    const rows = await prisma.$queryRawUnsafe<SessionRow[]>(
      `SELECT "sess"
       FROM "${SESSION_TABLE_NAME}"
       WHERE "sid" = $1
         AND "expire" >= NOW()`,
      sid,
    )

    if (!rows[0]) {
      return null
    }

    return normalizeStoredSession(rows[0].sess)
  }

  private async persistSession(sid: string, sess: session.SessionData): Promise<void> {
    await this.ensureTable()

    await prisma.$executeRawUnsafe(
      `INSERT INTO "${SESSION_TABLE_NAME}" ("sid", "sess", "expire")
       VALUES ($1, $2::json, $3)
       ON CONFLICT ("sid")
       DO UPDATE SET "sess" = EXCLUDED."sess", "expire" = EXCLUDED."expire"`,
      sid,
      JSON.stringify(sess),
      resolveSessionExpiry(sess),
    )
  }

  private async deleteSession(sid: string): Promise<void> {
    await this.ensureTable()

    await prisma.$executeRawUnsafe(
      `DELETE FROM "${SESSION_TABLE_NAME}"
       WHERE "sid" = $1`,
      sid,
    )
  }

  private async updateSessionExpiry(sid: string, sess: session.SessionData): Promise<void> {
    await this.ensureTable()

    await prisma.$executeRawUnsafe(
      `UPDATE "${SESSION_TABLE_NAME}"
       SET "expire" = $2
       WHERE "sid" = $1`,
      sid,
      resolveSessionExpiry(sess),
    )
  }
}
