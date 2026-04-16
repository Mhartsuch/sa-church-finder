import { z } from 'zod'

import {
  ChurchEventType,
  EVENT_SORT_OPTIONS,
  EVENT_TIME_OF_DAY,
  EVENT_TYPES,
} from '../types/event.types.js'

const isChurchEventType = (value: string): value is ChurchEventType =>
  (EVENT_TYPES as readonly string[]).includes(value)

/**
 * Multi-select event type filter for the aggregated events feed. Accepts
 *   - a single value (`type=service`)
 *   - a comma-separated list (`type=service,community`)
 *   - repeated query params (`type=service&type=community`, which Express
 *     surfaces as a string array)
 *
 * Always normalizes to a deduplicated `ChurchEventType[]` so the service layer
 * sees a consistent shape. Returns `undefined` when no value is supplied so
 * downstream code can skip the filter entirely.
 */
const eventTypesQueryParam = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined) return undefined

    const raw = Array.isArray(value) ? value.flatMap((item) => item.split(',')) : value.split(',')

    const normalized = Array.from(
      new Set(raw.map((item) => item.trim()).filter((item): item is string => item.length > 0)),
    )

    if (normalized.length === 0) return undefined

    for (const candidate of normalized) {
      if (!isChurchEventType(candidate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unknown event type: ${candidate}`,
        })
        return z.NEVER
      }
    }

    return normalized as ChurchEventType[]
  })

/**
 * Multi-select denomination family filter. Accepts a single value, a
 * comma-separated list, or repeated query params — matching the wire format
 * `eventsFeedSchema` uses so the calendar-feed and JSON-feed params stay
 * interchangeable. Empty / whitespace-only / over-length entries are dropped;
 * an empty normalized list collapses to `undefined`.
 */
const denominationMultiQueryParam = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined

    const raw = Array.isArray(value) ? value.flatMap((item) => item.split(',')) : value.split(',')

    const normalized = Array.from(
      new Set(
        raw
          .map((item) => item.trim())
          .filter((item): item is string => item.length > 0 && item.length <= 120),
      ),
    )

    return normalized.length > 0 ? normalized : undefined
  })

/**
 * Multi-select language filter. Mirrors `denominationMultiQueryParam` — accepts
 * a single value (`language=Spanish`), a comma-separated list
 * (`language=English,Spanish`), or repeated query params. Entries are trimmed,
 * deduped, and length-capped; an empty normalized list collapses to
 * `undefined` so the service layer can skip the filter.
 */
const languageMultiQueryParam = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined

    const raw = Array.isArray(value) ? value.flatMap((item) => item.split(',')) : value.split(',')

    const normalized = Array.from(
      new Set(
        raw
          .map((item) => item.trim())
          .filter((item): item is string => item.length > 0 && item.length <= 60),
      ),
    )

    return normalized.length > 0 ? normalized : undefined
  })

/**
 * Multi-select neighborhood filter. Mirrors `denominationMultiQueryParam` and
 * `languageMultiQueryParam` — accepts a single value
 * (`neighborhood=Downtown`), a comma-separated list
 * (`neighborhood=Downtown,Alamo Heights`), or repeated query params. Entries
 * are trimmed, deduped, and length-capped (120 chars to match the prior
 * single-value validation); an empty normalized list collapses to `undefined`
 * so the service layer can skip the filter. A single token over the length
 * cap triggers a zod validation error to preserve the prior strict behaviour.
 */
const neighborhoodMultiQueryParam = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((value, ctx) => {
    if (value === undefined) return undefined

    const raw = Array.isArray(value) ? value.flatMap((item) => item.split(',')) : value.split(',')

    const trimmed = raw.map((item) => item.trim()).filter((item) => item.length > 0)

    for (const token of trimmed) {
      if (token.length > 120) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Neighborhood value must be at most 120 characters',
        })
        return z.NEVER
      }
    }

    const normalized = Array.from(new Set(trimmed))

    return normalized.length > 0 ? normalized : undefined
  })

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
      type: eventTypesQueryParam,
      from: dateTimeSchema.optional(),
      to: dateTimeSchema.optional(),
      q: z.string().trim().max(200).optional(),
      page: z.coerce.number().int().positive().optional(),
      pageSize: z.coerce.number().int().positive().max(50).optional(),
      savedOnly: booleanishFlag,
      timeOfDay: z.enum(EVENT_TIME_OF_DAY).optional(),
      // Multi-select neighborhood filter. Supports a single value
      // (`neighborhood=Downtown`), a comma-separated list
      // (`neighborhood=Downtown,Alamo Heights`), or repeated query params.
      // Mirrors the wire format used by the other multi-select chip filters
      // (`denomination`, `language`) so the shared
      // `/churches/filter-options` payload (`neighborhoods[]`) can drive the
      // chip rail. Empty / whitespace-only entries collapse to `undefined`
      // so downstream code can skip the filter entirely.
      neighborhood: neighborhoodMultiQueryParam,
      // Multi-select denomination family filter. Supports a single value
      // (`denomination=Baptist`), a comma-separated list
      // (`denomination=Baptist,Methodist`), or repeated query params. Matches
      // the wire format the church search endpoint already accepts so the
      // shared `/churches/filter-options` payload (`denominations[].value`)
      // can drive both surfaces. Empty / whitespace-only entries collapse to
      // `undefined` so downstream code can skip the filter.
      denomination: denominationMultiQueryParam,
      // Restrict the feed to events at churches flagged as wheelchair
      // accessible. Reuses the same boolean-ish parser as `savedOnly` so
      // `?accessibleOnly=true`, `=1`, and `=yes` all work for URL share-links.
      accessibleOnly: booleanishFlag,
      // Restrict the feed to events at churches flagged as good for children
      // (`church.goodForChildren = true`). Reuses the same boolean-ish parser
      // as `accessibleOnly` so URL share-links can carry `?familyFriendly=true`,
      // `=1`, or `=yes` interchangeably.
      familyFriendly: booleanishFlag,
      // Restrict the feed to events at churches flagged as good for groups
      // (`church.goodForGroups = true`). Mirrors `familyFriendly` — reuses the
      // shared boolean-ish parser so URL share-links can carry
      // `?groupFriendly=true`, `=1`, or `=yes` interchangeably.
      groupFriendly: booleanishFlag,
      // Multi-select service-language filter. Supports a single value
      // (`language=Spanish`), a comma-separated list
      // (`language=English,Spanish`), or repeated query params. Mirrors the
      // wire format the church search endpoint already accepts so the shared
      // `/churches/filter-options` payload (`languages[]`) can drive both
      // surfaces. Empty / whitespace-only entries collapse to `undefined` so
      // downstream code can skip the filter.
      language: languageMultiQueryParam,
      // Feed ordering. `soonest` (default) is chronological ascending by
      // occurrence start time. `recent` reorders by `createdAt` descending so
      // newly announced events lead the feed, with start time as the stable
      // tiebreaker inside the same announcement moment.
      sort: z.enum(EVENT_SORT_OPTIONS).optional(),
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
      // Multi-select event type filter. Matches the wire format of the JSON
      // aggregated feed (`type=service,community` or repeated `type=` params)
      // so visitors who narrow the discovery page to several types can
      // subscribe to a calendar scoped to exactly that selection. Leave
      // unset to subscribe to every event type.
      type: eventTypesQueryParam,
      // Multi-select denomination family filter. Mirrors the JSON feed
      // (`denomination=Baptist,Methodist` or repeated `denomination=` params)
      // so a visitor who narrows the discovery page to one or more families
      // can subscribe to a calendar scoped to exactly that selection. Case is
      // preserved for filename/calendar-name display; the service matches
      // case-insensitively against `church.denominationFamily`.
      denomination: denominationMultiQueryParam,
      // Multi-select neighborhood filter. Mirrors the JSON feed
      // (`neighborhood=Downtown,Alamo Heights` or repeated `neighborhood=`
      // params) so a visitor who narrows the discovery page to one or more
      // San Antonio neighborhoods can subscribe to a calendar scoped to
      // exactly that selection. Case is preserved for filename/calendar-name
      // display; the service matches case-insensitively against
      // `church.neighborhood`.
      neighborhood: neighborhoodMultiQueryParam,
      // Multi-select service-language filter. Mirrors the JSON feed
      // (`language=English,Spanish` or repeated `language=` params) so a
      // visitor who narrows the discovery page to one or more service
      // languages can subscribe to a calendar scoped to exactly that
      // selection. Values flow through the `/churches/filter-options`
      // dropdown which shares the canonical casing already present in the
      // database, so the service layer matches case-sensitively via
      // `church.languages hasSome`.
      language: languageMultiQueryParam,
      // Restrict the calendar feed to events at churches flagged as
      // wheelchair accessible. Mirrors the JSON feed's `accessibleOnly`
      // wire format (`?accessibleOnly=true|1|yes`) so a visitor who has
      // toggled the wheelchair-accessible chip on the discovery page can
      // subscribe to a calendar scoped to exactly that narrowing. The
      // service layer requires `church.wheelchairAccessible = true`,
      // excluding both `false` and `null` (unknown) churches so the
      // subscribed calendar stays trustworthy.
      accessibleOnly: booleanishFlag,
    })
    .passthrough(),
  body: z.object({}).passthrough(),
})

export type CreateChurchEventBody = z.infer<typeof createChurchEventSchema>['body']
export type UpdateChurchEventBody = z.infer<typeof updateChurchEventSchema>['body']
