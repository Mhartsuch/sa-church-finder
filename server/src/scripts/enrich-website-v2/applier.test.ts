import type { PrismaClient } from '@prisma/client'

import { applyExtraction, ChurchRow } from './applier'
import type {
  EnrichV2Stats,
  EnrichWebsiteV2Options,
  ExtractedChurchData,
  ExtractedService,
} from './types'

const church = (overrides: Partial<ChurchRow> = {}): ChurchRow => ({
  id: 'church-1',
  name: 'Grace Fellowship',
  website: 'https://grace.example',
  pastorName: null,
  denomination: null,
  denominationFamily: null,
  yearEstablished: null,
  description: null,
  email: null,
  phone: null,
  languages: ['English'],
  goodForChildren: null,
  goodForGroups: null,
  wheelchairAccessible: null,
  services: [],
  ...overrides,
})

const extracted = (overrides: Partial<ExtractedChurchData> = {}): ExtractedChurchData =>
  ({
    pastorName: null,
    denomination: null,
    denominationFamily: null,
    yearEstablished: null,
    description: null,
    email: null,
    phone: null,
    languages: [],
    amenities: { goodForChildren: null, goodForGroups: null, wheelchairAccessible: null },
    staff: [],
    socialLinks: { facebook: null, instagram: null, twitter: null, youtube: null },
    services: [],
    ministries: [],
    affiliations: [],
    serviceStyle: null,
    sermonUrl: null,
    livestreamUrl: null,
    statementOfFaithUrl: null,
    givingUrl: null,
    newVisitorUrl: null,
    parkingInfo: null,
    dressCode: null,
    confidence: 0.9,
    confidenceLevel: 'high',
    source: 'claude',
    ...overrides,
  }) as ExtractedChurchData

const service = (dayOfWeek: number, startTime: string, serviceType = 'Service'): ExtractedService =>
  ({ dayOfWeek, startTime, endTime: null, serviceType, language: 'English' }) as ExtractedService

const options = { dryRun: false, overwrite: false } as EnrichWebsiteV2Options
const stats = (): EnrichV2Stats => ({ servicesCreated: 0, fieldsUpdated: 0 }) as EnrichV2Stats

const mockPrisma = (): {
  prisma: PrismaClient
  update: jest.Mock
  deleteMany: jest.Mock
  createMany: jest.Mock
} => {
  const update = jest.fn().mockResolvedValue({})
  const deleteMany = jest.fn().mockResolvedValue({})
  const createMany = jest.fn().mockResolvedValue({})
  const prisma = {
    church: { update },
    churchService: { deleteMany, createMany },
  } as unknown as PrismaClient
  return { prisma, update, deleteMany, createMany }
}

describe('applyExtraction', () => {
  it('drops office hours from extracted services and keeps the real ones', async () => {
    const { prisma, createMany } = mockPrisma()
    const services = [
      service(0, '10:30'),
      ...[1, 2, 3, 4].flatMap((day) => [service(day, '09:00'), service(day, '16:00')]),
      service(3, '19:00', 'Bible Study'),
    ]

    const changes = await applyExtraction(
      prisma,
      church(),
      extracted({ services }),
      options,
      stats(),
    )

    const created = createMany.mock.calls[0][0].data as { dayOfWeek: number; startTime: string }[]
    expect(created.map((s) => `${s.dayOfWeek}@${s.startTime}`)).toEqual(['0@10:30', '3@19:00'])
    expect(changes).toContain('dropped 8 service artifact(s)')
    expect(changes).toContain('2 service(s)')
  })

  it('does not wipe existing services when every extracted row is an artifact', async () => {
    const { prisma, deleteMany, createMany } = mockPrisma()
    const services = [1, 2, 3, 4, 5].map((day) => service(day, '09:00'))

    await applyExtraction(prisma, church(), extracted({ services }), options, stats())

    expect(deleteMany).not.toHaveBeenCalled()
    expect(createMany).not.toHaveBeenCalled()
  })

  it('stores a canonical denomination and family for an extracted label', async () => {
    const { prisma, update } = mockPrisma()

    await applyExtraction(
      prisma,
      church({ name: 'Mary Mother of the Church' }),
      extracted({ denomination: 'Roman Catholic', denominationFamily: null }),
      options,
      stats(),
    )

    expect(update.mock.calls[0][0].data).toMatchObject({
      denomination: 'Catholic',
      denominationFamily: 'Catholic',
    })
  })

  it('lets an explicit name beat a contradictory extracted label', async () => {
    const { prisma, update } = mockPrisma()

    await applyExtraction(
      prisma,
      church({ name: 'First Baptist Church of San Antonio' }),
      extracted({ denomination: 'Catholic', denominationFamily: 'Catholic' }),
      options,
      stats(),
    )

    expect(update.mock.calls[0][0].data).toMatchObject({
      denomination: 'Baptist',
      denominationFamily: 'Baptist',
    })
  })

  it("ignores a label that is just the church's own network name", async () => {
    const { prisma, update } = mockPrisma()

    await applyExtraction(
      prisma,
      church({ name: 'Greater Works Ministries Church' }),
      extracted({ denomination: 'Greater Works Ministries', denominationFamily: null }),
      options,
      stats(),
    )

    expect(update).not.toHaveBeenCalled()
  })
})
