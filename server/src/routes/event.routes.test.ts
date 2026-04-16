import bcrypt from 'bcryptjs'
import request from 'supertest'

import { createApp } from '../app.js'
import prisma from '../lib/prisma.js'
import { ChurchEventType } from '../types/event.types.js'

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
    neighborhood: 'Downtown',
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
    expect(response.body.meta.filters.type).toEqual(['service'])
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

  it('accepts a comma-separated list of event types and ORs them together', async () => {
    mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

    const response = await request(createApp())
      .get('/api/v1/events')
      .query({ type: 'service,community' })

    expect(response.status).toBe(200)
    expect(response.body.meta.filters.type).toEqual(['service', 'community'])

    const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
      AND: Array<Record<string, unknown>>
    }
    expect(whereArg.AND[0]).toMatchObject({
      eventType: { in: ['service', 'community'] },
    })
  })

  it('accepts repeated `type` query params for multi-select', async () => {
    mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

    // Express parses `?type=service&type=community` as a string array on
    // req.query, so the schema needs to handle both shapes.
    const response = await request(createApp()).get('/api/v1/events?type=service&type=community')

    expect(response.status).toBe(200)
    expect(response.body.meta.filters.type).toEqual(['service', 'community'])
  })

  it('dedupes repeated event types and rejects when any is invalid', async () => {
    mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

    const okResponse = await request(createApp())
      .get('/api/v1/events')
      .query({ type: 'service,service,community' })

    expect(okResponse.status).toBe(200)
    expect(okResponse.body.meta.filters.type).toEqual(['service', 'community'])

    const badResponse = await request(createApp())
      .get('/api/v1/events')
      .query({ type: 'service,not-a-type' })

    expect(badResponse.status).toBe(400)
    expect(badResponse.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('requires authentication when savedOnly=true is requested', async () => {
    const response = await request(createApp()).get('/api/v1/events').query({ savedOnly: 'true' })

    expect(response.status).toBe(401)
    expect(response.body.error.code).toBe('AUTH_ERROR')
    expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
  })

  it('restricts the feed to churches saved by the authenticated user when savedOnly=true', async () => {
    const agent = await buildLoginAgent()

    mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

    const response = await agent.get('/api/v1/events').query({ savedOnly: 'true' })

    expect(response.status).toBe(200)
    expect(response.body.meta.filters.savedOnly).toBe(true)

    expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              church: { savedByUsers: { some: { userId: 'user-admin-1' } } },
            }),
          ]),
        }),
      }),
    )
  })

  it('ignores savedOnly=false and does not add the saved-church filter', async () => {
    mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

    const response = await request(createApp()).get('/api/v1/events').query({ savedOnly: 'false' })

    expect(response.status).toBe(200)
    expect(response.body.meta.filters.savedOnly).toBeUndefined()

    const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
      AND: Array<Record<string, unknown>>
    }
    const baseQueryFilters = whereArg.AND[0]!
    expect(baseQueryFilters).not.toHaveProperty('church')
  })

  describe('neighborhood filter', () => {
    it('filters the feed to a single neighborhood (case-insensitive)', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ neighborhood: 'Downtown' })

      expect(response.status).toBe(200)
      // The echoed meta preserves the originally-supplied casing so chip
      // labels read naturally; the underlying SQL is matched insensitively.
      expect(response.body.meta.filters.neighborhood).toEqual(['Downtown'])

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // The neighborhood filter is expressed as an OR of insensitive equality
      // clauses on `neighborhood`, nested under the shared `church` clause.
      expect(whereArg.AND[0]).toMatchObject({
        church: {
          OR: [
            {
              neighborhood: { equals: 'downtown', mode: 'insensitive' },
            },
          ],
        },
      })
    })

    it('accepts a comma-separated multi-select and dedupes case-insensitively', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ neighborhood: 'Downtown,Alamo Heights,downtown' })

      expect(response.status).toBe(200)
      // Echoed meta preserves the originally-supplied casing/order so chip
      // labels read naturally; only exact-match duplicates (after trimming)
      // collapse via the display-casing set.
      expect(response.body.meta.filters.neighborhood).toEqual([
        'Downtown',
        'Alamo Heights',
        'downtown',
      ])

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // The OR list is deduped by lower-cased value so `Downtown` and
      // `downtown` collapse to a single SQL clause even though they round-trip
      // separately in the echoed meta.
      expect(whereArg.AND[0]).toMatchObject({
        church: {
          OR: [
            {
              neighborhood: { equals: 'downtown', mode: 'insensitive' },
            },
            {
              neighborhood: { equals: 'alamo heights', mode: 'insensitive' },
            },
          ],
        },
      })
    })

    it('drops empty/whitespace neighborhood tokens and skips the filter entirely', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ neighborhood: ' , , ' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.neighborhood).toBeUndefined()

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      const baseQueryFilters = whereArg.AND[0]!
      expect(baseQueryFilters).not.toHaveProperty('church')
    })

    it('omits the neighborhood meta when no value is supplied', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events')

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.neighborhood).toBeUndefined()
    })

    it('combines the neighborhood filter with savedOnly into a single church clause', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await agent
        .get('/api/v1/events')
        .query({ neighborhood: 'Alamo Heights', savedOnly: 'true' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.neighborhood).toEqual(['Alamo Heights'])
      expect(response.body.meta.filters.savedOnly).toBe(true)

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      expect(whereArg.AND[0]).toMatchObject({
        church: {
          savedByUsers: { some: { userId: 'user-admin-1' } },
          OR: [{ neighborhood: { equals: 'alamo heights', mode: 'insensitive' } }],
        },
      })
    })

    it('rejects neighborhood values that exceed the maximum length', async () => {
      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ neighborhood: 'x'.repeat(121) })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
    })
  })

  describe('denomination filter', () => {
    it('filters the feed to a single denomination family (case-insensitive)', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ denomination: 'Baptist' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.denomination).toEqual(['Baptist'])

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // The denomination filter is expressed as an OR of insensitive equality
      // clauses on `denominationFamily`, nested under the shared `church` clause.
      expect(whereArg.AND[0]).toMatchObject({
        church: {
          OR: [
            {
              denominationFamily: { equals: 'baptist', mode: 'insensitive' },
            },
          ],
        },
      })
    })

    it('accepts a comma-separated multi-select and dedupes case-insensitively', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ denomination: 'Baptist,Methodist,baptist' })

      expect(response.status).toBe(200)
      // The echoed meta preserves the originally-supplied casing/order so chip
      // labels read naturally; the underlying SQL is matched insensitively.
      expect(response.body.meta.filters.denomination).toEqual(['Baptist', 'Methodist', 'baptist'])

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      expect(whereArg.AND[0]).toMatchObject({
        church: {
          OR: [
            {
              denominationFamily: { equals: 'baptist', mode: 'insensitive' },
            },
            {
              denominationFamily: { equals: 'methodist', mode: 'insensitive' },
            },
          ],
        },
      })
    })

    it('combines the denomination filter with neighborhood and savedOnly into one church clause', async () => {
      const agent = await buildLoginAgent()

      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await agent.get('/api/v1/events').query({
        denomination: 'Baptist',
        neighborhood: 'Downtown',
        savedOnly: 'true',
      })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.denomination).toEqual(['Baptist'])
      expect(response.body.meta.filters.neighborhood).toEqual(['Downtown'])
      expect(response.body.meta.filters.savedOnly).toBe(true)

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // Both neighborhood and denomination are multi-select, each expressed as
      // its own `OR` of case-insensitive equality clauses. Prisma only allows a
      // single top-level `OR` per clause, so when both are present they are
      // `AND`-composed to preserve the intended
      // (neighborhood OR [...] ) AND (denomination OR [...] ) semantics.
      expect(whereArg.AND[0]).toMatchObject({
        church: {
          savedByUsers: { some: { userId: 'user-admin-1' } },
          AND: [
            {
              OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }],
            },
            {
              OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }],
            },
          ],
        },
      })
    })

    it('omits the denomination meta when no value is supplied', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events')

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.denomination).toBeUndefined()
    })

    it('drops empty denomination tokens and skips the filter entirely', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ denomination: ' , , ' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.denomination).toBeUndefined()

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      const baseQueryFilters = whereArg.AND[0]!
      expect(baseQueryFilters).not.toHaveProperty('church')
    })
  })

  describe('accessibleOnly filter', () => {
    it('filters the feed to wheelchair-accessible churches when enabled', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ accessibleOnly: 'true' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.accessibleOnly).toBe(true)

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // Matching `equals: true` excludes both `false` and `null` churches so
      // visitors can trust the narrowed result set.
      expect(whereArg.AND[0]).toMatchObject({
        church: { wheelchairAccessible: true },
      })
    })

    it('omits the accessibleOnly meta when no value is supplied', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events')

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.accessibleOnly).toBeUndefined()

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      const baseQueryFilters = whereArg.AND[0]!
      expect(baseQueryFilters).not.toHaveProperty('church')
    })

    it('treats accessibleOnly=false as no filter', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ accessibleOnly: 'false' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.accessibleOnly).toBeUndefined()

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      const baseQueryFilters = whereArg.AND[0]!
      expect(baseQueryFilters).not.toHaveProperty('church')
    })

    it('combines accessibleOnly with neighborhood and denomination in one church clause', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events').query({
        accessibleOnly: 'true',
        neighborhood: 'Downtown',
        denomination: 'Baptist',
      })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.accessibleOnly).toBe(true)
      expect(response.body.meta.filters.neighborhood).toEqual(['Downtown'])
      expect(response.body.meta.filters.denomination).toEqual(['Baptist'])

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // Neighborhood + denomination are both multi-select, so each contributes
      // its own nested `OR` combined under `AND`; wheelchairAccessible stays a
      // top-level field on the shared church clause.
      expect(whereArg.AND[0]).toMatchObject({
        church: {
          wheelchairAccessible: true,
          AND: [
            {
              OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }],
            },
            {
              OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }],
            },
          ],
        },
      })
    })
  })

  describe('familyFriendly filter', () => {
    it('filters the feed to good-for-children churches when enabled', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ familyFriendly: 'true' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.familyFriendly).toBe(true)

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // Matching `equals: true` excludes both `false` and `null` churches so
      // families can trust that the narrowed result set is kid-friendly.
      expect(whereArg.AND[0]).toMatchObject({
        church: { goodForChildren: true },
      })
    })

    it('omits the familyFriendly meta when no value is supplied', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events')

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.familyFriendly).toBeUndefined()

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      const baseQueryFilters = whereArg.AND[0]!
      expect(baseQueryFilters).not.toHaveProperty('church')
    })

    it('treats familyFriendly=false as no filter', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ familyFriendly: 'false' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.familyFriendly).toBeUndefined()

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      const baseQueryFilters = whereArg.AND[0]!
      expect(baseQueryFilters).not.toHaveProperty('church')
    })

    it('combines familyFriendly with accessibleOnly and neighborhood in one church clause', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events').query({
        familyFriendly: 'true',
        accessibleOnly: 'true',
        neighborhood: 'Downtown',
      })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.familyFriendly).toBe(true)
      expect(response.body.meta.filters.accessibleOnly).toBe(true)
      expect(response.body.meta.filters.neighborhood).toEqual(['Downtown'])

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // With only neighborhood as a multi-select clause on the church side
      // (no denomination narrowing), its `OR` list lives directly on the
      // shared church clause alongside the accessibility + family flags.
      expect(whereArg.AND[0]).toMatchObject({
        church: {
          wheelchairAccessible: true,
          goodForChildren: true,
          OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }],
        },
      })
    })
  })

  describe('groupFriendly filter', () => {
    it('filters the feed to good-for-groups churches when enabled', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ groupFriendly: 'true' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.groupFriendly).toBe(true)

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // Matching `equals: true` excludes both `false` and `null` churches so
      // small-group organizers can trust the narrowed result set hosts groups.
      expect(whereArg.AND[0]).toMatchObject({
        church: { goodForGroups: true },
      })
    })

    it('omits the groupFriendly meta when no value is supplied', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events')

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.groupFriendly).toBeUndefined()

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      const baseQueryFilters = whereArg.AND[0]!
      expect(baseQueryFilters).not.toHaveProperty('church')
    })

    it('treats groupFriendly=false as no filter', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ groupFriendly: 'false' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.groupFriendly).toBeUndefined()

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      const baseQueryFilters = whereArg.AND[0]!
      expect(baseQueryFilters).not.toHaveProperty('church')
    })

    it('combines groupFriendly with familyFriendly and accessibleOnly in one church clause', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events').query({
        groupFriendly: 'true',
        familyFriendly: 'true',
        accessibleOnly: 'true',
        neighborhood: 'Downtown',
      })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.groupFriendly).toBe(true)
      expect(response.body.meta.filters.familyFriendly).toBe(true)
      expect(response.body.meta.filters.accessibleOnly).toBe(true)
      expect(response.body.meta.filters.neighborhood).toEqual(['Downtown'])

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // Neighborhood remains a multi-select `OR` list on the shared church
      // clause while the three nullable-boolean flags sit as top-level fields.
      expect(whereArg.AND[0]).toMatchObject({
        church: {
          wheelchairAccessible: true,
          goodForChildren: true,
          goodForGroups: true,
          OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }],
        },
      })
    })
  })

  describe('verifiedOnly filter', () => {
    it('filters the feed to verified / claimed churches when enabled', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ verifiedOnly: 'true' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.verifiedOnly).toBe(true)

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // `isClaimed: true` excludes unclaimed churches so visitors know the
      // listing has been confirmed by a church leader.
      expect(whereArg.AND[0]).toMatchObject({
        church: { isClaimed: true },
      })
    })

    it('omits the verifiedOnly meta when no value is supplied', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events')

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.verifiedOnly).toBeUndefined()

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      const baseQueryFilters = whereArg.AND[0]!
      expect(baseQueryFilters).not.toHaveProperty('church')
    })

    it('treats verifiedOnly=false as no filter', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ verifiedOnly: 'false' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.verifiedOnly).toBeUndefined()

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      const baseQueryFilters = whereArg.AND[0]!
      expect(baseQueryFilters).not.toHaveProperty('church')
    })

    it('accepts the boolean-ish =1 alias', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events').query({ verifiedOnly: '1' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.verifiedOnly).toBe(true)
    })

    it('combines verifiedOnly with the other boolean axes in one church clause', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events').query({
        verifiedOnly: 'true',
        groupFriendly: 'true',
        familyFriendly: 'true',
        accessibleOnly: 'true',
      })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.verifiedOnly).toBe(true)
      expect(response.body.meta.filters.groupFriendly).toBe(true)
      expect(response.body.meta.filters.familyFriendly).toBe(true)
      expect(response.body.meta.filters.accessibleOnly).toBe(true)

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // All four nullable/non-nullable boolean flags sit as top-level fields
      // on the same shared church clause — no extra nesting required because
      // none of them contributes its own `OR` list.
      expect(whereArg.AND[0]).toMatchObject({
        church: {
          wheelchairAccessible: true,
          goodForChildren: true,
          goodForGroups: true,
          isClaimed: true,
        },
      })
    })
  })

  describe('language filter', () => {
    it('filters the feed to churches that host services in the requested language', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ language: 'Spanish' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.language).toEqual(['Spanish'])

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      expect(whereArg.AND[0]).toMatchObject({
        church: { languages: { hasSome: ['Spanish'] } },
      })
    })

    it('OR-combines a comma-separated list of languages', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ language: 'English,Spanish' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.language).toEqual(['English', 'Spanish'])

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      expect(whereArg.AND[0]).toMatchObject({
        church: { languages: { hasSome: ['English', 'Spanish'] } },
      })
    })

    it('omits the language meta when no value is supplied', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events')

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.language).toBeUndefined()

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      const baseQueryFilters = whereArg.AND[0]!
      expect(baseQueryFilters).not.toHaveProperty('church')
    })

    it('ignores blank / whitespace-only entries in the list', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ language: ',  ,Spanish, ' })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.language).toEqual(['Spanish'])
    })

    it('combines language with familyFriendly and neighborhood in one church clause', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events').query({
        language: 'Spanish',
        familyFriendly: 'true',
        neighborhood: 'Downtown',
      })

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.language).toEqual(['Spanish'])
      expect(response.body.meta.filters.familyFriendly).toBe(true)
      expect(response.body.meta.filters.neighborhood).toEqual(['Downtown'])

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as {
        AND: Array<Record<string, unknown>>
      }
      // Neighborhood is now a multi-select `OR` list on the shared church
      // clause while `languages.hasSome` and the family-friendly flag stay
      // top-level fields alongside it.
      expect(whereArg.AND[0]).toMatchObject({
        church: {
          goodForChildren: true,
          languages: { hasSome: ['Spanish'] },
          OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }],
        },
      })
    })
  })

  describe('timeOfDay filter (San Antonio local time)', () => {
    // San Antonio is America/Chicago — CDT (UTC-5) in May/June.
    // 09:00 CDT  -> 14:00 UTC (morning)
    // 13:00 CDT  -> 18:00 UTC (afternoon)
    // 18:30 CDT  -> 23:30 UTC (evening)
    // 23:00 CDT  -> 04:00 UTC next day (overnight, no bucket)
    const morningRecord = {
      ...baseEventRecord,
      id: 'event-morning',
      title: 'Morning Service',
      startTime: new Date('2026-05-03T14:00:00.000Z'),
      endTime: new Date('2026-05-03T15:00:00.000Z'),
      church: churchSummary,
    }
    const afternoonRecord = {
      ...baseEventRecord,
      id: 'event-afternoon',
      title: 'Afternoon Study',
      startTime: new Date('2026-05-03T18:00:00.000Z'),
      endTime: new Date('2026-05-03T19:00:00.000Z'),
      church: churchSummary,
    }
    const eveningRecord = {
      ...baseEventRecord,
      id: 'event-evening',
      title: 'Evening Group',
      startTime: new Date('2026-05-03T23:30:00.000Z'),
      endTime: new Date('2026-05-04T00:30:00.000Z'),
      church: churchSummary,
    }
    const overnightRecord = {
      ...baseEventRecord,
      id: 'event-overnight',
      title: 'Overnight Vigil',
      startTime: new Date('2026-05-04T04:00:00.000Z'),
      endTime: new Date('2026-05-04T05:00:00.000Z'),
      church: churchSummary,
    }

    it('includes only morning occurrences when timeOfDay=morning', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([
        morningRecord,
        afternoonRecord,
        eveningRecord,
        overnightRecord,
      ])

      const response = await request(createApp()).get('/api/v1/events').query({
        from: '2026-05-01T00:00:00.000Z',
        to: '2026-05-10T00:00:00.000Z',
        timeOfDay: 'morning',
      })

      expect(response.status).toBe(200)
      expect(response.body.data.map((event: { id: string }) => event.id)).toEqual(['event-morning'])
      expect(response.body.meta.filters.timeOfDay).toBe('morning')
    })

    it('includes only afternoon occurrences when timeOfDay=afternoon', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([
        morningRecord,
        afternoonRecord,
        eveningRecord,
        overnightRecord,
      ])

      const response = await request(createApp()).get('/api/v1/events').query({
        from: '2026-05-01T00:00:00.000Z',
        to: '2026-05-10T00:00:00.000Z',
        timeOfDay: 'afternoon',
      })

      expect(response.status).toBe(200)
      expect(response.body.data.map((event: { id: string }) => event.id)).toEqual([
        'event-afternoon',
      ])
    })

    it('includes only evening occurrences when timeOfDay=evening', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([
        morningRecord,
        afternoonRecord,
        eveningRecord,
        overnightRecord,
      ])

      const response = await request(createApp()).get('/api/v1/events').query({
        from: '2026-05-01T00:00:00.000Z',
        to: '2026-05-10T00:00:00.000Z',
        timeOfDay: 'evening',
      })

      expect(response.status).toBe(200)
      expect(response.body.data.map((event: { id: string }) => event.id)).toEqual(['event-evening'])
    })

    it('rejects unknown timeOfDay buckets with a 400', async () => {
      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ timeOfDay: 'midnight' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
    })

    it('omits the timeOfDay meta when no bucket is requested', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([feedEventRecord])

      const response = await request(createApp()).get('/api/v1/events')

      expect(response.status).toBe(200)
      expect(response.body.meta.filters.timeOfDay).toBeUndefined()
    })
  })

  describe('sort option', () => {
    const earlyStart = new Date('2026-05-02T15:00:00.000Z')
    const lateStart = new Date('2026-05-10T15:00:00.000Z')

    const freshlyAnnounced = {
      ...baseEventRecord,
      id: 'event-late-start-fresh',
      title: 'Just-announced Volunteer Day',
      eventType: 'volunteer',
      startTime: lateStart,
      endTime: new Date('2026-05-10T17:00:00.000Z'),
      createdAt: new Date('2026-04-15T00:00:00.000Z'),
      church: churchSummary,
    }

    const longStanding = {
      ...baseEventRecord,
      id: 'event-early-start-old',
      title: 'Long-running Sunday Service',
      eventType: 'service',
      startTime: earlyStart,
      endTime: new Date('2026-05-02T16:00:00.000Z'),
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      church: churchSummary,
    }

    it('defaults to soonest ordering when no sort is supplied', async () => {
      // Prisma returns rows in insertion order — the service is responsible
      // for the stable chronological sort regardless of the driver order.
      mockedPrisma.event.findMany.mockResolvedValueOnce([freshlyAnnounced, longStanding])

      const response = await request(createApp()).get('/api/v1/events').query({
        from: '2026-05-01T00:00:00.000Z',
        to: '2026-05-31T00:00:00.000Z',
      })

      expect(response.status).toBe(200)
      expect(response.body.data.map((event: { id: string }) => event.id)).toEqual([
        'event-early-start-old',
        'event-late-start-fresh',
      ])
      // Default sort is implicit — the meta envelope should stay clean.
      expect(response.body.meta.filters.sort).toBeUndefined()
    })

    it('reorders the feed by createdAt desc when sort=recent', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([longStanding, freshlyAnnounced])

      const response = await request(createApp()).get('/api/v1/events').query({
        from: '2026-05-01T00:00:00.000Z',
        to: '2026-05-31T00:00:00.000Z',
        sort: 'recent',
      })

      expect(response.status).toBe(200)
      // Most recently announced leads the feed even though its start time is
      // later than the long-running service.
      expect(response.body.data.map((event: { id: string }) => event.id)).toEqual([
        'event-late-start-fresh',
        'event-early-start-old',
      ])
      expect(response.body.meta.filters.sort).toBe('recent')
    })

    it('rejects unknown sort values with a 400', async () => {
      const response = await request(createApp())
        .get('/api/v1/events')
        .query({ sort: 'alphabetical' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
    })
  })

  describe('GET /events.ics aggregated calendar feed', () => {
    it('returns a text/calendar feed combining events across churches', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([
        {
          id: 'event-a',
          churchId: 'church-1',
          title: 'Sunday Worship',
          description: null,
          eventType: 'service',
          startTime: new Date('2026-05-03T14:00:00.000Z'),
          endTime: new Date('2026-05-03T15:30:00.000Z'),
          locationOverride: null,
          isRecurring: true,
          recurrenceRule: 'FREQ=WEEKLY',
          createdById: 'u1',
          createdAt: new Date(),
          updatedAt: new Date('2026-04-10T00:00:00.000Z'),
          church: {
            id: 'church-1',
            slug: 'grace-fellowship',
            name: 'Grace Fellowship',
            city: 'San Antonio',
            address: '1234 Broadway',
          },
        },
        {
          id: 'event-b',
          churchId: 'church-2',
          title: 'Food Drive',
          description: null,
          eventType: 'community',
          startTime: new Date('2026-05-05T16:00:00.000Z'),
          endTime: null,
          locationOverride: 'Parking lot',
          isRecurring: false,
          recurrenceRule: null,
          createdById: 'u2',
          createdAt: new Date(),
          updatedAt: new Date('2026-04-10T00:00:00.000Z'),
          church: {
            id: 'church-2',
            slug: 'northside-chapel',
            name: 'Northside Chapel',
            city: 'San Antonio',
            address: '999 Evers',
          },
        },
      ])

      const response = await request(createApp()).get('/api/v1/events.ics')

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toMatch(/text\/calendar/)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-events\.ics"/,
      )
      const body = response.text
      expect(body).toMatch(/BEGIN:VCALENDAR/)
      expect(body).toMatch(/SUMMARY:Sunday Worship · Grace Fellowship/)
      expect(body).toMatch(/SUMMARY:Food Drive · Northside Chapel/)
      expect(body).toMatch(/RRULE:FREQ=WEEKLY/)
      // Non-recurring event keeps its locationOverride.
      expect(body).toMatch(/LOCATION:Parking lot/)
    })

    it('filters the feed by event type and updates the filename', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([
        {
          id: 'event-a',
          churchId: 'church-1',
          title: 'Sunday Worship',
          description: null,
          eventType: 'service',
          startTime: new Date('2026-05-03T14:00:00.000Z'),
          endTime: null,
          locationOverride: null,
          isRecurring: false,
          recurrenceRule: null,
          createdById: 'u1',
          createdAt: new Date(),
          updatedAt: new Date(),
          church: {
            id: 'church-1',
            slug: 'grace-fellowship',
            name: 'Grace Fellowship',
            city: 'San Antonio',
            address: '1234 Broadway',
          },
        },
      ])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ type: 'service' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-service-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ eventType: 'service' }),
        }),
      )
    })

    it('rejects an invalid type filter', async () => {
      const response = await request(createApp()).get('/api/v1/events.ics').query({ type: 'bogus' })

      expect(response.status).toBe(400)
      expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
    })

    it('accepts a comma-separated multi-type filter and reflects every type in the filename', async () => {
      // Prisma gets an `in` clause for the two selected types; the ICS
      // response's filename enumerates both so downloaded files stay
      // self-describing when visitors mix chips on the discovery page.
      mockedPrisma.event.findMany.mockResolvedValueOnce([
        {
          id: 'event-a',
          churchId: 'church-1',
          title: 'Sunday Worship',
          description: null,
          eventType: 'service',
          startTime: new Date('2026-05-03T14:00:00.000Z'),
          endTime: null,
          locationOverride: null,
          isRecurring: false,
          recurrenceRule: null,
          createdById: 'u1',
          createdAt: new Date(),
          updatedAt: new Date(),
          church: {
            id: 'church-1',
            slug: 'grace-fellowship',
            name: 'Grace Fellowship',
            city: 'San Antonio',
            address: '1234 Broadway',
          },
        },
        {
          id: 'event-b',
          churchId: 'church-2',
          title: 'Food Drive',
          description: null,
          eventType: 'community',
          startTime: new Date('2026-05-04T16:00:00.000Z'),
          endTime: null,
          locationOverride: null,
          isRecurring: false,
          recurrenceRule: null,
          createdById: 'u2',
          createdAt: new Date(),
          updatedAt: new Date(),
          church: {
            id: 'church-2',
            slug: 'northside-chapel',
            name: 'Northside Chapel',
            city: 'San Antonio',
            address: '999 Evers',
          },
        },
      ])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ type: 'service,community' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-service-community-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: { in: ['service', 'community'] },
          }),
        }),
      )
    })

    it('accepts repeated type query params and dedupes them', async () => {
      // Express surfaces `?type=service&type=community&type=service` as an
      // array; the schema dedupes so downstream consumers only see each type
      // once. This protects against a user bookmarking a URL with duplicates.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp()).get(
        '/api/v1/events.ics?type=service&type=community&type=service',
      )

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-service-community-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: { in: ['service', 'community'] },
          }),
        }),
      )
    })

    it('rejects a multi-type filter when any entry is unknown', async () => {
      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ type: 'service,bogus' })

      expect(response.status).toBe(400)
      expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
    })

    it('filters the aggregated feed by a single denomination (case-insensitive)', async () => {
      // Denomination narrows the feed at the church level via a nested clause
      // on `church.denominationFamily`. Matching is case-insensitive so the
      // lowercased list collapses "Baptist" and "baptist" to one predicate.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ denomination: 'Baptist' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-baptist-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: {
              OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }],
            },
          }),
        }),
      )
    })

    it('accepts a comma-separated multi-denomination filter', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ denomination: 'Baptist,Methodist' })

      expect(response.status).toBe(200)
      // Filename enumerates every selected family (lowercased) so downloads
      // stay self-describing.
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-baptist-methodist-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: {
              OR: [
                { denominationFamily: { equals: 'baptist', mode: 'insensitive' } },
                { denominationFamily: { equals: 'methodist', mode: 'insensitive' } },
              ],
            },
          }),
        }),
      )
    })

    it('combines the type and denomination filters on the aggregated feed', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ type: 'service', denomination: 'Baptist' })

      expect(response.status).toBe(200)
      // Filename chains the type slug(s) ahead of the denomination slug(s) so
      // the ordering in downloads stays predictable.
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-service-baptist-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: 'service',
            church: {
              OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }],
            },
          }),
        }),
      )
    })

    it('slugifies denomination values with spaces or punctuation for the filename', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ denomination: 'Non-denominational' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-non-denominational-events\.ics"/,
      )
    })

    it('drops empty denomination tokens and skips the nested church clause', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ denomination: ' , , ' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-events\.ics"/,
      )

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as Record<
        string,
        unknown
      >
      expect(whereArg).not.toHaveProperty('church')
    })

    it('silently drops denomination values that exceed the maximum length', async () => {
      // The denomination normalizer filters out entries longer than 120 chars
      // before deduping, so an over-length value collapses to an empty list
      // and the request behaves like the city-wide feed. (The JSON feed
      // enforces a hard 120-char limit via `.max()`; the calendar feed is a
      // public GET that may be bookmarked, so we stay forgiving.)
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ denomination: 'x'.repeat(121) })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-events\.ics"/,
      )

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as Record<
        string,
        unknown
      >
      expect(whereArg).not.toHaveProperty('church')
    })

    it('filters the aggregated feed by a single neighborhood (case-insensitive)', async () => {
      // Neighborhood narrows the feed at the church level via a nested clause
      // on `church.neighborhood`. Matching is case-insensitive so the
      // lowercased list collapses "Downtown" and "downtown" to one predicate —
      // mirrors the denomination filter's contract.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ neighborhood: 'Downtown' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-downtown-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: {
              OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }],
            },
          }),
        }),
      )
    })

    it('accepts a comma-separated multi-neighborhood filter', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ neighborhood: 'Downtown,Alamo Heights' })

      expect(response.status).toBe(200)
      // Filename enumerates every selected neighborhood (slugified) so
      // downloads stay self-describing and filesystem-safe.
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-downtown-alamo-heights-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: {
              OR: [
                { neighborhood: { equals: 'downtown', mode: 'insensitive' } },
                { neighborhood: { equals: 'alamo heights', mode: 'insensitive' } },
              ],
            },
          }),
        }),
      )
    })

    it('accepts repeated neighborhood query params and dedupes them', async () => {
      // Express surfaces `?neighborhood=Downtown&neighborhood=Alamo+Heights`
      // as an array; the schema dedupes so downstream consumers only see each
      // neighborhood once even when users bookmark a URL with duplicates.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp()).get(
        '/api/v1/events.ics?neighborhood=Downtown&neighborhood=Alamo+Heights&neighborhood=Downtown',
      )

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-downtown-alamo-heights-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: {
              OR: [
                { neighborhood: { equals: 'downtown', mode: 'insensitive' } },
                { neighborhood: { equals: 'alamo heights', mode: 'insensitive' } },
              ],
            },
          }),
        }),
      )
    })

    it('AND-composes neighborhood with denomination when both are supplied', async () => {
      // Prisma only allows a single top-level `OR` per clause, so the two
      // multi-select filters have to compose as
      // `AND: [{ OR: neighborhoods }, { OR: denominations }]` to preserve the
      // intended `(neighborhood OR ...) AND (denomination OR ...)` semantics.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ neighborhood: 'Downtown', denomination: 'Baptist' })

      expect(response.status).toBe(200)
      // Filename chains type → denomination → neighborhood slugs in that
      // order; with neighborhood after denomination, the denomination slug
      // leads the suffix.
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-baptist-downtown-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: {
              AND: [
                { OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }] },
                { OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }] },
              ],
            },
          }),
        }),
      )
    })

    it('combines the type, denomination, and neighborhood filters on the aggregated feed', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ type: 'service', denomination: 'Baptist', neighborhood: 'Downtown' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-service-baptist-downtown-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: 'service',
            church: {
              AND: [
                { OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }] },
                { OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }] },
              ],
            },
          }),
        }),
      )
    })

    it('slugifies neighborhood values with spaces or punctuation for the filename', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ neighborhood: 'King William / Lavaca' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-king-william-lavaca-events\.ics"/,
      )
    })

    it('drops empty neighborhood tokens and skips the nested church clause', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ neighborhood: ' , , ' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-events\.ics"/,
      )

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as Record<
        string,
        unknown
      >
      expect(whereArg).not.toHaveProperty('church')
    })

    it('rejects a neighborhood value that exceeds the maximum length', async () => {
      // The neighborhood normalizer is strict about length (120 chars) and
      // reports a zod validation error, matching the JSON feed's contract so
      // attackers can't smuggle overly-long payloads into the public endpoint.
      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ neighborhood: 'x'.repeat(121) })

      expect(response.status).toBe(400)
      expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
    })

    it('filters the aggregated feed by a single language via church.languages hasSome', async () => {
      // Language narrows the feed at the church level via a nested
      // `church.languages hasSome` clause — mirrors the JSON feed contract so
      // the two surfaces stay interchangeable.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ language: 'Spanish' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-spanish-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: { languages: { hasSome: ['Spanish'] } },
          }),
        }),
      )
    })

    it('accepts a comma-separated multi-language filter', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ language: 'English,Spanish' })

      expect(response.status).toBe(200)
      // Filename enumerates every selected language (slugified) so downloads
      // stay self-describing.
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-english-spanish-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: { languages: { hasSome: ['English', 'Spanish'] } },
          }),
        }),
      )
    })

    it('accepts repeated language query params and dedupes them', async () => {
      // Express surfaces `?language=English&language=Spanish` as an array;
      // the schema dedupes so downstream consumers only see each language
      // once even when users bookmark a URL with duplicates.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp()).get(
        '/api/v1/events.ics?language=English&language=Spanish&language=English',
      )

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-english-spanish-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: { languages: { hasSome: ['English', 'Spanish'] } },
          }),
        }),
      )
    })

    it('AND-composes language with denomination when both are supplied', async () => {
      // Prisma only allows a single top-level `OR` per clause, so the two
      // filters compose as
      // `AND: [{ OR: denominations }, { languages: { hasSome: ... } }]`.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ denomination: 'Baptist', language: 'Spanish' })

      expect(response.status).toBe(200)
      // Filename chains type → denomination → neighborhood → language slugs
      // in that order; with only denomination and language present, the
      // denomination slug leads the suffix.
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-baptist-spanish-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: {
              AND: [
                { OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }] },
                { languages: { hasSome: ['Spanish'] } },
              ],
            },
          }),
        }),
      )
    })

    it('combines type, denomination, neighborhood, and language filters on the aggregated feed', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp()).get('/api/v1/events.ics').query({
        type: 'service',
        denomination: 'Baptist',
        neighborhood: 'Downtown',
        language: 'Spanish',
      })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-service-baptist-downtown-spanish-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: 'service',
            church: {
              AND: [
                { OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }] },
                { OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }] },
                { languages: { hasSome: ['Spanish'] } },
              ],
            },
          }),
        }),
      )
    })

    it('slugifies language values with spaces or punctuation for the filename', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ language: 'American Sign Language' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-american-sign-language-events\.ics"/,
      )
    })

    it('drops empty language tokens and skips the nested church clause', async () => {
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ language: ' , , ' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-events\.ics"/,
      )

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as Record<
        string,
        unknown
      >
      expect(whereArg).not.toHaveProperty('church')
    })

    it('silently drops language values that exceed the maximum length', async () => {
      // The language normalizer filters out entries longer than 60 chars
      // before deduping, so an over-length value collapses to an empty list
      // and the request behaves like the city-wide feed. (The calendar feed
      // is a public GET that may be bookmarked, so we stay forgiving — the
      // same contract the denomination filter uses.)
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ language: 'x'.repeat(61) })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-events\.ics"/,
      )

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as Record<
        string,
        unknown
      >
      expect(whereArg).not.toHaveProperty('church')
    })

    it('filters the aggregated feed by wheelchair-accessible churches', async () => {
      // `accessibleOnly=true` adds a `church.wheelchairAccessible: true` clause
      // — mirrors the JSON feed's contract so calendar subscribers see exactly
      // the events the wheelchair-accessible chip surfaces on the discovery
      // page. The filename gets a trailing `accessible` segment so saved ICS
      // downloads stay self-describing.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ accessibleOnly: 'true' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-accessible-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: { wheelchairAccessible: true },
          }),
        }),
      )
    })

    it('also accepts boolean-ish wheelchair-accessible aliases (1, yes)', async () => {
      // The shared `booleanishFlag` parser treats `true`, `1`, `yes`, and
      // `on` interchangeably so URL share-links coming from any surface
      // (the discovery page emits `accessibleOnly=true`, but hand-typed
      // bookmarks may use `=1`) resolve identically.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ accessibleOnly: '1' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-accessible-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: { wheelchairAccessible: true },
          }),
        }),
      )
    })

    it('skips the church clause when accessibleOnly is false', async () => {
      // A "no, just the city feed" toggle (the chip flipped off) must not
      // tack a `church` clause onto the Prisma query — the city-wide feed
      // contract stays unchanged when no narrowing is requested.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ accessibleOnly: 'false' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-events\.ics"/,
      )

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as Record<
        string,
        unknown
      >
      expect(whereArg).not.toHaveProperty('church')
    })

    it('AND-composes wheelchair-accessible with denomination + neighborhood + language', async () => {
      // When every narrowing axis is in play the four `church` sub-clauses
      // compose under a single `AND` (denomination → neighborhood → language
      // → wheelchair-accessible), and the filename suffix chains
      // type → denomination → neighborhood → language → `accessible`.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp()).get('/api/v1/events.ics').query({
        type: 'service',
        denomination: 'Baptist',
        neighborhood: 'Downtown',
        language: 'Spanish',
        accessibleOnly: 'true',
      })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-service-baptist-downtown-spanish-accessible-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: 'service',
            church: {
              AND: [
                { OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }] },
                { OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }] },
                { languages: { hasSome: ['Spanish'] } },
                { wheelchairAccessible: true },
              ],
            },
          }),
        }),
      )
    })

    it('rejects an invalid wheelchair-accessible flag', async () => {
      // The shared `booleanishFlag` parser refuses values like `maybe`, so
      // bogus subscription URLs surface as a 400 instead of silently passing
      // through with no narrowing.
      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ accessibleOnly: 'maybe' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
    })

    it('filters the aggregated feed by family-friendly churches', async () => {
      // `familyFriendly=true` adds a `church.goodForChildren: true` clause —
      // mirrors the JSON feed's contract so calendar subscribers see exactly
      // the events the "Good for kids" chip surfaces on the discovery page.
      // The filename gets a trailing `family-friendly` segment so saved ICS
      // downloads stay self-describing.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ familyFriendly: 'true' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-family-friendly-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: { goodForChildren: true },
          }),
        }),
      )
    })

    it('also accepts boolean-ish family-friendly aliases (1, yes)', async () => {
      // The shared `booleanishFlag` parser treats `true`, `1`, `yes`, and
      // `on` interchangeably so URL share-links coming from any surface
      // (the discovery page emits `familyFriendly=true`, but hand-typed
      // bookmarks may use `=1`) resolve identically.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ familyFriendly: '1' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-family-friendly-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: { goodForChildren: true },
          }),
        }),
      )
    })

    it('skips the church clause when familyFriendly is false', async () => {
      // The chip toggled off (or omitted entirely) must not tack a
      // `church` clause onto the Prisma query — the city-wide feed
      // contract stays unchanged when no narrowing is requested.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ familyFriendly: 'false' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-events\.ics"/,
      )

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as Record<
        string,
        unknown
      >
      expect(whereArg).not.toHaveProperty('church')
    })

    it('AND-composes family-friendly with every other narrowing axis', async () => {
      // When every narrowing axis is in play the five `church` sub-clauses
      // compose under a single `AND` (neighborhood → denomination → language
      // → wheelchair-accessible → family-friendly), and the filename suffix
      // chains type → denomination → neighborhood → language → `accessible`
      // → `family-friendly`.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp()).get('/api/v1/events.ics').query({
        type: 'service',
        denomination: 'Baptist',
        neighborhood: 'Downtown',
        language: 'Spanish',
        accessibleOnly: 'true',
        familyFriendly: 'true',
      })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-service-baptist-downtown-spanish-accessible-family-friendly-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: 'service',
            church: {
              AND: [
                { OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }] },
                { OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }] },
                { languages: { hasSome: ['Spanish'] } },
                { wheelchairAccessible: true },
                { goodForChildren: true },
              ],
            },
          }),
        }),
      )
    })

    it('rejects an invalid family-friendly flag', async () => {
      // The shared `booleanishFlag` parser refuses values like `maybe`, so
      // bogus subscription URLs surface as a 400 instead of silently passing
      // through with no narrowing.
      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ familyFriendly: 'maybe' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
    })

    it('filters the aggregated feed by group-friendly churches', async () => {
      // `groupFriendly=true` adds a `church.goodForGroups: true` clause —
      // mirrors the JSON feed's contract so calendar subscribers see exactly
      // the events the "Good for groups" chip surfaces on the discovery
      // page. The filename gets a trailing `group-friendly` segment so saved
      // ICS downloads stay self-describing.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ groupFriendly: 'true' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-group-friendly-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: { goodForGroups: true },
          }),
        }),
      )
    })

    it('also accepts boolean-ish group-friendly aliases (1, yes)', async () => {
      // The shared `booleanishFlag` parser treats `true`, `1`, `yes`, and
      // `on` interchangeably so URL share-links coming from any surface
      // (the discovery page emits `groupFriendly=true`, but hand-typed
      // bookmarks may use `=1`) resolve identically.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ groupFriendly: '1' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-group-friendly-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: { goodForGroups: true },
          }),
        }),
      )
    })

    it('skips the church clause when groupFriendly is false', async () => {
      // The chip toggled off (or omitted entirely) must not tack a
      // `church` clause onto the Prisma query — the city-wide feed
      // contract stays unchanged when no narrowing is requested.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ groupFriendly: 'false' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-events\.ics"/,
      )

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as Record<
        string,
        unknown
      >
      expect(whereArg).not.toHaveProperty('church')
    })

    it('AND-composes group-friendly with every other narrowing axis', async () => {
      // When every narrowing axis is in play the six `church` sub-clauses
      // compose under a single `AND` (neighborhood → denomination → language
      // → wheelchair-accessible → family-friendly → group-friendly), and the
      // filename suffix chains type → denomination → neighborhood → language
      // → `accessible` → `family-friendly` → `group-friendly`.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp()).get('/api/v1/events.ics').query({
        type: 'service',
        denomination: 'Baptist',
        neighborhood: 'Downtown',
        language: 'Spanish',
        accessibleOnly: 'true',
        familyFriendly: 'true',
        groupFriendly: 'true',
      })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-service-baptist-downtown-spanish-accessible-family-friendly-group-friendly-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: 'service',
            church: {
              AND: [
                { OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }] },
                { OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }] },
                { languages: { hasSome: ['Spanish'] } },
                { wheelchairAccessible: true },
                { goodForChildren: true },
                { goodForGroups: true },
              ],
            },
          }),
        }),
      )
    })

    it('rejects an invalid group-friendly flag', async () => {
      // The shared `booleanishFlag` parser refuses values like `maybe`, so
      // bogus subscription URLs surface as a 400 instead of silently passing
      // through with no narrowing.
      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ groupFriendly: 'maybe' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
    })

    it('filters the aggregated feed by verified / claimed churches', async () => {
      // `verifiedOnly=true` adds a `church.isClaimed: true` clause — mirrors
      // the JSON feed's contract so calendar subscribers see exactly the
      // events the "Verified churches" chip surfaces on the discovery page.
      // The filename gets a trailing `verified` segment so saved ICS
      // downloads stay self-describing.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ verifiedOnly: 'true' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-verified-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: { isClaimed: true },
          }),
        }),
      )
    })

    it('also accepts boolean-ish verified-only aliases (1, yes)', async () => {
      // The shared `booleanishFlag` parser treats `true`, `1`, `yes`, and
      // `on` interchangeably so URL share-links coming from any surface
      // (the discovery page emits `verifiedOnly=true`, but hand-typed
      // bookmarks may use `=1`) resolve identically.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ verifiedOnly: '1' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-verified-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            church: { isClaimed: true },
          }),
        }),
      )
    })

    it('skips the church clause when verifiedOnly is false', async () => {
      // The chip toggled off (or omitted entirely) must not tack a
      // `church` clause onto the Prisma query — the city-wide feed
      // contract stays unchanged when no narrowing is requested.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ verifiedOnly: 'false' })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-events\.ics"/,
      )

      const whereArg = mockedPrisma.event.findMany.mock.calls[0]![0]!.where as Record<
        string,
        unknown
      >
      expect(whereArg).not.toHaveProperty('church')
    })

    it('AND-composes verified-only with every other narrowing axis', async () => {
      // When every narrowing axis is in play the seven `church` sub-clauses
      // compose under a single `AND` (neighborhood → denomination → language
      // → wheelchair-accessible → family-friendly → group-friendly →
      // verified), and the filename suffix chains type → denomination →
      // neighborhood → language → `accessible` → `family-friendly` →
      // `group-friendly` → `verified`.
      mockedPrisma.event.findMany.mockResolvedValueOnce([])

      const response = await request(createApp()).get('/api/v1/events.ics').query({
        type: 'service',
        denomination: 'Baptist',
        neighborhood: 'Downtown',
        language: 'Spanish',
        accessibleOnly: 'true',
        familyFriendly: 'true',
        groupFriendly: 'true',
        verifiedOnly: 'true',
      })

      expect(response.status).toBe(200)
      expect(response.headers['content-disposition']).toMatch(
        /filename="sa-church-finder-service-baptist-downtown-spanish-accessible-family-friendly-group-friendly-verified-events\.ics"/,
      )
      expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: 'service',
            church: {
              AND: [
                { OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }] },
                { OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }] },
                { languages: { hasSome: ['Spanish'] } },
                { wheelchairAccessible: true },
                { goodForChildren: true },
                { goodForGroups: true },
                { isClaimed: true },
              ],
            },
          }),
        }),
      )
    })

    it('rejects an invalid verified-only flag', async () => {
      // The shared `booleanishFlag` parser refuses values like `maybe`, so
      // bogus subscription URLs surface as a 400 instead of silently passing
      // through with no narrowing.
      const response = await request(createApp())
        .get('/api/v1/events.ics')
        .query({ verifiedOnly: 'maybe' })

      expect(response.status).toBe(400)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
    })

    describe('timeOfDay filter on the aggregated calendar feed', () => {
      // 08:00 CDT / 13:00 UTC during April is in the "morning" bucket
      // (05:00–11:59 local).
      const morningStart = new Date('2026-05-03T13:00:00.000Z')
      // 14:00 CDT / 19:00 UTC is in the "afternoon" bucket (12:00–16:59).
      const afternoonStart = new Date('2026-05-03T19:00:00.000Z')
      // 18:00 CDT / 23:00 UTC is in the "evening" bucket (17:00–21:59).
      const eveningStart = new Date('2026-05-04T00:00:00.000Z')

      type FeedRowOverrides = {
        id: string
        churchId: string
        title: string
        description: null
        eventType: ChurchEventType
        startTime: Date
        endTime: null
        locationOverride: null
        isRecurring: boolean
        recurrenceRule: null
        createdById: string
        createdAt: Date
        updatedAt: Date
        church: {
          id: string
          slug: string
          name: string
          city: string
          address: string
        }
      }

      const buildRow = (id: string, eventType: ChurchEventType, start: Date): FeedRowOverrides => ({
        id,
        churchId: `church-${id}`,
        title: id,
        description: null,
        eventType,
        startTime: start,
        endTime: null,
        locationOverride: null,
        isRecurring: false,
        recurrenceRule: null,
        createdById: 'u1',
        createdAt: new Date(),
        updatedAt: new Date('2026-04-10T00:00:00.000Z'),
        church: {
          id: `church-${id}`,
          slug: `church-${id}`,
          name: `Church ${id}`,
          city: 'San Antonio',
          address: '1 Main',
        },
      })

      it('keeps only morning occurrences when timeOfDay=morning', async () => {
        mockedPrisma.event.findMany.mockResolvedValueOnce([
          buildRow('a', 'service', morningStart),
          buildRow('b', 'community', afternoonStart),
          buildRow('c', 'study', eveningStart),
        ])

        const response = await request(createApp())
          .get('/api/v1/events.ics')
          .query({ timeOfDay: 'morning' })

        expect(response.status).toBe(200)
        // Only the morning row should make it into the emitted ICS.
        expect(response.text).toMatch(/SUMMARY:a · Church a/)
        expect(response.text).not.toMatch(/SUMMARY:b · Church b/)
        expect(response.text).not.toMatch(/SUMMARY:c · Church c/)
        expect(response.headers['content-disposition']).toMatch(
          /filename="sa-church-finder-morning-events\.ics"/,
        )
      })

      it('keeps only afternoon occurrences when timeOfDay=afternoon', async () => {
        mockedPrisma.event.findMany.mockResolvedValueOnce([
          buildRow('a', 'service', morningStart),
          buildRow('b', 'community', afternoonStart),
          buildRow('c', 'study', eveningStart),
        ])

        const response = await request(createApp())
          .get('/api/v1/events.ics')
          .query({ timeOfDay: 'afternoon' })

        expect(response.status).toBe(200)
        expect(response.text).not.toMatch(/SUMMARY:a · Church a/)
        expect(response.text).toMatch(/SUMMARY:b · Church b/)
        expect(response.text).not.toMatch(/SUMMARY:c · Church c/)
        expect(response.headers['content-disposition']).toMatch(
          /filename="sa-church-finder-afternoon-events\.ics"/,
        )
      })

      it('keeps only evening occurrences when timeOfDay=evening', async () => {
        mockedPrisma.event.findMany.mockResolvedValueOnce([
          buildRow('a', 'service', morningStart),
          buildRow('b', 'community', afternoonStart),
          buildRow('c', 'study', eveningStart),
        ])

        const response = await request(createApp())
          .get('/api/v1/events.ics')
          .query({ timeOfDay: 'evening' })

        expect(response.status).toBe(200)
        expect(response.text).not.toMatch(/SUMMARY:a · Church a/)
        expect(response.text).not.toMatch(/SUMMARY:b · Church b/)
        expect(response.text).toMatch(/SUMMARY:c · Church c/)
        expect(response.headers['content-disposition']).toMatch(
          /filename="sa-church-finder-evening-events\.ics"/,
        )
      })

      it('composes timeOfDay with every other narrowing axis', async () => {
        // All seven axes together — the filename chains
        // type → denomination → neighborhood → language → `accessible` →
        // `family-friendly` → `group-friendly` → `evening`, and the
        // `church` clause carries the existing six sub-clauses (time-of-day
        // is applied in-memory, so it doesn't appear in the Prisma query).
        mockedPrisma.event.findMany.mockResolvedValueOnce([buildRow('a', 'service', eveningStart)])

        const response = await request(createApp()).get('/api/v1/events.ics').query({
          type: 'service',
          denomination: 'Baptist',
          neighborhood: 'Downtown',
          language: 'Spanish',
          accessibleOnly: 'true',
          familyFriendly: 'true',
          groupFriendly: 'true',
          timeOfDay: 'evening',
        })

        expect(response.status).toBe(200)
        expect(response.headers['content-disposition']).toMatch(
          /filename="sa-church-finder-service-baptist-downtown-spanish-accessible-family-friendly-group-friendly-evening-events\.ics"/,
        )
        expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              eventType: 'service',
              church: {
                AND: [
                  { OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }] },
                  { OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }] },
                  { languages: { hasSome: ['Spanish'] } },
                  { wheelchairAccessible: true },
                  { goodForChildren: true },
                  { goodForGroups: true },
                ],
              },
            }),
          }),
        )
      })

      it('rejects an invalid timeOfDay bucket', async () => {
        // Zod `.enum()` only accepts `morning` / `afternoon` / `evening`;
        // anything else 400s before the handler fires so bogus subscription
        // URLs surface as validation errors instead of silently returning
        // the city-wide feed.
        const response = await request(createApp())
          .get('/api/v1/events.ics')
          .query({ timeOfDay: 'midnight' })

        expect(response.status).toBe(400)
        expect(response.body.error.code).toBe('VALIDATION_ERROR')
        expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
      })
    })

    describe('keyword filter on the aggregated calendar feed', () => {
      // Helper that mints a FeedEventRow with the supplied title so the
      // emitted ICS `SUMMARY:<title> · <church>` line is easy to assert on.
      const start = new Date('2026-05-03T13:00:00.000Z')
      type KeywordFeedRow = {
        id: string
        churchId: string
        title: string
        description: null
        eventType: ChurchEventType
        startTime: Date
        endTime: null
        locationOverride: null
        isRecurring: boolean
        recurrenceRule: null
        createdById: string
        createdAt: Date
        updatedAt: Date
        church: {
          id: string
          slug: string
          name: string
          city: string
          address: string
        }
      }

      const buildRow = (id: string, title: string, churchName: string): KeywordFeedRow => ({
        id,
        churchId: `church-${id}`,
        title,
        description: null,
        eventType: 'service',
        startTime: start,
        endTime: null,
        locationOverride: null,
        isRecurring: false,
        recurrenceRule: null,
        createdById: 'u1',
        createdAt: new Date('2026-04-01T00:00:00.000Z'),
        updatedAt: new Date('2026-04-10T00:00:00.000Z'),
        church: {
          id: `church-${id}`,
          slug: `church-${id}`,
          name: churchName,
          city: 'San Antonio',
          address: '1 Main',
        },
      })

      it('forwards a case-insensitive `q` into a title/description/church OR clause', async () => {
        // Prisma enforces the keyword match at the DB level, so the mock
        // returns only the row that would actually survive the filter.
        mockedPrisma.event.findMany.mockResolvedValueOnce([
          buildRow('a', "Women's Bible Study", 'Grace Fellowship'),
        ])

        const response = await request(createApp()).get('/api/v1/events.ics').query({ q: 'bible' })

        expect(response.status).toBe(200)
        expect(response.text).toMatch(/SUMMARY:Women's Bible Study · Grace Fellowship/)
        expect(response.headers['content-disposition']).toMatch(
          /filename="sa-church-finder-matching-bible-events\.ics"/,
        )
        expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              AND: [
                {
                  OR: [
                    { isRecurring: true },
                    { isRecurring: false, startTime: { gte: expect.any(Date) } },
                  ],
                },
                {
                  OR: [
                    { title: { contains: 'bible', mode: 'insensitive' } },
                    { description: { contains: 'bible', mode: 'insensitive' } },
                    { church: { name: { contains: 'bible', mode: 'insensitive' } } },
                  ],
                },
              ],
            }),
          }),
        )
      })

      it('trims whitespace from `q` before forwarding and slugifying', async () => {
        // Leading/trailing whitespace comes off before the value reaches
        // the service layer (Zod `.trim()`) so the filename stays stable
        // regardless of what the user typed.
        mockedPrisma.event.findMany.mockResolvedValueOnce([
          buildRow('a', 'Youth Retreat', 'Grace Fellowship'),
        ])

        const response = await request(createApp())
          .get('/api/v1/events.ics')
          .query({ q: '  youth  ' })

        expect(response.status).toBe(200)
        expect(response.headers['content-disposition']).toMatch(
          /filename="sa-church-finder-matching-youth-events\.ics"/,
        )
        expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              AND: expect.arrayContaining([
                expect.objectContaining({
                  OR: [
                    { title: { contains: 'youth', mode: 'insensitive' } },
                    { description: { contains: 'youth', mode: 'insensitive' } },
                    { church: { name: { contains: 'youth', mode: 'insensitive' } } },
                  ],
                }),
              ]),
            }),
          }),
        )
      })

      it('skips the keyword filter when `q` is empty / whitespace-only', async () => {
        // A whitespace-only `q=` must collapse to "no filter" so the
        // emitted Prisma `where` stays on the simple inline `OR` path and
        // no `matching-` segment leaks into the filename.
        mockedPrisma.event.findMany.mockResolvedValueOnce([
          buildRow('a', 'Easter Service', 'Grace Fellowship'),
        ])

        const response = await request(createApp()).get('/api/v1/events.ics').query({ q: '   ' })

        expect(response.status).toBe(200)
        expect(response.headers['content-disposition']).toMatch(
          /filename="sa-church-finder-events\.ics"/,
        )
        const where = mockedPrisma.event.findMany.mock.calls[0]?.[0].where as Record<
          string,
          unknown
        >
        expect(where).not.toHaveProperty('AND')
        expect(where).toHaveProperty('OR')
      })

      it('composes keyword with every other narrowing axis', async () => {
        // All nine axes together — the filename chains
        // type → denomination → neighborhood → language → `accessible` →
        // `family-friendly` → `group-friendly` → `evening` → `matching-bible`,
        // and the emitted `where` keeps the window + keyword on the
        // top-level `AND` while the church-level axes live under `church`.
        const eveningStart = new Date('2026-05-04T00:00:00.000Z')
        mockedPrisma.event.findMany.mockResolvedValueOnce([
          {
            ...buildRow('a', "Women's Bible Study", 'Grace Fellowship'),
            startTime: eveningStart,
          },
        ])

        const response = await request(createApp()).get('/api/v1/events.ics').query({
          type: 'service',
          denomination: 'Baptist',
          neighborhood: 'Downtown',
          language: 'Spanish',
          accessibleOnly: 'true',
          familyFriendly: 'true',
          groupFriendly: 'true',
          timeOfDay: 'evening',
          q: 'bible',
        })

        expect(response.status).toBe(200)
        expect(response.headers['content-disposition']).toMatch(
          /filename="sa-church-finder-service-baptist-downtown-spanish-accessible-family-friendly-group-friendly-evening-matching-bible-events\.ics"/,
        )
        expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              eventType: 'service',
              church: {
                AND: [
                  { OR: [{ neighborhood: { equals: 'downtown', mode: 'insensitive' } }] },
                  { OR: [{ denominationFamily: { equals: 'baptist', mode: 'insensitive' } }] },
                  { languages: { hasSome: ['Spanish'] } },
                  { wheelchairAccessible: true },
                  { goodForChildren: true },
                  { goodForGroups: true },
                ],
              },
              AND: [
                {
                  OR: [
                    { isRecurring: true },
                    { isRecurring: false, startTime: { gte: expect.any(Date) } },
                  ],
                },
                {
                  OR: [
                    { title: { contains: 'bible', mode: 'insensitive' } },
                    { description: { contains: 'bible', mode: 'insensitive' } },
                    { church: { name: { contains: 'bible', mode: 'insensitive' } } },
                  ],
                },
              ],
            }),
          }),
        )
      })

      it('rejects an overlong `q` value (>200 chars)', async () => {
        // Zod caps the value at 200 characters so a maliciously large
        // query string can't propagate into the `ILIKE` predicate.
        const response = await request(createApp())
          .get('/api/v1/events.ics')
          .query({ q: 'x'.repeat(201) })

        expect(response.status).toBe(400)
        expect(response.body.error.code).toBe('VALIDATION_ERROR')
        expect(mockedPrisma.event.findMany).not.toHaveBeenCalled()
      })
    })
  })
})
