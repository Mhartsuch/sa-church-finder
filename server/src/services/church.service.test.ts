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

  it('searchChurches clamps pageSize to max 100', async () => {
    const result = await searchChurches({ pageSize: 500 })
    expect(result.meta.pageSize).toBe(100)
  })
})
