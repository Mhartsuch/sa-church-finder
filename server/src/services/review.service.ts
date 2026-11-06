import { Prisma } from '@prisma/client'

import prisma from '../lib/prisma.js'
import { AppError, ConflictError, NotFoundError } from '../middleware/error-handler.js'
import {
  IReview,
  IReviewInput,
  IReviewListParams,
  IReviewListResponse,
  IUserReview,
  ReviewSort,
} from '../types/review.types.js'

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

const reviewInclude = {
  user: { select: { id: true, name: true, avatarUrl: true } },
} satisfies Prisma.ReviewInclude

const userReviewInclude = {
  ...reviewInclude,
  church: {
    select: {
      id: true,
      name: true,
      slug: true,
      denomination: true,
      neighborhood: true,
      coverImageUrl: true,
    },
  },
} satisfies Prisma.ReviewInclude

type ReviewRecord = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>

const ORDER_BY: Record<ReviewSort, Prisma.ReviewOrderByWithRelationInput[]> = {
  recent: [{ createdAt: 'desc' }],
  highest: [{ rating: 'desc' }, { createdAt: 'desc' }],
  lowest: [{ rating: 'asc' }, { createdAt: 'desc' }],
}

const mapReview = (review: ReviewRecord): IReview => ({
  id: review.id,
  churchId: review.churchId,
  userId: review.userId,
  rating: Number(review.rating),
  body: review.body,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
  user: { id: review.user.id, name: review.user.name, avatarUrl: review.user.avatarUrl },
})

const assertChurchExists = async (churchId: string): Promise<void> => {
  const church = await prisma.church.findUnique({ where: { id: churchId }, select: { id: true } })
  if (!church) throw new NotFoundError('Church not found')
}

const findOwnReview = async (reviewId: string, userId: string): Promise<ReviewRecord> => {
  const review = await prisma.review.findUnique({ where: { id: reviewId }, include: reviewInclude })
  if (!review) throw new NotFoundError('Review not found')
  if (review.userId !== userId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only change your own reviews')
  }
  return review
}

/**
 * Recomputes a church's avgRating/reviewCount from its reviews. Recomputing
 * (rather than incrementally adjusting) keeps the aggregate correct even when
 * writes race or rows are removed by cascade (e.g. account deletion).
 */
export async function refreshChurchRating(churchId: string): Promise<void> {
  const aggregate = await prisma.review.aggregate({
    where: { churchId },
    _avg: { rating: true },
    _count: { _all: true },
  })
  const avg = aggregate._avg.rating == null ? 0 : Number(aggregate._avg.rating)

  await prisma.church.update({
    where: { id: churchId },
    data: {
      avgRating: new Prisma.Decimal(avg.toFixed(2)),
      reviewCount: aggregate._count._all,
    },
  })
}

export async function getChurchReviews(
  churchId: string,
  params: IReviewListParams,
  currentUserId?: string,
): Promise<IReviewListResponse> {
  await assertChurchExists(churchId)

  const sort = params.sort ?? 'recent'
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE))

  const [total, reviews, currentUserReview] = await Promise.all([
    prisma.review.count({ where: { churchId } }),
    prisma.review.findMany({
      where: { churchId },
      orderBy: ORDER_BY[sort],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: reviewInclude,
    }),
    currentUserId
      ? prisma.review.findUnique({
          where: { userId_churchId: { userId: currentUserId, churchId } },
          include: reviewInclude,
        })
      : null,
  ])

  return {
    data: reviews.map(mapReview),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), sort },
    currentUserReview: currentUserReview ? mapReview(currentUserReview) : null,
  }
}

export async function createReview(
  userId: string,
  churchId: string,
  input: IReviewInput,
): Promise<IReview> {
  await assertChurchExists(churchId)

  const existing = await prisma.review.findUnique({
    where: { userId_churchId: { userId, churchId } },
    select: { id: true },
  })
  if (existing) throw new ConflictError('You have already reviewed this church')

  const review = await prisma.review.create({
    data: { userId, churchId, rating: input.rating, body: input.body },
    include: reviewInclude,
  })
  await refreshChurchRating(churchId)

  return mapReview(review)
}

export async function updateReview(
  reviewId: string,
  userId: string,
  input: Partial<IReviewInput>,
): Promise<IReview> {
  const existing = await findOwnReview(reviewId, userId)

  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(input.rating !== undefined ? { rating: input.rating } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
    },
    include: reviewInclude,
  })

  if (input.rating !== undefined && input.rating !== Number(existing.rating)) {
    await refreshChurchRating(review.churchId)
  }

  return mapReview(review)
}

export async function deleteReview(
  reviewId: string,
  userId: string,
): Promise<{ id: string; churchId: string }> {
  const existing = await findOwnReview(reviewId, userId)

  await prisma.review.delete({ where: { id: reviewId } })
  await refreshChurchRating(existing.churchId)

  return { id: reviewId, churchId: existing.churchId }
}

export async function getUserReviews(userId: string): Promise<IUserReview[]> {
  const reviews = await prisma.review.findMany({
    where: { userId },
    orderBy: [{ updatedAt: 'desc' }],
    include: userReviewInclude,
  })

  return reviews.map((review) => ({ ...mapReview(review), church: review.church }))
}
