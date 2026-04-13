import bcrypt from 'bcryptjs'
import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'
import { isEmailDeliveryConfigured } from '../lib/email.js'
import { sendEmailVerificationEmail } from '../services/auth-email.service.js'

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
    emailVerificationToken: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))
jest.mock('../lib/email.js', () => ({
  __esModule: true,
  isEmailDeliveryConfigured: jest.fn(),
}))
jest.mock('../services/auth-email.service.js', () => ({
  __esModule: true,
  sendEmailVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}))
jest.mock('fs/promises', () => ({
  __esModule: true,
  unlink: jest.fn().mockResolvedValue(undefined),
}))

type MockedPrisma = {
  $transaction: jest.Mock
  user: {
    findUnique: jest.Mock
    create: jest.Mock
    update: jest.Mock
  }
  emailVerificationToken: {
    deleteMany: jest.Mock
    create: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma
const mockedIsEmailDeliveryConfigured = isEmailDeliveryConfigured as jest.MockedFunction<
  typeof isEmailDeliveryConfigured
>
const mockedSendEmailVerificationEmail = sendEmailVerificationEmail as jest.MockedFunction<
  typeof sendEmailVerificationEmail
>

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
    deactivatedAt: null,
  })

  const agent = request.agent(createApp())
  const loginResponse = await agent.post('/api/v1/auth/login').send({
    email: 'user@example.com',
    password: 'password123',
  })

  expect(loginResponse.status).toBe(200)

  return agent
}

describe('user account routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedIsEmailDeliveryConfigured.mockReturnValue(false)
    mockedSendEmailVerificationEmail.mockResolvedValue(undefined)
    mockedPrisma.$transaction.mockImplementation((operations: unknown[]) => Promise.all(operations))
    mockedPrisma.emailVerificationToken.deleteMany.mockResolvedValue({ count: 0 })
    mockedPrisma.emailVerificationToken.create.mockResolvedValue({ id: 'verify-token-1' })
  })

  // --- Profile Update (PATCH /api/v1/users/:id/profile) ---

  describe('PATCH /api/v1/users/:id/profile', () => {
    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp())
        .patch('/api/v1/users/user-1/profile')
        .send({ name: 'New Name' })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it("returns 403 when updating a different user's profile", async () => {
      const agent = await loginAgent()

      const response = await agent
        .patch('/api/v1/users/other-user/profile')
        .send({ name: 'New Name' })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 400 when body has no name or email', async () => {
      const agent = await loginAgent()

      const response = await agent.patch('/api/v1/users/user-1/profile').send({})

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('successfully updates name only', async () => {
      const agent = await loginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'user@example.com',
      })

      const updatedUser = {
        ...baseUser,
        name: 'Updated Name',
      }
      mockedPrisma.user.update.mockResolvedValueOnce(updatedUser)

      const response = await agent
        .patch('/api/v1/users/user-1/profile')
        .send({ name: 'Updated Name' })

      expect(response.status).toBe(200)
      expect(response.body.data.user).toMatchObject({
        id: 'user-1',
        name: 'Updated Name',
      })
      expect(response.body.data.emailChanged).toBe(false)
      expect(response.body.message).toBe('Profile updated successfully.')
    })

    it('successfully updates email and sets emailVerified to false', async () => {
      const agent = await loginAgent()

      mockedPrisma.user.findUnique
        .mockResolvedValueOnce({
          id: 'user-1',
          email: 'user@example.com',
        })
        .mockResolvedValueOnce(null) // no existing user with new email

      const updatedUser = {
        ...baseUser,
        email: 'newemail@example.com',
        emailVerified: false,
      }
      mockedPrisma.user.update.mockResolvedValueOnce(updatedUser)

      const response = await agent
        .patch('/api/v1/users/user-1/profile')
        .send({ email: 'newemail@example.com' })

      expect(response.status).toBe(200)
      expect(response.body.data.user).toMatchObject({
        email: 'newemail@example.com',
        emailVerified: false,
      })
      expect(response.body.data.emailChanged).toBe(true)
      expect(response.body.message).toBe('Profile updated. Please verify your new email address.')
      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            email: 'newemail@example.com',
            emailVerified: false,
          }),
        }),
      )
    })

    it('returns 409 when new email already exists', async () => {
      const agent = await loginAgent()

      mockedPrisma.user.findUnique
        .mockResolvedValueOnce({
          id: 'user-1',
          email: 'user@example.com',
        })
        .mockResolvedValueOnce({
          id: 'other-user',
        }) // email already taken

      const response = await agent
        .patch('/api/v1/users/user-1/profile')
        .send({ email: 'taken@example.com' })

      expect(response.status).toBe(409)
      expect(response.body.error.code).toBe('CONFLICT')
    })
  })

  // --- Change Password (POST /api/v1/auth/change-password) ---

  describe('POST /api/v1/auth/change-password', () => {
    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp()).post('/api/v1/auth/change-password').send({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('returns 400 when current password is wrong', async () => {
      const agent = await loginAgent()

      const passwordHash = await bcrypt.hash('password123', 12)
      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        passwordHash,
      })

      const response = await agent.post('/api/v1/auth/change-password').send({
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123',
      })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('INVALID_PASSWORD')
    })

    it('successfully changes password', async () => {
      const agent = await loginAgent()

      const passwordHash = await bcrypt.hash('password123', 12)
      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        passwordHash,
      })
      mockedPrisma.user.update.mockResolvedValueOnce({ id: 'user-1' })

      const response = await agent.post('/api/v1/auth/change-password').send({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      })

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Password changed successfully.')
      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            passwordHash: expect.any(String),
          }),
        }),
      )

      const updateArgs = mockedPrisma.user.update.mock.calls[0]?.[0]
      await expect(bcrypt.compare('newpassword123', updateArgs.data.passwordHash)).resolves.toBe(
        true,
      )
    })

    it('returns 400 for Google-only users (no passwordHash)', async () => {
      const agent = await loginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        passwordHash: null,
      })

      const response = await agent.post('/api/v1/auth/change-password').send({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('NO_PASSWORD')
    })
  })

  // --- Avatar Upload (POST /api/v1/users/:id/avatar) ---

  describe('POST /api/v1/users/:id/avatar', () => {
    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp())
        .post('/api/v1/users/user-1/avatar')
        .attach('avatar', Buffer.from('fake-image'), 'test.jpg')

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('returns 403 when uploading for a different user', async () => {
      const agent = await loginAgent()

      const response = await agent
        .post('/api/v1/users/other-user/avatar')
        .attach('avatar', Buffer.from('fake-image'), 'test.jpg')

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 400 when no file provided', async () => {
      const agent = await loginAgent()

      const response = await agent.post('/api/v1/users/user-1/avatar').send({})

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('NO_FILE')
    })

    it('successfully uploads avatar', async () => {
      const agent = await loginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        avatarUrl: null,
      })

      const updatedUser = {
        ...baseUser,
        avatarUrl: '/uploads/avatars/test-uuid.jpg',
      }
      mockedPrisma.user.update.mockResolvedValueOnce(updatedUser)

      const response = await agent
        .post('/api/v1/users/user-1/avatar')
        .attach('avatar', Buffer.from('fake-image'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        })

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id: 'user-1',
      })
      expect(response.body.data.avatarUrl).toBeTruthy()
      expect(response.body.message).toBe('Avatar uploaded successfully.')
      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            avatarUrl: expect.stringMatching(/^\/uploads\/avatars\//),
          }),
        }),
      )
    })
  })

  // --- Avatar Removal (DELETE /api/v1/users/:id/avatar) ---

  describe('DELETE /api/v1/users/:id/avatar', () => {
    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp()).delete('/api/v1/users/user-1/avatar')

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('successfully removes avatar', async () => {
      const agent = await loginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        avatarUrl: '/uploads/avatars/old-avatar.jpg',
      })

      const updatedUser = {
        ...baseUser,
        avatarUrl: null,
      }
      mockedPrisma.user.update.mockResolvedValueOnce(updatedUser)

      const response = await agent.delete('/api/v1/users/user-1/avatar')

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id: 'user-1',
        avatarUrl: null,
      })
      expect(response.body.message).toBe('Avatar removed.')
      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: { avatarUrl: null },
        }),
      )
    })
  })

  // --- Account Deactivation (POST /api/v1/users/:id/deactivate) ---

  describe('POST /api/v1/users/:id/deactivate', () => {
    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp())
        .post('/api/v1/users/user-1/deactivate')
        .send({ password: 'password123' })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('returns 403 when deactivating another user', async () => {
      const agent = await loginAgent()

      const response = await agent
        .post('/api/v1/users/other-user/deactivate')
        .send({ password: 'password123' })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 400 when password is wrong', async () => {
      const agent = await loginAgent()

      const passwordHash = await bcrypt.hash('password123', 12)
      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        passwordHash,
        deactivatedAt: null,
      })

      const response = await agent
        .post('/api/v1/users/user-1/deactivate')
        .send({ password: 'wrongpassword' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('INVALID_PASSWORD')
    })

    it('successfully deactivates account and clears session', async () => {
      const agent = await loginAgent()

      const passwordHash = await bcrypt.hash('password123', 12)
      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        passwordHash,
        deactivatedAt: null,
      })
      mockedPrisma.user.update.mockResolvedValueOnce({ id: 'user-1' })

      const response = await agent
        .post('/api/v1/users/user-1/deactivate')
        .send({ password: 'password123' })

      expect(response.status).toBe(200)
      expect(response.body.data).toBeNull()
      expect(response.body.message).toBe('Your account has been deactivated.')
      expect(mockedPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            deactivatedAt: expect.any(Date),
          }),
        }),
      )

      // Verify session is destroyed — subsequent request should fail
      const meResponse = await agent.get('/api/v1/auth/me')

      expect(meResponse.status).toBe(401)
      expect(meResponse.body.error.code).toBe('AUTH_ERROR')
    })
  })
})
