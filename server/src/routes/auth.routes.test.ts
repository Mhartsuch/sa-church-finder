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
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

type MockedPrisma = {
  user: {
    findUnique: jest.Mock
    create: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma

const baseUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  avatarUrl: null,
  role: 'USER',
  emailVerified: false,
  createdAt: new Date('2026-03-28T00:00:00.000Z'),
}

describe('auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('registers a user, normalizes the email, and establishes a session', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null)
    mockedPrisma.user.create.mockResolvedValueOnce({
      ...baseUser,
      email: 'new@example.com',
      name: 'New User',
    })

    const agent = request.agent(createApp())

    const registerResponse = await agent.post('/api/v1/auth/register').send({
      email: '  NEW@Example.com  ',
      password: 'password123',
      name: 'New User',
    })

    expect(registerResponse.status).toBe(201)
    expect(registerResponse.body.data).toMatchObject({
      email: 'new@example.com',
      name: 'New User',
      role: 'user',
      emailVerified: false,
    })
    expect(mockedPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'new@example.com',
          name: 'New User',
        }),
      }),
    )
    expect(registerResponse.headers['set-cookie']).toBeDefined()
  })

  it('rejects duplicate registration attempts', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' })

    const response = await request(createApp()).post('/api/v1/auth/register').send({
      email: 'user@example.com',
      password: 'password123',
      name: 'Existing User',
    })

    expect(response.status).toBe(409)
    expect(response.body.error.code).toBe('CONFLICT')
    expect(mockedPrisma.user.create).not.toHaveBeenCalled()
  })

  it('logs in, returns the current user, and clears the session on logout', async () => {
    const passwordHash = await bcrypt.hash('password123', 12)

    mockedPrisma.user.findUnique
      .mockResolvedValueOnce({
        ...baseUser,
        passwordHash,
      })
      .mockResolvedValueOnce(baseUser)

    const agent = request.agent(createApp())

    const loginResponse = await agent.post('/api/v1/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    })

    expect(loginResponse.status).toBe(200)
    expect(loginResponse.body.data).toMatchObject({
      email: 'user@example.com',
      role: 'user',
    })

    const meResponse = await agent.get('/api/v1/auth/me')

    expect(meResponse.status).toBe(200)
    expect(meResponse.body.data).toMatchObject({
      id: 'user-1',
      email: 'user@example.com',
    })

    const logoutResponse = await agent.post('/api/v1/auth/logout')

    expect(logoutResponse.status).toBe(200)
    expect(logoutResponse.body.message).toBe('Logout successful')

    const meAfterLogout = await agent.get('/api/v1/auth/me')

    expect(meAfterLogout.status).toBe(401)
    expect(meAfterLogout.body.error.code).toBe('AUTH_ERROR')
  })

  it('rejects invalid login credentials', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null)

    const response = await request(createApp()).post('/api/v1/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })
})
