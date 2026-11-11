/**
 * Church search, detail and filter options.
 *
 * Search ranking runs as a single PostGIS raw query that returns the ordered
 * page of church ids; the card payloads are then loaded through Prisma.
 */

import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma.js'
import {
  IChurch,
  IChurchSummary,
  IFilterOptions,
  ISearchParams,
  ISearchResponse,
} from '../types/church.types.js'

const DEFAULT_CENTER = { lat: 29.4241, lng: -98.4936 }
const DEFAULT_RADIUS_MILES = 10
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50
const METERS_PER_MILE = 1609.344
const CARD_PHOTO_LIMIT = 5

// ── Relevance ranking weights (additive; final score sorts DESC) ──
//
// Churches with no photos take a -1000 penalty so they always rank below any
// church with photos. Non-congregational traditions that Google's `church`
// place type sweeps in are demoted (never excluded) — an explicit filter for
// one of those families still orders its results normally.
const RANK_WEIGHTS = {
  NO_PHOTO_PENALTY: -1000,
  DESCRIPTION: 15, // description ≥ 50 chars
  COVER_IMAGE: 10,
  PHONE: 5,
  EMAIL: 5,
  WEBSITE: 5,
  AMENITY_PER_ITEM: 2,
  AMENITY_MAX: 10,
  PHOTO_PER_ITEM: 2,
  PHOTO_MAX: 10,
  SERVICE_PER_ITEM: 3,
  SERVICE_MAX: 12,
  RATING_MULTIPLIER: 4, // effective rating (0–5) × 4
  REVIEW_PER_ITEM: 0.5,
  REVIEW_MAX: 5,
  PROXIMITY_MAX: 15, // max / (1 + decay × miles)
  PROXIMITY_DECAY: 0.3,
  FRESHNESS_30D: 5,
  FRESHNESS_90D: 3,
  FRESHNESS_365D: 1,
  WHEELCHAIR_ACCESSIBLE: 3,
  OPERATIONAL_STATUS: 2,
  DEMOTED_FAMILY_PENALTY: 500,
} as const

const DEMOTED_DENOMINATION_FAMILIES = ['Latter-day Saints', "Jehovah's Witnesses"]

const TIME_RANGES: Record<NonNullable<ISearchParams['time']>, [string, string]> = {
  morning: ['00:00', '12:00'],
  afternoon: ['12:00', '17:00'],
  evening: ['17:00', '23:59'],
}

/**
 * Listings the public may see: not hidden (non-churches, duplicates) and not
 * permanently closed. Every public read path applies this.
 */
export const PUBLIC_CHURCH_WHERE: Prisma.ChurchWhereInput = {
  isHidden: false,
  OR: [{ businessStatus: null }, { businessStatus: { not: 'CLOSED_PERMANENTLY' } }],
}

// ── Prisma → payload mapping ──

const servicesInclude = {
  orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
} satisfies Prisma.Church$servicesArgs

// Anonymous viewers never match a saved row; an empty `in` list keeps the
// include shape (and payload type) identical for both cases.
type SavedInclude = { where: { userId: { in: string[] } }; select: { userId: true } }

const savedInclude = (userId?: string): SavedInclude => ({
  where: { userId: { in: userId ? [userId] : [] } },
  select: { userId: true },
})

type SummaryInclude = {
  services: typeof servicesInclude
  photos: { orderBy: { displayOrder: 'asc' }; take: number }
  savedByUsers: SavedInclude
}

/** Prisma include for card-sized church payloads. */
export const churchSummaryInclude = (userId?: string): SummaryInclude => ({
  services: servicesInclude,
  photos: { orderBy: { displayOrder: 'asc' }, take: CARD_PHOTO_LIMIT },
  savedByUsers: savedInclude(userId),
})

type ChurchWithRelations = Prisma.ChurchGetPayload<{
  include: {
    services: true
    photos: true
    savedByUsers: { select: { userId: true } }
  }
}>

const toNumberOrNull = (value: Prisma.Decimal | null): number | null =>
  value == null ? null : Number(value)

export function toChurchSummary(church: ChurchWithRelations): IChurchSummary {
  return {
    id: church.id,
    name: church.name,
    slug: church.slug,
    denomination: church.denomination,
    denominationFamily: church.denominationFamily,
    description: church.description,
    address: church.address,
    city: church.city,
    state: church.state,
    zipCode: church.zipCode,
    neighborhood: church.neighborhood,
    latitude: Number(church.latitude),
    longitude: Number(church.longitude),
    phone: church.phone,
    website: church.website,
    avgRating: Number(church.avgRating),
    reviewCount: church.reviewCount,
    googleRating: toNumberOrNull(church.googleRating),
    googleReviewCount: church.googleReviewCount,
    languages: church.languages,
    amenities: church.amenities,
    coverImageUrl: church.coverImageUrl,
    businessStatus: church.businessStatus,
    goodForChildren: church.goodForChildren,
    goodForGroups: church.goodForGroups,
    wheelchairAccessible: church.wheelchairAccessible,
    isSaved: church.savedByUsers.length > 0,
    photos: church.photos.map(({ id, url, altText, displayOrder }) => ({
      id,
      url,
      altText,
      displayOrder,
    })),
    services: church.services.map(
      ({ id, churchId, dayOfWeek, startTime, endTime, serviceType, language, description }) => ({
        id,
        churchId,
        dayOfWeek,
        startTime,
        endTime,
        serviceType,
        language,
        description,
      }),
    ),
  }
}

// ── Search ──

function splitCsv(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
}

function parseBounds(value: string): [number, number, number, number] | null {
  const parts = value.split(',').map(Number)
  return parts.length === 4 && parts.every(Number.isFinite)
    ? (parts as [number, number, number, number])
    : null
}

function buildWhere(params: ISearchParams, center: { lat: number; lng: number }): Prisma.Sql {
  const conditions: Prisma.Sql[] = [
    Prisma.sql`c."isHidden" = false`,
    Prisma.sql`(c."businessStatus" IS NULL OR c."businessStatus" != 'CLOSED_PERMANENTLY')`,
  ]
  const bounds = params.bounds ? parseBounds(params.bounds) : null

  if (bounds) {
    const [swLat, swLng, neLat, neLng] = bounds
    conditions.push(
      Prisma.sql`c."latitude" BETWEEN ${swLat} AND ${neLat}`,
      Prisma.sql`c."longitude" BETWEEN ${swLng} AND ${neLng}`,
    )
  } else {
    const radiusMeters = (params.radius ?? DEFAULT_RADIUS_MILES) * METERS_PER_MILE
    conditions.push(Prisma.sql`ST_DWithin(
      c."location",
      ST_SetSRID(ST_MakePoint(${center.lng}, ${center.lat}), 4326)::geography,
      ${radiusMeters}
    )`)
  }

  const q = params.q?.trim().toLowerCase()
  if (q) {
    // Escape LIKE wildcards so "100%" or "st_john" match literally.
    const term = `%${q.replace(/[\\%_]/g, '\\$&')}%`
    // Visitors type what they know: a name, a tradition ("lutheran"), a part
    // of town ("stone oak"), a street or a zip code.
    conditions.push(Prisma.sql`(
      LOWER(c."name") LIKE ${term}
      OR LOWER(COALESCE(c."denomination", '')) LIKE ${term}
      OR LOWER(COALESCE(c."denominationFamily", '')) LIKE ${term}
      OR LOWER(COALESCE(c."neighborhood", '')) LIKE ${term}
      OR LOWER(c."city") LIKE ${term}
      OR c."zipCode" LIKE ${term}
      OR LOWER(c."address") LIKE ${term}
      OR LOWER(COALESCE(c."description", '')) LIKE ${term}
      OR EXISTS (SELECT 1 FROM unnest(c."amenities") AS a WHERE LOWER(a) LIKE ${term})
      OR EXISTS (
        SELECT 1 FROM "church_services" cs
        WHERE cs."churchId" = c."id" AND LOWER(cs."serviceType") LIKE ${term}
      )
    )`)
  }

  const denominations = splitCsv(params.denomination)
  if (denominations.length > 0) {
    conditions.push(Prisma.sql`LOWER(c."denominationFamily") = ANY(${denominations}::text[])`)
  }

  const languages = splitCsv(params.language)
  if (languages.length > 0) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM unnest(c."languages") AS l WHERE LOWER(l) = ANY(${languages}::text[])
    )`)
  }

  for (const amenity of splitCsv(params.amenities)) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM unnest(c."amenities") AS a WHERE LOWER(a) = ${amenity}
    )`)
  }

  // NULL means "unknown" and must not satisfy a flag filter.
  if (params.wheelchairAccessible) conditions.push(Prisma.sql`c."wheelchairAccessible" = true`)
  if (params.goodForChildren) conditions.push(Prisma.sql`c."goodForChildren" = true`)
  if (params.goodForGroups) conditions.push(Prisma.sql`c."goodForGroups" = true`)

  if (params.hasPhotos) {
    conditions.push(
      Prisma.sql`EXISTS (SELECT 1 FROM "church_photos" cp WHERE cp."churchId" = c."id")`,
    )
  }

  if (params.minRating && params.minRating > 0) {
    conditions.push(Prisma.sql`(
      CASE WHEN c."reviewCount" > 0 THEN c."avgRating" ELSE COALESCE(c."googleRating", 0) END
    ) >= ${params.minRating}`)
  }

  const neighborhood = params.neighborhood?.trim().toLowerCase()
  if (neighborhood) {
    conditions.push(Prisma.sql`LOWER(c."neighborhood") = ${neighborhood}`)
  }

  if (params.day !== undefined) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "church_services" cs
      WHERE cs."churchId" = c."id" AND cs."dayOfWeek" = ${params.day}
    )`)
  }

  if (params.time) {
    const [start, end] = TIME_RANGES[params.time]
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "church_services" cs
      WHERE cs."churchId" = c."id" AND cs."startTime" >= ${start} AND cs."startTime" < ${end}
    )`)
  }

  return Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
}

function buildOrderBy(sort: ISearchParams['sort']): Prisma.Sql {
  const demoted = Prisma.sql`CASE WHEN "denominationFamily" = ANY(${DEMOTED_DENOMINATION_FAMILIES}::text[]) THEN 1 ELSE 0 END`
  const effectiveCount = Prisma.sql`GREATEST("reviewCount", COALESCE("googleReviewCount", 0))`
  const effectiveRating = Prisma.sql`CASE WHEN "reviewCount" > 0 THEN "avgRating" ELSE COALESCE("googleRating", 0) END`
  const w = RANK_WEIGHTS

  switch (sort) {
    case 'name':
      return Prisma.sql`ORDER BY "name" ASC`
    case 'distance':
      return Prisma.sql`ORDER BY distance_miles ASC NULLS LAST`
    case 'rating':
      // Bayesian weighted rating with prior 3.5 and weight 10; unrated last.
      return Prisma.sql`ORDER BY
        (${demoted}) ASC,
        CASE WHEN ${effectiveCount} = 0 AND COALESCE("googleRating", 0) = 0 THEN 0 ELSE 1 END DESC,
        ((${effectiveRating}) * ${effectiveCount} + 3.5 * 10) / (${effectiveCount} + 10) DESC,
        "name" ASC`
    case 'relevance':
    default:
      return Prisma.sql`ORDER BY (
        CASE WHEN photo_count = 0 THEN ${w.NO_PHOTO_PENALTY}::float ELSE 0 END
        + CASE WHEN LENGTH(COALESCE("description", '')) >= 50 THEN ${w.DESCRIPTION}::float ELSE 0 END
        + CASE WHEN "coverImageUrl" IS NOT NULL THEN ${w.COVER_IMAGE}::float ELSE 0 END
        + CASE WHEN "phone" IS NOT NULL THEN ${w.PHONE}::float ELSE 0 END
        + CASE WHEN "email" IS NOT NULL THEN ${w.EMAIL}::float ELSE 0 END
        + CASE WHEN "website" IS NOT NULL THEN ${w.WEBSITE}::float ELSE 0 END
        + LEAST(COALESCE(array_length("amenities", 1), 0) * ${w.AMENITY_PER_ITEM}::float, ${w.AMENITY_MAX}::float)
        + LEAST(photo_count * ${w.PHOTO_PER_ITEM}::float, ${w.PHOTO_MAX}::float)
        + LEAST(service_count * ${w.SERVICE_PER_ITEM}::float, ${w.SERVICE_MAX}::float)
        + (${effectiveRating})::float * ${w.RATING_MULTIPLIER}::float
        + LEAST(${effectiveCount} * ${w.REVIEW_PER_ITEM}::float, ${w.REVIEW_MAX}::float)
        + COALESCE(${w.PROXIMITY_MAX}::float / (1.0 + ${w.PROXIMITY_DECAY}::float * distance_miles), 0)
        + CASE
            WHEN "updatedAt" > NOW() - INTERVAL '30 days' THEN ${w.FRESHNESS_30D}::float
            WHEN "updatedAt" > NOW() - INTERVAL '90 days' THEN ${w.FRESHNESS_90D}::float
            WHEN "updatedAt" > NOW() - INTERVAL '365 days' THEN ${w.FRESHNESS_365D}::float
            ELSE 0
          END
        + CASE WHEN "wheelchairAccessible" = true THEN ${w.WHEELCHAIR_ACCESSIBLE}::float ELSE 0 END
        + CASE WHEN "businessStatus" = 'OPERATIONAL' THEN ${w.OPERATIONAL_STATUS}::float ELSE 0 END
        -- DEFAULT-ORDER DEMOTION
        - (${demoted})::float * ${w.DEMOTED_FAMILY_PENALTY}::float
      ) DESC, "name" ASC`
  }
}

async function executeSearch(params: ISearchParams, userId?: string): Promise<ISearchResponse> {
  const center = { lat: params.lat ?? DEFAULT_CENTER.lat, lng: params.lng ?? DEFAULT_CENTER.lng }
  const page = Math.max(1, params.page ?? 1)
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE))
  const where = buildWhere(params, center)
  const origin = Prisma.sql`ST_SetSRID(ST_MakePoint(${center.lng}, ${center.lat}), 4326)::geography`

  const [countRows, idRows] = await Promise.all([
    prisma.$queryRaw<{ count: bigint }[]>(Prisma.sql`
      SELECT COUNT(*) AS count FROM "churches" c ${where}
    `),
    prisma.$queryRaw<{ id: string; distance_miles: number | null }[]>(Prisma.sql`
      WITH church_base AS (
        SELECT
          c."id", c."name", c."description", c."coverImageUrl", c."phone", c."email",
          c."website", c."amenities", c."avgRating"::float8 AS "avgRating", c."reviewCount",
          c."googleRating"::float8 AS "googleRating", c."googleReviewCount", c."updatedAt",
          c."wheelchairAccessible", c."businessStatus", c."denominationFamily",
          ST_Distance(c."location", ${origin}) / ${METERS_PER_MILE} AS distance_miles,
          (SELECT COUNT(*) FROM "church_photos" WHERE "churchId" = c."id")::int AS photo_count,
          (SELECT COUNT(*) FROM "church_services" WHERE "churchId" = c."id")::int AS service_count
        FROM "churches" c
        ${where}
      )
      SELECT "id", distance_miles FROM church_base
      ${buildOrderBy(params.sort)}
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `),
  ])

  const total = Number(countRows[0]?.count ?? 0)
  const churches =
    idRows.length > 0
      ? await prisma.church.findMany({
          where: { id: { in: idRows.map((row) => row.id) } },
          include: churchSummaryInclude(userId),
        })
      : []
  const byId = new Map(churches.map((church) => [church.id, church]))

  const data = idRows.flatMap((row) => {
    const church = byId.get(row.id)
    if (!church) return []
    const summary = toChurchSummary(church)
    if (row.distance_miles != null) {
      summary.distance = Math.round(Number(row.distance_miles) * 10) / 10
    }
    return [summary]
  })

  return {
    data,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize), center },
  }
}

// Anonymous responses are identical for every signed-out visitor, and the
// default browse page hits the same few parameter combinations repeatedly.
// A short process-local TTL cache serves those from memory.
const ANON_CACHE_TTL_MS = 60 * 1000
const ANON_CACHE_MAX_ENTRIES = 100
const anonymousSearchCache = new Map<string, { payload: ISearchResponse; expiresAt: number }>()

export async function searchChurches(
  params: ISearchParams,
  userId?: string,
): Promise<ISearchResponse> {
  if (userId) return executeSearch(params, userId)

  const key = JSON.stringify(params)
  const cached = anonymousSearchCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.payload

  const payload = await executeSearch(params)
  if (anonymousSearchCache.size >= ANON_CACHE_MAX_ENTRIES) {
    const oldestKey = anonymousSearchCache.keys().next().value
    if (oldestKey !== undefined) anonymousSearchCache.delete(oldestKey)
  }
  anonymousSearchCache.set(key, { payload, expiresAt: Date.now() + ANON_CACHE_TTL_MS })
  return payload
}

// ── Detail ──

export async function getChurchBySlug(slug: string, userId?: string): Promise<IChurch | null> {
  const church = await prisma.church.findFirst({
    where: { slug, isHidden: false },
    include: {
      services: servicesInclude,
      photos: { orderBy: { displayOrder: 'asc' } },
      savedByUsers: savedInclude(userId),
    },
  })
  if (!church) return null

  return {
    ...toChurchSummary(church),
    email: church.email,
    pastorName: church.pastorName,
    yearEstablished: church.yearEstablished,
    googleMapsUrl: church.googleMapsUrl,
    createdAt: church.createdAt,
    updatedAt: church.updatedAt,
  }
}

// ── Filter options ──

const FILTER_OPTIONS_TTL_MS = 5 * 60 * 1000
let filterOptionsCache: { payload: IFilterOptions; expiresAt: number } | null = null

const sortedUnique = (values: Iterable<string>): string[] =>
  [...new Set([...values].map((v) => v.trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b))

export async function getFilterOptions(): Promise<IFilterOptions> {
  if (filterOptionsCache && filterOptionsCache.expiresAt > Date.now()) {
    return filterOptionsCache.payload
  }

  const churches = await prisma.church.findMany({
    where: PUBLIC_CHURCH_WHERE,
    select: { denominationFamily: true, neighborhood: true, languages: true, amenities: true },
  })

  const denominationCounts = new Map<string, number>()
  for (const { denominationFamily } of churches) {
    const value = denominationFamily?.trim()
    if (value) denominationCounts.set(value, (denominationCounts.get(value) ?? 0) + 1)
  }

  const payload: IFilterOptions = {
    denominations: [...denominationCounts]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value)),
    languages: sortedUnique(churches.flatMap((c) => c.languages)),
    amenities: sortedUnique(churches.flatMap((c) => c.amenities)),
    neighborhoods: sortedUnique(churches.flatMap((c) => (c.neighborhood ? [c.neighborhood] : []))),
  }

  filterOptionsCache = { payload, expiresAt: Date.now() + FILTER_OPTIONS_TTL_MS }
  return payload
}

/** Clears the in-process search and filter-option caches. */
export function invalidateChurchCaches(): void {
  filterOptionsCache = null
  anonymousSearchCache.clear()
}
