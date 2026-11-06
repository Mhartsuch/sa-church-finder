import bcrypt from 'bcryptjs'
import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'

jest.mock('../services/notification-email.service.js', () => ({
  __esModule: true,
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([]),
    church: { findUnique: jest.fn(), update: jest.fn() },
    review: {
      aggregate: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: { findUnique: jest.fn() },
  },
}))

type MockedPrisma = {
  church: { findUnique: jest.Mock; update: jest.Mock }
  review: {
    aggregate: jest.Mock
    count: jest.Mock
    findMany: jest.Mock
    findUnique: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
  user: { findUnique: jest.Mock }
}

const mockedPrisma = prisma as unknown as MockedPrisma

const baseUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  avatarUrl: null,
  emailVerified: true,
  createdAt: new Date('2026-03-28T00:00:00.000Z'),
}

const reviewBody = 'Warm welcome, thoughtful sermon, and a great kids program.'

const baseReview = {
  id: 'review-1',
  churchId: 'church-1',
  userId: 'user-1',
  rating: '4.00',
  body: reviewBody,
  createdAt: new Date('2026-03-28T10:00:00.000Z'),
  updatedAt: new Date('2026-03-28T10:00:00.000Z'),
  user: { id: 'user-1', name: 'Test User', avatarUrl: null },
}

const expectedReview = {
  id: 'review-1',
  churchId: 'church-1',
  userId: 'user-1',
  rating: 4,
  body: reviewBody,
  createdAt: '2026-03-28T10:00:00.000Z',
  updatedAt: '2026-03-28T10:00:00.000Z',
  user: { id: 'user-1', name: 'Test User', avatarUrl: null },
}

const loginAgent = async (): Promise<ReturnType<typeof request.agent>> => {
  mockedPrisma.user.findUnique.mockResolvedValue({
    ...baseUser,
    passwordHash: await bcrypt.hash('password123', 4),
  })
  const agent = request.agent(createApp())
  const login = await agent
    .post('/api/v1/auth/login')
    .send({ email: 'user@example.com', password: 'password123' })
  expect(login.status).toBe(200)
  return agent
}

describe('review routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockedPrisma.church.findUnique.mockResolvedValue({ id: 'church-1' })
    mockedPrisma.review.aggregate.mockResolvedValue({
      _avg: { rating: '4.50' },
      _count: { _all: 2 },
    })
  })

  describe('GET /churches/:churchId/reviews', () => {
    it('returns paginated reviews with meta and null currentUserReview when anonymous', async () => {
      mockedPrisma.review.count.mockResolvedValue(11)
      mockedPrisma.review.findMany.mockResolvedValue([baseReview])

      const response = await request(createApp())
        .get('/api/v1/churches/church-1/reviews')
        .query({ page: 2, pageSize: 5, sort: 'highest' })

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        data: [expectedReview],
        meta: { page: 2, pageSize: 5, total: 11, totalPages: 3, sort: 'highest' },
        currentUserReview: null,
      })
      expect(mockedPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { churchId: 'church-1' },
          orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
          skip: 5,
          take: 5,
        }),
      )
    })

    it('includes the signed-in user review', async () => {
      const agent = await loginAgent()
      mockedPrisma.review.count.mockResolvedValue(1)
      mockedPrisma.review.findMany.mockResolvedValue([baseReview])
      mockedPrisma.review.findUnique.mockResolvedValue(baseReview)

      const response = await agent.get('/api/v1/churches/church-1/reviews')

      expect(response.status).toBe(200)
      expect(response.body.meta.sort).toBe('recent')
      expect(response.body.currentUserReview).toEqual(expectedReview)
    })

    it('rejects unknown sort values', async () => {
      const response = await request(createApp())
        .get('/api/v1/churches/church-1/reviews')
        .query({ sort: 'helpful' })
      expect(response.status).toBe(400)
    })

    it('returns 404 for an unknown church', async () => {
      mockedPrisma.church.findUnique.mockResolvedValue(null)
      const response = await request(createApp()).get('/api/v1/churches/nope/reviews')
      expect(response.status).toBe(404)
    })
  })

  describe('POST /churches/:churchId/reviews', () => {
    it('requires authentication', async () => {
      const response = await request(createApp())
        .post('/api/v1/churches/church-1/reviews')
        .send({ rating: 4, body: reviewBody })
      expect(response.status).toBe(401)
    })

    it('creates a review and recomputes the church aggregate', async () => {
      const agent = await loginAgent()
      mockedPrisma.review.findUnique.mockResolvedValue(null)
      mockedPrisma.review.create.mockResolvedValue(baseReview)

      const response = await agent
        .post('/api/v1/churches/church-1/reviews')
        .send({ rating: 4, body: reviewBody })

      expect(response.status).toBe(201)
      expect(response.body.data).toEqual(expectedReview)
      expect(mockedPrisma.review.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { userId: 'user-1', churchId: 'church-1', rating: 4, body: reviewBody },
        }),
      )
      expect(mockedPrisma.church.update).toHaveBeenCalledWith({
        where: { id: 'church-1' },
        data: { avgRating: expect.anything(), reviewCount: 2 },
      })
      const { avgRating } = mockedPrisma.church.update.mock.calls[0][0].data
      expect(Number(avgRating)).toBe(4.5)
    })

    it('rejects a second review for the same church', async () => {
      const agent = await loginAgent()
      mockedPrisma.review.findUnique.mockResolvedValue({ id: 'review-1' })

      const response = await agent
        .post('/api/v1/churches/church-1/reviews')
        .send({ rating: 4, body: reviewBody })

      expect(response.status).toBe(409)
      expect(mockedPrisma.review.create).not.toHaveBeenCalled()
    })

    it('rejects out-of-range or fractional ratings', async () => {
      const agent = await loginAgent()
      for (const rating of [0, 6, 3.5]) {
        const response = await agent
          .post('/api/v1/churches/church-1/reviews')
          .send({ rating, body: reviewBody })
        expect(response.status).toBe(400)
      }
    })
  })

  describe('PATCH /reviews/:id', () => {
    it('updates the owner review and refreshes the aggregate when the rating changes', async () => {
      const agent = await loginAgent()
      mockedPrisma.review.findUnique.mockResolvedValue(baseReview)
      mockedPrisma.review.update.mockResolvedValue({ ...baseReview, rating: '5.00' })

      const response = await agent.patch('/api/v1/reviews/review-1').send({ rating: 5 })

      expect(response.status).toBe(200)
      expect(response.body.data.rating).toBe(5)
      expect(mockedPrisma.review.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'review-1' }, data: { rating: 5 } }),
      )
      expect(mockedPrisma.church.update).toHaveBeenCalledTimes(1)
    })

    it('skips the aggregate refresh for body-only edits', async () => {
      const agent = await loginAgent()
      mockedPrisma.review.findUnique.mockResolvedValue(baseReview)
      mockedPrisma.review.update.mockResolvedValue({ ...baseReview, body: 'Updated body text.' })

      const response = await agent
        .patch('/api/v1/reviews/review-1')
        .send({ body: 'Updated body text.' })

      expect(response.status).toBe(200)
      expect(mockedPrisma.church.update).not.toHaveBeenCalled()
    })

    it("forbids editing someone else's review", async () => {
      const agent = await loginAgent()
      mockedPrisma.review.findUnique.mockResolvedValue({ ...baseReview, userId: 'user-2' })

      const response = await agent.patch('/api/v1/reviews/review-1').send({ rating: 1 })

      expect(response.status).toBe(403)
      expect(mockedPrisma.review.update).not.toHaveBeenCalled()
    })

    it('requires at least one field', async () => {
      const agent = await loginAgent()
      const response = await agent.patch('/api/v1/reviews/review-1').send({})
      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /reviews/:id', () => {
    it('deletes the owner review and recomputes the aggregate', async () => {
      const agent = await loginAgent()
      mockedPrisma.review.findUnique.mockResolvedValue(baseReview)
      mockedPrisma.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { _all: 0 },
      })

      const response = await agent.delete('/api/v1/reviews/review-1')

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual({ id: 'review-1', churchId: 'church-1' })
      expect(mockedPrisma.review.delete).toHaveBeenCalledWith({ where: { id: 'review-1' } })
      const { data } = mockedPrisma.church.update.mock.calls[0][0]
      expect(data.reviewCount).toBe(0)
      expect(Number(data.avgRating)).toBe(0)
    })

    it('returns 404 for a missing review', async () => {
      const agent = await loginAgent()
      mockedPrisma.review.findUnique.mockResolvedValue(null)
      const response = await agent.delete('/api/v1/reviews/missing')
      expect(response.status).toBe(404)
    })

    it("forbids deleting someone else's review", async () => {
      const agent = await loginAgent()
      mockedPrisma.review.findUnique.mockResolvedValue({ ...baseReview, userId: 'user-2' })
      const response = await agent.delete('/api/v1/reviews/review-1')
      expect(response.status).toBe(403)
      expect(mockedPrisma.review.delete).not.toHaveBeenCalled()
    })
  })
})
