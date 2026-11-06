/**
 * Zod validation schemas for church endpoints
 */

import { z } from 'zod'

/**
 * Query-string boolean flag: accepts 'true'/'false'/'1'/'0' or a native
 * boolean. Missing values stay `undefined` ("not filtered").
 */
const booleanFlag = z
  .union([z.enum(['true', 'false', '1', '0']), z.boolean()])
  .transform((value) => value === true || value === 'true' || value === '1')

export const churchSearchQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().max(25).optional(),
  q: z.string().max(200).optional(),
  denomination: z.string().optional(),
  day: z.coerce.number().int().min(0).max(6).optional(),
  time: z.enum(['morning', 'afternoon', 'evening']).optional(),
  language: z.string().optional(),
  amenities: z.string().optional(),
  wheelchairAccessible: booleanFlag.optional(),
  goodForChildren: booleanFlag.optional(),
  goodForGroups: booleanFlag.optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  neighborhood: z.string().optional(),
  hasPhotos: booleanFlag.optional(),
  sort: z.enum(['relevance', 'distance', 'rating', 'name']).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(50).optional(),
  bounds: z.string().optional(),
})

export const churchSearchSchema = z.object({
  query: churchSearchQuerySchema,
  params: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export const churchDetailSchema = z.object({
  params: z.object({ slug: z.string().min(1) }).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export const churchIdSchema = z.object({
  params: z.object({ id: z.string().min(1) }).passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})
