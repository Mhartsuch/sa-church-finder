import { z } from 'zod'

const ratingSchema = z.coerce.number().int().min(1).max(5)
const bodySchema = z.string().trim().min(10).max(2000)

const emptyObject = z.object({}).passthrough()

export const churchReviewsSchema = z.object({
  params: z.object({ churchId: z.string().min(1) }).passthrough(),
  query: z.object({
    sort: z.enum(['recent', 'highest', 'lowest']).optional(),
    page: z.coerce.number().int().positive().optional(),
    pageSize: z.coerce.number().int().positive().max(50).optional(),
  }),
  body: emptyObject,
})

export const createReviewSchema = z.object({
  params: z.object({ churchId: z.string().min(1) }).passthrough(),
  query: emptyObject,
  body: z.object({ rating: ratingSchema, body: bodySchema }),
})

export const updateReviewSchema = z.object({
  params: z.object({ id: z.string().min(1) }).passthrough(),
  query: emptyObject,
  body: z
    .object({ rating: ratingSchema.optional(), body: bodySchema.optional() })
    .refine((value) => value.rating !== undefined || value.body !== undefined, {
      message: 'At least one of rating or body is required',
    }),
})

export const reviewIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }).passthrough(),
  query: emptyObject,
  body: emptyObject,
})

export type CreateReviewBody = z.infer<typeof createReviewSchema>['body']
export type UpdateReviewBody = z.infer<typeof updateReviewSchema>['body']
