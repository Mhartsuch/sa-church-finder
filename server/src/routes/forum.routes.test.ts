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
    forumPost: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    forumReply: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
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
  forumPost: {
    count: jest.Mock
    findMany: jest.Mock
    findUnique: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
  forumReply: {
    findUnique: jest.Mock
    create: jest.Mock
    delete: jest.Mock
  }
  user: {
    findUnique: jest.Mock
    update: jest.Mock
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

const baseAuthor = {
  id: 'user-1',
  name: 'Test User',
  avatarUrl: null,
}

const basePost = {
  id: 'post-1',
  title: 'Looking for a family-friendly church in the Stone Oak area',
  body: "We just moved to San Antonio and are looking for a welcoming church with a good children's program near Stone Oak.",
  category: 'recommendations',
  authorId: 'user-1',
  author: baseAuthor,
  isPinned: false,
  isLocked: false,
  viewCount: 12,
  createdAt: new Date('2026-04-01T10:00:00.000Z'),
  updatedAt: new Date('2026-04-01T10:00:00.000Z'),
  _count: { replies: 3 },
}

const baseReply = {
  id: 'reply-1',
  body: 'Welcome to San Antonio! You should check out Community Bible Church — they have an excellent kids ministry.',
  postId: 'post-1',
  authorId: 'user-2',
  author: {
    id: 'user-2',
    name: 'Another User',
    avatarUrl: null,
  },
  createdAt: new Date('2026-04-01T12:00:00.000Z'),
  updatedAt: new Date('2026-04-01T12:00:00.000Z'),
}

describe('forum routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    mockedPrisma.$transaction.mockImplementation((operations: unknown[]) =>
      Promise.all(operations),
    )
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

  const loginAdminAgent = async (): Promise<ReturnType<typeof request.agent>> => {
    const passwordHash = await bcrypt.hash('password123', 12)

    mockedPrisma.user.findUnique.mockResolvedValue({
      ...baseUser,
      id: 'admin-1',
      email: 'admin@example.com',
      role: 'SITE_ADMIN',
      passwordHash,
    })

    const agent = request.agent(createApp())

    const loginResponse = await agent.post('/api/v1/auth/login').send({
      email: 'admin@example.com',
      password: 'password123',
    })

    expect(loginResponse.status).toBe(200)

    return agent
  }

  // ── GET /forum/posts ────────────────────────────────────────────────

  it('returns paginated forum posts with default sorting', async () => {
    mockedPrisma.forumPost.count.mockResolvedValue(2)
    mockedPrisma.forumPost.findMany.mockResolvedValue([basePost])

    const response = await request(createApp()).get('/api/v1/forum/posts')

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0]).toMatchObject({
      id: 'post-1',
      title: basePost.title,
      category: 'recommendations',
      replyCount: 3,
    })
    expect(response.body.meta).toMatchObject({
      page: 1,
      pageSize: 20,
      total: 2,
      sort: 'recent',
      category: null,
    })
  })

  it('filters forum posts by category', async () => {
    mockedPrisma.forumPost.count.mockResolvedValue(1)
    mockedPrisma.forumPost.findMany.mockResolvedValue([basePost])

    const response = await request(createApp()).get(
      '/api/v1/forum/posts?category=recommendations',
    )

    expect(response.status).toBe(200)
    expect(response.body.meta).toMatchObject({
      category: 'recommendations',
    })

    const countArgs = mockedPrisma.forumPost.count.mock.calls[0][0]
    expect(countArgs.where).toMatchObject({ category: 'recommendations' })
  })

  it('sorts forum posts by the requested order', async () => {
    mockedPrisma.forumPost.count.mockResolvedValue(1)
    mockedPrisma.forumPost.findMany.mockResolvedValue([basePost])

    const response = await request(createApp()).get('/api/v1/forum/posts?sort=popular')

    expect(response.status).toBe(200)
    expect(response.body.meta).toMatchObject({ sort: 'popular' })

    const findManyArgs = mockedPrisma.forumPost.findMany.mock.calls[0][0]
    expect(findManyArgs.orderBy).toEqual([
      { isPinned: 'desc' },
      { viewCount: 'desc' },
      { createdAt: 'desc' },
    ])
  })

  it('rejects an invalid category query parameter', async () => {
    const response = await request(createApp()).get('/api/v1/forum/posts?category=invalid')

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  // ── GET /forum/posts/:id ────────────────────────────────────────────

  it('returns a forum post with its replies', async () => {
    const postWithReplies = {
      ...basePost,
      _count: undefined,
      replies: [baseReply],
    }

    mockedPrisma.forumPost.findUnique.mockResolvedValue(postWithReplies)
    mockedPrisma.forumPost.update.mockResolvedValue({})

    const response = await request(createApp()).get('/api/v1/forum/posts/post-1')

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'post-1',
      title: basePost.title,
      replyCount: 1,
    })
    expect(response.body.data.replies).toHaveLength(1)
    expect(response.body.data.replies[0]).toMatchObject({
      id: 'reply-1',
      body: baseReply.body,
      author: { id: 'user-2', name: 'Another User' },
    })
  })

  it('returns 404 for a non-existent forum post', async () => {
    mockedPrisma.forumPost.findUnique.mockResolvedValue(null)

    const response = await request(createApp()).get('/api/v1/forum/posts/nonexistent')

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })

  // ── POST /forum/posts ──────────────────────────────────────────────

  it('creates a forum post when authenticated', async () => {
    const agent = await loginAgent()

    const createdPost = {
      ...basePost,
      id: 'post-new',
      title: 'Best churches for young adults in downtown San Antonio',
      body: 'Looking for recommendations for churches with active young adult ministries near the downtown area.',
      category: 'recommendations',
      authorId: 'user-1',
    }

    mockedPrisma.forumPost.create.mockResolvedValue(createdPost)

    const response = await agent.post('/api/v1/forum/posts').send({
      title: 'Best churches for young adults in downtown San Antonio',
      body: 'Looking for recommendations for churches with active young adult ministries near the downtown area.',
      category: 'recommendations',
    })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({
      id: 'post-new',
      title: 'Best churches for young adults in downtown San Antonio',
      category: 'recommendations',
    })
    expect(response.body.message).toBe('Post created successfully')
  })

  it('requires authentication to create a forum post', async () => {
    const response = await request(createApp()).post('/api/v1/forum/posts').send({
      title: 'Best churches for young adults in downtown San Antonio',
      body: 'Looking for recommendations for churches with active young adult ministries near the downtown area.',
    })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('validates input when creating a forum post', async () => {
    const agent = await loginAgent()

    const response = await agent.post('/api/v1/forum/posts').send({
      title: 'Hi',
      body: 'Short',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('defaults category to general when not specified', async () => {
    const agent = await loginAgent()

    const createdPost = {
      ...basePost,
      id: 'post-default-cat',
      category: 'general',
    }

    mockedPrisma.forumPost.create.mockResolvedValue(createdPost)

    const response = await agent.post('/api/v1/forum/posts').send({
      title: 'A question about the community here in San Antonio',
      body: 'I have been attending several churches and wanted to share my thoughts and hear from others.',
    })

    expect(response.status).toBe(201)

    const createArgs = mockedPrisma.forumPost.create.mock.calls[0][0]
    expect(createArgs.data.category).toBe('general')
  })

  // ── PATCH /forum/posts/:id ─────────────────────────────────────────

  it('updates own forum post', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumPost.findUnique.mockResolvedValue({
      id: 'post-1',
      authorId: 'user-1',
    })

    const updatedPost = {
      ...basePost,
      title: 'Updated: Looking for family-friendly churches near Stone Oak',
    }

    mockedPrisma.forumPost.update.mockResolvedValue(updatedPost)

    const response = await agent.patch('/api/v1/forum/posts/post-1').send({
      title: 'Updated: Looking for family-friendly churches near Stone Oak',
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'post-1',
      title: 'Updated: Looking for family-friendly churches near Stone Oak',
    })
    expect(response.body.message).toBe('Post updated successfully')
  })

  it('returns 403 when updating another users forum post', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumPost.findUnique.mockResolvedValue({
      id: 'post-2',
      authorId: 'user-2',
    })

    const response = await agent.patch('/api/v1/forum/posts/post-2').send({
      title: 'Trying to edit someone elses post about San Antonio churches',
    })

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  it('returns 404 when updating a non-existent forum post', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumPost.findUnique.mockResolvedValue(null)

    const response = await agent.patch('/api/v1/forum/posts/nonexistent').send({
      title: 'This post does not exist and should return not found',
    })

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })

  it('rejects update with no fields provided', async () => {
    const agent = await loginAgent()

    const response = await agent.patch('/api/v1/forum/posts/post-1').send({})

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  // ── DELETE /forum/posts/:id ────────────────────────────────────────

  it('lets the owner delete their own forum post', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumPost.findUnique.mockResolvedValue({
      id: 'post-1',
      authorId: 'user-1',
    })
    mockedPrisma.forumPost.delete.mockResolvedValue({ id: 'post-1' })

    const response = await agent.delete('/api/v1/forum/posts/post-1')

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'post-1',
      deleted: true,
    })
    expect(response.body.message).toBe('Post deleted successfully')
  })

  it('lets a site admin delete any forum post', async () => {
    const agent = await loginAdminAgent()

    mockedPrisma.forumPost.findUnique.mockResolvedValue({
      id: 'post-2',
      authorId: 'user-2',
    })
    mockedPrisma.user.findUnique.mockResolvedValue({
      role: 'SITE_ADMIN',
    })
    mockedPrisma.forumPost.delete.mockResolvedValue({ id: 'post-2' })

    const response = await agent.delete('/api/v1/forum/posts/post-2')

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'post-2',
      deleted: true,
    })
  })

  it('returns 403 when a non-owner non-admin tries to delete a forum post', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumPost.findUnique.mockResolvedValue({
      id: 'post-2',
      authorId: 'user-2',
    })
    mockedPrisma.user.findUnique.mockResolvedValue({
      role: 'USER',
    })

    const response = await agent.delete('/api/v1/forum/posts/post-2')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  it('returns 404 when deleting a non-existent forum post', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumPost.findUnique.mockResolvedValue(null)

    const response = await agent.delete('/api/v1/forum/posts/nonexistent')

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })

  // ── POST /forum/posts/:id/replies ──────────────────────────────────

  it('creates a reply on a forum post when authenticated', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumPost.findUnique.mockResolvedValue({
      id: 'post-1',
      isLocked: false,
    })

    const createdReply = {
      ...baseReply,
      id: 'reply-new',
      authorId: 'user-1',
      author: baseAuthor,
      body: 'Thanks for the recommendation, I will definitely check them out this Sunday.',
    }

    mockedPrisma.forumReply.create.mockResolvedValue(createdReply)

    const response = await agent.post('/api/v1/forum/posts/post-1/replies').send({
      body: 'Thanks for the recommendation, I will definitely check them out this Sunday.',
    })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({
      id: 'reply-new',
      postId: 'post-1',
      body: 'Thanks for the recommendation, I will definitely check them out this Sunday.',
    })
    expect(response.body.message).toBe('Reply created successfully')
  })

  it('requires authentication to create a reply', async () => {
    const response = await request(createApp())
      .post('/api/v1/forum/posts/post-1/replies')
      .send({
        body: 'Trying to reply without being logged in should not work.',
      })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('returns 403 when replying to a locked forum post', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumPost.findUnique.mockResolvedValue({
      id: 'post-locked',
      isLocked: true,
    })

    const response = await agent.post('/api/v1/forum/posts/post-locked/replies').send({
      body: 'This post is locked so my reply should be rejected with a clear error message.',
    })

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('POST_LOCKED')
  })

  it('returns 404 when replying to a non-existent forum post', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumPost.findUnique.mockResolvedValue(null)

    const response = await agent.post('/api/v1/forum/posts/nonexistent/replies').send({
      body: 'This post does not exist so the reply should fail with a not found error.',
    })

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })

  it('validates reply body is not empty', async () => {
    const agent = await loginAgent()

    const response = await agent.post('/api/v1/forum/posts/post-1/replies').send({
      body: '',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
  })

  // ── DELETE /forum/replies/:id ──────────────────────────────────────

  it('lets the owner delete their own reply', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumReply.findUnique.mockResolvedValue({
      id: 'reply-1',
      authorId: 'user-1',
    })
    mockedPrisma.forumReply.delete.mockResolvedValue({ id: 'reply-1' })

    const response = await agent.delete('/api/v1/forum/replies/reply-1')

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'reply-1',
      deleted: true,
    })
    expect(response.body.message).toBe('Reply deleted successfully')
  })

  it('lets a site admin delete any reply', async () => {
    const agent = await loginAdminAgent()

    mockedPrisma.forumReply.findUnique.mockResolvedValue({
      id: 'reply-2',
      authorId: 'user-2',
    })
    mockedPrisma.user.findUnique.mockResolvedValue({
      role: 'SITE_ADMIN',
    })
    mockedPrisma.forumReply.delete.mockResolvedValue({ id: 'reply-2' })

    const response = await agent.delete('/api/v1/forum/replies/reply-2')

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'reply-2',
      deleted: true,
    })
  })

  it('returns 403 when a non-owner non-admin tries to delete a reply', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumReply.findUnique.mockResolvedValue({
      id: 'reply-2',
      authorId: 'user-2',
    })
    mockedPrisma.user.findUnique.mockResolvedValue({
      role: 'USER',
    })

    const response = await agent.delete('/api/v1/forum/replies/reply-2')

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
  })

  it('returns 404 when deleting a non-existent reply', async () => {
    const agent = await loginAgent()

    mockedPrisma.forumReply.findUnique.mockResolvedValue(null)

    const response = await agent.delete('/api/v1/forum/replies/nonexistent')

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })
})
