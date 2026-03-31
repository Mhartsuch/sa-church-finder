import session from 'express-session'

const executeRawUnsafe = jest.fn<Promise<number>, [string, ...unknown[]]>()
const queryRawUnsafe = jest.fn<Promise<unknown[]>, [string, ...unknown[]]>()

jest.mock('./prisma.js', () => ({
  __esModule: true,
  default: {
    $executeRawUnsafe: executeRawUnsafe,
    $queryRawUnsafe: queryRawUnsafe,
  },
}))

import { PrismaSessionStore, SESSION_TABLE_NAME } from './prisma-session-store.js'

const setSession = (
  store: PrismaSessionStore,
  sid: string,
  sessionData: session.SessionData,
): Promise<void> =>
  new Promise((resolve, reject) => {
    store.set(sid, sessionData, (error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })

const getSession = (
  store: PrismaSessionStore,
  sid: string,
): Promise<session.SessionData | null | undefined> =>
  new Promise((resolve, reject) => {
    store.get(sid, (error, sessionData) => {
      if (error) {
        reject(error)
        return
      }

      resolve(sessionData)
    })
  })

const destroySession = (store: PrismaSessionStore, sid: string): Promise<void> =>
  new Promise((resolve, reject) => {
    store.destroy(sid, (error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })

const touchSession = (
  store: PrismaSessionStore,
  sid: string,
  sessionData: session.SessionData,
): Promise<void> =>
  new Promise((resolve, reject) => {
    store.touch(sid, sessionData, (error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })

describe('PrismaSessionStore', () => {
  beforeEach(() => {
    executeRawUnsafe.mockReset()
    queryRawUnsafe.mockReset()
    executeRawUnsafe.mockResolvedValue(1)
  })

  it('persists sessions with an upsert after ensuring the session table exists', async () => {
    const store = new PrismaSessionStore()
    const sessionData = {
      cookie: {
        maxAge: 15_000,
      },
      userId: 'user-1',
    } as unknown as session.SessionData

    await setSession(store, 'sid-1', sessionData)

    expect(executeRawUnsafe).toHaveBeenCalledTimes(3)
    expect(executeRawUnsafe.mock.calls[0][0]).toContain(
      `CREATE TABLE IF NOT EXISTS "${SESSION_TABLE_NAME}"`,
    )
    expect(executeRawUnsafe.mock.calls[1][0]).toContain(
      `CREATE INDEX IF NOT EXISTS "IDX_${SESSION_TABLE_NAME}_expire"`,
    )
    expect(executeRawUnsafe.mock.calls[2][0]).toContain(`INSERT INTO "${SESSION_TABLE_NAME}"`)
    expect(executeRawUnsafe.mock.calls[2][1]).toBe('sid-1')
  })

  it('returns a stored session payload when one exists', async () => {
    const store = new PrismaSessionStore()
    const expectedSession = {
      cookie: {
        maxAge: 15_000,
      },
      userId: 'user-2',
    }

    queryRawUnsafe.mockResolvedValueOnce([{ sess: expectedSession }])

    const result = await getSession(store, 'sid-2')

    expect(result).toEqual(expectedSession)
    expect(queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining(`FROM "${SESSION_TABLE_NAME}"`),
      'sid-2',
    )
  })

  it('returns null when the session row is missing', async () => {
    const store = new PrismaSessionStore()

    queryRawUnsafe.mockResolvedValueOnce([])

    const result = await getSession(store, 'missing-sid')

    expect(result).toBeNull()
  })

  it('touches the session expiry without recreating the table more than once', async () => {
    const store = new PrismaSessionStore()
    const sessionData = {
      cookie: {
        maxAge: 30_000,
      },
    } as unknown as session.SessionData

    await touchSession(store, 'sid-3', sessionData)
    await touchSession(store, 'sid-3', sessionData)

    const createTableCalls = executeRawUnsafe.mock.calls.filter(([query]) =>
      query.includes(`CREATE TABLE IF NOT EXISTS "${SESSION_TABLE_NAME}"`),
    )

    expect(createTableCalls).toHaveLength(1)
    expect(executeRawUnsafe.mock.calls.at(-1)?.[0]).toContain(`UPDATE "${SESSION_TABLE_NAME}"`)
  })

  it('destroys a session row', async () => {
    const store = new PrismaSessionStore()

    await destroySession(store, 'sid-4')

    expect(executeRawUnsafe.mock.calls.at(-1)?.[0]).toContain(`DELETE FROM "${SESSION_TABLE_NAME}"`)
    expect(executeRawUnsafe.mock.calls.at(-1)?.[1]).toBe('sid-4')
  })
})
