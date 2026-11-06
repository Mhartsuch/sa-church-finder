import bcrypt from 'bcryptjs'
import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([]),
    church: { update: jest.fn() },
    review: { aggregate: jest.fn(), findMany: jest.fn() },
    user: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  },
}))

type MockedPrisma = {
  church: { update: jest.Mock }
  review: { aggregate: jest.Mock; findMany: jest.Mock }
  user: { findUnique: jest.Mock; update: jest.Mock; delete: jest.Mock }
}

const mockedPrisma = prisma as unknown as MockedPrisma

const baseUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  avatarUrl: null,
  emailVerified: false,
  createdAt: new Date('2026-03-28T00:00:00.000Z'),
}

let passwordHash: string

beforeAll(async () => {
  passwordHash = await bcrypt.hash('password123', 4)
})

const loginAgent = async (): Promise<ReturnType<typeof request.agent>> => {
  mockedPrisma.user.findUnique.mockResolvedValueOnce({ ...baseUser, passwordHash })

  const agent = request.agent(createApp())
  const loginResponse = await agent
    .post('/api/v1/auth/login')
    .send({ email: 'user@example.com', password: 'password123' })

  expect(loginResponse.status).toBe(200)
  return agent
}

describe('user account routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('PATCH /api/v1/users/:id/profile', () => {
    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp())
        .patch('/api/v1/users/user-1/profile')
        .send({ name: 'New Name' })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it("returns 403 for a different user's profile", async () => {
      const agent = await loginAgent()
      const response = await agent.patch('/api/v1/users/other-user/profile').send({ name: 'X' })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 400 without a name', async () => {
      const agent = await loginAgent()
      const response = await agent.patch('/api/v1/users/user-1/profile').send({})

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('updates the name and returns the AuthUser', async () => {
      const agent = await loginAgent()
      mockedPrisma.user.update.mockResolvedValueOnce({ ...baseUser, name: 'Updated Name' })

      const response = await agent
        .patch('/api/v1/users/user-1/profile')
        .send({ name: '  Updated Name  ', email: 'ignored@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual({
        id: 'user-1',
        email: 'user@example.com',
        name: 'Updated Name',
        avatarUrl: null,
        emailVerified: false,
        createdAt: '2026-03-28T00:00:00.000Z',
      })
      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' }, data: { name: 'Updated Name' } }),
      )
    })
  })

  describe('GET /api/v1/users/:id/reviews', () => {
    it('returns the user reviews with a church summary', async () => {
      const agent = await loginAgent()
      mockedPrisma.review.findMany.mockResolvedValueOnce([
        {
          id: 'review-1',
          churchId: 'church-1',
          userId: 'user-1',
          rating: '5.00',
          body: 'Wonderful community and worship.',
          createdAt: new Date('2026-03-29T00:00:00.000Z'),
          updatedAt: new Date('2026-03-29T00:00:00.000Z'),
          user: { id: 'user-1', name: 'Test User', avatarUrl: null },
          church: {
            id: 'church-1',
            name: 'Grace Church',
            slug: 'grace-church',
            denomination: 'Baptist',
            neighborhood: 'Downtown',
            coverImageUrl: null,
          },
        },
      ])

      const response = await agent.get('/api/v1/users/user-1/reviews')

      expect(response.status).toBe(200)
      expect(response.body.meta).toEqual({ total: 1 })
      expect(response.body.data[0]).toEqual({
        id: 'review-1',
        churchId: 'church-1',
        userId: 'user-1',
        rating: 5,
        body: 'Wonderful community and worship.',
        createdAt: '2026-03-29T00:00:00.000Z',
        updatedAt: '2026-03-29T00:00:00.000Z',
        user: { id: 'user-1', name: 'Test User', avatarUrl: null },
        church: {
          id: 'church-1',
          name: 'Grace Church',
          slug: 'grace-church',
          denomination: 'Baptist',
          neighborhood: 'Downtown',
          coverImageUrl: null,
        },
      })
    })

    it("returns 403 for another user's reviews", async () => {
      const agent = await loginAgent()
      const response = await agent.get('/api/v1/users/other-user/reviews')
      expect(response.status).toBe(403)
    })
  })

  describe('POST /api/v1/auth/change-password', () => {
    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp())
        .post('/api/v1/auth/change-password')
        .send({ currentPassword: 'password123', newPassword: 'newpassword123' })

      expect(response.status).toBe(401)
    })

    it('returns 400 when current password is wrong', async () => {
      const agent = await loginAgent()
      mockedPrisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', passwordHash })

      const response = await agent
        .post('/api/v1/auth/change-password')
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword123' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('INVALID_PASSWORD')
    })

    it('changes the password', async () => {
      const agent = await loginAgent()
      mockedPrisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', passwordHash })
      mockedPrisma.user.update.mockResolvedValueOnce({ id: 'user-1' })

      const response = await agent
        .post('/api/v1/auth/change-password')
        .send({ currentPassword: 'password123', newPassword: 'newpassword123' })

      expect(response.status).toBe(200)
      const updateArgs = mockedPrisma.user.update.mock.calls[0]?.[0]
      await expect(bcrypt.compare('newpassword123', updateArgs.data.passwordHash)).resolves.toBe(
        true,
      )
    })

    it('returns 400 for Google-only users', async () => {
      const agent = await loginAgent()
      mockedPrisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1', passwordHash: null })

      const response = await agent
        .post('/api/v1/auth/change-password')
        .send({ currentPassword: 'password123', newPassword: 'newpassword123' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('NO_PASSWORD')
    })
  })

  describe('DELETE /api/v1/users/:id', () => {
    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp())
        .delete('/api/v1/users/user-1')
        .send({ password: 'password123' })

      expect(response.status).toBe(401)
      expect(mockedPrisma.user.delete).not.toHaveBeenCalled()
    })

    it('returns 403 when deleting another account', async () => {
      const agent = await loginAgent()
      const response = await agent.delete('/api/v1/users/other-user').send({ password: 'x' })

      expect(response.status).toBe(403)
      expect(mockedPrisma.user.delete).not.toHaveBeenCalled()
    })

    it('requires the password when the account has one', async () => {
      const agent = await loginAgent()
      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        passwordHash,
        reviews: [],
      })

      const response = await agent.delete('/api/v1/users/user-1').send({})

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('PASSWORD_REQUIRED')
      expect(mockedPrisma.user.delete).not.toHaveBeenCalled()
    })

    it('rejects a wrong password', async () => {
      const agent = await loginAgent()
      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        passwordHash,
        reviews: [],
      })

      const response = await agent.delete('/api/v1/users/user-1').send({ password: 'nope-nope' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('INVALID_PASSWORD')
      expect(mockedPrisma.user.delete).not.toHaveBeenCalled()
    })

    it('deletes the account, refreshes reviewed church ratings, and destroys the session', async () => {
      const agent = await loginAgent()
      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        passwordHash,
        reviews: [{ churchId: 'church-1' }, { churchId: 'church-2' }],
      })
      mockedPrisma.user.delete.mockResolvedValueOnce({ id: 'user-1' })
      mockedPrisma.review.aggregate.mockResolvedValue({
        _avg: { rating: null },
        _count: { _all: 0 },
      })

      const response = await agent.delete('/api/v1/users/user-1').send({ password: 'password123' })

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual({ deleted: true })
      expect(mockedPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } })
      expect(mockedPrisma.church.update).toHaveBeenCalledTimes(2)
      expect(mockedPrisma.church.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'church-2' } }),
      )

      const meResponse = await agent.get('/api/v1/auth/me')
      expect(meResponse.status).toBe(401)
    })

    it('deletes a Google-only account without a password', async () => {
      const agent = await loginAgent()
      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        passwordHash: null,
        reviews: [],
      })
      mockedPrisma.user.delete.mockResolvedValueOnce({ id: 'user-1' })

      const response = await agent.delete('/api/v1/users/user-1')

      expect(response.status).toBe(200)
      expect(mockedPrisma.user.delete).toHaveBeenCalled()
      expect(mockedPrisma.church.update).not.toHaveBeenCalled()
    })
  })
})
