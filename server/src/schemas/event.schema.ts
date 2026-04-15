import { z } from 'zod'

import { EVENT_TYPES } from '../types/event.types.js'

const dateTimeSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid datetime value')

const optionalNullableString = (max: number): z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodNull]>> =>
  z.union([z.string().trim().max(max), z.null()]).optional()

const optionalNullableDateTime = z.union([dateTimeSchema, z.null()]).optional()

export const createChurchEventSchema = z.object({
  params: z
    .object({
      churchId: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      title: z.string().trim().min(2).max(200),
      description: optionalNullableString(5000),
      eventType: z.enum(EVENT_TYPES),
      startTime: dateTimeSchema,
      endTime: optionalNullableDateTime,
      locationOverride: optionalNullableString(200),
      isRecurring: z.boolean().optional(),
      recurrenceRule: optionalNullableString(500),
    })
    .refine(
      (value) =>
        !value.endTime || new Date(value.endTime).getTime() > new Date(value.startTime).getTime(),
      {
        message: '"endTime" must be after "startTime"',
        path: ['endTime'],
      },
    ),
})

export const updateChurchEventSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      title: z.string().trim().min(2).max(200).optional(),
      description: optionalNullableString(5000),
      eventType: z.enum(EVENT_TYPES).optional(),
      startTime: dateTimeSchema.optional(),
      endTime: optionalNullableDateTime,
      locationOverride: optionalNullableString(200),
      isRecurring: z.boolean().optional(),
      recurrenceRule: optionalNullableString(500),
    })
    .refine((value) => Object.values(value).some((field) => field !== undefined), {
      message: 'At least one event field is required',
    })
    .refine(
      (value) =>
        !value.endTime ||
        !value.startTime ||
        new Date(value.endTime).getTime() > new Date(value.startTime).getTime(),
      {
        message: '"endTime" must be after "startTime"',
        path: ['endTime'],
      },
    ),
})

export const eventIdSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

const booleanishFlag = z
  .union([
    z.boolean(),
    z
      .string()
      .transform((value) => value.trim().toLowerCase())
      .refine(
        (value) => ['true', 'false', '1', '0', 'yes', 'no'].includes(value),
        'Must be true, false, 1, or 0',
      )
      .transform((value) => value === 'true' || value === '1' || value === 'yes'),
  ])
  .optional()

export const eventsFeedSchema = z.object({
  params: z.object({}).passthrough(),
  query: z
    .object({
      type: z.enum(EVENT_TYPES).optional(),
      from: dateTimeSchema.optional(),
      to: dateTimeSchema.optional(),
      q: z.string().trim().max(200).optional(),
      page: z.coerce.number().int().positive().optional(),
      pageSize: z.coerce.number().int().positive().max(50).optional(),
      savedOnly: booleanishFlag,
    })
    .passthrough()
    .refine(
      (value) =>
        !value.from || !value.to || new Date(value.to).getTime() >= new Date(value.from).getTime(),
      {
        message: '"to" must be on or after "from"',
        path: ['to'],
      },
    ),
  body: z.object({}).passthrough(),
})

export const aggregatedCalendarFeedSchema = z.object({
  params: z.object({}).passthrough(),
  query: z
    .object({
      type: z.enum(EVENT_TYPES).optional(),
    })
    .passthrough(),
  body: z.object({}).passthrough(),
})

export type CreateChurchEventBody = z.infer<typeof createChurchEventSchema>['body']
export type UpdateChurchEventBody = z.infer<typeof updateChurchEventSchema>['body']
