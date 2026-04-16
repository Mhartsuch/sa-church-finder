import bcrypt from 'bcryptjs'
import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([]),
    church: {
      findUnique: jest.fn(),
    },
    churchVisit: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    userAward: {
      findMany: jest.fn().mockResolvedValue([]),
      createMany: jest.fn(),
    },
    review: {
      count: jest.fn().mockResolvedValue(0),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

type MockedPrisma = {
  church: {
    findUnique: jest.Mock
  }
  churchVisit: {
    findUnique: jest.Mock
    findMany: jest.Mock
    count: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
  userAward: {
    findMany: jest.Mock
    createMany: jest.Mock
  }
  review: {
    count: jest.Mock
  }
  user: {
    findUnique: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma

const baseUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  avatarUrl: null,
  role: 'USER',
  emailVerified: true,
  createdAt: new Date('2026-03-28T00:00:00.000Z'),
}

const baseChurch = {
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

const baseVisit = {
  id: 'visit-1',
  userId: 'user-1',
  churchId: 'church-1',
  visitedAt: new Date('2026-04-10'),
  notes: 'Great service',
  rating: 4,
  createdAt: new Date('2026-04-10T10:00:00.000Z'),
  updatedAt: new Date('2026-04-10T10:00:00.000Z'),
  church: baseChurch,
}

const buildLoginAgent = async (
  userOverrides: Partial<typeof baseUser> = {},
): Promise<ReturnType<typeof request.agent>> => {
  const passwordHash = await bcrypt.hash('password123', 12)

  mockedPrisma.user.findUnique.mockResolvedValueOnce({
    ...baseUser,
    ...userOverrides,
    passwordHash,
  })

  const agent = request.agent(createApp())

  const loginResponse = await agent.post('/api/v1/auth/login').send({
    email: userOverrides.email ?? baseUser.email,
    password: 'password123',
  })

  expect(loginResponse.status).toBe(200)

  return agent
}

describe('visit routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    // Default: no existing awards, no reviews
    mockedPrisma.userAward.findMany.mockResolvedValue([])
    mockedPrisma.review.count.mockResolvedValue(0)
  })

  describe('POST /api/v1/churches/:id/visits', () => {
    it('requires authentication', async () => {
      const response = await request(createApp())
        .post('/api/v1/churches/church-1/visits')
        .send({ visitedAt: '2026-04-10' })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('creates a visit and returns it with church info', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.church.findUnique.mockResolvedValueOnce({ id: 'church-1' })
      mockedPrisma.churchVisit.create.mockResolvedValueOnce(baseVisit)
      // Award check: visits for stats
      mockedPrisma.churchVisit.findMany.mockResolvedValueOnce([
        { churchId: 'church-1', church: { denominationFamily: 'Non-denominational', neighborhood: 'Alamo Heights' } },
      ])

      const response = await agent.post('/api/v1/churches/church-1/visits').send({
        visitedAt: '2026-04-10',
        notes: 'Great service',
        rating: 4,
      })

      expect(response.status).toBe(201)
      expect(response.body.data).toMatchObject({
        id: 'visit-1',
        churchId: 'church-1',
        notes: 'Great service',
        rating: 4,
      })
      expect(response.body.data.church).toMatchObject({
        name: 'Grace Church',
        slug: 'grace-church',
      })
      expect(response.body.meta).toHaveProperty('newAwards')
      expect(response.body.message).toBe('Visit logged successfully')
    })

    it('grants FIRST_VISIT award on first visit', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.church.findUnique.mockResolvedValueOnce({ id: 'church-1' })
      mockedPrisma.churchVisit.create.mockResolvedValueOnce(baseVisit)
      // checkAndGrantAwards: 1st findMany — existing awards (none)
      mockedPrisma.userAward.findMany.mockResolvedValueOnce([])
      // checkAndGrantAwards: visits for stats
      mockedPrisma.churchVisit.findMany.mockResolvedValueOnce([
        { churchId: 'church-1', church: { denominationFamily: 'Non-denominational', neighborhood: 'Alamo Heights' } },
      ])
      mockedPrisma.userAward.createMany.mockResolvedValueOnce({ count: 1 })
      // checkAndGrantAwards: 2nd findMany — retrieve newly created awards
      mockedPrisma.userAward.findMany.mockResolvedValueOnce([
        { id: 'award-1', userId: 'user-1', awardType: 'FIRST_VISIT', earnedAt: new Date() },
      ])

      const response = await agent.post('/api/v1/churches/church-1/visits').send({
        visitedAt: '2026-04-10',
      })

      expect(response.status).toBe(201)
      expect(response.body.meta.newAwards).toHaveLength(1)
      expect(response.body.meta.newAwards[0].awardType).toBe('FIRST_VISIT')
    })

    it('returns 404 when church does not exist', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.church.findUnique.mockResolvedValueOnce(null)

      const response = await agent.post('/api/v1/churches/nonexistent/visits').send({
        visitedAt: '2026-04-10',
      })

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })

    it('validates visitedAt is a valid date format', async () => {
      const agent = await buildLoginAgent()

      const response = await agent.post('/api/v1/churches/church-1/visits').send({
        visitedAt: 'not-a-date',
      })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('validates rating is between 1 and 5', async () => {
      const agent = await buildLoginAgent()

      const response = await agent.post('/api/v1/churches/church-1/visits').send({
        visitedAt: '2026-04-10',
        rating: 6,
      })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('validates notes max length', async () => {
      const agent = await buildLoginAgent()

      const response = await agent.post('/api/v1/churches/church-1/visits').send({
        visitedAt: '2026-04-10',
        notes: 'x'.repeat(1001),
      })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('PATCH /api/v1/visits/:id', () => {
    it('requires authentication', async () => {
      const response = await request(createApp())
        .patch('/api/v1/visits/visit-1')
        .send({ notes: 'Updated' })

      expect(response.status).toBe(401)
    })

    it('updates visit notes and rating', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchVisit.findUnique.mockResolvedValueOnce({
        id: 'visit-1',
        userId: 'user-1',
      })
      mockedPrisma.churchVisit.update.mockResolvedValueOnce({
        ...baseVisit,
        notes: 'Updated notes',
        rating: 5,
      })

      const response = await agent.patch('/api/v1/visits/visit-1').send({
        notes: 'Updated notes',
        rating: 5,
      })

      expect(response.status).toBe(200)
      expect(response.body.data.notes).toBe('Updated notes')
      expect(response.body.data.rating).toBe(5)
    })

    it('returns 404 for non-existent visit', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchVisit.findUnique.mockResolvedValueOnce(null)

      const response = await agent.patch('/api/v1/visits/nonexistent').send({
        notes: 'Updated',
      })

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })

    it('returns 403 when editing another user visit', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchVisit.findUnique.mockResolvedValueOnce({
        id: 'visit-1',
        userId: 'other-user',
      })

      const response = await agent.patch('/api/v1/visits/visit-1').send({
        notes: 'Hijack attempt',
      })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })
  })

  describe('DELETE /api/v1/visits/:id', () => {
    it('requires authentication', async () => {
      const response = await request(createApp()).delete('/api/v1/visits/visit-1')

      expect(response.status).toBe(401)
    })

    it('deletes a visit owned by the user', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchVisit.findUnique.mockResolvedValueOnce({
        id: 'visit-1',
        userId: 'user-1',
      })
      mockedPrisma.churchVisit.delete.mockResolvedValueOnce({ id: 'visit-1' })

      const response = await agent.delete('/api/v1/visits/visit-1')

      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe('visit-1')
      expect(response.body.message).toBe('Visit deleted successfully')
    })

    it('returns 404 for non-existent visit', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchVisit.findUnique.mockResolvedValueOnce(null)

      const response = await agent.delete('/api/v1/visits/nonexistent')

      expect(response.status).toBe(404)
    })

    it('returns 403 when deleting another user visit', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchVisit.findUnique.mockResolvedValueOnce({
        id: 'visit-1',
        userId: 'other-user',
      })

      const response = await agent.delete('/api/v1/visits/visit-1')

      expect(response.status).toBe(403)
    })
  })
})
