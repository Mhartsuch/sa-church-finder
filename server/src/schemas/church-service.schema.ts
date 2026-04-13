import { z } from 'zod'

const dayOfWeekSchema = z.coerce.number().int().min(0).max(6)

const timeStringSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format')

const optionalNullableString = (max: number) =>
  z.union([z.string().trim().max(max), z.null()]).optional()

export const createChurchServiceSchema = z.object({
  params: z
    .object({
      churchId: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({
    dayOfWeek: dayOfWeekSchema,
    startTime: timeStringSchema,
    endTime: z.union([timeStringSchema, z.null()]).optional(),
    serviceType: z.string().trim().min(1).max(100),
    language: z.string().trim().min(1).max(50).optional(),
    description: optionalNullableString(500),
  }),
})

export const updateChurchServiceSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      dayOfWeek: dayOfWeekSchema.optional(),
      startTime: timeStringSchema.optional(),
      endTime: z.union([timeStringSchema, z.null()]).optional(),
      serviceType: z.string().trim().min(1).max(100).optional(),
      language: z.string().trim().min(1).max(50).optional(),
      description: optionalNullableString(500),
    })
    .refine((value) => Object.values(value).some((field) => field !== undefined), {
      message: 'At least one service field is required',
    }),
})

export const churchServiceIdSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export type CreateChurchServiceBody = z.infer<typeof createChurchServiceSchema>['body']
export type UpdateChurchServiceBody = z.infer<typeof updateChurchServiceSchema>['body']
