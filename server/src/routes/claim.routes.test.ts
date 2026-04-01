import bcrypt from 'bcryptjs'
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
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    churchClaim: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

type MockedPrisma = {
  $transaction: jest.Mock
  church: {
    findUnique: jest.Mock
    update: jest.Mock
  }
  churchClaim: {
    findFirst: jest.Mock
    findMany: jest.Mock
    findUnique: jest.Mock
    create: jest.Mock
    update: jest.Mock
  }
  user: {
    findUnique: jest.Mock
    update: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma

const baseUser = {
  id: 'user-1',
  email: 'staff@grace.org',
  name: 'Grace Staff',
  avatarUrl: null,
  role: 'USER',
  emailVerified: true,
  createdAt: new Date('2026-03-28T00:00:00.000Z'),
}

describe('church claim routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockedPrisma.$transaction.mockImplementation((operations: unknown[]) =>
      Promise.all(operations),
    )
  })

  const loginAgent = async (
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

  it('requires authentication to submit a church claim', async () => {
    const response = await request(createApp())
      .post('/api/v1/churches/church-1/claim')
      .send({
        roleTitle: 'Executive Pastor',
        verificationEmail: 'staff@grace.org',
      })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('submits a church claim when the verification email matches the church domain', async () => {
    const agent = await loginAgent()

    mockedPrisma.church.findUnique.mockResolvedValueOnce({
      id: 'church-1',
      isClaimed: false,
      email: 'hello@grace.org',
      website: 'https://www.grace.org',
    })
    mockedPrisma.churchClaim.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
    mockedPrisma.churchClaim.create.mockResolvedValueOnce({
      id: 'claim-1',
      churchId: 'church-1',
      roleTitle: 'Executive Pastor',
      verificationEmail: 'staff@grace.org',
      status: 'PENDING',
      createdAt: new Date('2026-03-31T00:00:00.000Z'),
      reviewedAt: null,
    })

    const response = await agent.post('/api/v1/churches/church-1/claim').send({
      roleTitle: 'Executive Pastor',
      verificationEmail: 'staff@grace.org',
    })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({
      id: 'claim-1',
      churchId: 'church-1',
      roleTitle: 'Executive Pastor',
      verificationEmail: 'staff@grace.org',
      status: 'pending',
    })
  })

  it('rejects a claim when the verification email does not match the church domain', async () => {
    const agent = await loginAgent()

    mockedPrisma.church.findUnique.mockResolvedValueOnce({
      id: 'church-1',
      isClaimed: false,
      email: 'hello@grace.org',
      website: 'https://www.grace.org',
    })
    mockedPrisma.churchClaim.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)

    const response = await agent.post('/api/v1/churches/church-1/claim').send({
      roleTitle: 'Executive Pastor',
      verificationEmail: 'staff@anotherchurch.org',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('CLAIM_EMAIL_DOMAIN_MISMATCH')
  })

  it('lists church claims only for the authenticated owner', async () => {
    const agent = await loginAgent()

    mockedPrisma.churchClaim.findMany.mockResolvedValueOnce([
      {
        id: 'claim-1',
        churchId: 'church-1',
        userId: 'user-1',
        roleTitle: 'Executive Pastor',
        verificationEmail: 'staff@grace.org',
        status: 'PENDING',
        createdAt: new Date('2026-03-31T00:00:00.000Z'),
        reviewedAt: null,
        church: {
          id: 'church-1',
          name: 'Grace Fellowship',
          slug: 'grace-fellowship',
          denomination: 'Non-denominational',
          city: 'San Antonio',
          state: 'TX',
          neighborhood: 'Downtown',
          isClaimed: false,
        },
        reviewedBy: null,
      },
    ])

    const ownResponse = await agent.get('/api/v1/users/user-1/claims')

    expect(ownResponse.status).toBe(200)
    expect(ownResponse.body.meta).toMatchObject({
      total: 1,
      pending: 1,
      approved: 0,
      rejected: 0,
    })
    expect(ownResponse.body.data[0]).toMatchObject({
      id: 'claim-1',
      church: {
        slug: 'grace-fellowship',
      },
    })

    const otherResponse = await agent.get('/api/v1/users/user-2/claims')

    expect(otherResponse.status).toBe(403)
    expect(otherResponse.body.error.code).toBe('FORBIDDEN')
  })

  it('lets a site admin review pending claim requests', async () => {
    const agent = await loginAgent({
      id: 'admin-1',
      email: 'admin@example.com',
      name: 'Site Admin',
      role: 'SITE_ADMIN',
    })

    mockedPrisma.user.findUnique
      .mockResolvedValueOnce({ role: 'SITE_ADMIN' })
      .mockResolvedValueOnce({ role: 'SITE_ADMIN' })
      .mockResolvedValueOnce({ role: 'SITE_ADMIN' })

    mockedPrisma.churchClaim.findMany.mockResolvedValueOnce([
      {
        id: 'claim-1',
        churchId: 'church-1',
        userId: 'user-1',
        roleTitle: 'Executive Pastor',
        verificationEmail: 'staff@grace.org',
        status: 'PENDING',
        createdAt: new Date('2026-03-31T00:00:00.000Z'),
        reviewedAt: null,
        user: {
          id: 'user-1',
          name: 'Grace Staff',
          email: 'staff@grace.org',
        },
        church: {
          id: 'church-1',
          name: 'Grace Fellowship',
          slug: 'grace-fellowship',
          denomination: 'Non-denominational',
          city: 'San Antonio',
          state: 'TX',
          neighborhood: 'Downtown',
          isClaimed: false,
        },
        reviewedBy: null,
      },
    ])

    const listResponse = await agent.get('/api/v1/admin/claims')

    expect(listResponse.status).toBe(200)
    expect(listResponse.body.meta.total).toBe(1)
    expect(listResponse.body.data[0]).toMatchObject({
      id: 'claim-1',
      user: {
        email: 'staff@grace.org',
      },
      church: {
        slug: 'grace-fellowship',
      },
    })

    mockedPrisma.churchClaim.findUnique.mockResolvedValueOnce({
      id: 'claim-1',
      churchId: 'church-1',
      userId: 'user-1',
      status: 'PENDING',
      church: {
        id: 'church-1',
        isClaimed: false,
        claimedById: null,
      },
      user: {
        id: 'user-1',
        role: 'USER',
      },
    })
    mockedPrisma.churchClaim.update.mockResolvedValueOnce({
      id: 'claim-1',
    })
    mockedPrisma.church.update.mockResolvedValueOnce({
      id: 'church-1',
    })
    mockedPrisma.user.update.mockResolvedValueOnce({
      id: 'user-1',
      role: 'CHURCH_ADMIN',
    })

    const approveResponse = await agent.patch('/api/v1/admin/claims/claim-1').send({
      status: 'approved',
    })

    expect(approveResponse.status).toBe(200)
    expect(approveResponse.body.data).toMatchObject({
      claimId: 'claim-1',
      churchId: 'church-1',
      userId: 'user-1',
      status: 'approved',
    })
    expect(mockedPrisma.church.update).toHaveBeenCalledWith({
      where: { id: 'church-1' },
      data: {
        isClaimed: true,
        claimedById: 'user-1',
      },
    })
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        role: 'CHURCH_ADMIN',
      },
    })

    mockedPrisma.user.findUnique.mockResolvedValueOnce({ role: 'SITE_ADMIN' })
    mockedPrisma.churchClaim.findUnique.mockResolvedValueOnce({
      id: 'claim-2',
      churchId: 'church-2',
      userId: 'user-2',
      status: 'PENDING',
      church: {
        id: 'church-2',
        isClaimed: false,
        claimedById: null,
      },
      user: {
        id: 'user-2',
        role: 'USER',
      },
    })
    mockedPrisma.churchClaim.update.mockResolvedValueOnce({
      id: 'claim-2',
      status: 'REJECTED',
    })

    const rejectResponse = await agent.patch('/api/v1/admin/claims/claim-2').send({
      status: 'rejected',
    })

    expect(rejectResponse.status).toBe(200)
    expect(rejectResponse.body.data).toMatchObject({
      claimId: 'claim-2',
      churchId: 'church-2',
      userId: 'user-2',
      status: 'rejected',
    })
  })
})
