/**
 * Zod validation schemas for church search endpoints
 */

import { z } from 'zod'
import { EVENT_TYPES } from '../types/event.types.js'

/**
 * Schema for church search query parameters
 */
export const churchSearchSchema = z.object({
  query: z
    .object({
      lat: z.coerce.number().optional(),
      lng: z.coerce.number().optional(),
      radius: z.coerce.number().positive().optional(),
      q: z.string().optional(),
      denomination: z.string().optional(),
      day: z.coerce.number().int().min(0).max(6).optional(),
      time: z.enum(['morning', 'afternoon', 'evening']).optional(),
      language: z.string().optional(),
      amenities: z.string().optional(),
      sort: z.enum(['relevance', 'distance', 'rating', 'name']).optional(),
      page: z.coerce.number().int().positive().optional(),
      pageSize: z.coerce.number().int().positive().optional(),
      bounds: z.string().optional(),
    })
    .passthrough(),
  params: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

/**
 * Schema for church detail route parameters
 */
export const churchDetailSchema = z.object({
  params: z
    .object({
      slug: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

const dateTimeQuerySchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid datetime value')

export const churchEventsSchema = z.object({
  params: z
    .object({
      slug: z.string().min(1),
    })
    .passthrough(),
  query: z
    .object({
      type: z.enum(EVENT_TYPES).optional(),
      from: dateTimeQuerySchema.optional(),
      to: dateTimeQuerySchema.optional(),
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

/**
 * Schema for church ID route parameters
 */
export const churchIdSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})
