/**
 * Zod validation schemas for church search endpoints
 */

import { z } from 'zod'
import { EVENT_TYPES } from '../types/event.types.js'

/**
 * Query-string boolean flag: accepts 'true'/'false'/'1'/'0' and the native
 * boolean that's already been coerced. Missing values stay `undefined` so the
 * search service can distinguish "not filtered" from "explicitly false".
 */
const searchBooleanFlag = z
  .union([z.enum(['true', 'false', '1', '0']), z.boolean()])
  .transform((value) => value === true || value === 'true' || value === '1')

/**
 * Schema for church search query parameters
 */
export const churchSearchSchema = z.object({
  query: z
    .object({
      lat: z.coerce.number().optional(),
      lng: z.coerce.number().optional(),
      // Capped at 25 miles to match the documented API contract. Sending
      // `radius=50` now surfaces a clear 400 rather than silently running an
      // expensive PostGIS query over a huge bounding circle.
      radius: z.coerce.number().positive().max(25).optional(),
      q: z.string().optional(),
      denomination: z.string().optional(),
      day: z.coerce.number().int().min(0).max(6).optional(),
      time: z.enum(['morning', 'afternoon', 'evening']).optional(),
      // Accepts single value or comma-separated list; the service splits on
      // `,` for OR-combined language matching.
      language: z.string().optional(),
      amenities: z.string().optional(),
      wheelchairAccessible: searchBooleanFlag.optional(),
      goodForChildren: searchBooleanFlag.optional(),
      goodForGroups: searchBooleanFlag.optional(),
      minRating: z.coerce.number().min(0).max(5).optional(),
      neighborhood: z.string().optional(),
      serviceType: z.string().optional(),
      hasPhotos: searchBooleanFlag.optional(),
      isClaimed: searchBooleanFlag.optional(),
      openNow: searchBooleanFlag.optional(),
      sort: z.enum(['relevance', 'distance', 'rating', 'name']).optional(),
      page: z.coerce.number().int().positive().optional(),
      // Capped at 50 per API_SPEC; prior behaviour allowed up to 100 which let
      // callers materialise ~5× the rows they should fetch in one round-trip.
      pageSize: z.coerce.number().int().positive().max(50).optional(),
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

const booleanQueryFlag = z
  .union([z.enum(['true', 'false', '1', '0']), z.boolean()])
  .transform((value) => value === true || value === 'true' || value === '1')

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
      expand: booleanQueryFlag.optional(),
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

/**
 * Schema for PATCH /churches/:id — update editable church listing fields.
 * All body fields are optional (PATCH semantics). String fields accept `null`
 * to clear the value.
 */
export const churchUpdateSchema = z.object({
  params: z
    .object({
      id: z.string().uuid(),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      description: z.string().max(5000).nullable().optional(),
      phone: z.string().max(30).nullable().optional(),
      email: z.string().email().max(255).nullable().optional(),
      website: z.string().max(500).nullable().optional(),
      pastorName: z.string().max(255).nullable().optional(),
      yearEstablished: z
        .number()
        .int()
        .min(1500)
        .max(new Date().getFullYear())
        .nullable()
        .optional(),
      languages: z.array(z.string().min(1).max(100)).max(20).optional(),
      amenities: z.array(z.string().min(1).max(100)).max(50).optional(),
      goodForChildren: z.boolean().nullable().optional(),
      goodForGroups: z.boolean().nullable().optional(),
      wheelchairAccessible: z.boolean().nullable().optional(),
    })
    .strict(),
})

export type ChurchUpdateBody = z.infer<typeof churchUpdateSchema>['body']
