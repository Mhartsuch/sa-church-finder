/**
 * Church search and filtering service — Prisma + PostGIS edition
 *
 * Uses Prisma for standard queries and $queryRaw with PostGIS
 * for spatial operations (radius search, distance calculation,
 * bounding box filtering).
 */

import { ClaimStatus, Prisma, Role } from '@prisma/client'
import prisma from '../lib/prisma.js'
import { AppError } from '../middleware/error-handler.js'
import { getViewerClaimForChurch } from './church-claim.service.js'
import {
  IBounds,
  IChurch,
  IChurchEnrichment,
  IChurchPhoto,
  IChurchSummary,
  ISearchParams,
  ISearchResponse,
} from '../types/church.types.js'

const DEFAULT_CENTER_LAT = 29.4241
const DEFAULT_CENTER_LNG = -98.4936
const DEFAULT_RADIUS = 10
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const METERS_PER_MILE = 1609.344

// ── Relevance ranking weights ──
//
// Adjust these constants to tune ranking without touching logic.
// All factor scores are additive; the final score determines DESC sort order.
//
// Score budget (approximate):
//   Profile completeness  0 – 55 pts
//   Photo bonus           0 – 10 pts
//   Service variety       0 – 12 pts
//   Engagement            0 – 25 pts
//   Proximity             0 – 15 pts
//   Freshness             0 –  5 pts
//   Accessibility         0 –  3 pts
//   Operational status    0 –  2 pts
//   ─────────────────────────────
//   Best possible total     127 pts
//
// Churches with NO photos receive a -1000 penalty, ensuring they always
// appear below any church that has at least one photo.
const RANK_WEIGHTS = {
  // Hard penalty for missing photos
  NO_PHOTO_PENALTY: -1000,

  // Profile completeness
  DESCRIPTION: 15, // has a meaningful description (≥ 50 chars)
  COVER_IMAGE: 10, // coverImageUrl is set
  PHONE: 5, // phone listed
  EMAIL: 5, // email listed
  WEBSITE: 5, // website listed
  IS_CLAIMED: 5, // church has been claimed/verified
  AMENITY_PER_ITEM: 2, // per amenity in the amenities array
  AMENITY_MAX: 10, // cap on amenity contribution

  // Photo bonus (on top of the no-photo penalty gate)
  PHOTO_PER_ITEM: 2, // per uploaded photo
  PHOTO_MAX: 10, // cap on photo bonus

  // Service variety
  SERVICE_PER_ITEM: 3, // per service time entry
  SERVICE_MAX: 12, // cap on service variety contribution

  // Engagement
  RATING_MULTIPLIER: 4, // avgRating (0–5) × this → 0–20 pts
  REVIEW_PER_ITEM: 0.5, // per review
  REVIEW_MAX: 5, // cap on review-count contribution

  // Proximity — exponential decay: PROXIMITY_MAX / (1 + DECAY × miles)
  PROXIMITY_MAX: 15, // score at 0 miles
  PROXIMITY_DECAY: 0.3, // decay rate per mile (0.3 → ≈ 9 pts at 5 mi, 6 pts at 10 mi)

  // Freshness
  FRESHNESS_30D: 5, // updated within 30 days
  FRESHNESS_90D: 3, // updated within 90 days
  FRESHNESS_365D: 1, // updated within 1 year

  // Accessibility & status
  WHEELCHAIR_ACCESSIBLE: 3, // confirmed wheelchair accessible
  OPERATIONAL_STATUS: 2, // confirmed OPERATIONAL business status
} as const

// ── Raw SQL result types ──

interface ChurchRow {
  id: string
  name: string
  slug: string
  denomination: string | null
  denominationFamily: string | null
  description: string | null
  address: string
  city: string
  state: string
  zipCode: string
  neighborhood: string | null
  latitude: number | string
  longitude: number | string
  phone: string | null
  email: string | null
  website: string | null
  pastorName: string | null
  googleRating: number | string | null
  googleReviewCount: number | null
  yearEstablished: number | null
  avgRating: number | string
  reviewCount: number
  isClaimed: boolean
  isSaved: boolean
  languages: string[]
  amenities: string[]
  coverImageUrl: string | null
  businessStatus: string | null
  goodForChildren: boolean | null
  goodForGroups: boolean | null
  wheelchairAccessible: boolean | null
  distance_miles: number | null
  // Computed by the ranking CTE — not exposed in IChurchSummary
  photo_count: number
  service_count: number
  ranking_score: number
}

interface ServiceRow {
  id: string
  churchId: string
  dayOfWeek: number
  startTime: string
  endTime: string | null
  serviceType: string
  language: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

interface PhotoRow {
  id: string
  churchId: string
  url: string
  altText: string | null
  displayOrder: number
}

interface CountRow {
  count: bigint
}

// ── Helpers ──

function parseBounds(boundsStr: string): IBounds | null {
  try {
    const [swLat, swLng, neLat, neLng] = boundsStr.split(',').map(Number)
    if (isNaN(swLat) || isNaN(swLng) || isNaN(neLat) || isNaN(neLng)) return null
    return { swLat, swLng, neLat, neLng }
  } catch {
    return null
  }
}

function toNumber(val: unknown): number {
  if (typeof val === 'number') return val
  return Number(val) || 0
}

function rowToSummary(
  row: ChurchRow,
  services: ServiceRow[],
  photos?: IChurchPhoto[],
): IChurchSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    denomination: row.denomination ?? undefined,
    denominationFamily: row.denominationFamily ?? undefined,
    description: row.description ?? undefined,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zipCode,
    neighborhood: row.neighborhood ?? undefined,
    latitude: toNumber(row.latitude),
    longitude: toNumber(row.longitude),
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    avgRating: toNumber(row.avgRating),
    reviewCount: row.reviewCount,
    googleRating: row.googleRating != null ? toNumber(row.googleRating) : undefined,
    googleReviewCount: row.googleReviewCount ?? undefined,
    isClaimed: row.isClaimed,
    isSaved: row.isSaved,
    languages: row.languages || [],
    amenities: row.amenities || [],
    coverImageUrl: row.coverImageUrl ?? undefined,
    businessStatus: row.businessStatus ?? undefined,
    goodForChildren: row.goodForChildren ?? undefined,
    goodForGroups: row.goodForGroups ?? undefined,
    wheelchairAccessible: row.wheelchairAccessible ?? undefined,
    distance:
      row.distance_miles != null ? Math.round(toNumber(row.distance_miles) * 10) / 10 : undefined,
    photos,
    services: services.map((s) => ({
      id: s.id,
      churchId: s.churchId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime ?? undefined,
      serviceType: s.serviceType,
      language: s.language,
      description: s.description ?? undefined,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    })),
  }
}

// ── Time categorisation for service time filtering ──

function getTimeCategoryFilter(time: string): [string, string] {
  switch (time.toLowerCase()) {
    case 'morning':
      return ['00:00', '12:00']
    case 'afternoon':
      return ['12:00', '17:00']
    case 'evening':
      return ['17:00', '23:59']
    default:
      return ['00:00', '23:59']
  }
}

// ── Main search ──

export async function searchChurches(
  params: ISearchParams,
  userId?: string,
): Promise<ISearchResponse> {
  const centerLat = params.lat ?? DEFAULT_CENTER_LAT
  const centerLng = params.lng ?? DEFAULT_CENTER_LNG
  const radius = params.radius ?? DEFAULT_RADIUS
  const page = Math.max(1, params.page ?? DEFAULT_PAGE)
  // pageSize is clamped to 50 to match the documented API contract. Callers
  // that used to request up to 100 rows per page will quietly receive 50 —
  // the Zod schema also rejects values > 50 at the edge so this is a
  // belt-and-braces safeguard.
  const pageSize = Math.min(50, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE))
  const offset = (page - 1) * pageSize
  const sortBy = params.sort ?? 'relevance'

  // ── Build WHERE conditions ──
  const conditions: Prisma.Sql[] = [Prisma.sql`1=1`]

  // Exclude permanently closed churches
  conditions.push(
    Prisma.sql`(c."businessStatus" IS NULL OR c."businessStatus" != 'CLOSED_PERMANENTLY')`,
  )

  // Spatial filter: bounds or radius
  if (params.bounds) {
    const bounds = parseBounds(params.bounds)
    if (bounds) {
      conditions.push(Prisma.sql`c."latitude" >= ${bounds.swLat}`)
      conditions.push(Prisma.sql`c."latitude" <= ${bounds.neLat}`)
      conditions.push(Prisma.sql`c."longitude" >= ${bounds.swLng}`)
      conditions.push(Prisma.sql`c."longitude" <= ${bounds.neLng}`)
    }
  } else {
    const radiusMeters = radius * METERS_PER_MILE
    conditions.push(Prisma.sql`ST_DWithin(
      c."location",
      ST_SetSRID(ST_MakePoint(${centerLng}, ${centerLat}), 4326)::geography,
      ${radiusMeters}
    )`)
  }

  // Text search — covers name, description, amenities, and service types
  if (params.q?.trim()) {
    const term = `%${params.q.trim().toLowerCase()}%`
    conditions.push(Prisma.sql`(
      LOWER(c."name") LIKE ${term}
      OR LOWER(COALESCE(c."description", '')) LIKE ${term}
      OR EXISTS (
        SELECT 1 FROM unnest(c."amenities") AS amenity
        WHERE LOWER(amenity) LIKE ${term}
      )
      OR EXISTS (
        SELECT 1 FROM "church_services" cs
        WHERE cs."churchId" = c."id"
          AND LOWER(cs."serviceType") LIKE ${term}
      )
    )`)
  }

  // Denomination — accepts a single value or a comma-separated list. Multiple
  // values are OR-combined so "Baptist,Methodist" matches any church in
  // either family. Matching is case-insensitive. Single-value callers
  // (`?denomination=Baptist`) go through the same path as a one-element list,
  // so legacy behaviour is preserved.
  if (params.denomination?.trim()) {
    const denominationList = params.denomination
      .split(',')
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
    if (denominationList.length > 0) {
      conditions.push(Prisma.sql`LOWER(c."denominationFamily") = ANY(${denominationList}::text[])`)
    }
  }

  // Language — accepts a single value or a comma-separated list. Multiple
  // values are OR-combined so "English,Spanish" matches any church that holds
  // services in at least one of them. Matching is case-insensitive.
  if (params.language?.trim()) {
    const languageList = params.language
      .split(',')
      .map((l) => l.trim().toLowerCase())
      .filter(Boolean)
    if (languageList.length > 0) {
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM unnest(c."languages") AS lang
        WHERE LOWER(lang) = ANY(${languageList}::text[])
      )`)
    }
  }

  // Amenities (all must match). Matching is case-insensitive and exact —
  // earlier code used `ILIKE ANY(c."amenities")` which treats array elements
  // as LIKE patterns and allowed spurious wildcard behaviour.
  if (params.amenities?.trim()) {
    const amenityList = params.amenities
      .split(',')
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean)
    for (const amenity of amenityList) {
      conditions.push(Prisma.sql`EXISTS (
        SELECT 1 FROM unnest(c."amenities") AS amenity
        WHERE LOWER(amenity) = ${amenity}
      )`)
    }
  }

  // Accessibility & community boolean flags — only applied when the caller
  // explicitly passes `true`. A NULL value on the church row means "unknown"
  // and should NOT satisfy the filter, so we compare to `true` directly.
  if (params.wheelchairAccessible === true) {
    conditions.push(Prisma.sql`c."wheelchairAccessible" = true`)
  }
  if (params.goodForChildren === true) {
    conditions.push(Prisma.sql`c."goodForChildren" = true`)
  }
  if (params.goodForGroups === true) {
    conditions.push(Prisma.sql`c."goodForGroups" = true`)
  }

  // Quality / trust filters
  if (params.hasPhotos === true) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "church_photos" cp WHERE cp."churchId" = c."id"
    )`)
  }
  if (params.isClaimed === true) {
    conditions.push(Prisma.sql`c."isClaimed" = true`)
  }

  // Minimum effective rating. "Effective" means local avgRating when the
  // church has any reviews, otherwise the Google-imported rating. Churches
  // with no reviews on either side are excluded by the floor, which matches
  // how the ranking score treats them.
  if (typeof params.minRating === 'number' && params.minRating > 0) {
    conditions.push(Prisma.sql`(
      CASE WHEN c."reviewCount" > 0 THEN c."avgRating" ELSE COALESCE(c."googleRating", 0) END
    ) >= ${params.minRating}`)
  }

  // Neighborhood — case-insensitive exact match
  if (params.neighborhood?.trim()) {
    const neighborhood = params.neighborhood.trim().toLowerCase()
    conditions.push(Prisma.sql`LOWER(c."neighborhood") = ${neighborhood}`)
  }

  // Service type — any service on this church matches (case-insensitive)
  if (params.serviceType?.trim()) {
    const serviceType = params.serviceType.trim().toLowerCase()
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "church_services" cs
      WHERE cs."churchId" = c."id"
        AND LOWER(cs."serviceType") = ${serviceType}
    )`)
  }

  // Service day filter — requires a subquery
  if (typeof params.day === 'number' && params.day >= 0 && params.day <= 6) {
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "church_services" cs WHERE cs."churchId" = c."id" AND cs."dayOfWeek" = ${params.day}
    )`)
  }

  // Service time filter
  if (params.time?.trim()) {
    const [startRange, endRange] = getTimeCategoryFilter(params.time)
    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "church_services" cs
      WHERE cs."churchId" = c."id"
        AND cs."startTime" >= ${startRange}
        AND cs."startTime" < ${endRange}
    )`)
  }

  // "Open now" — match churches with a service happening at the current
  // day-of-week and time in America/Chicago (San Antonio's timezone).
  if (params.openNow === true) {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }))
    const currentDay = now.getDay() // 0=Sunday
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    conditions.push(Prisma.sql`EXISTS (
      SELECT 1 FROM "church_services" cs
      WHERE cs."churchId" = c."id"
        AND cs."dayOfWeek" = ${currentDay}
        AND cs."startTime" <= ${currentTime}
        AND (cs."endTime" IS NOT NULL AND cs."endTime" > ${currentTime})
    )`)
  }

  // ── Combine WHERE ──
  const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`

  // ── ORDER BY ──
  let orderClause: Prisma.Sql
  switch (sortBy) {
    case 'rating':
      // Bayesian weighted rating: (R × N + C × M) / (N + M)
      // R = effective rating, N = effective review count, C = prior (3.5), M = weight (10)
      // Churches with no rating data sort last; among rated churches,
      // a 5.0 from 1 review scores ~3.65, while 4.8 from 200 scores ~4.74
      orderClause = Prisma.sql`ORDER BY
        CASE WHEN GREATEST("reviewCount", COALESCE("googleReviewCount", 0)) = 0
             AND COALESCE("googleRating", 0) = 0
          THEN 0 ELSE 1 END DESC,
        (
          (CASE WHEN "reviewCount" > 0 THEN "avgRating" ELSE COALESCE("googleRating", 0) END)
          * GREATEST("reviewCount", COALESCE("googleReviewCount", 0))
          + 3.5 * 10
        ) / (GREATEST("reviewCount", COALESCE("googleReviewCount", 0)) + 10) DESC`
      break
    case 'name':
      orderClause = Prisma.sql`ORDER BY "name" ASC`
      break
    case 'distance':
      orderClause = Prisma.sql`ORDER BY distance_miles ASC NULLS LAST`
      break
    case 'relevance':
    default:
      orderClause = Prisma.sql`ORDER BY ranking_score DESC`
      break
  }

  const isSavedSelect = userId
    ? Prisma.sql`EXISTS (
        SELECT 1
        FROM "user_saved_churches" usc
        WHERE usc."churchId" = c."id"
          AND usc."userId" = ${userId}
      )`
    : Prisma.sql`FALSE`

  // ── Distance expression (computed once in CTE, reused by ranking score) ──
  const distanceExpr = Prisma.sql`
    CASE
      WHEN c."location" IS NOT NULL THEN
        ST_Distance(
          c."location",
          ST_SetSRID(ST_MakePoint(${centerLng}, ${centerLat}), 4326)::geography
        ) / ${METERS_PER_MILE}
      ELSE NULL
    END
  `

  // ── Ranking score expression ──
  // References CTE columns: photo_count, service_count, distance_miles.
  // All weight values are parameterised — adjust RANK_WEIGHTS at the top of this
  // file to tune ranking without touching this SQL.
  const rankingScoreExpr = Prisma.sql`
    -- PHOTO PENALTY: churches with no photos are always ranked below those that have them
    CASE WHEN photo_count = 0 THEN ${RANK_WEIGHTS.NO_PHOTO_PENALTY}::float ELSE 0 END

    -- PROFILE COMPLETENESS
    + CASE WHEN "description" IS NOT NULL AND LENGTH("description") >= 50
        THEN ${RANK_WEIGHTS.DESCRIPTION}::float ELSE 0 END
    + CASE WHEN "coverImageUrl" IS NOT NULL THEN ${RANK_WEIGHTS.COVER_IMAGE}::float ELSE 0 END
    + CASE WHEN "phone" IS NOT NULL THEN ${RANK_WEIGHTS.PHONE}::float ELSE 0 END
    + CASE WHEN "email" IS NOT NULL THEN ${RANK_WEIGHTS.EMAIL}::float ELSE 0 END
    + CASE WHEN "website" IS NOT NULL THEN ${RANK_WEIGHTS.WEBSITE}::float ELSE 0 END
    + CASE WHEN "isClaimed" THEN ${RANK_WEIGHTS.IS_CLAIMED}::float ELSE 0 END
    + LEAST(
        COALESCE(array_length("amenities", 1), 0)::float * ${RANK_WEIGHTS.AMENITY_PER_ITEM}::float,
        ${RANK_WEIGHTS.AMENITY_MAX}::float
      )

    -- PHOTO BONUS (additional credit for more photos)
    + LEAST(
        photo_count::float * ${RANK_WEIGHTS.PHOTO_PER_ITEM}::float,
        ${RANK_WEIGHTS.PHOTO_MAX}::float
      )

    -- SERVICE VARIETY
    + LEAST(
        service_count::float * ${RANK_WEIGHTS.SERVICE_PER_ITEM}::float,
        ${RANK_WEIGHTS.SERVICE_MAX}::float
      )

    -- ENGAGEMENT (use local avg when reviews exist, else fall back to Google rating)
    + CASE WHEN "reviewCount" > 0 THEN "avgRating" ELSE COALESCE("googleRating", 0) END::float
        * ${RANK_WEIGHTS.RATING_MULTIPLIER}::float
    + LEAST(
        GREATEST("reviewCount", COALESCE("googleReviewCount", 0))::float * ${RANK_WEIGHTS.REVIEW_PER_ITEM}::float,
        ${RANK_WEIGHTS.REVIEW_MAX}::float
      )

    -- PROXIMITY (exponential decay: max / (1 + decay × miles))
    + CASE WHEN distance_miles IS NOT NULL
        THEN ${RANK_WEIGHTS.PROXIMITY_MAX}::float / (1.0 + ${RANK_WEIGHTS.PROXIMITY_DECAY}::float * distance_miles)
        ELSE 0
      END

    -- FRESHNESS
    + CASE
        WHEN "updatedAt" > NOW() - INTERVAL '30 days'  THEN ${RANK_WEIGHTS.FRESHNESS_30D}::float
        WHEN "updatedAt" > NOW() - INTERVAL '90 days'  THEN ${RANK_WEIGHTS.FRESHNESS_90D}::float
        WHEN "updatedAt" > NOW() - INTERVAL '365 days' THEN ${RANK_WEIGHTS.FRESHNESS_365D}::float
        ELSE 0
      END

    -- ACCESSIBILITY
    + CASE WHEN "wheelchairAccessible" = true THEN ${RANK_WEIGHTS.WHEELCHAIR_ACCESSIBLE}::float ELSE 0 END

    -- OPERATIONAL STATUS
    + CASE WHEN "businessStatus" = 'OPERATIONAL' THEN ${RANK_WEIGHTS.OPERATIONAL_STATUS}::float ELSE 0 END
  `

  // ── Count query ──
  const countResult = await prisma.$queryRaw<CountRow[]>(Prisma.sql`
    SELECT COUNT(DISTINCT c."id") as count
    FROM "churches" c
    ${whereClause}
  `)
  const total = Number(countResult[0]?.count ?? 0)

  // ── Main query — CTE computes derived columns, outer SELECT adds ranking score ──
  //
  // Structure:
  //   church_base CTE  → fetches all matching churches with distance, photo_count,
  //                       service_count, and isSaved precomputed.
  //   Outer SELECT     → adds ranking_score using the CTE columns, then orders and
  //                       paginates.
  //
  // This single CTE pass means each subquery (photo count, service count) runs
  // once per church rather than being duplicated in both SELECT and ORDER BY.
  const churches = await prisma.$queryRaw<ChurchRow[]>(Prisma.sql`
    WITH church_base AS (
      SELECT
        c."id", c."name", c."slug",
        c."denomination", c."denominationFamily", c."description",
        c."address", c."city", c."state", c."zipCode", c."neighborhood",
        c."latitude"::float8  AS "latitude",
        c."longitude"::float8 AS "longitude",
        c."phone", c."email", c."website",
        c."pastorName", c."yearEstablished",
        c."avgRating"::float8 AS "avgRating",
        c."reviewCount",
        c."googleRating"::float8 AS "googleRating",
        c."googleReviewCount",
        c."isClaimed",
        c."languages", c."amenities", c."coverImageUrl",
        c."businessStatus", c."goodForChildren", c."goodForGroups", c."wheelchairAccessible",
        c."updatedAt",
        ${isSavedSelect} AS "isSaved",
        ${distanceExpr} AS distance_miles,
        (SELECT COUNT(*) FROM "church_photos"   WHERE "churchId" = c."id")::int AS photo_count,
        (SELECT COUNT(*) FROM "church_services" WHERE "churchId" = c."id")::int AS service_count
      FROM "churches" c
      ${whereClause}
    )
    SELECT
      *,
      (${rankingScoreExpr}) AS ranking_score
    FROM church_base
    ${orderClause}
    LIMIT ${pageSize} OFFSET ${offset}
  `)

  // ── Fetch services for the returned churches ──
  const churchIds = churches.map((c) => c.id)
  let services: ServiceRow[] = []

  if (churchIds.length > 0) {
    services = await prisma.$queryRaw<ServiceRow[]>(Prisma.sql`
      SELECT * FROM "church_services"
      WHERE "churchId" IN (${Prisma.join(churchIds)})
      ORDER BY "dayOfWeek" ASC, "startTime" ASC
    `)
  }

  // Group services by churchId
  const servicesByChurch = new Map<string, ServiceRow[]>()
  for (const s of services) {
    const list = servicesByChurch.get(s.churchId) || []
    list.push(s)
    servicesByChurch.set(s.churchId, list)
  }

  // ── Fetch photos for the returned churches (first 5 per church) ──
  let photoRows: PhotoRow[] = []
  if (churchIds.length > 0) {
    photoRows = await prisma.$queryRaw<PhotoRow[]>(Prisma.sql`
      SELECT "id", "churchId", "url", "altText", "displayOrder"
      FROM "church_photos"
      WHERE "churchId" IN (${Prisma.join(churchIds)})
      ORDER BY "displayOrder" ASC
    `)
  }

  const MAX_CARD_PHOTOS = 5
  const photosByChurch = new Map<string, IChurchPhoto[]>()
  for (const p of photoRows) {
    const list = photosByChurch.get(p.churchId) || []
    if (list.length < MAX_CARD_PHOTOS) {
      list.push({ id: p.id, url: p.url, altText: p.altText, displayOrder: p.displayOrder })
      photosByChurch.set(p.churchId, list)
    }
  }

  // ── Build response ──
  const data: IChurchSummary[] = churches.map((row) =>
    rowToSummary(row, servicesByChurch.get(row.id) || [], photosByChurch.get(row.id)),
  )

  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      center: { lat: centerLat, lng: centerLng },
    },
  }
}

// ── Single church lookups ──

const ENRICHMENT_STRING_MAX = 280
const ENRICHMENT_ARRAY_MAX = 20
const ALLOWED_SERVICE_STYLES = new Set(['Traditional', 'Contemporary', 'Blended', 'Liturgical'])

function sanitizeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return parsed.toString()
  } catch {
    return null
  }
}

function sanitizeTextField(value: unknown, max = ENRICHMENT_STRING_MAX): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.length > max ? `${trimmed.slice(0, max).trimEnd()}…` : trimmed
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const entry of value) {
    if (typeof entry !== 'string') continue
    const trimmed = entry.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(trimmed)
    if (out.length >= ENRICHMENT_ARRAY_MAX) break
  }
  return out
}

/**
 * Normalize the raw JSON snapshot stored on `enrichment_states.extractedData`
 * into the presentational shape exposed to the frontend. Drops any data that
 * fails validation (URLs must be HTTP/HTTPS, strings are trimmed and capped,
 * arrays are deduped) and returns null when no surfaceable fields survive.
 */
export function toChurchEnrichment(data: unknown, updatedAt: Date): IChurchEnrichment | null {
  if (!data || typeof data !== 'object') return null
  const snapshot = data as Record<string, unknown>

  const rawSocial =
    snapshot.socialLinks && typeof snapshot.socialLinks === 'object'
      ? (snapshot.socialLinks as Record<string, unknown>)
      : {}

  const serviceStyleRaw = sanitizeTextField(snapshot.serviceStyle, 40)
  const serviceStyle =
    serviceStyleRaw && ALLOWED_SERVICE_STYLES.has(serviceStyleRaw) ? serviceStyleRaw : null

  const enrichment: IChurchEnrichment = {
    ministries: sanitizeStringArray(snapshot.ministries),
    affiliations: sanitizeStringArray(snapshot.affiliations),
    serviceStyle,
    sermonUrl: sanitizeHttpUrl(snapshot.sermonUrl),
    livestreamUrl: sanitizeHttpUrl(snapshot.livestreamUrl),
    statementOfFaithUrl: sanitizeHttpUrl(snapshot.statementOfFaithUrl),
    givingUrl: sanitizeHttpUrl(snapshot.givingUrl),
    newVisitorUrl: sanitizeHttpUrl(snapshot.newVisitorUrl),
    parkingInfo: sanitizeTextField(snapshot.parkingInfo),
    dressCode: sanitizeTextField(snapshot.dressCode, 80),
    socialLinks: {
      facebook: sanitizeHttpUrl(rawSocial.facebook),
      instagram: sanitizeHttpUrl(rawSocial.instagram),
      twitter: sanitizeHttpUrl(rawSocial.twitter),
      youtube: sanitizeHttpUrl(rawSocial.youtube),
    },
    updatedAt,
  }

  const hasAny =
    enrichment.ministries.length > 0 ||
    enrichment.affiliations.length > 0 ||
    Boolean(enrichment.serviceStyle) ||
    Boolean(enrichment.sermonUrl) ||
    Boolean(enrichment.livestreamUrl) ||
    Boolean(enrichment.statementOfFaithUrl) ||
    Boolean(enrichment.givingUrl) ||
    Boolean(enrichment.newVisitorUrl) ||
    Boolean(enrichment.parkingInfo) ||
    Boolean(enrichment.dressCode) ||
    Boolean(enrichment.socialLinks.facebook) ||
    Boolean(enrichment.socialLinks.instagram) ||
    Boolean(enrichment.socialLinks.twitter) ||
    Boolean(enrichment.socialLinks.youtube)

  return hasAny ? enrichment : null
}

export async function getChurchBySlug(slug: string, userId?: string): Promise<IChurch | null> {
  const church = await prisma.church.findFirst({
    where: { slug },
    include: {
      services: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
      photos: { orderBy: { displayOrder: 'asc' } },
      enrichmentState: true,
    },
  })
  if (!church) return null

  const savedChurch = userId
    ? await prisma.userSavedChurch.findUnique({
        where: {
          userId_churchId: {
            userId,
            churchId: church.id,
          },
        },
        select: {
          churchId: true,
        },
      })
    : null
  const viewerClaim = userId ? await getViewerClaimForChurch(church.id, userId) : null

  const photos: IChurchPhoto[] = church.photos.map((p) => ({
    id: p.id,
    url: p.url,
    altText: p.altText,
    displayOrder: p.displayOrder,
  }))

  const enrichment =
    church.enrichmentState && church.enrichmentState.status === 'applied'
      ? toChurchEnrichment(church.enrichmentState.extractedData, church.enrichmentState.updatedAt)
      : null

  const { enrichmentState: _unused, ...churchRest } = church
  void _unused

  return {
    ...churchRest,
    latitude: toNumber(church.latitude),
    longitude: toNumber(church.longitude),
    avgRating: toNumber(church.avgRating),
    googleRating: church.googleRating != null ? toNumber(church.googleRating) : null,
    googleReviewCount: church.googleReviewCount ?? null,
    isSaved: Boolean(savedChurch),
    viewerClaim,
    enrichment,
    services: church.services,
    photos,
  }
}

export async function getChurchById(id: string, userId?: string): Promise<IChurch | null> {
  const church = await prisma.church.findFirst({
    where: { id },
    include: {
      services: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
      photos: { orderBy: { displayOrder: 'asc' } },
      enrichmentState: true,
    },
  })
  if (!church) return null

  const savedChurch = userId
    ? await prisma.userSavedChurch.findUnique({
        where: {
          userId_churchId: {
            userId,
            churchId: church.id,
          },
        },
        select: {
          churchId: true,
        },
      })
    : null
  const viewerClaim = userId ? await getViewerClaimForChurch(church.id, userId) : null

  const photos: IChurchPhoto[] = church.photos.map((p) => ({
    id: p.id,
    url: p.url,
    altText: p.altText,
    displayOrder: p.displayOrder,
  }))

  const enrichment =
    church.enrichmentState && church.enrichmentState.status === 'applied'
      ? toChurchEnrichment(church.enrichmentState.extractedData, church.enrichmentState.updatedAt)
      : null

  const { enrichmentState: _unused, ...churchRest } = church
  void _unused

  return {
    ...churchRest,
    latitude: toNumber(church.latitude),
    longitude: toNumber(church.longitude),
    avgRating: toNumber(church.avgRating),
    googleRating: church.googleRating != null ? toNumber(church.googleRating) : null,
    googleReviewCount: church.googleReviewCount ?? null,
    isSaved: Boolean(savedChurch),
    viewerClaim,
    enrichment,
    services: church.services,
    photos,
  }
}

// ── Filter option queries ──

export interface IDenominationOption {
  value: string
  count: number
}

export interface IFilterOptionsPayload {
  denominations: IDenominationOption[]
  languages: string[]
  amenities: string[]
  neighborhoods: string[]
  serviceTypes: string[]
}

/**
 * Returns every denomination family that has at least one operational
 * church, paired with the count of churches in that family. Results are
 * sorted by count descending, then alphabetical as a tiebreaker, so the
 * UI can pin the most common traditions first.
 *
 * Closed-permanently churches are excluded from the counts to match the
 * list-view behaviour in `searchChurches` — a user who selects
 * "Baptist · 42" should get 42 results, not 38.
 */
export async function getAvailableDenominations(): Promise<IDenominationOption[]> {
  const rows = await prisma.church.groupBy({
    by: ['denominationFamily'],
    where: {
      denominationFamily: { not: null },
      businessStatus: { not: 'CLOSED_PERMANENTLY' },
    },
    _count: { _all: true },
  })

  return rows
    .map((row) => ({
      value: row.denominationFamily ?? '',
      count: row._count._all,
    }))
    .filter((row) => row.value.trim().length > 0)
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

export async function getAvailableLanguages(): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ lang: string }>>`
    SELECT DISTINCT unnest("languages") as lang FROM "churches" ORDER BY lang
  `
  return rows.map((r) => r.lang)
}

export async function getAvailableAmenities(): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ amenity: string }>>`
    SELECT DISTINCT unnest("amenities") as amenity FROM "churches" ORDER BY amenity
  `
  return rows.map((r) => r.amenity)
}

export async function getAvailableNeighborhoods(): Promise<string[]> {
  const result = await prisma.church.findMany({
    where: {
      neighborhood: { not: null },
      businessStatus: { not: 'CLOSED_PERMANENTLY' },
    },
    select: { neighborhood: true },
    distinct: ['neighborhood'],
    orderBy: { neighborhood: 'asc' },
  })
  return result
    .map((r) => r.neighborhood!)
    .filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
}

export async function getAvailableServiceTypes(): Promise<string[]> {
  // Service types come from the denormalised `church_services` table, so use
  // a raw DISTINCT query rather than Prisma's distinct-on (which would need a
  // compound key). Results are deduped case-insensitively so "Traditional"
  // and "traditional" collapse to a single option.
  const rows = await prisma.$queryRaw<Array<{ service_type: string }>>`
    SELECT DISTINCT ON (LOWER("serviceType")) "serviceType" AS service_type
    FROM "church_services"
    WHERE "serviceType" IS NOT NULL AND "serviceType" <> ''
    ORDER BY LOWER("serviceType") ASC
  `
  return rows.map((r) => r.service_type)
}

// ── Filter options cache ──
//
// `/api/v1/churches/filter-options` runs five independent DISTINCT queries on
// every call. The underlying data only changes when a church is added, edited,
// or removed, so a short in-process TTL cache cuts the per-request cost to
// zero for the common case (the search page load) without risking meaningfully
// stale chips. 5 minutes matches the TTL the frontend React Query layer
// already applies via `FILTER_OPTIONS_STALE_TIME`, so the two layers line up.
//
// The cache is intentionally process-local (single Node instance) — we don't
// need Redis for this. If the API ever runs multi-instance, each instance
// gets its own copy and they expire independently, which is fine for
// read-only filter options.
const FILTER_OPTIONS_CACHE_TTL_MS = 5 * 60 * 1000

let filterOptionsCache: { payload: IFilterOptionsPayload; expiresAt: number } | null = null

/**
 * Returns the full filter-options payload used by the search page's filter
 * panel. Cached for 5 minutes to avoid running five DISTINCT queries on every
 * page load. Call `invalidateFilterOptionsCache()` after any mutation that
 * could change the distinct set (church create/update/delete, service edits,
 * etc.) if you want the next request to recompute immediately.
 */
export async function getFilterOptions(): Promise<IFilterOptionsPayload> {
  const now = Date.now()

  if (filterOptionsCache && filterOptionsCache.expiresAt > now) {
    return filterOptionsCache.payload
  }

  const [denominations, languages, amenities, neighborhoods, serviceTypes] = await Promise.all([
    getAvailableDenominations(),
    getAvailableLanguages(),
    getAvailableAmenities(),
    getAvailableNeighborhoods(),
    getAvailableServiceTypes(),
  ])

  const payload: IFilterOptionsPayload = {
    denominations,
    languages,
    amenities,
    neighborhoods,
    serviceTypes,
  }

  filterOptionsCache = {
    payload,
    expiresAt: now + FILTER_OPTIONS_CACHE_TTL_MS,
  }

  return payload
}

/**
 * Clears the in-process filter-options cache. Test suites call this between
 * cases so stale fixtures don't leak across `it()` blocks; production code
 * calls it from mutation paths that could change the distinct sets.
 */
export function invalidateFilterOptionsCache(): void {
  filterOptionsCache = null
}

// ── Church update ──

export interface IUpdateChurchInput {
  description?: string | null
  phone?: string | null
  email?: string | null
  website?: string | null
  pastorName?: string | null
  yearEstablished?: number | null
  languages?: string[]
  amenities?: string[]
  goodForChildren?: boolean | null
  goodForGroups?: boolean | null
  wheelchairAccessible?: boolean | null
}

/**
 * Authorizes that the given user can manage the given church. Site admins
 * can manage any church; church admins can manage churches they have an
 * approved claim for (supports multiple admins per church).
 */
const authorizeChurchManager = async (userId: string, churchId: string): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  })

  if (!user) {
    throw new AppError(401, 'AUTH_ERROR', 'Not authenticated')
  }

  if (user.role === Role.SITE_ADMIN) {
    return
  }

  if (user.role === Role.CHURCH_ADMIN) {
    const approvedClaim = await prisma.churchClaim.findFirst({
      where: {
        churchId,
        userId,
        status: ClaimStatus.APPROVED,
      },
      select: { id: true },
    })

    if (approvedClaim) {
      return
    }
  }

  throw new AppError(403, 'FORBIDDEN', 'You do not have permission to edit this church')
}

/**
 * Update editable fields on a church listing. Only the fields present in the
 * input are changed — omitted keys are left untouched (PATCH semantics).
 *
 * After a successful update the filter-options cache is invalidated so the
 * search page picks up any new languages, amenities, etc.
 */
export async function updateChurch(
  userId: string,
  churchId: string,
  input: IUpdateChurchInput,
): Promise<IChurch> {
  await authorizeChurchManager(userId, churchId)

  const data: Prisma.ChurchUpdateInput = {}

  if (input.description !== undefined) {
    data.description = input.description?.trim() || null
  }
  if (input.phone !== undefined) {
    data.phone = input.phone?.trim() || null
  }
  if (input.email !== undefined) {
    data.email = input.email?.trim() || null
  }
  if (input.website !== undefined) {
    data.website = input.website?.trim() || null
  }
  if (input.pastorName !== undefined) {
    data.pastorName = input.pastorName?.trim() || null
  }
  if (input.yearEstablished !== undefined) {
    data.yearEstablished = input.yearEstablished
  }
  if (input.languages !== undefined) {
    data.languages = input.languages
  }
  if (input.amenities !== undefined) {
    data.amenities = input.amenities
  }
  if (input.goodForChildren !== undefined) {
    data.goodForChildren = input.goodForChildren
  }
  if (input.goodForGroups !== undefined) {
    data.goodForGroups = input.goodForGroups
  }
  if (input.wheelchairAccessible !== undefined) {
    data.wheelchairAccessible = input.wheelchairAccessible
  }

  const church = await prisma.church.update({
    where: { id: churchId },
    data,
    include: {
      services: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] },
      photos: { orderBy: { displayOrder: 'asc' } },
    },
  })

  // Invalidate filter-options cache so new languages/amenities show up
  invalidateFilterOptionsCache()

  const savedChurch = await prisma.userSavedChurch.findUnique({
    where: {
      userId_churchId: {
        userId,
        churchId: church.id,
      },
    },
    select: { churchId: true },
  })

  const viewerClaim = await getViewerClaimForChurch(church.id, userId)

  const photos: IChurchPhoto[] = church.photos.map((p) => ({
    id: p.id,
    url: p.url,
    altText: p.altText,
    displayOrder: p.displayOrder,
  }))

  return {
    ...church,
    latitude: toNumber(church.latitude),
    longitude: toNumber(church.longitude),
    avgRating: toNumber(church.avgRating),
    googleRating: church.googleRating != null ? toNumber(church.googleRating) : null,
    googleReviewCount: church.googleReviewCount ?? null,
    isSaved: Boolean(savedChurch),
    viewerClaim,
    services: church.services,
    photos,
  }
}
