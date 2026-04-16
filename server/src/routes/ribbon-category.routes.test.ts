import bcrypt from 'bcryptjs'
import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'
import { invalidateRibbonCategoryCache } from '../services/ribbon-category.service.js'

jest.mock('../lib/prisma.js', () => ({
  __esModule: true,
  default: {
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn(),
    ribbonCategory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    church: {
      groupBy: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

type MockedPrisma = {
  $transaction: jest.Mock
  ribbonCategory: {
    findMany: jest.Mock
    findUnique: jest.Mock
    findFirst: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
  church: {
    groupBy: jest.Mock
  }
  user: {
    findUnique: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma

const siteAdminUser = {
  id: 'user-site-admin-1',
  email: 'siteadmin@example.com',
  name: 'Site Admin',
  avatarUrl: null,
  role: 'SITE_ADMIN',
  emailVerified: true,
  createdAt: new Date('2026-03-01T00:00:00.000Z'),
}

const baseCategory = {
  id: 'cat-1',
  label: 'Catholic',
  icon: '✝️',
  slug: 'catholic',
  filterType: 'DENOMINATION',
  filterValue: 'Catholic',
  position: 0,
  isVisible: true,
  source: 'MANUAL',
  isPinned: false,
  createdAt: new Date('2026-04-01T00:00:00.000Z'),
  updatedAt: new Date('2026-04-01T00:00:00.000Z'),
}

const buildLoginAgent = async (
  userOverrides: Partial<typeof siteAdminUser> = {},
): Promise<ReturnType<typeof request.agent>> => {
  const passwordHash = await bcrypt.hash('password123', 12)

  mockedPrisma.user.findUnique.mockResolvedValueOnce({
    ...siteAdminUser,
    ...userOverrides,
    passwordHash,
  })

  const agent = request.agent(createApp())

  const loginResponse = await agent.post('/api/v1/auth/login').send({
    email: userOverrides.email ?? siteAdminUser.email,
    password: 'password123',
  })

  expect(loginResponse.status).toBe(200)

  return agent
}

describe('ribbon-category routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    invalidateRibbonCategoryCache()
  })

  // -------------------------------------------------------------------------
  // GET /api/v1/ribbon-categories (public)
  // -------------------------------------------------------------------------

  describe('GET /api/v1/ribbon-categories', () => {
    it('returns visible ribbon categories without auth', async () => {
      mockedPrisma.ribbonCategory.findMany.mockResolvedValueOnce([baseCategory])

      const response = await request(createApp()).get('/api/v1/ribbon-categories')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0]).toMatchObject({
        id: 'cat-1',
        label: 'Catholic',
        slug: 'catholic',
      })
      expect(mockedPrisma.ribbonCategory.findMany).toHaveBeenCalledWith({
        where: { isVisible: true },
        orderBy: { position: 'asc' },
      })
    })

    it('returns an empty array when no visible categories exist', async () => {
      mockedPrisma.ribbonCategory.findMany.mockResolvedValueOnce([])

      const response = await request(createApp()).get('/api/v1/ribbon-categories')

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual([])
    })
  })

  // -------------------------------------------------------------------------
  // GET /api/v1/admin/ribbon-categories (SITE_ADMIN only)
  // -------------------------------------------------------------------------

  describe('GET /api/v1/admin/ribbon-categories', () => {
    it('returns all ribbon categories for site admin', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'SITE_ADMIN',
      })
      mockedPrisma.ribbonCategory.findMany.mockResolvedValueOnce([
        baseCategory,
        { ...baseCategory, id: 'cat-2', label: 'Baptist', isVisible: false },
      ])

      const response = await agent.get('/api/v1/admin/ribbon-categories')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
      expect(mockedPrisma.ribbonCategory.findMany).toHaveBeenCalledWith({
        orderBy: { position: 'asc' },
      })
    })

    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp()).get('/api/v1/admin/ribbon-categories')

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('returns 403 for non-admin user', async () => {
      const agent = await buildLoginAgent({
        id: 'user-regular-1',
        email: 'user@example.com',
        role: 'USER',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'USER',
      })

      const response = await agent.get('/api/v1/admin/ribbon-categories')

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })
  })

  // -------------------------------------------------------------------------
  // POST /api/v1/admin/ribbon-categories (SITE_ADMIN only)
  // -------------------------------------------------------------------------

  describe('POST /api/v1/admin/ribbon-categories', () => {
    const validBody = {
      label: 'Baptist',
      filterType: 'DENOMINATION',
      filterValue: 'Baptist',
    }

    it('creates a ribbon category for site admin', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'SITE_ADMIN',
      })
      // createRibbonCategory: check for existing slug
      mockedPrisma.ribbonCategory.findUnique.mockResolvedValueOnce(null)
      // createRibbonCategory: get last position
      mockedPrisma.ribbonCategory.findFirst.mockResolvedValueOnce({ position: 2 })
      // createRibbonCategory: create
      mockedPrisma.ribbonCategory.create.mockResolvedValueOnce({
        ...baseCategory,
        id: 'cat-new',
        label: 'Baptist',
        slug: 'baptist',
        filterValue: 'Baptist',
        position: 3,
      })

      const response = await agent.post('/api/v1/admin/ribbon-categories').send(validBody)

      expect(response.status).toBe(201)
      expect(response.body.data).toMatchObject({
        id: 'cat-new',
        label: 'Baptist',
      })
      expect(response.body.message).toBe('Ribbon category created successfully')
      expect(mockedPrisma.ribbonCategory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          label: 'Baptist',
          filterType: 'DENOMINATION',
          filterValue: 'Baptist',
          position: 3,
          source: 'MANUAL',
        }),
      })
    })

    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp())
        .post('/api/v1/admin/ribbon-categories')
        .send(validBody)

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('returns 403 for non-admin user', async () => {
      const agent = await buildLoginAgent({
        id: 'user-regular-1',
        email: 'user@example.com',
        role: 'USER',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'USER',
      })

      const response = await agent.post('/api/v1/admin/ribbon-categories').send(validBody)

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 400 when label is missing', async () => {
      const agent = await buildLoginAgent()

      const response = await agent.post('/api/v1/admin/ribbon-categories').send({
        filterType: 'DENOMINATION',
        filterValue: 'Baptist',
      })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('returns 400 when filterType is invalid', async () => {
      const agent = await buildLoginAgent()

      const response = await agent.post('/api/v1/admin/ribbon-categories').send({
        label: 'Baptist',
        filterType: 'INVALID',
        filterValue: 'Baptist',
      })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('returns 400 when filterValue is missing', async () => {
      const agent = await buildLoginAgent()

      const response = await agent.post('/api/v1/admin/ribbon-categories').send({
        label: 'Baptist',
        filterType: 'DENOMINATION',
      })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  // -------------------------------------------------------------------------
  // PATCH /api/v1/admin/ribbon-categories/:id (SITE_ADMIN only)
  // -------------------------------------------------------------------------

  describe('PATCH /api/v1/admin/ribbon-categories/:id', () => {
    it('updates a ribbon category for site admin', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'SITE_ADMIN',
      })
      // updateRibbonCategory: find existing
      mockedPrisma.ribbonCategory.findUnique.mockResolvedValueOnce(baseCategory)
      // updateRibbonCategory: update
      mockedPrisma.ribbonCategory.update.mockResolvedValueOnce({
        ...baseCategory,
        label: 'Updated Catholic',
      })

      const response = await agent
        .patch('/api/v1/admin/ribbon-categories/cat-1')
        .send({ label: 'Updated Catholic' })

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id: 'cat-1',
        label: 'Updated Catholic',
      })
      expect(response.body.message).toBe('Ribbon category updated successfully')
      expect(mockedPrisma.ribbonCategory.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: { label: 'Updated Catholic' },
      })
    })

    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp())
        .patch('/api/v1/admin/ribbon-categories/cat-1')
        .send({ label: 'Updated' })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('returns 403 for non-admin user', async () => {
      const agent = await buildLoginAgent({
        id: 'user-regular-1',
        email: 'user@example.com',
        role: 'USER',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'USER',
      })

      const response = await agent
        .patch('/api/v1/admin/ribbon-categories/cat-1')
        .send({ label: 'Updated' })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 400 when body is empty', async () => {
      const agent = await buildLoginAgent()

      const response = await agent
        .patch('/api/v1/admin/ribbon-categories/cat-1')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('returns 404 when category does not exist', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'SITE_ADMIN',
      })
      // updateRibbonCategory: find existing returns null
      mockedPrisma.ribbonCategory.findUnique.mockResolvedValueOnce(null)

      const response = await agent
        .patch('/api/v1/admin/ribbon-categories/cat-missing')
        .send({ label: 'Updated' })

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })
  })

  // -------------------------------------------------------------------------
  // DELETE /api/v1/admin/ribbon-categories/:id (SITE_ADMIN only)
  // -------------------------------------------------------------------------

  describe('DELETE /api/v1/admin/ribbon-categories/:id', () => {
    it('deletes a ribbon category for site admin', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'SITE_ADMIN',
      })
      // deleteRibbonCategory: find existing
      mockedPrisma.ribbonCategory.findUnique.mockResolvedValueOnce({
        id: 'cat-1',
      })
      // deleteRibbonCategory: delete
      mockedPrisma.ribbonCategory.delete.mockResolvedValueOnce({
        id: 'cat-1',
      })

      const response = await agent.delete('/api/v1/admin/ribbon-categories/cat-1')

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        id: 'cat-1',
        deleted: true,
      })
      expect(response.body.message).toBe('Ribbon category deleted successfully')
      expect(mockedPrisma.ribbonCategory.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      })
    })

    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp()).delete(
        '/api/v1/admin/ribbon-categories/cat-1',
      )

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('returns 403 for non-admin user', async () => {
      const agent = await buildLoginAgent({
        id: 'user-regular-1',
        email: 'user@example.com',
        role: 'USER',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'USER',
      })

      const response = await agent.delete('/api/v1/admin/ribbon-categories/cat-1')

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 404 when category does not exist', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'SITE_ADMIN',
      })
      mockedPrisma.ribbonCategory.findUnique.mockResolvedValueOnce(null)

      const response = await agent.delete('/api/v1/admin/ribbon-categories/cat-missing')

      expect(response.status).toBe(404)
      expect(response.body.error.code).toBe('NOT_FOUND')
    })
  })

  // -------------------------------------------------------------------------
  // POST /api/v1/admin/ribbon-categories/reorder (SITE_ADMIN only)
  // -------------------------------------------------------------------------

  describe('POST /api/v1/admin/ribbon-categories/reorder', () => {
    it('reorders ribbon categories for site admin', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'SITE_ADMIN',
      })
      // reorderRibbonCategories: verify IDs exist
      mockedPrisma.ribbonCategory.findMany.mockResolvedValueOnce([
        { id: 'cat-2' },
        { id: 'cat-1' },
      ])
      // reorderRibbonCategories: $transaction
      mockedPrisma.$transaction.mockResolvedValueOnce(undefined)
      // reorderRibbonCategories: return reordered list
      mockedPrisma.ribbonCategory.findMany.mockResolvedValueOnce([
        { ...baseCategory, id: 'cat-2', position: 0 },
        { ...baseCategory, id: 'cat-1', position: 1 },
      ])

      const response = await agent
        .post('/api/v1/admin/ribbon-categories/reorder')
        .send({ ids: ['cat-2', 'cat-1'] })

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.message).toBe('Ribbon categories reordered successfully')
    })

    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp())
        .post('/api/v1/admin/ribbon-categories/reorder')
        .send({ ids: ['cat-1'] })

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('returns 403 for non-admin user', async () => {
      const agent = await buildLoginAgent({
        id: 'user-regular-1',
        email: 'user@example.com',
        role: 'USER',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'USER',
      })

      const response = await agent
        .post('/api/v1/admin/ribbon-categories/reorder')
        .send({ ids: ['cat-1'] })

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 400 when ids array is empty', async () => {
      const agent = await buildLoginAgent()

      const response = await agent
        .post('/api/v1/admin/ribbon-categories/reorder')
        .send({ ids: [] })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('returns 400 when ids is missing', async () => {
      const agent = await buildLoginAgent()

      const response = await agent
        .post('/api/v1/admin/ribbon-categories/reorder')
        .send({})

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  // -------------------------------------------------------------------------
  // POST /api/v1/admin/ribbon-categories/auto-generate (SITE_ADMIN only)
  // -------------------------------------------------------------------------

  describe('POST /api/v1/admin/ribbon-categories/auto-generate', () => {
    it('auto-generates ribbon categories for site admin', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'SITE_ADMIN',
      })
      // autoGenerateRibbonCategories: groupBy denominations
      mockedPrisma.church.groupBy.mockResolvedValueOnce([
        { denomination: 'Catholic', _count: { denomination: 10 } },
        { denomination: 'Baptist', _count: { denomination: 8 } },
      ])
      // autoGenerateRibbonCategories: existing manual/pinned categories
      mockedPrisma.ribbonCategory.findMany.mockResolvedValueOnce([])
      // autoGenerateRibbonCategories: existing AUTO categories
      mockedPrisma.ribbonCategory.findMany.mockResolvedValueOnce([])
      // autoGenerateRibbonCategories: last position
      mockedPrisma.ribbonCategory.findFirst.mockResolvedValueOnce({ position: 0 })
      // autoGenerateRibbonCategories: findUnique slug check for Catholic
      mockedPrisma.ribbonCategory.findUnique.mockResolvedValueOnce(null)
      // autoGenerateRibbonCategories: create Catholic
      mockedPrisma.ribbonCategory.create.mockResolvedValueOnce({
        ...baseCategory,
        id: 'auto-1',
        label: 'Catholic',
        source: 'AUTO',
      })
      // autoGenerateRibbonCategories: findUnique slug check for Baptist
      mockedPrisma.ribbonCategory.findUnique.mockResolvedValueOnce(null)
      // autoGenerateRibbonCategories: create Baptist
      mockedPrisma.ribbonCategory.create.mockResolvedValueOnce({
        ...baseCategory,
        id: 'auto-2',
        label: 'Baptist',
        source: 'AUTO',
      })

      const response = await agent
        .post('/api/v1/admin/ribbon-categories/auto-generate')
        .send({ limit: 6 })

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        created: 2,
        updated: 0,
        removed: 0,
      })
      expect(response.body.message).toMatch(/Auto-generation complete/)
    })

    it('returns 401 when not authenticated', async () => {
      const response = await request(createApp())
        .post('/api/v1/admin/ribbon-categories/auto-generate')
        .send({})

      expect(response.status).toBe(401)
      expect(response.body.error.code).toBe('AUTH_ERROR')
    })

    it('returns 403 for non-admin user', async () => {
      const agent = await buildLoginAgent({
        id: 'user-regular-1',
        email: 'user@example.com',
        role: 'USER',
      })

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'USER',
      })

      const response = await agent
        .post('/api/v1/admin/ribbon-categories/auto-generate')
        .send({})

      expect(response.status).toBe(403)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })

    it('returns 400 when limit exceeds maximum', async () => {
      const agent = await buildLoginAgent()

      const response = await agent
        .post('/api/v1/admin/ribbon-categories/auto-generate')
        .send({ limit: 99 })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('accepts an empty body (uses default limit)', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.user.findUnique.mockResolvedValueOnce({
        role: 'SITE_ADMIN',
      })
      mockedPrisma.church.groupBy.mockResolvedValueOnce([])
      mockedPrisma.ribbonCategory.findMany.mockResolvedValueOnce([])
      mockedPrisma.ribbonCategory.findMany.mockResolvedValueOnce([])
      mockedPrisma.ribbonCategory.findFirst.mockResolvedValueOnce(null)

      const response = await agent
        .post('/api/v1/admin/ribbon-categories/auto-generate')
        .send({})

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        created: 0,
        updated: 0,
        removed: 0,
      })
    })
  })
})
