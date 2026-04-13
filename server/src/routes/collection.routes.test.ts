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
      findUnique: jest.fn(),
    },
    churchCollection: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    churchCollectionItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}))

type MockedPrisma = {
  church: {
    findUnique: jest.Mock
  }
  churchCollection: {
    findUnique: jest.Mock
    findMany: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
  churchCollectionItem: {
    findUnique: jest.Mock
    create: jest.Mock
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

const baseCollection = {
  id: 'coll-1',
  userId: 'user-1',
  name: 'Best Music',
  description: 'Churches with amazing worship music',
  slug: 'best-music',
  isPublic: true,
  createdAt: new Date('2026-04-10T10:00:00.000Z'),
  updatedAt: new Date('2026-04-10T10:00:00.000Z'),
}

const baseChurch = {
  id: 'church-1',
  name: 'Grace Church',
  slug: 'grace-church',
  denomination: 'Non-denominational',
  denominationFamily: 'Non-denominational',
  address: '123 Main St',
  city: 'San Antonio',
  neighborhood: 'Alamo Heights',
  coverImageUrl: 'https://example.com/grace.jpg',
  avgRating: 4.5,
  reviewCount: 12,
}

const buildLoginAgent = async (
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

describe('collection routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('POST /api/v1/collections', () => {
    it('requires authentication', async () => {
      const response = await request(createApp())
        .post('/api/v1/collections')
        .send({ name: 'My Collection' })

      expect(response.status).toBe(401)
    })

    it('creates a collection with auto-generated slug', async () => {
      const agent = await buildLoginAgent()

      // resolveUniqueSlug check
      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce(null)
      mockedPrisma.churchCollection.create.mockResolvedValueOnce(baseCollection)

      const response = await agent.post('/api/v1/collections').send({
        name: 'Best Music',
        description: 'Churches with amazing worship music',
      })

      expect(response.status).toBe(201)
      expect(response.body.data).toMatchObject({
        name: 'Best Music',
        slug: 'best-music',
        isPublic: true,
      })
      expect(response.body.message).toBe('Collection created successfully')
    })

    it('validates name is required', async () => {
      const agent = await buildLoginAgent()

      const response = await agent.post('/api/v1/collections').send({
        description: 'Missing name',
      })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })

    it('validates name max length', async () => {
      const agent = await buildLoginAgent()

      const response = await agent.post('/api/v1/collections').send({
        name: 'x'.repeat(101),
      })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/v1/collections/:id', () => {
    it('returns a public collection to unauthenticated users', async () => {
      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce({
        ...baseCollection,
        user: { id: 'user-1', name: 'Test User', avatarUrl: null },
        items: [
          {
            notes: 'Love the choir',
            addedAt: new Date(),
            church: baseChurch,
          },
        ],
      })

      const response = await request(createApp()).get('/api/v1/collections/coll-1')

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        name: 'Best Music',
        isPublic: true,
        churchCount: 1,
      })
      expect(response.body.data.churches).toHaveLength(1)
      expect(response.body.data.churches[0]).toMatchObject({
        name: 'Grace Church',
        notes: 'Love the choir',
      })
    })

    it('returns 403 for private collections viewed by non-owner', async () => {
      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce({
        ...baseCollection,
        isPublic: false,
        user: { id: 'user-1', name: 'Test User', avatarUrl: null },
        items: [],
      })

      const response = await request(createApp()).get('/api/v1/collections/coll-1')

      expect(response.status).toBe(403)
    })

    it('returns 404 for non-existent collection', async () => {
      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce(null)

      const response = await request(createApp()).get('/api/v1/collections/nonexistent')

      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /api/v1/collections/:id', () => {
    it('requires authentication', async () => {
      const response = await request(createApp())
        .patch('/api/v1/collections/coll-1')
        .send({ name: 'Updated' })

      expect(response.status).toBe(401)
    })

    it('updates collection name and slug', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchCollection.findUnique
        .mockResolvedValueOnce({
          ...baseCollection,
          _count: { items: 3 },
        })
        // resolveUniqueSlug
        .mockResolvedValueOnce(null)
      mockedPrisma.churchCollection.update.mockResolvedValueOnce({
        ...baseCollection,
        name: 'Updated Name',
        slug: 'updated-name',
        _count: { items: 3 },
      })

      const response = await agent.patch('/api/v1/collections/coll-1').send({
        name: 'Updated Name',
      })

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe('Updated Name')
    })

    it('returns 403 when editing another user collection', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce({
        ...baseCollection,
        userId: 'other-user',
        _count: { items: 0 },
      })

      const response = await agent.patch('/api/v1/collections/coll-1').send({
        name: 'Hijack',
      })

      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /api/v1/collections/:id', () => {
    it('deletes a collection owned by the user', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce({
        id: 'coll-1',
        userId: 'user-1',
      })
      mockedPrisma.churchCollection.delete.mockResolvedValueOnce({ id: 'coll-1' })

      const response = await agent.delete('/api/v1/collections/coll-1')

      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe('coll-1')
    })

    it('returns 403 when deleting another user collection', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce({
        id: 'coll-1',
        userId: 'other-user',
      })

      const response = await agent.delete('/api/v1/collections/coll-1')

      expect(response.status).toBe(403)
    })
  })

  describe('POST /api/v1/collections/:id/churches/:churchId', () => {
    it('adds a church to a collection', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce({
        id: 'coll-1',
        userId: 'user-1',
      })
      mockedPrisma.church.findUnique.mockResolvedValueOnce(baseChurch)
      mockedPrisma.churchCollectionItem.findUnique.mockResolvedValueOnce(null)
      mockedPrisma.churchCollectionItem.create.mockResolvedValueOnce({
        collectionId: 'coll-1',
        churchId: 'church-1',
        notes: 'Amazing choir',
        addedAt: new Date(),
      })

      const response = await agent
        .post('/api/v1/collections/coll-1/churches/church-1')
        .send({ notes: 'Amazing choir' })

      expect(response.status).toBe(201)
      expect(response.body.data).toMatchObject({
        id: 'church-1',
        name: 'Grace Church',
        notes: 'Amazing choir',
      })
    })

    it('returns 409 when church is already in collection', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce({
        id: 'coll-1',
        userId: 'user-1',
      })
      mockedPrisma.church.findUnique.mockResolvedValueOnce(baseChurch)
      mockedPrisma.churchCollectionItem.findUnique.mockResolvedValueOnce({
        collectionId: 'coll-1',
      })

      const response = await agent
        .post('/api/v1/collections/coll-1/churches/church-1')
        .send({})

      expect(response.status).toBe(409)
    })

    it('returns 403 when adding to another user collection', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce({
        id: 'coll-1',
        userId: 'other-user',
      })

      const response = await agent
        .post('/api/v1/collections/coll-1/churches/church-1')
        .send({})

      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /api/v1/collections/:id/churches/:churchId', () => {
    it('removes a church from a collection', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce({
        id: 'coll-1',
        userId: 'user-1',
      })
      mockedPrisma.churchCollectionItem.findUnique.mockResolvedValueOnce({
        collectionId: 'coll-1',
      })
      mockedPrisma.churchCollectionItem.delete.mockResolvedValueOnce({})

      const response = await agent.delete('/api/v1/collections/coll-1/churches/church-1')

      expect(response.status).toBe(200)
      expect(response.body.data).toMatchObject({
        collectionId: 'coll-1',
        churchId: 'church-1',
      })
    })

    it('returns 404 when church is not in collection', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.churchCollection.findUnique.mockResolvedValueOnce({
        id: 'coll-1',
        userId: 'user-1',
      })
      mockedPrisma.churchCollectionItem.findUnique.mockResolvedValueOnce(null)

      const response = await agent.delete('/api/v1/collections/coll-1/churches/church-1')

      expect(response.status).toBe(404)
    })
  })
})
