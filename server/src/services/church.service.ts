/**
 * Church search and filtering service — Prisma + PostGIS edition
 *
 * Uses Prisma for standard queries and $queryRaw with PostGIS
 * for spatial operations (radius search, distance calculation,
 * bounding box filtering).
 */

import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma.js'
import { getViewerClaimForChurch } from './church-claim.service.js'
import {
  IBounds,
  IChurch,
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
//   Service variety       0 –  9 pts
//   Engagement            0 – 25 pts
//   Proximity             0 – 15 pts
//   Freshness             0 –  5 pts
//   ─────────────────────────────
//   Best possible total     119 pts
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
  SERVICE_MAX: 9, // cap on service variety contribution

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
  yearEstablished: number | null
  avgRating: number | string
  reviewCount: number
  isClaimed: boolean
  isSaved: boolean
  languages: string[]
  amenities: string[]
  coverImageUrl: string | null
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

function rowToSummary(row: ChurchRow, services: ServiceRow[]): IChurchSummary {
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
    isClaimed: row.isClaimed,
    isSaved: row.isSaved,
    languages: row.languages || [],
    amenities: row.amenities || [],
    coverImageUrl: row.coverImageUrl ?? undefined,
    distance:
      row.distance_miles != null ? Math.round(toNumber(row.distance_miles) * 10) / 10 : undefined,
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
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE))
  const offset = (page - 1) * pageSize
  const sortBy = params.sort ?? 'relevance'

  // ── Build WHERE conditions ──
  const conditions: Prisma.Sql[] = [Prisma.sql`1=1`]

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

  // Denomination
  if (params.denomination?.trim()) {
    const denom = params.denomination.toLowerCase()
    conditions.push(Prisma.sql`LOWER(c."denominationFamily") = ${denom}`)
  }

  // Language
  if (params.language?.trim()) {
    const lang = params.language
    conditions.push(Prisma.sql`${lang} = ANY(c."languages")`)
  }

  // Amenities (all must match)
  if (params.amenities?.trim()) {
    const amenityList = params.amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean)
    for (const amenity of amenityList) {
      conditions.push(Prisma.sql`${amenity} ILIKE ANY(c."amenities")`)
    }
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

  // ── Combine WHERE ──
  const whereClause = Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`

  // ── ORDER BY ──
  let orderClause: Prisma.Sql
  switch (sortBy) {
    case 'rating':
      orderClause = Prisma.sql`ORDER BY "avgRating" DESC, "reviewCount" DESC`
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

    -- ENGAGEMENT
    + "avgRating"::float * ${RANK_WEIGHTS.RATING_MULTIPLIER}::float
    + LEAST(
        "reviewCount"::float * ${RANK_WEIGHTS.REVIEW_PER_ITEM}::float,
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
        c."reviewCount", c."isClaimed",
        c."languages", c."amenities", c."coverImageUrl",
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

  // ── Build response ──
  const data: IChurchSummary[] = churches.map((row) =>
    rowToSummary(row, servicesByChurch.get(row.id) || []),
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

export async function getChurchBySlug(slug: string, userId?: string): Promise<IChurch | null> {
  const church = await prisma.church.findFirst({
    where: { slug },
    include: { services: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] } },
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

  return {
    ...church,
    latitude: toNumber(church.latitude),
    longitude: toNumber(church.longitude),
    avgRating: toNumber(church.avgRating),
    isSaved: Boolean(savedChurch),
    viewerClaim,
    services: church.services,
  }
}

export async function getChurchById(id: string, userId?: string): Promise<IChurch | null> {
  const church = await prisma.church.findFirst({
    where: { id },
    include: { services: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] } },
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

  return {
    ...church,
    latitude: toNumber(church.latitude),
    longitude: toNumber(church.longitude),
    avgRating: toNumber(church.avgRating),
    isSaved: Boolean(savedChurch),
    viewerClaim,
    services: church.services,
  }
}

// ── Filter option queries ──

export async function getDenominationFamilies(): Promise<string[]> {
  const result = await prisma.church.findMany({
    where: { denominationFamily: { not: null } },
    select: { denominationFamily: true },
    distinct: ['denominationFamily'],
    orderBy: { denominationFamily: 'asc' },
  })
  return result.map((r) => r.denominationFamily!).filter(Boolean)
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
