import prisma from '../lib/prisma.js'
import { NotFoundError } from '../middleware/error-handler.js'

export interface IPassport {
  user: {
    id: string
    name: string
    avatarUrl?: string | null
    createdAt: Date
  }
  stats: {
    totalVisits: number
    uniqueChurches: number
    denominationsVisited: number
    neighborhoodsVisited: number
    collectionsCount: number
    reviewCount: number
  }
  awards: Array<{
    awardType: string
    earnedAt: Date
  }>
  recentVisits: Array<{
    id: string
    visitedAt: string
    rating?: number | null
    notes?: string | null
    church: {
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
  }>
}

export async function getPassport(userId: string): Promise<IPassport> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      createdAt: true,
    },
  })

  if (!user) {
    throw new NotFoundError('User not found')
  }

  const [totalVisits, uniqueChurchVisits, collectionsCount, reviewCount, awards, recentVisits] =
    await Promise.all([
      // a. Total visit count
      prisma.churchVisit.count({ where: { userId } }),

      // b + c. Unique churches visited with denomination/neighborhood info
      prisma.churchVisit.findMany({
        where: { userId },
        distinct: ['churchId'],
        select: {
          churchId: true,
          church: {
            select: {
              denominationFamily: true,
              neighborhood: true,
            },
          },
        },
      }),

      // d. Public collections count
      prisma.churchCollection.count({ where: { userId, isPublic: true } }),

      // e. Review count
      prisma.review.count({ where: { userId } }),

      // f. Awards
      prisma.userAward.findMany({
        where: { userId },
        orderBy: { earnedAt: 'asc' },
        select: {
          awardType: true,
          earnedAt: true,
        },
      }),

      // g. Recent visits (last 10)
      prisma.churchVisit.findMany({
        where: { userId },
        orderBy: { visitedAt: 'desc' },
        take: 10,
        include: {
          church: {
            select: {
              id: true,
              name: true,
              slug: true,
              denomination: true,
              denominationFamily: true,
              neighborhood: true,
              coverImageUrl: true,
              address: true,
              city: true,
            },
          },
        },
      }),
    ])

  const uniqueChurches = uniqueChurchVisits.length

  const denominationsVisited = new Set(
    uniqueChurchVisits
      .map((v) => v.church.denominationFamily)
      .filter((d): d is string => d !== null),
  ).size

  const neighborhoodsVisited = new Set(
    uniqueChurchVisits.map((v) => v.church.neighborhood).filter((n): n is string => n !== null),
  ).size

  return {
    user,
    stats: {
      totalVisits,
      uniqueChurches,
      denominationsVisited,
      neighborhoodsVisited,
      collectionsCount,
      reviewCount,
    },
    awards: awards.map((a) => ({
      awardType: a.awardType,
      earnedAt: a.earnedAt,
    })),
    recentVisits: recentVisits.map((v) => ({
      id: v.id,
      visitedAt: v.visitedAt.toISOString(),
      rating: v.rating,
      notes: v.notes,
      church: v.church,
    })),
  }
}
