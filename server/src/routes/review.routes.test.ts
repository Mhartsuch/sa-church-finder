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
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    review: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

type MockedPrisma = {
  church: {
    findUnique: jest.Mock
    update: jest.Mock
  }
  review: {
    count: jest.Mock
    findMany: jest.Mock
    findUnique: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
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

const baseReview = {
  id: 'review-1',
  churchId: 'church-1',
  userId: 'user-1',
  rating: '4.50',
  body: 'This church felt welcoming from the moment we walked in, and the service was thoughtful, grounded, and easy to follow.',
  welcomeRating: 5,
  worshipRating: 4,
  sermonRating: 4,
  facilitiesRating: 4,
  helpfulCount: 3,
  createdAt: new Date('2026-03-28T10:00:00.000Z'),
  updatedAt: new Date('2026-03-28T10:00:00.000Z'),
  user: {
    id: 'user-1',
    name: 'Test User',
    avatarUrl: null,
  },
}

describe('review routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  const loginAgent = async (): Promise<ReturnType<typeof request.agent>> => {
    const passwordHash = await bcrypt.hash('password123', 12)

    mockedPrisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      passwordHash,
    })

    const agent = request.agent(createApp())

    const loginResponse = await agent.post('/api/v1/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    })

    expect(loginResponse.status).toBe(200)

    return agent
  }

  it('requires authentication to create a review', async () => {
    const response = await request(createApp())
      .post('/api/v1/churches/church-1/reviews')
      .send({
        rating: 4.5,
        body: 'This church felt warm and welcoming from start to finish, and the sermon stayed with us all afternoon.',
      })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('lists church reviews and returns the current users existing review', async () => {
    const agent = await loginAgent()

    mockedPrisma.church.findUnique.mockResolvedValue({ id: 'church-1' })
    mockedPrisma.review.count.mockResolvedValue(1)
    mockedPrisma.review.findMany.mockResolvedValue([baseReview])
    mockedPrisma.review.findUnique.mockResolvedValue(baseReview)

    const response = await agent.get('/api/v1/churches/church-1/reviews?sort=highest')

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.meta).toMatchObject({
      sort: 'highest',
      total: 1,
    })
    expect(response.body.currentUserReview).toMatchObject({
      id: 'review-1',
      userId: 'user-1',
    })
  })

  it('creates a review and updates church aggregates incrementally', async () => {
    const agent = await loginAgent()

    mockedPrisma.church.findUnique.mockResolvedValue({
      id: 'church-1',
      avgRating: '4.50',
      reviewCount: 10,
    })
    mockedPrisma.review.findUnique.mockResolvedValue(null)
    mockedPrisma.review.create.mockResolvedValue({
      ...baseReview,
      rating: '5.00',
    })
    mockedPrisma.church.update.mockResolvedValue({
      id: 'church-1',
    })

    const response = await agent.post('/api/v1/churches/church-1/reviews').send({
      rating: 5,
      body: 'We felt genuinely welcomed, the worship was strong, and the message was both clear and practical for our family.',
      welcomeRating: 5,
      worshipRating: 5,
      sermonRating: 5,
      facilitiesRating: 4,
    })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({
      churchId: 'church-1',
      rating: 5,
    })

    const updateArgs = mockedPrisma.church.update.mock.calls[0][0]
    expect(updateArgs.data.reviewCount).toBe(11)
    expect(String(updateArgs.data.avgRating)).toBe('4.55')
  })

  it('updates an existing review and adjusts the aggregate without changing the count', async () => {
    const agent = await loginAgent()

    mockedPrisma.review.findUnique.mockResolvedValue({
      ...baseReview,
      rating: '4.00',
    })
    mockedPrisma.church.findUnique.mockResolvedValue({
      id: 'church-1',
      avgRating: '4.50',
      reviewCount: 10,
    })
    mockedPrisma.review.update.mockResolvedValue({
      ...baseReview,
      rating: '5.00',
      updatedAt: new Date('2026-03-29T10:00:00.000Z'),
    })
    mockedPrisma.church.update.mockResolvedValue({
      id: 'church-1',
    })

    const response = await agent.patch('/api/v1/reviews/review-1').send({
      rating: 5,
      body: 'After a second visit, the church felt even more welcoming and the teaching was especially strong and practical.',
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'review-1',
      rating: 5,
    })

    const updateArgs = mockedPrisma.church.update.mock.calls[0][0]
    expect(updateArgs.data.reviewCount).toBe(10)
    expect(Number(updateArgs.data.avgRating)).toBeCloseTo(4.6, 5)
  })

  it('deletes a review, updates aggregates, and exposes account review history only to the owner', async () => {
    const agent = await loginAgent()

    mockedPrisma.review.findUnique.mockResolvedValue({
      ...baseReview,
      rating: '4.50',
    })
    mockedPrisma.church.findUnique.mockResolvedValue({
      id: 'church-1',
      avgRating: '4.50',
      reviewCount: 10,
    })
    mockedPrisma.review.delete.mockResolvedValue({
      id: 'review-1',
    })
    mockedPrisma.church.update.mockResolvedValue({
      id: 'church-1',
    })
    mockedPrisma.review.findMany.mockResolvedValue([
      {
        ...baseReview,
        church: {
          id: 'church-1',
          name: 'Grace Fellowship',
          slug: 'grace-fellowship',
          denomination: 'Non-denominational',
          city: 'San Antonio',
          state: 'TX',
          neighborhood: 'Downtown',
        },
      },
    ])

    const deleteResponse = await agent.delete('/api/v1/reviews/review-1')

    expect(deleteResponse.status).toBe(200)

    const deleteUpdateArgs = mockedPrisma.church.update.mock.calls[0][0]
    expect(deleteUpdateArgs.data.reviewCount).toBe(9)
    expect(Number(deleteUpdateArgs.data.avgRating)).toBeCloseTo(4.5, 5)

    const ownReviewsResponse = await agent.get('/api/v1/users/user-1/reviews')

    expect(ownReviewsResponse.status).toBe(200)
    expect(ownReviewsResponse.body.data[0]).toMatchObject({
      id: 'review-1',
      church: {
        slug: 'grace-fellowship',
      },
    })

    const otherReviewsResponse = await agent.get('/api/v1/users/user-2/reviews')

    expect(otherReviewsResponse.status).toBe(403)
    expect(otherReviewsResponse.body.error.code).toBe('FORBIDDEN')
  })
})
