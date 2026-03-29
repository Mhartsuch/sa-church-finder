/**
 * Church search and filtering service — Prisma + PostGIS edition
 *
 * Uses Prisma for standard queries and $queryRaw with PostGIS
 * for spatial operations (radius search, distance calculation,
 * bounding box filtering).
 */

import { Prisma } from '@prisma/client'
import prisma from '../lib/prisma.js'
import { IBounds, IChurch, IChurchSummary, ISearchParams, ISearchResponse } from '../types/church.types.js'

const DEFAULT_CENTER_LAT = 29.4241
const DEFAULT_CENTER_LNG = -98.4936
const DEFAULT_RADIUS = 10
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const METERS_PER_MILE = 1609.344

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
  languages: string[]
  amenities: string[]
  coverImageUrl: string | null
  distance_miles: number | null
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
    languages: row.languages || [],
    amenities: row.amenities || [],
    coverImageUrl: row.coverImageUrl ?? undefined,
    distance: row.distance_miles != null ? Math.round(toNumber(row.distance_miles) * 10) / 10 : undefined,
    services: services.map(s => ({
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
    case 'morning': return ['00:00', '12:00']
    case 'afternoon': return ['12:00', '17:00']
    case 'evening': return ['17:00', '23:59']
    default: return ['00:00', '23:59']
  }
}

// ── Main search ──

export async function searchChurches(params: ISearchParams): Promise<ISearchResponse> {
  const centerLat = params.lat ?? DEFAULT_CENTER_LAT
  const centerLng = params.lng ?? DEFAULT_CENTER_LNG
  const radius = params.radius ?? DEFAULT_RADIUS
  const page = Math.max(1, params.page ?? DEFAULT_PAGE)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE))
  const offset = (page - 1) * pageSize
  const sortBy = params.sort ?? 'distance'

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

  // Text search
  if (params.q?.trim()) {
    const term = `%${params.q.trim().toLowerCase()}%`
    conditions.push(Prisma.sql`(LOWER(c."name") LIKE ${term} OR LOWER(COALESCE(c."description", '')) LIKE ${term})`)
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
    const amenityList = params.amenities.split(',').map(a => a.trim()).filter(Boolean)
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
      orderClause = Prisma.sql`ORDER BY c."avgRating" DESC, c."reviewCount" DESC`
      break
    case 'name':
      orderClause = Prisma.sql`ORDER BY c."name" ASC`
      break
    case 'distance':
    default:
      orderClause = Prisma.sql`ORDER BY distance_miles ASC NULLS LAST`
      break
  }

  // ── Count query ──
  const countResult = await prisma.$queryRaw<CountRow[]>(Prisma.sql`
    SELECT COUNT(DISTINCT c."id") as count
    FROM "churches" c
    ${whereClause}
  `)
  const total = Number(countResult[0]?.count ?? 0)

  // ── Main query with distance ──
  const churches = await prisma.$queryRaw<ChurchRow[]>(Prisma.sql`
    SELECT
      c."id", c."name", c."slug",
      c."denomination", c."denominationFamily", c."description",
      c."address", c."city", c."state", c."zipCode", c."neighborhood",
      c."latitude"::float8 as "latitude",
      c."longitude"::float8 as "longitude",
      c."phone", c."email", c."website",
      c."pastorName", c."yearEstablished",
      c."avgRating"::float8 as "avgRating",
      c."reviewCount", c."isClaimed",
      c."languages", c."amenities", c."coverImageUrl",
      CASE
        WHEN c."location" IS NOT NULL THEN
          ST_Distance(
            c."location",
            ST_SetSRID(ST_MakePoint(${centerLng}, ${centerLat}), 4326)::geography
          ) / ${METERS_PER_MILE}
        ELSE NULL
      END as "distance_miles"
    FROM "churches" c
    ${whereClause}
    ${orderClause}
    LIMIT ${pageSize} OFFSET ${offset}
  `)

  // ── Fetch services for the returned churches ──
  const churchIds = churches.map(c => c.id)
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
  const data: IChurchSummary[] = churches.map(row =>
    rowToSummary(row, servicesByChurch.get(row.id) || [])
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

export async function getChurchBySlug(slug: string): Promise<IChurch | null> {
  const church = await prisma.church.findFirst({
    where: { slug },
    include: { services: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] } },
  })
  if (!church) return null

  return {
    ...church,
    latitude: toNumber(church.latitude),
    longitude: toNumber(church.longitude),
    avgRating: toNumber(church.avgRating),
    services: church.services,
  }
}

export async function getChurchById(id: string): Promise<IChurch | null> {
  const church = await prisma.church.findFirst({
    where: { id },
    include: { services: { orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] } },
  })
  if (!church) return null

  return {
    ...church,
    latitude: toNumber(church.latitude),
    longitude: toNumber(church.longitude),
    avgRating: toNumber(church.avgRating),
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
  return result.map(r => r.denominationFamily!).filter(Boolean)
}

export async function getAvailableLanguages(): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ lang: string }>>`
    SELECT DISTINCT unnest("languages") as lang FROM "churches" ORDER BY lang
  `
  return rows.map(r => r.lang)
}

export async function getAvailableAmenities(): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ amenity: string }>>`
    SELECT DISTINCT unnest("amenities") as amenity FROM "churches" ORDER BY amenity
  `
  return rows.map(r => r.amenity)
}
