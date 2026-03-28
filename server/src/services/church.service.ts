/**
 * Church search and filtering service
 * Handles all church discovery operations with support for:
 * - Distance-based search with haversine formula
 * - Text search on church names/descriptions
 * - Filtering by denomination, services, language, amenities
 * - Sorting and pagination
 */

import { IChurch, IChurchSummary, ISearchParams, ISearchResponse, IBounds } from '../types/church.types.js'
import { churches } from '../data/churches.js'

const EARTH_RADIUS_MILES = 3959
const DEFAULT_CENTER_LAT = 29.4241
const DEFAULT_CENTER_LNG = -98.4936
const DEFAULT_RADIUS = 10
const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20

/**
 * Calculate distance in miles between two points using Haversine formula
 */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (degrees: number) => (degrees * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_MILES * c
}

/**
 * Parse time of day into minutes since midnight
 */
function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + (minutes || 0)
}

/**
 * Categorize time of day
 * 'morning': before 12:00
 * 'afternoon': 12:00-17:00
 * 'evening': after 17:00
 */
function getTimeCategory(timeStr: string): string {
  const minutes = parseTime(timeStr)
  if (minutes < 12 * 60) return 'morning'
  if (minutes < 17 * 60) return 'afternoon'
  return 'evening'
}

/**
 * Check if a church has a service matching the given day of week
 */
function hasServiceOnDay(church: IChurch, dayOfWeek: number): boolean {
  return church.services.some(service => service.dayOfWeek === dayOfWeek)
}

/**
 * Check if a church has a service in the given time category
 */
function hasServiceInTimeCategory(church: IChurch, timeCategory: string): boolean {
  return church.services.some(service => getTimeCategory(service.startTime) === timeCategory)
}

/**
 * Check if a church offers a specific language
 */
function hasLanguage(church: IChurch, language: string): boolean {
  return church.languages.some(lang => lang.toLowerCase() === language.toLowerCase())
}

/**
 * Check if a church has all specified amenities
 */
function hasAllAmenities(church: IChurch, amenities: string[]): boolean {
  return amenities.every(amenity =>
    church.amenities.some(a => a.toLowerCase() === amenity.toLowerCase())
  )
}

/**
 * Check if text search matches church name or description
 */
function matchesSearchText(church: IChurch, query: string): boolean {
  const lowercaseQuery = query.toLowerCase()
  const name = church.name.toLowerCase()
  const description = (church.description || '').toLowerCase()
  return name.includes(lowercaseQuery) || description.includes(lowercaseQuery)
}

/**
 * Check if church is within bounding box
 */
function isWithinBounds(church: IChurch, bounds: IBounds): boolean {
  return (
    church.latitude >= bounds.swLat &&
    church.latitude <= bounds.neLat &&
    church.longitude >= bounds.swLng &&
    church.longitude <= bounds.neLng
  )
}

/**
 * Parse bounds string: "sw_lat,sw_lng,ne_lat,ne_lng"
 */
function parseBounds(boundsStr: string): IBounds | null {
  try {
    const [swLat, swLng, neLat, neLng] = boundsStr.split(',').map(Number)
    if (isNaN(swLat) || isNaN(swLng) || isNaN(neLat) || isNaN(neLng)) {
      return null
    }
    return { swLat, swLng, neLat, neLng }
  } catch {
    return null
  }
}

/**
 * Convert church to summary format with calculated distance
 */
function churchToSummary(church: IChurch, centerLat: number, centerLng: number): IChurchSummary {
  const distance = haversineDistance(centerLat, centerLng, church.latitude, church.longitude)
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
    latitude: church.latitude,
    longitude: church.longitude,
    phone: church.phone,
    email: church.email,
    website: church.website,
    avgRating: church.avgRating,
    reviewCount: church.reviewCount,
    isClaimed: church.isClaimed,
    languages: church.languages,
    amenities: church.amenities,
    coverImageUrl: church.coverImageUrl,
    distance: Math.round(distance * 10) / 10,
    services: church.services,
  }
}

/**
 * Main search function - filters and sorts churches based on parameters
 */
export function searchChurches(params: ISearchParams): ISearchResponse {
  let results = [...churches]

  // Parse center point
  const centerLat = params.lat ?? DEFAULT_CENTER_LAT
  const centerLng = params.lng ?? DEFAULT_CENTER_LNG
  const radius = params.radius ?? DEFAULT_RADIUS

  // Filter by bounding box if provided
  if (params.bounds) {
    const bounds = parseBounds(params.bounds)
    if (bounds) {
      results = results.filter(church => isWithinBounds(church, bounds))
    }
  } else {
    // Filter by radius if bounds not provided
    results = results.filter(church => {
      const distance = haversineDistance(centerLat, centerLng, church.latitude, church.longitude)
      return distance <= radius
    })
  }

  // Filter by search text
  if (params.q && params.q.trim()) {
    results = results.filter(church => matchesSearchText(church, params.q!))
  }

  // Filter by denomination family
  if (params.denomination && params.denomination.trim()) {
    const denominationFamily = params.denomination.toLowerCase()
    results = results.filter(church =>
      (church.denominationFamily || '').toLowerCase() === denominationFamily
    )
  }

  // Filter by service day
  if (typeof params.day === 'number' && params.day >= 0 && params.day <= 6) {
    results = results.filter(church => hasServiceOnDay(church, params.day!))
  }

  // Filter by service time
  if (params.time && params.time.trim()) {
    const timeCategory = params.time.toLowerCase()
    results = results.filter(church => hasServiceInTimeCategory(church, timeCategory))
  }

  // Filter by language
  if (params.language && params.language.trim()) {
    results = results.filter(church => hasLanguage(church, params.language!))
  }

  // Filter by amenities (all must match)
  if (params.amenities && params.amenities.trim()) {
    const requestedAmenities = params.amenities
      .split(',')
      .map(a => a.trim())
      .filter(a => a.length > 0)
    if (requestedAmenities.length > 0) {
      results = results.filter(church => hasAllAmenities(church, requestedAmenities))
    }
  }

  // Convert to summaries with distance
  const summaries = results.map(church => churchToSummary(church, centerLat, centerLng))

  // Sort results
  const sortBy = params.sort ?? 'distance'
  if (sortBy === 'distance') {
    summaries.sort((a, b) => (a.distance || 0) - (b.distance || 0))
  } else if (sortBy === 'rating') {
    summaries.sort((a, b) => b.avgRating - a.avgRating)
  } else if (sortBy === 'name') {
    summaries.sort((a, b) => a.name.localeCompare(b.name))
  }

  // Pagination
  const page = Math.max(1, params.page ?? DEFAULT_PAGE)
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? DEFAULT_PAGE_SIZE))
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedResults = summaries.slice(startIndex, endIndex)

  const totalPages = Math.ceil(summaries.length / pageSize)

  return {
    data: paginatedResults,
    meta: {
      page,
      pageSize,
      total: summaries.length,
      totalPages,
      center: {
        lat: centerLat,
        lng: centerLng,
      },
    },
  }
}

/**
 * Get a church by slug
 */
export function getChurchBySlug(slug: string): IChurch | null {
  return churches.find(church => church.slug === slug) || null
}

/**
 * Get a church by ID
 */
export function getChurchById(id: string): IChurch | null {
  return churches.find(church => church.id === id) || null
}

/**
 * Get all available denomination families
 */
export function getDenominationFamilies(): string[] {
  const families = new Set<string>()
  churches.forEach(church => {
    if (church.denominationFamily) {
      families.add(church.denominationFamily)
    }
  })
  return Array.from(families).sort()
}

/**
 * Get all available languages across all churches
 */
export function getAvailableLanguages(): string[] {
  const languages = new Set<string>()
  churches.forEach(church => {
    church.languages.forEach(lang => languages.add(lang))
  })
  return Array.from(languages).sort()
}

/**
 * Get all available amenities across all churches
 */
export function getAvailableAmenities(): string[] {
  const amenities = new Set<string>()
  churches.forEach(church => {
    church.amenities.forEach(amenity => amenities.add(amenity))
  })
  return Array.from(amenities).sort()
}
