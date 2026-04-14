/**
 * Church service tests
 * These test the exported helper functions. Full integration tests
 * against the database require a running PostgreSQL instance.
 */

import { searchChurches, toChurchEnrichment } from './church.service.js'

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
})

describe('toChurchEnrichment', () => {
  const now = new Date('2026-04-14T00:00:00Z')

  it('returns null when the snapshot is missing or has no surfaceable fields', () => {
    expect(toChurchEnrichment(null, now)).toBeNull()
    expect(toChurchEnrichment(undefined, now)).toBeNull()
    expect(toChurchEnrichment({}, now)).toBeNull()
    expect(
      toChurchEnrichment(
        {
          ministries: [],
          affiliations: [],
          socialLinks: { facebook: null, instagram: null, twitter: null, youtube: null },
        },
        now,
      ),
    ).toBeNull()
  })

  it('keeps valid http(s) URLs and drops non-http protocols or malformed values', () => {
    const result = toChurchEnrichment(
      {
        sermonUrl: 'https://example.com/sermons',
        livestreamUrl: 'http://example.com/live',
        givingUrl: 'javascript:alert(1)',
        statementOfFaithUrl: 'not-a-url',
        newVisitorUrl: '   ',
        socialLinks: {
          facebook: 'https://facebook.com/x',
          instagram: 'ftp://instagram.com/x',
          twitter: null,
          youtube: 'https://youtube.com/@x',
        },
      },
      now,
    )
    expect(result).not.toBeNull()
    expect(result?.sermonUrl).toBe('https://example.com/sermons')
    expect(result?.livestreamUrl).toBe('http://example.com/live')
    expect(result?.givingUrl).toBeNull()
    expect(result?.statementOfFaithUrl).toBeNull()
    expect(result?.newVisitorUrl).toBeNull()
    expect(result?.socialLinks.facebook).toBe('https://facebook.com/x')
    expect(result?.socialLinks.instagram).toBeNull()
    expect(result?.socialLinks.twitter).toBeNull()
    expect(result?.socialLinks.youtube).toBe('https://youtube.com/@x')
  })

  it('dedupes and trims string arrays and caps them at 20 entries', () => {
    const manyMinistries = Array.from({ length: 30 }, (_, i) => `Ministry ${i + 1}`)
    const result = toChurchEnrichment(
      {
        ministries: ['  AWANA  ', 'awana', 'Celebrate Recovery', '', ...manyMinistries],
        affiliations: ['SBC', 'sbc ', 'PCA'],
      },
      now,
    )
    expect(result?.ministries).toContain('AWANA')
    expect(result?.ministries.filter((m) => m.toLowerCase() === 'awana')).toHaveLength(1)
    expect(result?.ministries.length).toBeLessThanOrEqual(20)
    expect(result?.affiliations).toEqual(['SBC', 'PCA'])
  })

  it('only surfaces an allow-listed serviceStyle', () => {
    expect(
      toChurchEnrichment({ serviceStyle: 'Contemporary', ministries: ['x'] }, now)?.serviceStyle,
    ).toBe('Contemporary')
    expect(
      toChurchEnrichment({ serviceStyle: 'Rock Concert', ministries: ['x'] }, now)?.serviceStyle,
    ).toBeNull()
  })

  it('truncates overly long free-text notes with an ellipsis', () => {
    const long = 'a'.repeat(500)
    const result = toChurchEnrichment({ parkingInfo: long, ministries: ['x'] }, now)
    expect(result?.parkingInfo?.length).toBeLessThanOrEqual(281)
    expect(result?.parkingInfo?.endsWith('…')).toBe(true)
  })

  it('ignores non-object socialLinks', () => {
    const result = toChurchEnrichment({ socialLinks: 'not-an-object', ministries: ['x'] }, now)
    expect(result?.socialLinks).toEqual({
      facebook: null,
      instagram: null,
      twitter: null,
      youtube: null,
    })
  })
})
