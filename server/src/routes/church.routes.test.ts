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
      title: 'Neighborhood Dinner',
      eventType: 'community',
    })
    expect(response.body.meta).toMatchObject({
      total: 1,
      filters: {
        type: 'community',
        from: '2026-03-30T00:00:00.000Z',
        to: '2026-04-30T00:00:00.000Z',
      },
    })
    expect(mockedPrisma.event.findMany).toHaveBeenCalledWith({
      where: {
        churchId: 'church-1',
        eventType: 'community',
        startTime: {
          gte: new Date('2026-03-30T00:00:00.000Z'),
          lte: new Date('2026-04-30T00:00:00.000Z'),
        },
      },
      orderBy: [{ startTime: 'asc' }, { title: 'asc' }],
    })
  })

  it('returns 404 when fetching events for an unknown church slug', async () => {
    mockedPrisma.church.findUnique.mockResolvedValue(null)

    const response = await request(createApp()).get('/api/v1/churches/missing-church/events')

    expect(response.status).toBe(404)
    expect(response.body.error).toMatchObject({
      code: 'NOT_FOUND',
    })
  })
})
