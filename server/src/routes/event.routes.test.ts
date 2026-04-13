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
    event: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
  event: {
    findUnique: jest.Mock
    findMany: jest.Mock
    count: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
  user: {
    findUnique: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma

const startTime = new Date('2026-05-01T14:00:00.000Z')
const endTime = new Date('2026-05-01T16:00:00.000Z')

const churchAdminLoginUser = {
  id: 'user-admin-1',
  email: 'admin@grace.org',
  name: 'Grace Admin',
  avatarUrl: null,
  role: 'CHURCH_ADMIN',
  emailVerified: true,
  createdAt: new Date('2026-03-28T00:00:00.000Z'),
}

const baseEventRecord = {
  id: 'event-1',
  churchId: 'church-1',
  title: 'Spring Service',
  description: 'Welcome everyone',
  eventType: 'service',
  startTime,
  endTime,
  locationOverride: null,
  isRecurring: false,
  recurrenceRule: null,
  source: 'MANUAL',
  status: 'PUBLISHED',
  sourceUrl: null,
  sourceHash: null,
  createdById: 'user-admin-1',
  createdAt: new Date('2026-04-01T00:00:00.000Z'),
  updatedAt: new Date('2026-04-01T00:00:00.000Z'),
}

const buildLoginAgent = async (
  userOverrides: Partial<typeof churchAdminLoginUser> = {},
): Promise<ReturnType<typeof request.agent>> => {
  const passwordHash = await bcrypt.hash('password123', 12)

  mockedPrisma.user.findUnique.mockResolvedValueOnce({
    ...churchAdminLoginUser,
    ...userOverrides,
    passwordHash,
  })

  const agent = request.agent(createApp())

  const loginResponse = await agent.post('/api/v1/auth/login').send({
    email: userOverrides.email ?? churchAdminLoginUser.email,
    password: 'password123',
  })

  expect(loginResponse.status).toBe(200)

  return agent
}

describe('event routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('requires authentication to create an event', async () => {
    const response = await request(createApp()).post('/api/v1/churches/church-1/events').send({
      title: 'Spring Service',
      eventType: 'service',
      startTime: startTime.toISOString(),
    })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
  })

  it('creates an event when the church admin owns the church', async () => {
    const agent = await buildLoginAgent()

    // authorizeChurchEventManager loads user + church in parallel
    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-admin-1',
      role: 'CHURCH_ADMIN',
    })
    mockedPrisma.church.findUnique.mockResolvedValueOnce({
      id: 'church-1',
      claimedById: 'user-admin-1',
      isClaimed: true,
    })
    mockedPrisma.event.create.mockResolvedValueOnce(baseEventRecord)

    const response = await agent.post('/api/v1/churches/church-1/events').send({
      title: 'Spring Service',
      description: 'Welcome everyone',
      eventType: 'service',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    })

    expect(response.status).toBe(201)
    expect(response.body.data).toMatchObject({
      id: 'event-1',
      churchId: 'church-1',
      title: 'Spring Service',
      eventType: 'service',
    })
    expect(mockedPrisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          churchId: 'church-1',
          title: 'Spring Service',
          eventType: 'service',
          createdById: 'user-admin-1',
        }),
      }),
    )
  })

  it('forbids a church admin from creating events for another church', async () => {
    const agent = await buildLoginAgent()

    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-admin-1',
      role: 'CHURCH_ADMIN',
    })
    mockedPrisma.church.findUnique.mockResolvedValueOnce({
      id: 'church-2',
      claimedById: 'another-user',
      isClaimed: true,
    })

    const response = await agent.post('/api/v1/churches/church-2/events').send({
      title: 'Spring Service',
      eventType: 'service',
      startTime: startTime.toISOString(),
    })

    expect(response.status).toBe(403)
    expect(response.body.error.code).toBe('FORBIDDEN')
    expect(mockedPrisma.event.create).not.toHaveBeenCalled()
  })

  it('rejects events where end time is before start time', async () => {
    const agent = await buildLoginAgent()

    const response = await agent.post('/api/v1/churches/church-1/events').send({
      title: 'Spring Service',
      eventType: 'service',
      startTime: endTime.toISOString(),
      endTime: startTime.toISOString(),
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedPrisma.event.create).not.toHaveBeenCalled()
  })

  it('updates an event owned by the church admin', async () => {
    const agent = await buildLoginAgent()

    mockedPrisma.event.findUnique.mockResolvedValueOnce({
      id: 'event-1',
      churchId: 'church-1',
      startTime,
      endTime,
    })
    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-admin-1',
      role: 'CHURCH_ADMIN',
    })
    mockedPrisma.church.findUnique.mockResolvedValueOnce({
      id: 'church-1',
      claimedById: 'user-admin-1',
      isClaimed: true,
    })
    mockedPrisma.event.update.mockResolvedValueOnce({
      ...baseEventRecord,
      title: 'Updated Spring Service',
    })

    const response = await agent.patch('/api/v1/events/event-1').send({
      title: 'Updated Spring Service',
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'event-1',
      title: 'Updated Spring Service',
    })
    expect(mockedPrisma.event.update).toHaveBeenCalledWith({
      where: { id: 'event-1' },
      data: { title: 'Updated Spring Service' },
    })
  })

  it('returns 404 when updating a missing event', async () => {
    const agent = await buildLoginAgent()

    mockedPrisma.event.findUnique.mockResolvedValueOnce(null)

    const response = await agent.patch('/api/v1/events/event-missing').send({
      title: 'Does not matter',
    })

    expect(response.status).toBe(404)
    expect(response.body.error.code).toBe('NOT_FOUND')
  })

  it('deletes an event owned by the church admin', async () => {
    const agent = await buildLoginAgent()

    mockedPrisma.event.findUnique.mockResolvedValueOnce({
      id: 'event-1',
      churchId: 'church-1',
    })
    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-admin-1',
      role: 'CHURCH_ADMIN',
    })
    mockedPrisma.church.findUnique.mockResolvedValueOnce({
      id: 'church-1',
      claimedById: 'user-admin-1',
      isClaimed: true,
    })
    mockedPrisma.event.delete.mockResolvedValueOnce({
      id: 'event-1',
    })

    const response = await agent.delete('/api/v1/events/event-1')

    expect(response.status).toBe(200)
    expect(response.body.data).toMatchObject({
      id: 'event-1',
      churchId: 'church-1',
      deleted: true,
    })
    expect(mockedPrisma.event.delete).toHaveBeenCalledWith({
      where: { id: 'event-1' },
    })
  })

  it('rejects an invalid recurrence rule with a 400', async () => {
    const agent = await buildLoginAgent()

    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-admin-1',
      role: 'CHURCH_ADMIN',
    })
    mockedPrisma.church.findUnique.mockResolvedValueOnce({
      id: 'church-1',
      claimedById: 'user-admin-1',
      isClaimed: true,
    })

    const response = await agent.post('/api/v1/churches/church-1/events').send({
      title: 'Broken Series',
      eventType: 'service',
      startTime: startTime.toISOString(),
      isRecurring: true,
      recurrenceRule: 'FREQ=YEARLY',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(response.body.error.message).toMatch(/recurrence/i)
    expect(mockedPrisma.event.create).not.toHaveBeenCalled()
  })

  it('rejects a recurrence rule that is missing when isRecurring=true', async () => {
    const agent = await buildLoginAgent()

    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-admin-1',
      role: 'CHURCH_ADMIN',
    })
    mockedPrisma.church.findUnique.mockResolvedValueOnce({
      id: 'church-1',
      claimedById: 'user-admin-1',
      isClaimed: true,
    })

    const response = await agent.post('/api/v1/churches/church-1/events').send({
      title: 'No Rule',
      eventType: 'service',
      startTime: startTime.toISOString(),
      isRecurring: true,
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedPrisma.event.create).not.toHaveBeenCalled()
  })

  it('creates a recurring event and persists a normalized RRULE', async () => {
    const agent = await buildLoginAgent()

    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'user-admin-1',
      role: 'CHURCH_ADMIN',
    })
    mockedPrisma.church.findUnique.mockResolvedValueOnce({
      id: 'church-1',
      claimedById: 'user-admin-1',
      isClaimed: true,
    })
    mockedPrisma.event.create.mockResolvedValueOnce({
      ...baseEventRecord,
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=SU,WE',
    })

    const response = await agent.post('/api/v1/churches/church-1/events').send({
      title: 'Spring Service',
      eventType: 'service',
      startTime: startTime.toISOString(),
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY;INTERVAL=1;BYDAY=WE,SU',
    })

    expect(response.status).toBe(201)
    expect(mockedPrisma.event.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isRecurring: true,
          // INTERVAL=1 is default so it's stripped; BYDAY is reordered into
          // week order.
          recurrenceRule: 'FREQ=WEEKLY;BYDAY=SU,WE',
        }),
      }),
    )
  })

  it('allows a site admin to manage events for any church', async () => {
    const agent = await buildLoginAgent({
      id: 'admin-2',
      email: 'admin@example.com',
      role: 'SITE_ADMIN',
    })

    mockedPrisma.user.findUnique.mockResolvedValueOnce({
      id: 'admin-2',
      role: 'SITE_ADMIN',
    })
    mockedPrisma.church.findUnique.mockResolvedValueOnce({
      id: 'church-7',
      claimedById: 'someone-else',
      isClaimed: true,
    })
    mockedPrisma.event.create.mockResolvedValueOnce({
      ...baseEventRecord,
      churchId: 'church-7',
      createdById: 'admin-2',
    })

    const response = await agent.post('/api/v1/churches/church-7/events').send({
      title: 'Site-wide Service',
      eventType: 'service',
      startTime: startTime.toISOString(),
    })

    expect(response.status).toBe(201)
    expect(response.body.data.churchId).toBe('church-7')
  })
})

describe('GET /api/v1/events (aggregated feed)', () => {
  const churchSummary = {
    id: 'church-1',
    slug: 'grace-church',
    name: 'Grace Church',
    city: 'San Antonio',
    denomination: 'Non-denominational',
    coverImageUrl: 'https://example.com/grace.jpg',
  }

  const feedEventRecord = {
    ...baseEventRecord,
    church: churchSummary,
  }

  const windowFrom = '2026-05-01T00:00:00.000Z'
  const windowTo = '2026-06-30T00:00:00.000Z'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns aggregated events with church info, pagination, and filters', async () => {
    mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

    const response = await request(createApp()).get('/api/v1/events').query({
      type: 'service',
      q: 'spring',
      from: windowFrom,
      to: windowTo,
      page: '1',
      pageSize: '10',
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0]).toMatchObject({
      id: 'event-1',
      occurrenceId: 'event-1',
      title: 'Spring Service',
      isOccurrence: false,
      seriesStartTime: startTime.toISOString(),
      church: {
        id: 'church-1',
        slug: 'grace-church',
        name: 'Grace Church',
        city: 'San Antonio',
      },
    })
    expect(response.body.meta).toMatchObject({
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    })
    expect(response.body.meta.filters.type).toBe('service')
    expect(response.body.meta.filters.q).toBe('spring')

    expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.any(Array),
        }),
        include: expect.objectContaining({
          church: expect.objectContaining({
            select: expect.objectContaining({ slug: true, name: true }),
          }),
        }),
        orderBy: [{ startTime: 'asc' }, { title: 'asc' }],
      }),
    )
  })

  it('defaults to page 1 with 20 results per page when no pagination params are provided', async () => {
    mockedPrisma.event.findMany.mockResolvedValueOnce([])

    const response = await request(createApp()).get('/api/v1/events')

    expect(response.status).toBe(200)
    expect(response.body.data).toEqual([])
    expect(response.body.meta).toMatchObject({
      total: 0,
      page: 1,
      pageSize: 20,
      totalPages: 0,
    })

    expect(mockedPrisma.event.findMany).toHaveBeenCalled()
  })

  it('paginates the expanded result set when page > 1', async () => {
    const seriesStart = new Date('2026-05-03T15:00:00.000Z')
    const recurringRecord = {
      ...baseEventRecord,
      id: 'event-recurring',
      title: 'Weekly Service',
      startTime: seriesStart,
      endTime: new Date('2026-05-03T16:30:00.000Z'),
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY;COUNT=35',
      church: churchSummary,
    }

    mockedPrisma.event.findMany.mockResolvedValueOnce([recurringRecord])

    const response = await request(createApp()).get('/api/v1/events').query({
      from: '2026-05-01T00:00:00.000Z',
      to: '2027-05-01T00:00:00.000Z',
      page: '3',
      pageSize: '10',
    })

    expect(response.status).toBe(200)
    expect(response.body.meta).toMatchObject({
      total: 35,
      page: 3,
      pageSize: 10,
      totalPages: 4,
    })
    // The 3rd page of 10 weekly occurrences is occurrences 21..30 from dtstart.
    expect(response.body.data).toHaveLength(10)
    expect(response.body.data[0]).toMatchObject({
      id: 'event-recurring',
      isOccurrence: true,
      seriesStartTime: seriesStart.toISOString(),
      startTime: '2026-09-20T15:00:00.000Z', // dtstart + 20 weeks
    })
  })

  it('expands a weekly recurring event into multiple occurrences in the window', async () => {
    const seriesStart = new Date('2026-05-03T15:00:00.000Z')
    const recurringRecord = {
      ...baseEventRecord,
      id: 'event-recurring',
      title: 'Sunday Worship',
      startTime: seriesStart,
      endTime: new Date('2026-05-03T16:30:00.000Z'),
      isRecurring: true,
      recurrenceRule: 'FREQ=WEEKLY',
      church: churchSummary,
    }

    mockedPrisma.event.findMany.mockResolvedValueOnce([recurringRecord])

    const response = await request(createApp()).get('/api/v1/events').query({
      from: '2026-05-01T00:00:00.000Z',
      to: '2026-06-01T00:00:00.000Z',
    })

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(5)

    const occurrenceIds = response.body.data.map(
      (event: { occurrenceId: string }) => event.occurrenceId,
    )
    expect(new Set(occurrenceIds).size).toBe(5)
    expect(occurrenceIds[0]).toBe('event-recurring::2026-05-03T15:00:00.000Z')

    expect(response.body.data[1]).toMatchObject({
      id: 'event-recurring',
      isOccurrence: true,
      startTime: '2026-05-10T15:00:00.000Z',
      endTime: '2026-05-10T16:30:00.000Z',
      seriesStartTime: seriesStart.toISOString(),
      recurrenceRule: 'FREQ=WEEKLY',
    })
  })

  it('rejects requests where "to" is before "from"', async () => {
    const response = await request(createApp()).get('/api/v1/events').query({
      from: '2026-06-01T00:00:00.000Z',
      to: '2026-05-01T00:00:00.000Z',
    })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
  })

  it('rejects invalid event type values', async () => {
    const response = await request(createApp()).get('/api/v1/events').query({ type: 'not-a-type' })

    expect(response.status).toBe(400)
    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
  })
})
