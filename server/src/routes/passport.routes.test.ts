import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([]),
    user: {
      findUnique: jest.fn(),
    },
    churchVisit: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    churchCollection: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    review: {
      count: jest.fn(),
    },
    userAward: {
      findMany: jest.fn(),
    },
  },
}))

type MockedPrisma = {
  user: { findUnique: jest.Mock }
  churchVisit: { findMany: jest.Mock; count: jest.Mock }
  churchCollection: { findMany: jest.Mock; count: jest.Mock }
  review: { count: jest.Mock }
  userAward: { findMany: jest.Mock }
}

const mockedPrisma = prisma as unknown as MockedPrisma

const baseUser = {
  id: 'user-1',
  name: 'Test User',
  avatarUrl: null,
  createdAt: new Date('2026-01-15T00:00:00.000Z'),
}

const churchInfo = {
  id: 'church-1',
  name: 'Grace Church',
  slug: 'grace-church',
  denomination: 'Non-denominational',
  denominationFamily: 'Non-denominational',
  neighborhood: 'Alamo Heights',
  coverImageUrl: 'https://example.com/grace.jpg',
  address: '123 Main St',
  city: 'San Antonio',
}

describe('passport routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /api/v1/users/:id/passport', () => {
    it('returns a user passport with stats, awards, and recent visits', async () => {
      mockedPrisma.user.findUnique.mockResolvedValueOnce(baseUser)
      mockedPrisma.churchVisit.count.mockResolvedValueOnce(5)
      mockedPrisma.churchVisit.findMany
        // distinct churches for stats
        .mockResolvedValueOnce([
          { churchId: 'church-1', church: { denominationFamily: 'Non-denominational', neighborhood: 'Alamo Heights' } },
          { churchId: 'church-2', church: { denominationFamily: 'Baptist', neighborhood: 'Stone Oak' } },
          { churchId: 'church-3', church: { denominationFamily: 'Catholic', neighborhood: 'Downtown' } },
        ])
        // recent visits
        .mockResolvedValueOnce([
          {
            id: 'visit-1',
            visitedAt: new Date('2026-04-10'),
            rating: 4,
            notes: 'Great service',
            church: churchInfo,
          },
        ])
      mockedPrisma.churchCollection.count.mockResolvedValueOnce(2)
      mockedPrisma.review.count.mockResolvedValueOnce(3)
      mockedPrisma.userAward.findMany.mockResolvedValueOnce([
        { awardType: 'FIRST_VISIT', earnedAt: new Date('2026-03-01') },
        { awardType: 'DENOMINATION_DIVERSITY', earnedAt: new Date('2026-04-05') },
      ])

      const response = await request(createApp()).get('/api/v1/users/user-1/passport')

      expect(response.status).toBe(200)
      expect(response.body.data.user).toMatchObject({
        id: 'user-1',
        name: 'Test User',
      })
      expect(response.body.data.stats).toMatchObject({
        totalVisits: 5,
        uniqueChurches: 3,
        denominationsVisited: 3,
        neighborhoodsVisited: 3,
        collectionsCount: 2,
        reviewCount: 3,
      })
      expect(response.body.data.awards).toHaveLength(2)
      expect(response.body.data.awards[0].awardType).toBe('FIRST_VISIT')
      expect(response.body.data.recentVisits).toHaveLength(1)
      expect(response.body.data.recentVisits[0].church.name).toBe('Grace Church')
    })

    it('returns 404 for non-existent user', async () => {
      mockedPrisma.user.findUnique.mockResolvedValueOnce(null)

      const response = await request(createApp()).get('/api/v1/users/nonexistent/passport')

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })

    it('returns empty stats for a user with no activity', async () => {
      mockedPrisma.user.findUnique.mockResolvedValueOnce(baseUser)
      mockedPrisma.churchVisit.count.mockResolvedValueOnce(0)
      mockedPrisma.churchVisit.findMany
        .mockResolvedValueOnce([])   // distinct churches
        .mockResolvedValueOnce([])   // recent visits
      mockedPrisma.churchCollection.count.mockResolvedValueOnce(0)
      mockedPrisma.review.count.mockResolvedValueOnce(0)
      mockedPrisma.userAward.findMany.mockResolvedValueOnce([])

      const response = await request(createApp()).get('/api/v1/users/user-1/passport')

      expect(response.status).toBe(200)
      expect(response.body.data.stats).toMatchObject({
        totalVisits: 0,
        uniqueChurches: 0,
        denominationsVisited: 0,
        neighborhoodsVisited: 0,
        collectionsCount: 0,
        reviewCount: 0,
      })
      expect(response.body.data.awards).toEqual([])
      expect(response.body.data.recentVisits).toEqual([])
    })
  })

  describe('GET /api/v1/users/:id/visits', () => {
    it('returns paginated visits for a user', async () => {
      mockedPrisma.churchVisit.findMany.mockResolvedValueOnce([
        {
          id: 'visit-1',
          userId: 'user-1',
          churchId: 'church-1',
          visitedAt: new Date('2026-04-10'),
          notes: 'Great service',
          rating: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
          church: churchInfo,
        },
      ])
      mockedPrisma.churchVisit.count.mockResolvedValueOnce(1)

      const response = await request(createApp())
        .get('/api/v1/users/user-1/visits')
        .query({ page: 1, pageSize: 10 })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0]).toMatchObject({
        id: 'visit-1',
        churchId: 'church-1',
        rating: 4,
      })
      expect(response.body.meta).toMatchObject({
        page: 1,
        pageSize: 10,
        total: 1,
        totalPages: 1,
      })
    })

    it('uses default pagination when no params provided', async () => {
      mockedPrisma.churchVisit.findMany.mockResolvedValueOnce([])
      mockedPrisma.churchVisit.count.mockResolvedValueOnce(0)

      const response = await request(createApp()).get('/api/v1/users/user-1/visits')

      expect(response.status).toBe(200)
      expect(response.body.meta).toMatchObject({
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      })
    })
  })

  describe('GET /api/v1/users/:id/collections', () => {
    it('returns public collections for an unauthenticated viewer', async () => {
      mockedPrisma.churchCollection.findMany.mockResolvedValueOnce([
        {
          ...{
            id: 'coll-1',
            userId: 'user-1',
            name: 'Best Music',
            description: 'Great choirs',
            slug: 'best-music',
            isPublic: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          _count: { items: 3 },
        },
      ])

      const response = await request(createApp()).get('/api/v1/users/user-1/collections')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0]).toMatchObject({
        name: 'Best Music',
        isPublic: true,
        churchCount: 3,
      })
    })
  })
})
