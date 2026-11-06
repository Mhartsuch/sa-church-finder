import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'
import { invalidateChurchCaches } from '../services/church.service.js'

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
    church: { findUnique: jest.fn(), findMany: jest.fn() },
  },
}))

type MockedPrisma = {
  $queryRaw: jest.Mock
  church: { findUnique: jest.Mock; findMany: jest.Mock }
}

const mockedPrisma = prisma as unknown as MockedPrisma

const churchRecord = {
  id: 'church-1',
  name: 'Grace Fellowship',
  slug: 'grace-fellowship',
  denomination: 'Southern Baptist',
  denominationFamily: 'Baptist',
  description: 'A friendly church downtown.',
  address: '123 Main St',
  city: 'San Antonio',
  state: 'TX',
  zipCode: '78205',
  neighborhood: 'Downtown',
  latitude: '29.42410000',
  longitude: '-98.49360000',
  phone: '210-555-0100',
  email: 'hello@grace.example',
  website: 'https://grace.example',
  pastorName: 'Pastor Ann',
  yearEstablished: 1950,
  avgRating: '4.50',
  reviewCount: 2,
  googleRating: null,
  googleReviewCount: null,
  languages: ['English'],
  amenities: ['Parking'],
  coverImageUrl: 'https://img/cover.jpg',
  googlePlaceId: 'gp-1',
  businessStatus: 'OPERATIONAL',
  googleMapsUrl: null,
  primaryType: 'church',
  goodForChildren: true,
  goodForGroups: null,
  wheelchairAccessible: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
  services: [],
  photos: [
    { id: 'p1', churchId: 'church-1', url: 'https://img/1.jpg', altText: null, displayOrder: 0 },
  ],
  savedByUsers: [],
}

describe('church routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    invalidateChurchCaches()
  })

  describe('GET /api/v1/churches', () => {
    it('returns the search envelope', async () => {
      mockedPrisma.$queryRaw
        .mockResolvedValueOnce([{ count: BigInt(1) }])
        .mockResolvedValueOnce([{ id: 'church-1', distance_miles: 0.44 }])
      mockedPrisma.church.findMany.mockResolvedValueOnce([churchRecord])

      const response = await request(createApp())
        .get('/api/v1/churches')
        .query({ denomination: 'Baptist', day: 0, wheelchairAccessible: 'true' })

      expect(response.status).toBe(200)
      expect(response.body.meta).toEqual({
        page: 1,
        pageSize: 20,
        total: 1,
        totalPages: 1,
        center: { lat: 29.4241, lng: -98.4936 },
      })
      expect(response.body.data[0]).toMatchObject({
        id: 'church-1',
        slug: 'grace-fellowship',
        distance: 0.4,
        isSaved: false,
        photos: [{ id: 'p1', url: 'https://img/1.jpg', altText: null, displayOrder: 0 }],
      })
      expect(response.body.data[0]).not.toHaveProperty('isClaimed')
    })

    it('rejects pageSize above 50', async () => {
      const response = await request(createApp()).get('/api/v1/churches').query({ pageSize: 51 })
      expect(response.status).toBe(400)
    })

    it('rejects an invalid time of day', async () => {
      const response = await request(createApp()).get('/api/v1/churches').query({ time: 'noon' })
      expect(response.status).toBe(400)
    })
  })

  describe('GET /api/v1/churches/filter-options', () => {
    it('returns filter options without serviceTypes and with a short cache window', async () => {
      mockedPrisma.church.findMany.mockResolvedValueOnce([
        {
          denominationFamily: 'Baptist',
          neighborhood: 'Downtown',
          languages: ['English'],
          amenities: [],
        },
      ])

      const response = await request(createApp()).get('/api/v1/churches/filter-options')

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual({
        denominations: [{ value: 'Baptist', count: 1 }],
        languages: ['English'],
        amenities: [],
        neighborhoods: ['Downtown'],
      })
      expect(response.headers['cache-control']).toBe(
        'private, max-age=30, stale-while-revalidate=120',
      )
    })
  })

  describe('GET /api/v1/churches/:slug', () => {
    it('returns the church profile', async () => {
      mockedPrisma.church.findUnique.mockResolvedValueOnce(churchRecord)

      const response = await request(createApp()).get('/api/v1/churches/grace-fellowship')

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id: 'church-1',
        email: 'hello@grace.example',
        pastorName: 'Pastor Ann',
        yearEstablished: 1950,
        avgRating: 4.5,
        isSaved: false,
      })
      expect(response.body.data).not.toHaveProperty('viewerClaim')
      expect(response.body.data).not.toHaveProperty('claimedById')
      expect(mockedPrisma.church.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: 'grace-fellowship' } }),
      )
    })

    it('returns 404 for an unknown slug', async () => {
      mockedPrisma.church.findUnique.mockResolvedValueOnce(null)

      const response = await request(createApp()).get('/api/v1/churches/missing')

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })
  })

  describe('removed endpoints', () => {
    it.each([
      ['patch', '/api/v1/churches/church-1'],
      ['get', '/api/v1/churches/grace-fellowship/events'],
      ['get', '/api/v1/ribbon-categories'],
      ['get', '/api/v1/forum/posts'],
    ] as const)('%s %s is gone', async (method, path) => {
      const response = await request(createApp())[method](path)
      expect(response.status).toBe(404)
    })
  })
})
