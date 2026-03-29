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
    emailVerificationToken: {
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
  emailVerificationToken: {
    deleteMany: jest.Mock
    create: jest.Mock
    findUnique: jest.Mock
    update: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma
const fetchMock = jest.fn()
const originalFetch = global.fetch
const originalResetPreviewSetting = process.env.AUTH_EXPOSE_RESET_PREVIEW
const originalVerificationPreviewSetting = process.env.AUTH_EXPOSE_VERIFICATION_PREVIEW
const originalGoogleClientId = process.env.GOOGLE_CLIENT_ID
const originalGoogleClientSecret = process.env.GOOGLE_CLIENT_SECRET
const originalGoogleCallbackUrl = process.env.GOOGLE_CALLBACK_URL

const baseUser = {
  id: 'user-1',
  email: 'user@example.com',
  name: 'Test User',
  avatarUrl: null,
  role: 'USER',
  emailVerified: false,
  createdAt: new Date('2026-03-28T00:00:00.000Z'),
}

const loginAgent = async (): Promise<ReturnType<typeof request.agent>> => {
  const passwordHash = await bcrypt.hash('password123', 12)

  mockedPrisma.user.findUnique.mockResolvedValueOnce({
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

describe('auth routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = fetchMock as typeof fetch
    mockedPrisma.$transaction.mockImplementation((operations: unknown[]) =>
      Promise.all(operations),
    )
    mockedPrisma.emailVerificationToken.deleteMany.mockResolvedValue({ count: 0 })
    mockedPrisma.emailVerificationToken.create.mockResolvedValue({ id: 'verify-token-1' })
    delete process.env.AUTH_EXPOSE_RESET_PREVIEW
    delete process.env.AUTH_EXPOSE_VERIFICATION_PREVIEW
    process.env.GOOGLE_CLIENT_ID = 'google-client-id'
    process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret'
    process.env.GOOGLE_CALLBACK_URL =
      'http://localhost:3001/api/v1/auth/google/callback'
  })

  afterAll(() => {
    if (originalFetch) {
      global.fetch = originalFetch
    }

    if (originalResetPreviewSetting === undefined) {
      delete process.env.AUTH_EXPOSE_RESET_PREVIEW
    } else {
      process.env.AUTH_EXPOSE_RESET_PREVIEW = originalResetPreviewSetting
    }

    if (originalVerificationPreviewSetting === undefined) {
      delete process.env.AUTH_EXPOSE_VERIFICATION_PREVIEW
    } else {
      process.env.AUTH_EXPOSE_VERIFICATION_PREVIEW = originalVerificationPreviewSetting
    }

    if (originalGoogleClientId === undefined) {
      delete process.env.GOOGLE_CLIENT_ID
    } else {
      process.env.GOOGLE_CLIENT_ID = originalGoogleClientId
    }

    if (originalGoogleClientSecret === undefined) {
      delete process.env.GOOGLE_CLIENT_SECRET
    } else {
      process.env.GOOGLE_CLIENT_SECRET = originalGoogleClientSecret
    }

    if (originalGoogleCallbackUrl === undefined) {
      delete process.env.GOOGLE_CALLBACK_URL
    } else {
      process.env.GOOGLE_CALLBACK_URL = originalGoogleCallbackUrl
    }
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
    expect(mockedPrisma.emailVerificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
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

  it('starts Google OAuth with the expected redirect and preserves the requested return path', async () => {
    const response = await request(createApp())
      .get('/api/v1/auth/google')
      .query({ returnTo: '/churches/grace-community?tab=reviews' })

    expect(response.status).toBe(302)
    expect(response.headers['set-cookie']).toBeDefined()

    const redirectUrl = new URL(response.headers.location)

    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      'https://accounts.google.com/o/oauth2/v2/auth',
    )
    expect(redirectUrl.searchParams.get('client_id')).toBe('google-client-id')
    expect(redirectUrl.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3001/api/v1/auth/google/callback',
    )
    expect(redirectUrl.searchParams.get('scope')).toBe('openid email profile')
    expect(redirectUrl.searchParams.get('response_type')).toBe('code')
    expect(redirectUrl.searchParams.get('state')).toBeTruthy()
  })

  it('creates a session-backed user from Google OAuth and redirects back to the saved return path', async () => {
    const agent = request.agent(createApp())
    const googleUser = {
      ...baseUser,
      email: 'google-user@example.com',
      name: 'Google User',
      avatarUrl: 'https://example.com/avatar.png',
      emailVerified: true,
    }

    const startResponse = await agent
      .get('/api/v1/auth/google')
      .query({ returnTo: '/churches/grace-community?tab=reviews' })
    const state = new URL(startResponse.headers.location).searchParams.get('state')

    expect(state).toBeTruthy()

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          access_token: 'google-access-token',
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          sub: 'google-sub-1',
          email: 'google-user@example.com',
          email_verified: true,
          name: 'Google User',
          picture: 'https://example.com/avatar.png',
        }),
      } as Response)

    mockedPrisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(googleUser)
    mockedPrisma.user.create.mockResolvedValueOnce(googleUser)

    const callbackResponse = await agent.get('/api/v1/auth/google/callback').query({
      code: 'google-auth-code',
      state: state!,
    })

    expect(callbackResponse.status).toBe(302)
    expect(callbackResponse.headers.location).toBe(
      'http://localhost:5173/churches/grace-community?tab=reviews',
    )
    expect(mockedPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: 'google-user@example.com',
          name: 'Google User',
          googleId: 'google-sub-1',
          emailVerified: true,
          avatarUrl: 'https://example.com/avatar.png',
        }),
      }),
    )

    const meResponse = await agent.get('/api/v1/auth/me')

    expect(meResponse.status).toBe(200)
    expect(meResponse.body.data).toMatchObject({
      id: 'user-1',
      email: 'google-user@example.com',
      emailVerified: true,
    })
  })

  it('links Google OAuth to an existing account with the same email', async () => {
    const agent = request.agent(createApp())
    const existingEmailUser = {
      ...baseUser,
      googleId: null,
    }
    const linkedUser = {
      ...baseUser,
      avatarUrl: 'https://example.com/avatar.png',
      emailVerified: true,
    }

    const startResponse = await agent
      .get('/api/v1/auth/google')
      .query({ returnTo: '/search?sort=rating' })
    const state = new URL(startResponse.headers.location).searchParams.get('state')

    expect(state).toBeTruthy()

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          access_token: 'google-access-token',
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          sub: 'google-sub-2',
          email: 'user@example.com',
          email_verified: true,
          name: 'Updated Google Name',
          picture: 'https://example.com/avatar.png',
        }),
      } as Response)

    mockedPrisma.user.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingEmailUser)
    mockedPrisma.user.update.mockResolvedValueOnce(linkedUser)

    const callbackResponse = await agent.get('/api/v1/auth/google/callback').query({
      code: 'google-auth-code',
      state: state!,
    })

    expect(callbackResponse.status).toBe(302)
    expect(callbackResponse.headers.location).toBe('http://localhost:5173/search?sort=rating')
    expect(mockedPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          googleId: 'google-sub-2',
          emailVerified: true,
          avatarUrl: 'https://example.com/avatar.png',
        }),
      }),
    )
  })

  it('redirects back to login when Google OAuth callback state is invalid', async () => {
    const agent = request.agent(createApp())

    await agent.get('/api/v1/auth/google').query({ returnTo: '/churches/grace-community' })

    const callbackResponse = await agent.get('/api/v1/auth/google/callback').query({
      code: 'google-auth-code',
      state: 'wrong-state',
    })

    expect(callbackResponse.status).toBe(302)

    const redirectUrl = new URL(callbackResponse.headers.location)

    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      'http://localhost:5173/login',
    )
    expect(redirectUrl.searchParams.get('authError')).toBe('google_session_expired')
    expect(redirectUrl.searchParams.get('returnTo')).toBe('/churches/grace-community')
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('redirects back to login when Google OAuth is not configured', async () => {
    delete process.env.GOOGLE_CLIENT_ID
    delete process.env.GOOGLE_CLIENT_SECRET

    const response = await request(createApp())
      .get('/api/v1/auth/google')
      .query({ returnTo: '/churches/grace-community' })

    expect(response.status).toBe(302)

    const redirectUrl = new URL(response.headers.location)

    expect(`${redirectUrl.origin}${redirectUrl.pathname}`).toBe(
      'http://localhost:5173/login',
    )
    expect(redirectUrl.searchParams.get('authError')).toBe('google_unavailable')
    expect(redirectUrl.searchParams.get('returnTo')).toBe('/churches/grace-community')
  })

  it('resends an email verification token and exposes a preview link when enabled', async () => {
    process.env.AUTH_EXPOSE_VERIFICATION_PREVIEW = 'true'

    const agent = await loginAgent()

    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      emailVerified: false,
    })

    const response = await agent.post('/api/v1/auth/verify-email/resend').send({})

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      status: 'sent',
    })
    expect(response.body.data.previewUrl).toMatch(
      /^http:\/\/localhost:5173\/verify-email\?token=/,
    )
    expect(mockedPrisma.emailVerificationToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          tokenHash: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      }),
    )
  })

  it('returns an already-verified status when resending verification for a verified user', async () => {
    const agent = await loginAgent()

    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      emailVerified: true,
    })

    const response = await agent.post('/api/v1/auth/verify-email/resend').send({})

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      status: 'already-verified',
    })
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

  it('verifies an email token and marks the user as verified', async () => {
    const rawToken = 'verify-email-token'
    const tokenHash = createHash('sha256').update(rawToken).digest('hex')

    mockedPrisma.emailVerificationToken.findUnique.mockResolvedValueOnce({
      id: 'verification-token-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
      usedAt: null,
      user: {
        emailVerified: false,
      },
    })
    mockedPrisma.emailVerificationToken.update.mockResolvedValueOnce({
      id: 'verification-token-1',
    })
    mockedPrisma.user.update.mockResolvedValueOnce({ id: 'user-1' })
    mockedPrisma.emailVerificationToken.deleteMany.mockResolvedValueOnce({ count: 0 })

    const response = await request(createApp()).post('/api/v1/auth/verify-email').send({
      token: rawToken,
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      status: 'verified',
    })
    expect(mockedPrisma.emailVerificationToken.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tokenHash,
        },
      }),
    )
    expect(mockedPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-1' },
        data: {
          emailVerified: true,
        },
      }),
    )
  })

  it('treats reused verification links for already verified users as a success state', async () => {
    mockedPrisma.emailVerificationToken.findUnique.mockResolvedValueOnce({
      id: 'verification-token-1',
      userId: 'user-1',
      expiresAt: new Date(Date.now() - 1000),
      usedAt: new Date(Date.now() - 500),
      user: {
        emailVerified: true,
      },
    })

    const response = await request(createApp()).post('/api/v1/auth/verify-email').send({
      token: 'used-verification-token',
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      status: 'already-verified',
    })
  })

  it('rejects invalid email verification tokens', async () => {
    mockedPrisma.emailVerificationToken.findUnique.mockResolvedValueOnce(null)

    const response = await request(createApp()).post('/api/v1/auth/verify-email').send({
      token: 'bad-verification-token',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('INVALID_EMAIL_VERIFICATION_TOKEN')
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
