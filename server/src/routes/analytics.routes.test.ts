import bcrypt from 'bcryptjs'
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
    church: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    churchClaim: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    review: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    userSavedChurch: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

jest.mock('../services/analytics.service.js', () => ({
  getChurchAnalytics: jest.fn(),
}))

import { getChurchAnalytics } from '../services/analytics.service.js'

const mockedGetChurchAnalytics = getChurchAnalytics as jest.MockedFunction<typeof getChurchAnalytics>

type MockedPrisma = {
  user: {
    findUnique: jest.Mock
  }
  church: {
    findUnique: jest.Mock
    findMany: jest.Mock
  }
  churchClaim: {
    findFirst: jest.Mock
    findMany: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma

const siteAdminUser = {
  id: 'user-site-admin-1',
  email: 'siteadmin@example.com',
  name: 'Site Admin',
  avatarUrl: null,
  role: 'SITE_ADMIN',
  emailVerified: true,
  createdAt: new Date('2026-03-01T00:00:00.000Z'),
}

const regularUser = {
  id: 'user-regular-1',
  email: 'regular@example.com',
  name: 'Regular User',
  avatarUrl: null,
  role: 'USER',
  emailVerified: true,
  createdAt: new Date('2026-03-15T00:00:00.000Z'),
}

const fakeAnalytics = {
  churchId: 'church-1',
  churchName: 'Grace Church',
  reviewCount: 10,
  avgRating: 4.5,
  saveCount: 25,
  totalReviews: 10,
  respondedReviews: 8,
  responseRate: 80,
  avgWelcomeRating: 4.2,
  avgWorshipRating: 4.6,
  avgSermonRating: 4.3,
  avgFacilitiesRating: 4.1,
  reviewTrend: [],
  saveTrend: [],
  recentReviewCount: 3,
  recentSaveCount: 5,
}

const buildLoginAgent = async (
  userOverrides: Partial<typeof siteAdminUser> = {},
): Promise<ReturnType<typeof request.agent>> => {
  const passwordHash = await bcrypt.hash('password123', 12)

  mockedPrisma.user.findUnique.mockResolvedValueOnce({
    ...regularUser,
    ...userOverrides,
    passwordHash,
  })

  const agent = request.agent(createApp())

  const loginResponse = await agent.post('/api/v1/auth/login').send({
    email: userOverrides.email ?? regularUser.email,
    password: 'password123',
  })

  expect(loginResponse.status).toBe(200)

  return agent
}

describe('analytics routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('GET /api/v1/analytics/churches/:churchId', () => {
    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp()).get('/api/v1/analytics/churches/church-1')

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('allows SITE_ADMIN to access any church analytics', async () => {
      const agent = await buildLoginAgent({
        id: siteAdminUser.id,
        email: siteAdminUser.email,
        role: 'SITE_ADMIN',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'SITE_ADMIN',
      })

      mockedGetChurchAnalytics.mockResolvedValueOnce(fakeAnalytics)

      const response = await agent.get('/api/v1/analytics/churches/church-1')

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        churchId: 'church-1',
        churchName: 'Grace Church',
        reviewCount: 10,
        avgRating: 4.5,
      })
      expect(mockedGetChurchAnalytics).toHaveBeenCalledWith('church-1')
    })

    it('allows a user with an approved claim to access their church analytics', async () => {
      const agent = await buildLoginAgent({
        id: regularUser.id,
        email: regularUser.email,
        role: 'USER',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'USER',
      })

      mockedPrisma.churchClaim.findFirst.mockResolvedValueOnce({
        id: 'claim-1',
      })

      mockedGetChurchAnalytics.mockResolvedValueOnce(fakeAnalytics)

      const response = await agent.get('/api/v1/analytics/churches/church-1')

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        churchId: 'church-1',
        churchName: 'Grace Church',
      })
      expect(mockedPrisma.churchClaim.findFirst).toHaveBeenCalledWith({
        where: {
          churchId: 'church-1',
          userId: regularUser.id,
          status: 'APPROVED',
        },
        select: { id: true },
      })
      expect(mockedGetChurchAnalytics).toHaveBeenCalledWith('church-1')
    })

    it('returns 403 when user has no approved claim on the church', async () => {
      const agent = await buildLoginAgent({
        id: regularUser.id,
        email: regularUser.email,
        role: 'USER',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'USER',
      })

      mockedPrisma.churchClaim.findFirst.mockResolvedValueOnce(null)

      const response = await agent.get('/api/v1/analytics/churches/church-1')

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
      expect(mockedGetChurchAnalytics).not.toHaveBeenCalled()
    })
  })

  describe('GET /api/v1/analytics/my-churches', () => {
    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp()).get('/api/v1/analytics/my-churches')

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('returns analytics for all churches when user is SITE_ADMIN', async () => {
      const agent = await buildLoginAgent({
        id: siteAdminUser.id,
        email: siteAdminUser.email,
        role: 'SITE_ADMIN',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'SITE_ADMIN',
      })

      mockedPrisma.church.findMany.mockResolvedValueOnce([
        { id: 'church-1' },
        { id: 'church-2' },
      ])

      const analyticsChurch1 = { ...fakeAnalytics, churchId: 'church-1', churchName: 'Grace Church' }
      const analyticsChurch2 = { ...fakeAnalytics, churchId: 'church-2', churchName: 'Hope Church' }

      mockedGetChurchAnalytics.mockResolvedValueOnce(analyticsChurch1)
      mockedGetChurchAnalytics.mockResolvedValueOnce(analyticsChurch2)

      const response = await agent.get('/api/v1/analytics/my-churches')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.data[0].churchId).toBe('church-1')
      expect(response.body.data[1].churchId).toBe('church-2')
      expect(mockedPrisma.church.findMany).toHaveBeenCalledWith({
        select: { id: true },
      })
      expect(mockedGetChurchAnalytics).toHaveBeenCalledTimes(2)
    })

    it('returns analytics only for churches with approved claims for a regular user', async () => {
      const agent = await buildLoginAgent({
        id: regularUser.id,
        email: regularUser.email,
        role: 'USER',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'USER',
      })

      mockedPrisma.churchClaim.findMany.mockResolvedValueOnce([
        { churchId: 'church-3' },
      ])

      const analyticsChurch3 = { ...fakeAnalytics, churchId: 'church-3', churchName: 'Faith Church' }
      mockedGetChurchAnalytics.mockResolvedValueOnce(analyticsChurch3)

      const response = await agent.get('/api/v1/analytics/my-churches')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].churchId).toBe('church-3')
      expect(mockedPrisma.churchClaim.findMany).toHaveBeenCalledWith({
        where: {
          userId: regularUser.id,
          status: 'APPROVED',
        },
        select: { churchId: true },
      })
      expect(mockedGetChurchAnalytics).toHaveBeenCalledWith('church-3')
    })

    it('returns empty array when regular user has no approved claims', async () => {
      const agent = await buildLoginAgent({
        id: regularUser.id,
        email: regularUser.email,
        role: 'USER',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'USER',
      })

      mockedPrisma.churchClaim.findMany.mockResolvedValueOnce([])

      const response = await agent.get('/api/v1/analytics/my-churches')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(0)
      expect(mockedGetChurchAnalytics).not.toHaveBeenCalled()
    })
  })
})
