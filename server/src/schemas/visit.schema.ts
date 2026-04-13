import { z } from 'zod'

export const createVisitSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  body: z.object({
    visitedAt: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'visitedAt must be a date in YYYY-MM-DD format'),
    notes: z.string().max(1000, 'Notes must be 1000 characters or fewer').optional(),
    rating: z
      .number()
      .int()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .optional(),
  }),
})

export const updateVisitSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  body: z.object({
    notes: z.string().max(1000, 'Notes must be 1000 characters or fewer').optional(),
    rating: z
      .number()
      .int()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .nullable()
      .optional(),
  }),
})

export const deleteVisitSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
})

export const userVisitsSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z
    .object({
      page: z.coerce.number().int().min(1).optional().default(1),
      pageSize: z.coerce.number().int().min(1).max(50).optional().default(20),
    })
    .passthrough(),
})

export type CreateVisitBody = z.infer<typeof createVisitSchema>['body']
export type UpdateVisitBody = z.infer<typeof updateVisitSchema>['body']
