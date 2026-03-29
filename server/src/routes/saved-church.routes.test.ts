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
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    userSavedChurch: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

type MockedPrisma = {
  church: {
    findUnique: jest.Mock
  }
  user: {
    findUnique: jest.Mock
  }
  userSavedChurch: {
    findUnique: jest.Mock
    create: jest.Mock
    delete: jest.Mock
    findMany: jest.Mock
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

describe('saved church routes', () => {
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

  it('requires authentication to toggle a saved church', async () => {
    const response = await request(createApp()).post('/api/v1/churches/church-1/save')

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('saves and unsaves a church for the signed-in user', async () => {
    const agent = await loginAgent()

    mockedPrisma.church.findUnique.mockResolvedValue({ id: 'church-1' })
    mockedPrisma.userSavedChurch.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ churchId: 'church-1' })
    mockedPrisma.userSavedChurch.create.mockResolvedValue({
      userId: 'user-1',
      churchId: 'church-1',
      savedAt: new Date('2026-03-28T00:00:00.000Z'),
    })
    mockedPrisma.userSavedChurch.delete.mockResolvedValue({
      userId: 'user-1',
      churchId: 'church-1',
    })

    const saveResponse = await agent.post('/api/v1/churches/church-1/save')

    expect(saveResponse.status).toBe(200)
    expect(saveResponse.body.data).toEqual({
      churchId: 'church-1',
      saved: true,
    })
    expect(mockedPrisma.userSavedChurch.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        churchId: 'church-1',
      },
    })

    const unsaveResponse = await agent.post('/api/v1/churches/church-1/save')

    expect(unsaveResponse.status).toBe(200)
    expect(unsaveResponse.body.data).toEqual({
      churchId: 'church-1',
      saved: false,
    })
    expect(mockedPrisma.userSavedChurch.delete).toHaveBeenCalledWith({
      where: {
        userId_churchId: {
          userId: 'user-1',
          churchId: 'church-1',
        },
      },
    })
  })

  it('returns the signed-in users saved churches and rejects other profile access', async () => {
    const agent = await loginAgent()

    mockedPrisma.userSavedChurch.findMany.mockResolvedValue([
      {
        savedAt: new Date('2026-03-28T12:00:00.000Z'),
        church: {
          id: 'church-1',
          name: 'Grace Fellowship',
          slug: 'grace-fellowship',
          denomination: 'Non-denominational',
          denominationFamily: 'non-denominational',
          description: null,
          address: '123 Main St',
          city: 'San Antonio',
          state: 'TX',
          zipCode: '78205',
          neighborhood: 'Downtown',
          latitude: '29.4241',
          longitude: '-98.4936',
          phone: null,
          email: null,
          website: null,
          avgRating: '4.8',
          reviewCount: 12,
          isClaimed: false,
          languages: ['English'],
          amenities: ['Childcare'],
          coverImageUrl: null,
          services: [],
        },
      },
    ])

    const ownSavedResponse = await agent.get('/api/v1/users/user-1/saved')

    expect(ownSavedResponse.status).toBe(200)
    expect(ownSavedResponse.body.data).toHaveLength(1)
    expect(ownSavedResponse.body.data[0]).toMatchObject({
      id: 'church-1',
      name: 'Grace Fellowship',
      isSaved: true,
    })

    const otherSavedResponse = await agent.get('/api/v1/users/user-2/saved')

    expect(otherSavedResponse.status).toBe(403)
    expect(otherSavedResponse.body.error.code).toBe('FORBIDDEN')
  })
})
