/**
 * Church service tests
 * These test the exported helper functions. Full integration tests
 * against the database require a running PostgreSQL instance.
 */

import { searchChurches } from './church.service.js'

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

    beforeEach(() => {
      const prisma = jest.requireMock('../lib/prisma.js').default as { $queryRaw: jest.Mock }
      prisma.$queryRaw.mockClear()
    })

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
})
