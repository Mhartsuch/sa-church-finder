import prisma from '../lib/prisma.js'
import logger from '../lib/logger.js'
import { NotFoundError } from '../middleware/error-handler.js'
import { IChurchAnalytics } from '../types/analytics.types.js'

/**
 * Build an array of the last 6 month boundaries (newest first).
 * Each entry: { label: "YYYY-MM", start: Date, end: Date }
 */
function getLastSixMonths(): Array<{ label: string; start: Date; end: Date }> {
  const months: Array<{ label: string; start: Date; end: Date }> = []
  const now = new Date()

  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = new Date(d.getFullYear(), d.getMonth(), 1)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.push({ label, start, end })
  }

  return months
}

function toNumber(value: unknown): number {
  if (typeof value === 'number') return value
  return Number(value) || 0
}

function averageOfNonNull(values: Array<number | null>): number | null {
  const valid = values.filter((v): v is number => v !== null)
  if (valid.length === 0) return null
  return valid.reduce((sum, v) => sum + v, 0) / valid.length
}

export async function getChurchAnalytics(churchId: string): Promise<IChurchAnalytics> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      id: true,
      name: true,
      avgRating: true,
      reviewCount: true,
    },
  })

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  const months = getLastSixMonths()
  const sixMonthsAgo = months[months.length - 1].start
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  // Run all independent queries in parallel
  const [saveCount, reviews, recentReviewCount, saves, recentSaveCount] = await Promise.all([
    // Total saves
    prisma.userSavedChurch.count({
      where: { churchId },
    }),

    // All reviews in the last 6 months (for trend computation + sub-ratings)
    // We also need all reviews for sub-rating averages, so fetch all
    prisma.review.findMany({
      where: { churchId },
      select: {
        rating: true,
        welcomeRating: true,
        worshipRating: true,
        sermonRating: true,
        facilitiesRating: true,
        respondedAt: true,
        createdAt: true,
      },
    }),

    // Recent review count (last 30 days)
    prisma.review.count({
      where: {
        churchId,
        createdAt: { gte: thirtyDaysAgo },
      },
    }),

    // Saves in the last 6 months (for trend)
    prisma.userSavedChurch.findMany({
      where: {
        churchId,
        savedAt: { gte: sixMonthsAgo },
      },
      select: {
        savedAt: true,
      },
    }),

    // Recent save count (last 30 days)
    prisma.userSavedChurch.count({
      where: {
        churchId,
        savedAt: { gte: thirtyDaysAgo },
      },
    }),
  ])

  // Response rate
  const totalReviews = reviews.length
  const respondedReviews = reviews.filter((r) => r.respondedAt !== null).length
  const responseRate = totalReviews > 0 ? Math.round((respondedReviews / totalReviews) * 100) : 0

  // Sub-rating averages
  const avgWelcomeRating = averageOfNonNull(reviews.map((r) => r.welcomeRating))
  const avgWorshipRating = averageOfNonNull(reviews.map((r) => r.worshipRating))
  const avgSermonRating = averageOfNonNull(reviews.map((r) => r.sermonRating))
  const avgFacilitiesRating = averageOfNonNull(reviews.map((r) => r.facilitiesRating))

  // Review trend: group by month for last 6 months
  const reviewTrend = months.map(({ label, start, end }) => {
    const monthReviews = reviews.filter((r) => r.createdAt >= start && r.createdAt < end)
    const count = monthReviews.length
    const avgRating =
      count > 0
        ? monthReviews.reduce((sum, r) => sum + toNumber(r.rating), 0) / count
        : 0

    return { month: label, count, avgRating: Math.round(avgRating * 100) / 100 }
  })

  // Save trend: group by month for last 6 months
  const saveTrend = months.map(({ label, start, end }) => {
    const count = saves.filter((s) => s.savedAt >= start && s.savedAt < end).length
    return { month: label, count }
  })

  logger.info({ churchId, totalReviews, saveCount }, 'Church analytics computed')

  return {
    churchId: church.id,
    churchName: church.name,
    reviewCount: church.reviewCount,
    avgRating: toNumber(church.avgRating),
    saveCount,
    totalReviews,
    respondedReviews,
    responseRate,
    avgWelcomeRating,
    avgWorshipRating,
    avgSermonRating,
    avgFacilitiesRating,
    reviewTrend,
    saveTrend,
    recentReviewCount,
    recentSaveCount,
  }
}
