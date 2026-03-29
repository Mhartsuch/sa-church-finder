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

export async function getSavedChurchesForUser(userId: string): Promise<ISavedChurch[]> {
  const savedChurches = await prisma.userSavedChurch.findMany({
    where: { userId },
    orderBy: { savedAt: 'desc' },
    include: {
      church: {
        include: {
          services: {
            orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
          },
        },
      },
    },
  })

  return savedChurches.map(({ church, savedAt }) => ({
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
  }))
}
