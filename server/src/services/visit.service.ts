import prisma from '../lib/prisma.js'
import { AppError, NotFoundError } from '../middleware/error-handler.js'

export interface IChurchVisit {
  id: string
  userId: string
  churchId: string
  visitedAt: string // ISO date string
  notes?: string | null
  rating?: number | null
  createdAt: Date
  updatedAt: Date
  church?: {
    id: string
    name: string
    slug: string
    denomination?: string | null
    denominationFamily?: string | null
    neighborhood?: string | null
    coverImageUrl?: string | null
    address: string
    city: string
  }
}

export interface IAward {
  id: string
  userId: string
  awardType: string
  earnedAt: Date
}

const AWARD_DEFINITIONS: { type: string; check: (stats: AwardStats) => boolean }[] = [
  { type: 'FIRST_VISIT', check: (s) => s.uniqueChurches >= 1 },
  { type: 'EXPLORER_5', check: (s) => s.uniqueChurches >= 5 },
  { type: 'DEVOTED_10', check: (s) => s.uniqueChurches >= 10 },
  { type: 'PILGRIM_25', check: (s) => s.uniqueChurches >= 25 },
  { type: 'DENOMINATION_DIVERSITY', check: (s) => s.uniqueDenominationFamilies >= 3 },
  { type: 'NEIGHBORHOOD_EXPLORER', check: (s) => s.uniqueNeighborhoods >= 3 },
  { type: 'REGULAR', check: (s) => s.hasRegularChurch },
  { type: 'REVIEWER', check: (s) => s.reviewCount >= 1 },
]

interface AwardStats {
  uniqueChurches: number
  totalVisits: number
  uniqueDenominationFamilies: number
  uniqueNeighborhoods: number
  reviewCount: number
  hasRegularChurch: boolean
}

const churchSelect = {
  id: true,
  name: true,
  slug: true,
  denomination: true,
  denominationFamily: true,
  neighborhood: true,
  coverImageUrl: true,
  address: true,
  city: true,
} as const

function mapVisit(visit: {
  id: string
  userId: string
  churchId: string
  visitedAt: Date
  notes: string | null
  rating: number | null
  createdAt: Date
  updatedAt: Date
  church?: {
    id: string
    name: string
    slug: string
    denomination: string | null
    denominationFamily: string | null
    neighborhood: string | null
    coverImageUrl: string | null
    address: string
    city: string
  }
}): IChurchVisit {
  return {
    id: visit.id,
    userId: visit.userId,
    churchId: visit.churchId,
    visitedAt: visit.visitedAt.toISOString(),
    notes: visit.notes,
    rating: visit.rating,
    createdAt: visit.createdAt,
    updatedAt: visit.updatedAt,
    ...(visit.church
      ? {
          church: {
            id: visit.church.id,
            name: visit.church.name,
            slug: visit.church.slug,
            denomination: visit.church.denomination,
            denominationFamily: visit.church.denominationFamily,
            neighborhood: visit.church.neighborhood,
            coverImageUrl: visit.church.coverImageUrl,
            address: visit.church.address,
            city: visit.church.city,
          },
        }
      : {}),
  }
}

export async function createVisit(
  userId: string,
  churchId: string,
  input: { visitedAt: string; notes?: string; rating?: number },
): Promise<{ visit: IChurchVisit; newAwards: IAward[] }> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { id: true },
  })

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  const visit = await prisma.churchVisit.create({
    data: {
      userId,
      churchId,
      visitedAt: new Date(input.visitedAt),
      notes: input.notes ?? null,
      rating: input.rating ?? null,
    },
    include: {
      church: { select: churchSelect },
    },
  })

  const newAwards = await checkAndGrantAwards(userId)

  return {
    visit: mapVisit(visit),
    newAwards,
  }
}

export async function updateVisit(
  visitId: string,
  userId: string,
  input: { notes?: string; rating?: number | null },
): Promise<IChurchVisit> {
  const existing = await prisma.churchVisit.findUnique({
    where: { id: visitId },
    select: { id: true, userId: true },
  })

  if (!existing) {
    throw new NotFoundError('Visit not found')
  }

  if (existing.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only edit your own visits')
  }

  const data: { notes?: string; rating?: number | null } = {}
  if (input.notes !== undefined) {
    data.notes = input.notes
  }
  if (input.rating !== undefined) {
    data.rating = input.rating
  }

  const updated = await prisma.churchVisit.update({
    where: { id: visitId },
    data,
    include: {
      church: { select: churchSelect },
    },
  })

  return mapVisit(updated)
}

export async function deleteVisit(visitId: string, userId: string): Promise<void> {
  const existing = await prisma.churchVisit.findUnique({
    where: { id: visitId },
    select: { id: true, userId: true },
  })

  if (!existing) {
    throw new NotFoundError('Visit not found')
  }

  if (existing.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only delete your own visits')
  }

  await prisma.churchVisit.delete({
    where: { id: visitId },
  })
}

export async function getUserVisits(
  userId: string,
  page: number,
  pageSize: number,
): Promise<{ visits: IChurchVisit[]; total: number }> {
  const skip = (page - 1) * pageSize

  const [visits, total] = await Promise.all([
    prisma.churchVisit.findMany({
      where: { userId },
      orderBy: [{ visitedAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: pageSize,
      include: {
        church: { select: churchSelect },
      },
    }),
    prisma.churchVisit.count({ where: { userId } }),
  ])

  return {
    visits: visits.map(mapVisit),
    total,
  }
}

async function checkAndGrantAwards(userId: string): Promise<IAward[]> {
  const existingAwards = await prisma.userAward.findMany({
    where: { userId },
    select: { awardType: true },
  })

  const existingTypes = new Set(existingAwards.map((a) => a.awardType))

  const visits = await prisma.churchVisit.findMany({
    where: { userId },
    select: {
      churchId: true,
      church: {
        select: {
          denominationFamily: true,
          neighborhood: true,
        },
      },
    },
  })

  const uniqueChurchIds = new Set(visits.map((v) => v.churchId))
  const uniqueDenomFamilies = new Set(
    visits
      .map((v) => v.church.denominationFamily)
      .filter((f): f is string => f !== null && f !== undefined),
  )
  const uniqueNeighborhoods = new Set(
    visits
      .map((v) => v.church.neighborhood)
      .filter((n): n is string => n !== null && n !== undefined),
  )

  // Check if any church has been visited 3+ times
  const churchVisitCounts = new Map<string, number>()
  for (const visit of visits) {
    churchVisitCounts.set(visit.churchId, (churchVisitCounts.get(visit.churchId) ?? 0) + 1)
  }
  const hasRegularChurch = Array.from(churchVisitCounts.values()).some((count) => count >= 3)

  const reviewCount = await prisma.review.count({ where: { userId } })

  const stats: AwardStats = {
    uniqueChurches: uniqueChurchIds.size,
    totalVisits: visits.length,
    uniqueDenominationFamilies: uniqueDenomFamilies.size,
    uniqueNeighborhoods: uniqueNeighborhoods.size,
    reviewCount,
    hasRegularChurch,
  }

  const newAwardTypes = AWARD_DEFINITIONS.filter(
    (def) => !existingTypes.has(def.type) && def.check(stats),
  ).map((def) => def.type)

  if (newAwardTypes.length === 0) {
    return []
  }

  await prisma.userAward.createMany({
    data: newAwardTypes.map((awardType) => ({
      userId,
      awardType,
    })),
  })

  const newAwards = await prisma.userAward.findMany({
    where: {
      userId,
      awardType: { in: newAwardTypes },
    },
  })

  return newAwards.map((award) => ({
    id: award.id,
    userId: award.userId,
    awardType: award.awardType,
    earnedAt: award.earnedAt,
  }))
}
