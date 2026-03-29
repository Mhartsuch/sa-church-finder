import { z } from 'zod'

const reviewRatingSchema = z.coerce.number().refine(
  (value) => value >= 1 && value <= 5 && Math.round(value * 2) === value * 2,
  {
    message: 'Rating must be between 1 and 5 in 0.5 increments',
  },
)

const optionalCategoryRatingSchema = z
  .union([
    z.coerce.number().int().min(1).max(5),
    z.null(),
  ])
  .optional()

const reviewBodySchema = z.string().trim().min(50).max(2000)

export const churchReviewsSchema = z.object({
  params: z.object({
    churchId: z.string().min(1),
  }).passthrough(),
  query: z.object({
    sort: z.enum(['recent', 'highest', 'lowest', 'helpful']).optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().optional(),
  }).passthrough(),
  body: z.object({}).passthrough(),
})

export const createReviewSchema = z.object({
  params: z.object({
    churchId: z.string().min(1),
  }).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    rating: reviewRatingSchema,
    body: reviewBodySchema,
    welcomeRating: optionalCategoryRatingSchema,
    worshipRating: optionalCategoryRatingSchema,
    sermonRating: optionalCategoryRatingSchema,
    facilitiesRating: optionalCategoryRatingSchema,
  }).passthrough(),
})

export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    rating: reviewRatingSchema.optional(),
    body: reviewBodySchema.optional(),
    welcomeRating: optionalCategoryRatingSchema,
    worshipRating: optionalCategoryRatingSchema,
    sermonRating: optionalCategoryRatingSchema,
    facilitiesRating: optionalCategoryRatingSchema,
  })
    .passthrough()
    .refine(
      (value) => Object.values(value).some((field) => field !== undefined),
      {
        message: 'At least one review field is required',
      },
    ),
})

export const reviewIdSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export type CreateReviewBody = z.infer<typeof createReviewSchema>['body']
export type UpdateReviewBody = z.infer<typeof updateReviewSchema>['body']
