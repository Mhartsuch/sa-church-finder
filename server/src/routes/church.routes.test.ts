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
    event: {
      findMany: jest.fn(),
    },
  },
}))

type MockedPrisma = {
  church: {
    findUnique: jest.Mock
  }
  event: {
    findMany: jest.Mock
  }
}

const mockedPrisma = prisma as unknown as MockedPrisma

describe('church routes', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('lists filtered church events for a church slug', async () => {
    mockedPrisma.church.findUnique.mockResolvedValue({
      id: 'church-1',
    })
    mockedPrisma.event.findMany.mockResolvedValue([
      {
        id: 'event-1',
        churchId: 'church-1',
        title: 'Neighborhood Dinner',
        description: 'A shared meal for first-time visitors and longtime members.',
        eventType: 'community',
        startTime: new Date('2026-04-02T00:30:00.000Z'),
        endTime: new Date('2026-04-02T02:00:00.000Z'),
        locationOverride: 'Fellowship Hall',
        isRecurring: false,
        recurrenceRule: null,
        createdById: 'user-1',
        createdAt: new Date('2026-03-30T00:00:00.000Z'),
        updatedAt: new Date('2026-03-30T00:00:00.000Z'),
      },
    ])

    const response = await request(createApp())
      .get('/api/v1/churches/grace-fellowship/events')
      .query({
        type: 'community',
        from: '2026-03-30T00:00:00.000Z',
        to: '2026-04-30T00:00:00.000Z',
      })

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0]).toMatchObject({
      id: 'event-1',
      occurrenceId: 'event-1',
      title: 'Neighborhood Dinner',
      eventType: 'community',
      isOccurrence: false,
    })
    expect(response.body.meta).toMatchObject({
      total: 1,
      filters: {
        type: 'community',
        from: '2026-03-30T00:00:00.000Z',
        to: '2026-04-30T00:00:00.000Z',
        expand: true,
      },
    })
    expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          churchId: 'church-1',
          eventType: 'community',
          OR: [
            {
              isRecurring: false,
              startTime: {
                gte: new Date('2026-03-30T00:00:00.000Z'),
                lte: new Date('2026-04-30T00:00:00.000Z'),
              },
            },
            {
              isRecurring: true,
              startTime: {
                lte: new Date('2026-04-30T00:00:00.000Z'),
              },
            },
          ],
        }),
        orderBy: [{ startTime: 'asc' }, { title: 'asc' }],
      }),
    )
  })

  it('expands recurring events into occurrences that intersect the window', async () => {
    mockedPrisma.church.findUnique.mockResolvedValue({ id: 'church-1' })
    mockedPrisma.event.findMany.mockResolvedValue([
      {
        id: 'event-series',
        churchId: 'church-1',
        title: 'Sunday Worship',
        description: 'Weekly gathering',
        eventType: 'service',
        startTime: new Date('2026-04-05T15:00:00.000Z'),
        endTime: new Date('2026-04-05T16:30:00.000Z'),
        locationOverride: null,
        isRecurring: true,
        recurrenceRule: 'FREQ=WEEKLY',
        createdById: 'user-1',
        createdAt: new Date('2026-03-30T00:00:00.000Z'),
        updatedAt: new Date('2026-03-30T00:00:00.000Z'),
      },
    ])

    const response = await request(createApp())
      .get('/api/v1/churches/grace-fellowship/events')
      .query({
        from: '2026-04-01T00:00:00.000Z',
        to: '2026-04-30T00:00:00.000Z',
      })

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(4)
    expect(response.body.data.map((event: { startTime: string }) => event.startTime)).toEqual([
      '2026-04-05T15:00:00.000Z',
      '2026-04-12T15:00:00.000Z',
      '2026-04-19T15:00:00.000Z',
      '2026-04-26T15:00:00.000Z',
    ])
    // The endTime for each occurrence preserves the original duration.
    expect(response.body.data[1].endTime).toBe('2026-04-12T16:30:00.000Z')
    expect(response.body.data[1]).toMatchObject({
      id: 'event-series',
      occurrenceId: 'event-series::2026-04-12T15:00:00.000Z',
      isOccurrence: true,
      isRecurring: true,
      seriesStartTime: '2026-04-05T15:00:00.000Z',
    })
  })

  it('returns raw series rows when expand=false', async () => {
    mockedPrisma.church.findUnique.mockResolvedValue({ id: 'church-1' })
    mockedPrisma.event.findMany.mockResolvedValue([
      {
        id: 'event-series',
        churchId: 'church-1',
        title: 'Sunday Worship',
        description: 'Weekly gathering',
        eventType: 'service',
        startTime: new Date('2026-04-05T15:00:00.000Z'),
        endTime: new Date('2026-04-05T16:30:00.000Z'),
        locationOverride: null,
        isRecurring: true,
        recurrenceRule: 'FREQ=WEEKLY',
        createdById: 'user-1',
        createdAt: new Date('2026-03-30T00:00:00.000Z'),
        updatedAt: new Date('2026-03-30T00:00:00.000Z'),
      },
    ])

    const response = await request(createApp())
      .get('/api/v1/churches/grace-fellowship/events')
      .query({
        from: '2026-04-01T00:00:00.000Z',
        to: '2026-04-30T00:00:00.000Z',
        expand: 'false',
      })

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveLength(1)
    expect(response.body.data[0]).toMatchObject({
      id: 'event-series',
      occurrenceId: 'event-series',
      isOccurrence: false,
      isRecurring: true,
    })
    expect(response.body.meta.filters.expand).toBe(false)
    expect(mockedPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          churchId: 'church-1',
          startTime: {
            gte: new Date('2026-04-01T00:00:00.000Z'),
            lte: new Date('2026-04-30T00:00:00.000Z'),
          },
        }),
      }),
    )
  })

  it('returns 404 when fetching events for an unknown church slug', async () => {
    mockedPrisma.church.findUnique.mockResolvedValue(null)

    const response = await request(createApp()).get('/api/v1/churches/missing-church/events')

    expect(response.status).toBe(404)
    expect(response.body.error).toMatchObject({
      code: 'NOT_FOUND',
    })
  })

  describe('GET /churches/:slug/events.ics', () => {
    it('returns a text/calendar ICS feed for a single church', async () => {
      mockedPrisma.church.findUnique.mockResolvedValue({
        id: 'church-1',
        slug: 'grace-fellowship',
        name: 'Grace Fellowship',
        city: 'San Antonio',
        address: '1234 Broadway',
      })
      mockedPrisma.event.findMany.mockResolvedValue([
        {
          id: 'event-1',
          churchId: 'church-1',
          title: 'Sunday Worship',
          description: 'Weekly gathering',
          eventType: 'service',
          startTime: new Date('2026-05-03T14:00:00.000Z'),
          endTime: new Date('2026-05-03T15:30:00.000Z'),
          locationOverride: null,
          isRecurring: true,
          recurrenceRule: 'FREQ=WEEKLY',
          createdById: 'user-1',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-10T00:00:00.000Z'),
          church: {
            id: 'church-1',
            slug: 'grace-fellowship',
            name: 'Grace Fellowship',
            city: 'San Antonio',
            address: '1234 Broadway',
          },
        },
      ])

      const response = await request(createApp()).get(
        '/api/v1/churches/grace-fellowship/events.ics',
      )

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toMatch(/text\/calendar/)
      expect(response.headers['content-disposition']).toMatch(
        /filename="grace-fellowship-events\.ics"/,
      )
      const body = response.text
      expect(body.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
      expect(body).toMatch(/X-WR-CALNAME:Grace Fellowship — Events/)
      expect(body).toMatch(/UID:event-1@sachurchfinder\.com/)
      expect(body).toMatch(/SUMMARY:Sunday Worship/)
      expect(body).toMatch(/RRULE:FREQ=WEEKLY/)
      // Falls back to the church address when no locationOverride is set.
      expect(body).toMatch(/LOCATION:1234 Broadway/)
    })

    it('narrows the feed by event type when ?type is provided', async () => {
      mockedPrisma.church.findUnique.mockResolvedValue({
        id: 'church-1',
        slug: 'grace-fellowship',
        name: 'Grace Fellowship',
        city: 'San Antonio',
        address: '1234 Broadway',
      })
      mockedPrisma.event.findMany.mockResolvedValue([
        {
          id: 'event-service',
          churchId: 'church-1',
          title: 'Worship',
          description: null,
          eventType: 'service',
          startTime: new Date('2026-05-03T14:00:00.000Z'),
          endTime: null,
          locationOverride: null,
          isRecurring: false,
          recurrenceRule: null,
          createdById: 'user-1',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-01T00:00:00.000Z'),
          church: {
            id: 'church-1',
            slug: 'grace-fellowship',
            name: 'Grace Fellowship',
            city: 'San Antonio',
            address: '1234 Broadway',
          },
        },
        {
          id: 'event-community',
          churchId: 'church-1',
          title: 'Dinner',
          description: null,
          eventType: 'community',
          startTime: new Date('2026-05-10T14:00:00.000Z'),
          endTime: null,
          locationOverride: null,
          isRecurring: false,
          recurrenceRule: null,
          createdById: 'user-1',
          createdAt: new Date('2026-04-01T00:00:00.000Z'),
          updatedAt: new Date('2026-04-01T00:00:00.000Z'),
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
        .get('/api/v1/churches/grace-fellowship/events.ics')
        .query({ type: 'service' })

      expect(response.status).toBe(200)
      expect(response.text).toMatch(/SUMMARY:Worship/)
      expect(response.text).not.toMatch(/SUMMARY:Dinner/)
    })

    it('returns 404 when the church slug is unknown', async () => {
      mockedPrisma.church.findUnique.mockResolvedValue(null)

      const response = await request(createApp()).get('/api/v1/churches/missing-church/events.ics')

      expect(response.status).toBe(404)
      expect(response.body.error).toMatchObject({ code: 'NOT_FOUND' })
    })

    it('rejects an invalid type filter', async () => {
      const response = await request(createApp())
        .get('/api/v1/churches/grace-fellowship/events.ics')
        .query({ type: 'bogus' })

      expect(response.status).toBe(400)
    })
  })
})
