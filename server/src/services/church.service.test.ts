/**
 * Church service tests
 * These test the exported helper functions. Full integration tests
 * against the database require a running PostgreSQL instance.
 */

import { invalidateFilterOptionsCache, searchChurches } from './church.service.js'

// Mock prisma to avoid needing a database in CI
jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn().mockResolvedValue([]),
    church: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
  },
}))

describe('church service', () => {
  beforeEach(() => {
    // Clears the anonymous search cache so each test sees real query calls.
    invalidateFilterOptionsCache()
    const prisma = jest.requireMock('../lib/prisma.js').default as { $queryRaw: jest.Mock }
    prisma.$queryRaw.mockClear()
  })

  it('searchChurches returns proper response shape with empty results', async () => {
    const result = await searchChurches({})
    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('meta')
    expect(result.meta).toHaveProperty('page', 1)
    expect(result.meta).toHaveProperty('totalPages')
    expect(Array.isArray(result.data)).toBe(true)
  })

  it('searchChurches respects pagination params', async () => {
    const result = await searchChurches({ page: 2, pageSize: 5 })
    expect(result.meta.page).toBe(2)
    expect(result.meta.pageSize).toBe(5)
  })

  it('searchChurches clamps pageSize to the documented max of 50', async () => {
    const result = await searchChurches({ pageSize: 500 })
    expect(result.meta.pageSize).toBe(50)
  })

  describe('non-congregational demotion in default ordering', () => {
    // The generated SQL is inspected through the mocked $queryRaw call args
    // (Prisma.Sql exposes .sql and .values).
    const getQueries = () => {
      const prisma = jest.requireMock('../lib/prisma.js').default as {
        $queryRaw: jest.Mock
      }
      return prisma.$queryRaw.mock.calls.map((call) => call[0] as { sql: string; values: unknown[] })
    }

    it('applies the demotion term to the relevance ranking score', async () => {
      await searchChurches({})
      const mainQuery = getQueries().find((q) => q.sql.includes('ranking_score'))
      expect(mainQuery).toBeDefined()
      expect(mainQuery!.sql).toContain('DEFAULT-ORDER DEMOTION')
      expect(mainQuery!.values.flat()).toEqual(
        expect.arrayContaining(['Latter-day Saints', "Jehovah's Witnesses"])
      )
    })

    it('sorts demoted families last under the rating sort', async () => {
      await searchChurches({ sort: 'rating' })
      const mainQuery = getQueries().find((q) => q.sql.includes('ORDER BY'))
      expect(mainQuery).toBeDefined()
      expect(mainQuery!.sql).toMatch(/ORDER BY[\s\S]*"denominationFamily" = ANY[\s\S]*ASC/)
    })
  })

  describe('anonymous search cache', () => {
    const getMock = () =>
      (jest.requireMock('../lib/prisma.js').default as { $queryRaw: jest.Mock }).$queryRaw

    it('serves repeat anonymous searches from cache without re-querying', async () => {
      await searchChurches({ q: 'grace' })
      const callsAfterFirst = getMock().mock.calls.length
      expect(callsAfterFirst).toBeGreaterThan(0)

      const second = await searchChurches({ q: 'grace' })
      expect(getMock().mock.calls.length).toBe(callsAfterFirst)
      expect(second).toHaveProperty('data')
    })

    it('bypasses the cache for signed-in searches', async () => {
      await searchChurches({ q: 'grace' })
      const callsAfterAnon = getMock().mock.calls.length

      await searchChurches({ q: 'grace' }, 'user-123')
      expect(getMock().mock.calls.length).toBeGreaterThan(callsAfterAnon)
    })

    it('refreshes after church-data mutations invalidate the cache', async () => {
      await searchChurches({ q: 'grace' })
      const callsAfterFirst = getMock().mock.calls.length

      invalidateFilterOptionsCache()

      await searchChurches({ q: 'grace' })
      expect(getMock().mock.calls.length).toBeGreaterThan(callsAfterFirst)
    })
  })
})
