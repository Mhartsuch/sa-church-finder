import prisma from '../lib/prisma.js'
import { NotFoundError } from '../middleware/error-handler.js'
import { IChurchService, ISavedChurch } from '../types/church.types.js'

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return value
  }

  return Number(value) || 0
}

const mapService = (service: {
  id: string
  churchId: string
  dayOfWeek: number
  startTime: string
  endTime: string | null
  serviceType: string
  language: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}): IChurchService => ({
  id: service.id,
  churchId: service.churchId,
  dayOfWeek: service.dayOfWeek,
  startTime: service.startTime,
  endTime: service.endTime,
  serviceType: service.serviceType,
  language: service.language,
  description: service.description,
  createdAt: service.createdAt,
  updatedAt: service.updatedAt,
})

export async function toggleSavedChurch(
  userId: string,
  churchId: string,
): Promise<{ churchId: string; saved: boolean }> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { id: true },
  })

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  const existingSavedChurch = await prisma.userSavedChurch.findUnique({
    where: {
      userId_churchId: {
        userId,
        churchId,
      },
    },
    select: {
      churchId: true,
    },
  })

  if (existingSavedChurch) {
    await prisma.userSavedChurch.delete({
      where: {
        userId_churchId: {
          userId,
          churchId,
        },
      },
    })

    return {
      churchId,
      saved: false,
    }
  }

  await prisma.userSavedChurch.create({
    data: {
      userId,
      churchId,
    },
  })

  return {
    churchId,
    saved: true,
  }
}

export type SavedChurchSort = 'savedAt' | 'name' | 'rating'

export interface ISavedChurchesQuery {
  sort?: SavedChurchSort
  order?: 'asc' | 'desc'
  q?: string
  page?: number
  pageSize?: number
}

export interface ISavedChurchesResponse {
  data: ISavedChurch[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

function mapSavedChurch(
  church: {
    id: string
    name: string
    slug: string
    denomination: string | null
    denominationFamily: string | null
    description: string | null
    address: string
    city: string
    state: string
    zipCode: string
    neighborhood: string | null
    latitude: unknown
    longitude: unknown
    phone: string | null
    email: string | null
    website: string | null
    pastorName: string | null
    yearEstablished: number | null
    avgRating: unknown
    reviewCount: number
    isClaimed: boolean
    languages: string[]
    amenities: string[]
    coverImageUrl: string | null
    services: Array<{
      id: string
      churchId: string
      dayOfWeek: number
      startTime: string
      endTime: string | null
      serviceType: string
      language: string
      description: string | null
      createdAt: Date
      updatedAt: Date
    }>
  },
  savedAt: Date,
): ISavedChurch {
  return {
    id: church.id,
    name: church.name,
    slug: church.slug,
    denomination: church.denomination ?? undefined,
    denominationFamily: church.denominationFamily ?? undefined,
    description: church.description ?? undefined,
    address: church.address,
    city: church.city,
    state: church.state,
    zipCode: church.zipCode,
    neighborhood: church.neighborhood ?? undefined,
    latitude: toNumber(church.latitude),
    longitude: toNumber(church.longitude),
    phone: church.phone ?? undefined,
    email: church.email ?? undefined,
    website: church.website ?? undefined,
    pastorName: church.pastorName ?? undefined,
    yearEstablished: church.yearEstablished ?? undefined,
    avgRating: toNumber(church.avgRating),
    reviewCount: church.reviewCount,
    isClaimed: church.isClaimed,
    isSaved: true,
    languages: church.languages,
    amenities: church.amenities,
    coverImageUrl: church.coverImageUrl ?? undefined,
    services: church.services.map(mapService),
    savedAt,
  }
}

export async function getSavedChurchesForUser(
  userId: string,
  query: ISavedChurchesQuery = {},
): Promise<ISavedChurchesResponse> {
  const { sort = 'savedAt', order = 'desc', q, page = 1, pageSize = 20 } = query

  // Build the where clause with optional text search
  const where: Record<string, unknown> = { userId }
  if (q && q.trim().length > 0) {
    const search = q.trim()
    where.church = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { denomination: { contains: search, mode: 'insensitive' } },
        { neighborhood: { contains: search, mode: 'insensitive' } },
      ],
    }
  }

  // Build the orderBy clause
  let orderBy: Record<string, unknown>
  switch (sort) {
    case 'name':
      orderBy = { church: { name: order } }
      break
    case 'rating':
      orderBy = { church: { avgRating: order } }
      break
    case 'savedAt':
    default:
      orderBy = { savedAt: order }
      break
  }

  const [total, savedChurches] = await Promise.all([
    prisma.userSavedChurch.count({ where }),
    prisma.userSavedChurch.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        church: {
          include: {
            services: {
              orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
            },
          },
        },
      },
    }),
  ])

  return {
    data: savedChurches.map(({ church, savedAt }) => mapSavedChurch(church, savedAt)),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
    },
  }
}
