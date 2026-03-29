import bcrypt from 'bcryptjs'
import { createHash } from 'crypto'
import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn(),
    church: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    passwordResetToken: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

type MockedPrisma = {
  $transaction: jest.Mock
  user: {
    findUnique: jest.Mock
    create: jest.Mock
    update: jest.Mock
  }
  passwordResetToken: {
    deleteMany: jest.Mock
    create: jest.Mock
    findUnique: jest.Mock
    update: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma
const originalResetPreviewSetting = process.env.AUTH_EXPOSE_RESET_PREVIEW

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
    mockedPrisma.$transaction.mockImplementation((operations: unknown[]) =>
      Promise.all(operations),
    )
    delete process.env.AUTH_EXPOSE_RESET_PREVIEW
  })

  afterAll(() => {
    if (originalResetPreviewSetting === undefined) {
      delete process.env.AUTH_EXPOSE_RESET_PREVIEW
      return
    }

    process.env.AUTH_EXPOSE_RESET_PREVIEW = originalResetPreviewSetting
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

  it('creates a password reset token and exposes a preview link only when preview mode is enabled', async () => {
    process.env.AUTH_EXPOSE_RESET_PREVIEW = 'true'

    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      email: 'user@example.com',
    })
    mockedPrisma.passwordResetToken.deleteMany.mockResolvedValueOnce({ count: 0 })
    mockedPrisma.passwordResetToken.create.mockResolvedValueOnce({ id: 'reset-token-1' })

    const response = await request(createApp()).post('/api/v1/auth/forgot-password').send({
      email: '  USER@example.com  ',
    })

    expect(response.status).toBe(200)
    expect(response.body.message).toMatch(/If an account exists/)
    expect(response.body.data.previewUrl).toMatch(
      /^http:\/\/localhost:5173\/reset-password\?token=/,
    )
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          email: 'user@example.com',
        },
      }),
    )
    expect(mockedPrisma.passwordResetToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      }),
    )
  })

  it('returns a generic forgot-password response when the account does not exist', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null)

    const response = await request(createApp()).post('/api/v1/auth/forgot-password').send({
      email: 'missing@example.com',
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toEqual({})
    expect(response.body.message).toMatch(/If an account exists/)
    expect(mockedPrisma.passwordResetToken.create).not.toHaveBeenCalled()
  })

  it('resets a password and invalidates any remaining reset tokens for the user', async () => {
    const rawToken = 'plain-reset-token'
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')

    mockedPrisma.passwordResetToken.findUnique.mockResolvedValueOnce({
      id: 'reset-token-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      usedAt: null,
    })
    mockedPrisma.passwordResetToken.update.mockResolvedValueOnce({ id: 'reset-token-1' })
    mockedPrisma.user.update.mockResolvedValueOnce({ id: 'user-1' })
    mockedPrisma.passwordResetToken.deleteMany.mockResolvedValueOnce({ count: 1 })

    const response = await request(createApp()).post('/api/v1/auth/reset-password').send({
      token: rawToken,
      password: 'newpassword123',
    })

    expect(response.status).toBe(200)
    expect(response.body.message).toBe('Password reset successful')
    expect(mockedPrisma.passwordResetToken.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tokenHash,
        },
      }),
    )
    expect(mockedPrisma.passwordResetToken.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'reset-token-1' },
        data: expect.objectContaining({
          usedAt: expect.any(Date),
        }),
      }),
    )
    expect(mockedPrisma.passwordResetToken.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: 'user-1',
          usedAt: null,
        },
      }),
    )

    const userUpdateArgs = mockedPrisma.user.update.mock.calls[0]?.[0]
    expect(userUpdateArgs).toEqual(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          passwordHash: expect.any(String),
        }),
      }),
    )
    await expect(
      bcrypt.compare('newpassword123', userUpdateArgs.data.passwordHash),
    ).resolves.toBe(true)
  })

  it('rejects reset attempts with an invalid or expired token', async () => {
    mockedPrisma.passwordResetToken.findUnique.mockResolvedValueOnce(null)

    const response = await request(createApp()).post('/api/v1/auth/reset-password').send({
      token: 'bad-token',
      password: 'newpassword123',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('INVALID_RESET_TOKEN')
  })
})
