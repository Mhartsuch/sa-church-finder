/**
 * Church service tests
 * These test the exported helper functions. Full integration tests
 * against the database require a running PostgreSQL instance.
 */

import {
  getChurchBySlug,
  getFilterOptions,
  invalidateChurchCaches,
  searchChurches,
} from './church.service.js'

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

type MockedPrisma = {
  $queryRaw: jest.Mock
  church: { findFirst: jest.Mock; findMany: jest.Mock }
}

const churchRecord = (
  id: string,
  overrides: Record<string, unknown> = {},
): Record<string, unknown> => ({
  id,
  name: `Church ${id}`,
  slug: `church-${id}`,
  denomination: 'Baptist',
  denominationFamily: 'Baptist',
  description: null,
  address: '1 Main St',
  city: 'San Antonio',
  state: 'TX',
  zipCode: '78205',
  neighborhood: 'Downtown',
  latitude: '29.42410000',
  longitude: '-98.49360000',
  phone: null,
  email: 'hello@example.com',
  website: null,
  pastorName: 'Pastor Ann',
  yearEstablished: 1950,
  avgRating: '4.50',
  reviewCount: 2,
  googleRating: '4.70',
  googleReviewCount: 120,
  languages: ['English'],
  amenities: [],
  coverImageUrl: null,
  googlePlaceId: 'gp',
  businessStatus: 'OPERATIONAL',
  googleMapsUrl: 'https://maps.example.com',
  primaryType: 'church',
  goodForChildren: true,
  goodForGroups: null,
  wheelchairAccessible: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  services: [
    {
      id: 's1',
      churchId: id,
      dayOfWeek: 0,
      startTime: '09:00',
      endTime: null,
      serviceType: 'Worship',
      language: 'English',
      description: null,
      isAutoImported: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  photos: [],
  savedByUsers: [],
  ...overrides,
})

const getPrisma = (): MockedPrisma => jest.requireMock('../lib/prisma.js').default as MockedPrisma

describe('church service', () => {
  beforeEach(() => {
    // Clears the anonymous search cache so each test sees real query calls.
    invalidateChurchCaches()
    const prisma = jest.requireMock('../lib/prisma.js').default as MockedPrisma
    prisma.$queryRaw.mockReset().mockResolvedValue([])
    prisma.church.findMany.mockReset().mockResolvedValue([])
    prisma.church.findFirst.mockReset().mockResolvedValue(null)
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
    const getQueries = (): { sql: string; values: unknown[] }[] => {
      const prisma = jest.requireMock('../lib/prisma.js').default as {
        $queryRaw: jest.Mock
      }
      return prisma.$queryRaw.mock.calls.map(
        (call) => call[0] as { sql: string; values: unknown[] },
      )
    }

    it('applies the demotion term to the relevance ranking score', async () => {
      await searchChurches({})
      const mainQuery = getQueries().find((q) => q.sql.includes('DEFAULT-ORDER DEMOTION'))
      expect(mainQuery).toBeDefined()
      expect(mainQuery!.values.flat()).toEqual(
        expect.arrayContaining(['Latter-day Saints', "Jehovah's Witnesses"]),
      )
    })

    it('sorts demoted families last under the rating sort', async () => {
      await searchChurches({ sort: 'rating' })
      const mainQuery = getQueries().find((q) => q.sql.includes('ORDER BY'))
      expect(mainQuery).toBeDefined()
      expect(mainQuery!.sql).toMatch(/ORDER BY[\s\S]*"denominationFamily" = ANY[\s\S]*ASC/)
    })
  })

  describe('keyword search', () => {
    const lastCountQuery = (): { sql: string; values: unknown[] } => {
      const mock = (jest.requireMock('../lib/prisma.js').default as { $queryRaw: jest.Mock })
        .$queryRaw
      const calls = mock.mock.calls as [{ sql: string; values: unknown[] }][]
      return calls.map(([query]) => query).find((query) => query.sql.includes('COUNT(*)'))!
    }

    it('matches tradition, part of town, zip code and street as well as the name', async () => {
      await searchChurches({ q: 'Stone Oak' }, 'user-keyword-1')
      const { sql, values } = lastCountQuery()

      for (const column of ['denomination', 'denominationFamily', 'neighborhood', 'zipCode']) {
        expect(sql).toContain(`c."${column}"`)
      }
      expect(sql).toContain('LOWER(c."city") LIKE')
      expect(sql).toContain('LOWER(c."address") LIKE')
      expect(values).toContain('%stone oak%')
    })

    it('escapes LIKE wildcards in the search term', async () => {
      await searchChurches({ q: '100%_x' }, 'user-keyword-2')
      expect(lastCountQuery().values).toContain('%100\\%\\_x%')
    })

    it('never returns hidden listings', async () => {
      await searchChurches({}, 'user-keyword-3')
      expect(lastCountQuery().sql).toContain('c."isHidden" = false')
    })
  })

  describe('anonymous search cache', () => {
    const getMock = (): jest.Mock =>
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

      invalidateChurchCaches()

      await searchChurches({ q: 'grace' })
      expect(getMock().mock.calls.length).toBeGreaterThan(callsAfterFirst)
    })
  })
  describe('result hydration', () => {
    it('returns churches in ranked order with distance and no internal fields', async () => {
      const prisma = getPrisma()
      prisma.$queryRaw.mockResolvedValueOnce([{ count: BigInt(2) }]).mockResolvedValueOnce([
        { id: 'b', distance_miles: 1.26 },
        { id: 'a', distance_miles: null },
      ])
      prisma.church.findMany.mockResolvedValueOnce([
        churchRecord('a'),
        churchRecord('b', { savedByUsers: [{ userId: 'u1' }] }),
      ])

      const result = await searchChurches({ sort: 'distance' }, 'u1')

      expect(result.meta.total).toBe(2)
      expect(result.data.map((c) => c.id)).toEqual(['b', 'a'])
      expect(result.data[0]).toMatchObject({ distance: 1.3, isSaved: true, latitude: 29.4241 })
      expect(result.data[1].distance).toBeUndefined()
      expect(result.data[1].isSaved).toBe(false)
      expect(result.data[0]).not.toHaveProperty('savedByUsers')
      expect(result.data[0]).not.toHaveProperty('email')
      expect(result.data[0].services[0]).not.toHaveProperty('isAutoImported')
    })

    it('skips hydration when the page is empty', async () => {
      await searchChurches({ q: 'nothing-matches' })
      expect(getPrisma().church.findMany).not.toHaveBeenCalled()
    })
  })

  describe('getChurchBySlug', () => {
    it('returns null for an unknown slug', async () => {
      expect(await getChurchBySlug('missing')).toBeNull()
    })

    it('returns the full profile with all photos ordered by displayOrder', async () => {
      const photos = Array.from({ length: 8 }, (_, i) => ({
        id: `p${i}`,
        churchId: 'a',
        url: `https://img/${i}.jpg`,
        altText: null,
        displayOrder: i,
        googlePhotoRef: null,
        createdAt: new Date(),
      }))
      getPrisma().church.findFirst.mockResolvedValueOnce(churchRecord('a', { photos }))

      const church = await getChurchBySlug('church-a')

      expect(church?.photos).toHaveLength(8)
      expect(church?.photos[0]).toEqual({
        id: 'p0',
        url: 'https://img/0.jpg',
        altText: null,
        displayOrder: 0,
      })
      expect(church).toMatchObject({
        email: 'hello@example.com',
        pastorName: 'Pastor Ann',
        isSaved: false,
      })
      expect(church).not.toHaveProperty('googlePlaceId')
      const args = getPrisma().church.findFirst.mock.calls[0][0]
      expect(args.include.photos).toEqual({ orderBy: { displayOrder: 'asc' } })
      // Hidden listings (non-churches, duplicates) must 404 like a missing slug.
      expect(args.where).toEqual({ slug: 'church-a', isHidden: false })
    })
  })

  describe('getFilterOptions', () => {
    it('derives counted denominations and sorted distinct values', async () => {
      getPrisma().church.findMany.mockResolvedValueOnce([
        {
          denominationFamily: 'Baptist',
          neighborhood: 'Downtown',
          languages: ['Spanish', 'English'],
          amenities: ['Parking'],
        },
        {
          denominationFamily: 'Catholic',
          neighborhood: null,
          languages: ['English'],
          amenities: [],
        },
        {
          denominationFamily: 'Baptist',
          neighborhood: 'Alamo Heights',
          languages: [],
          amenities: ['Childcare'],
        },
        { denominationFamily: null, neighborhood: 'Downtown', languages: [], amenities: [] },
      ])

      expect(await getFilterOptions()).toEqual({
        denominations: [
          { value: 'Baptist', count: 2 },
          { value: 'Catholic', count: 1 },
        ],
        languages: ['English', 'Spanish'],
        amenities: ['Childcare', 'Parking'],
        neighborhoods: ['Alamo Heights', 'Downtown'],
      })
    })
  })
})
