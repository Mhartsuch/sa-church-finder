import { Prisma, Role } from '@prisma/client'

import prisma from '../lib/prisma.js'
import { AppError, ConflictError, NotFoundError } from '../middleware/error-handler.js'
import { ICreateReviewInput, IReview, IReviewListParams, IReviewListResponse, IUserReview, IUserReviewHistoryResponse, IUpdateReviewInput, ReviewSort } from '../types/review.types.js'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50

const reviewInclude = Prisma.validator<Prisma.ReviewInclude>()({
  user: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
})

const reviewWithChurchInclude = Prisma.validator<Prisma.ReviewInclude>()({
  ...reviewInclude,
  church: {
    select: {
      id: true,
      name: true,
      slug: true,
      denomination: true,
      city: true,
      state: true,
      neighborhood: true,
    },
  },
})

type ReviewRecord = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>
type ReviewWithChurchRecord = Prisma.ReviewGetPayload<{
  include: typeof reviewWithChurchInclude
}>

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return value
  }

  return Number(value) || 0
}

const toDecimal = (value: number): Prisma.Decimal => {
  const normalizedValue = Math.min(5, Math.max(0, value))
  return new Prisma.Decimal(normalizedValue.toFixed(2))
}

const mapReview = (review: ReviewRecord): IReview => ({
  id: review.id,
  churchId: review.churchId,
  userId: review.userId,
  rating: toNumber(review.rating),
  body: review.body,
  welcomeRating: review.welcomeRating,
  worshipRating: review.worshipRating,
  sermonRating: review.sermonRating,
  facilitiesRating: review.facilitiesRating,
  helpfulCount: review.helpfulCount,
  createdAt: review.createdAt,
  updatedAt: review.updatedAt,
  user: {
    id: review.user.id,
    name: review.user.name,
    avatarUrl: review.user.avatarUrl,
  },
})

const mapUserReview = (review: ReviewWithChurchRecord): IUserReview => ({
  ...mapReview(review),
  church: {
    id: review.church.id,
    name: review.church.name,
    slug: review.church.slug,
    denomination: review.church.denomination,
    city: review.church.city,
    state: review.church.state,
    neighborhood: review.church.neighborhood,
  },
})

const getReviewOrderBy = (
  sort: ReviewSort,
): Prisma.ReviewOrderByWithRelationInput[] => {
  switch (sort) {
    case 'highest':
      return [{ rating: 'desc' }, { createdAt: 'desc' }]
    case 'lowest':
      return [{ rating: 'asc' }, { createdAt: 'desc' }]
    case 'helpful':
      return [{ helpfulCount: 'desc' }, { createdAt: 'desc' }]
    case 'recent':
    default:
      return [{ createdAt: 'desc' }]
  }
}

const computeCreateAggregate = (
  currentAverage: number,
  currentCount: number,
  newRating: number,
): { avgRating: number; reviewCount: number } => {
  const reviewCount = currentCount + 1
  const avgRating = ((currentAverage * currentCount) + newRating) / reviewCount

  return {
    avgRating,
    reviewCount,
  }
}

const computeUpdateAggregate = (
  currentAverage: number,
  currentCount: number,
  oldRating: number,
  newRating: number,
): { avgRating: number; reviewCount: number } => {
  if (currentCount <= 0) {
    return {
      avgRating: newRating,
      reviewCount: 1,
    }
  }

  const avgRating = ((currentAverage * currentCount) - oldRating + newRating) / currentCount

  return {
    avgRating,
    reviewCount: currentCount,
  }
}

const computeDeleteAggregate = (
  currentAverage: number,
  currentCount: number,
  deletedRating: number,
): { avgRating: number; reviewCount: number } => {
  const reviewCount = Math.max(0, currentCount - 1)

  if (reviewCount === 0) {
    return {
      avgRating: 0,
      reviewCount: 0,
    }
  }

  const avgRating = ((currentAverage * currentCount) - deletedRating) / reviewCount

  return {
    avgRating,
    reviewCount,
  }
}

const updateChurchAggregates = async (
  churchId: string,
  values: { avgRating: number; reviewCount: number },
): Promise<void> => {
  await prisma.church.update({
    where: { id: churchId },
    data: {
      avgRating: toDecimal(values.avgRating),
      reviewCount: values.reviewCount,
    },
  })
}

export async function getChurchReviews(
  churchId: string,
  params: IReviewListParams,
  currentUserId?: string,
): Promise<IReviewListResponse> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { id: true },
  })

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  const sort = params.sort ?? 'recent'
  const page = Math.max(DEFAULT_PAGE, params.page ?? DEFAULT_PAGE)
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE),
  )
  const skip = (page - 1) * pageSize

  const where = {
    churchId,
    isFlagged: false,
  }

  const total = await prisma.review.count({ where })
  const reviews = await prisma.review.findMany({
    where,
    orderBy: getReviewOrderBy(sort),
    skip,
    take: pageSize,
    include: reviewInclude,
  })

  const currentUserReview = currentUserId
    ? await prisma.review.findUnique({
        where: {
          userId_churchId: {
            userId: currentUserId,
            churchId,
          },
        },
        include: reviewInclude,
      })
    : null

  return {
    data: reviews.map(mapReview),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      sort,
    },
    currentUserReview: currentUserReview ? mapReview(currentUserReview) : null,
  }
}

export async function createReview(
  userId: string,
  churchId: string,
  input: ICreateReviewInput,
): Promise<IReview> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      id: true,
      avgRating: true,
      reviewCount: true,
    },
  })

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_churchId: {
        userId,
        churchId,
      },
    },
    select: { id: true },
  })

  if (existingReview) {
    throw new ConflictError('You have already reviewed this church')
  }

  const review = await prisma.review.create({
    data: {
      userId,
      churchId,
      rating: toDecimal(input.rating),
      body: input.body,
      welcomeRating: input.welcomeRating ?? null,
      worshipRating: input.worshipRating ?? null,
      sermonRating: input.sermonRating ?? null,
      facilitiesRating: input.facilitiesRating ?? null,
    },
    include: reviewInclude,
  })

  await updateChurchAggregates(
    church.id,
    computeCreateAggregate(
      toNumber(church.avgRating),
      church.reviewCount,
      input.rating,
    ),
  )

  return mapReview(review)
}

export async function updateReview(
  reviewId: string,
  requesterUserId: string,
  input: IUpdateReviewInput,
): Promise<IReview> {
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    include: reviewInclude,
  })

  if (!existingReview) {
    throw new NotFoundError('Review not found')
  }

  if (existingReview.userId !== requesterUserId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only edit your own reviews')
  }

  const church = await prisma.church.findUnique({
    where: { id: existingReview.churchId },
    select: {
      id: true,
      avgRating: true,
      reviewCount: true,
    },
  })

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  const nextRating = input.rating ?? toNumber(existingReview.rating)
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(input.rating !== undefined ? { rating: toDecimal(input.rating) } : {}),
      ...(input.body !== undefined ? { body: input.body } : {}),
      ...(input.welcomeRating !== undefined
        ? { welcomeRating: input.welcomeRating }
        : {}),
      ...(input.worshipRating !== undefined
        ? { worshipRating: input.worshipRating }
        : {}),
      ...(input.sermonRating !== undefined
        ? { sermonRating: input.sermonRating }
        : {}),
      ...(input.facilitiesRating !== undefined
        ? { facilitiesRating: input.facilitiesRating }
        : {}),
    },
    include: reviewInclude,
  })

  if (nextRating !== toNumber(existingReview.rating)) {
    await updateChurchAggregates(
      church.id,
      computeUpdateAggregate(
        toNumber(church.avgRating),
        church.reviewCount,
        toNumber(existingReview.rating),
        nextRating,
      ),
    )
  }

  return mapReview(updatedReview)
}

export async function deleteReview(
  reviewId: string,
  requesterUserId: string,
): Promise<{ id: string; churchId: string }> {
  const existingReview = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
  })

  if (!existingReview) {
    throw new NotFoundError('Review not found')
  }

  if (existingReview.userId !== requesterUserId) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterUserId },
      select: {
        role: true,
      },
    })

    if (!requester || requester.role !== Role.SITE_ADMIN) {
      throw new AppError(403, 'FORBIDDEN', 'You can only delete your own reviews')
    }
  }

  const church = await prisma.church.findUnique({
    where: { id: existingReview.churchId },
    select: {
      id: true,
      avgRating: true,
      reviewCount: true,
    },
  })

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  await prisma.review.delete({
    where: { id: reviewId },
  })

  await updateChurchAggregates(
    church.id,
    computeDeleteAggregate(
      toNumber(church.avgRating),
      church.reviewCount,
      toNumber(existingReview.rating),
    ),
  )

  return {
    id: reviewId,
    churchId: existingReview.churchId,
  }
}

export async function getUserReviewHistory(
  userId: string,
): Promise<IUserReviewHistoryResponse> {
  const reviews = await prisma.review.findMany({
    where: {
      userId,
    },
    orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    include: reviewWithChurchInclude,
  })

  return {
    data: reviews.map(mapUserReview),
    meta: {
      total: reviews.length,
    },
  }
}
