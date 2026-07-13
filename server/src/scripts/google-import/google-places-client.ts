/**
 * Google Places API (New) HTTP client.
 * Uses native fetch — no external dependencies.
 */

import { RateLimiter } from './rate-limiter.js'
import type { GoogleNearbySearchResponse, GooglePlaceResult } from './types.js'

const PLACES_API_BASE = 'https://places.googleapis.com/v1'

// Nearby Search (New) returns at most 20 places and does NOT paginate —
// a full page means the cell is probably saturated and must be subdivided.
const NEARBY_MAX_RESULTS = 20
// Stop subdividing below this radius; a 300 m circle with 20+ churches is
// implausible in practice, and each level of subdivision quadruples API calls.
const MIN_SUBDIVISION_RADIUS_METERS = 300

const MAX_RETRIES = 3
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])
const METERS_PER_DEGREE_LAT = 111_320

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const NEARBY_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.addressComponents',
  'places.nationalPhoneNumber',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.types',
  'places.editorialSummary',
  'places.photos',
  'places.rating',
  'places.userRatingCount',
  'places.regularOpeningHours',
  'places.businessStatus',
  'places.accessibilityOptions',
  'places.goodForChildren',
  'places.goodForGroups',
  'places.primaryType',
  'places.primaryTypeDisplayName',
].join(',')

const DETAIL_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'location',
  'addressComponents',
  'nationalPhoneNumber',
  'websiteUri',
  'googleMapsUri',
  'editorialSummary',
  'photos',
  'rating',
  'userRatingCount',
  'regularOpeningHours',
  'businessStatus',
  'accessibilityOptions',
  'goodForChildren',
  'goodForGroups',
  'primaryType',
  'primaryTypeDisplayName',
].join(',')

export class GooglePlacesClient {
  private readonly apiKey: string
  private readonly rateLimiter: RateLimiter

  constructor(apiKey: string, requestsPerSecond = 5) {
    this.apiKey = apiKey
    this.rateLimiter = new RateLimiter(requestsPerSecond)
  }

  /**
   * Perform a request with rate limiting and exponential-backoff retries on
   * 429/5xx responses and network errors. Honors Retry-After when present.
   * Non-retryable error statuses are returned to the caller to interpret.
   */
  private async fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
    let attempt = 0
    for (;;) {
      await this.rateLimiter.wait()

      let response: Response | null = null
      let networkError: unknown = null
      try {
        response = await fetch(url, init)
      } catch (error) {
        networkError = error
      }

      if (response && !RETRYABLE_STATUSES.has(response.status)) {
        return response
      }

      attempt++
      if (attempt > MAX_RETRIES) {
        if (response) return response
        throw networkError
      }

      const retryAfterSeconds = Number(response?.headers.get('retry-after'))
      const backoffMs = Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds * 1000
        : 1000 * 2 ** (attempt - 1)
      console.warn(
        `  [retry ${attempt}/${MAX_RETRIES}] ${response ? `HTTP ${response.status}` : 'network error'} — waiting ${backoffMs}ms`,
      )
      await sleep(backoffMs)
    }
  }

  /**
   * Search for churches near a given point.
   *
   * Nearby Search (New) caps responses at 20 places with no pagination, so a
   * full page likely means the cell is saturated. Saturated cells are
   * recursively subdivided into four overlapping child circles (centers at
   * ±r/2, radius r/√2 — fully covering the parent) until results fit or the
   * radius floor is reached. Duplicates from overlap are deduped by place id.
   */
  async searchNearbyChurches(
    latitude: number,
    longitude: number,
    radiusMeters: number,
  ): Promise<GooglePlaceResult[]> {
    const resultsById = new Map<string, GooglePlaceResult>()
    await this.searchNearbyInto(resultsById, latitude, longitude, radiusMeters)
    return [...resultsById.values()]
  }

  private async searchNearbyInto(
    resultsById: Map<string, GooglePlaceResult>,
    latitude: number,
    longitude: number,
    radiusMeters: number,
  ): Promise<void> {
    const places = await this.searchNearbyOnce(latitude, longitude, radiusMeters)
    for (const place of places) {
      resultsById.set(place.id, place)
    }

    const saturated = places.length >= NEARBY_MAX_RESULTS
    if (!saturated || radiusMeters / 2 < MIN_SUBDIVISION_RADIUS_METERS) {
      if (saturated) {
        console.warn(
          `  [saturated] cell at (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) r=${Math.round(radiusMeters)}m hit the ${NEARBY_MAX_RESULTS}-result cap at the radius floor — some places may be missed`,
        )
      }
      return
    }

    const centerOffsetMeters = radiusMeters / 2
    const childRadius = radiusMeters / Math.SQRT2
    const deltaLat = centerOffsetMeters / METERS_PER_DEGREE_LAT
    const deltaLng =
      centerOffsetMeters / (METERS_PER_DEGREE_LAT * Math.cos((latitude * Math.PI) / 180))

    for (const latSign of [-1, 1]) {
      for (const lngSign of [-1, 1]) {
        await this.searchNearbyInto(
          resultsById,
          latitude + latSign * deltaLat,
          longitude + lngSign * deltaLng,
          childRadius,
        )
      }
    }
  }

  private async searchNearbyOnce(
    latitude: number,
    longitude: number,
    radiusMeters: number,
  ): Promise<GooglePlaceResult[]> {
    const body = {
      includedTypes: ['church'],
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: radiusMeters,
        },
      },
      maxResultCount: NEARBY_MAX_RESULTS,
    }

    const response = await this.fetchWithRetry(`${PLACES_API_BASE}/places:searchNearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': NEARBY_FIELD_MASK,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Google Places API error (${response.status}): ${errorText}`)
    }

    const data = (await response.json()) as GoogleNearbySearchResponse
    return data.places ?? []
  }

  /**
   * Fetch details for a single place by its Place ID.
   * Used by the enrich script to update existing churches.
   */
  async getPlaceDetails(placeId: string): Promise<GooglePlaceResult | null> {
    const response = await this.fetchWithRetry(`${PLACES_API_BASE}/places/${placeId}`, {
      headers: {
        'X-Goog-Api-Key': this.apiKey,
        'X-Goog-FieldMask': DETAIL_FIELD_MASK,
      },
    })

    if (response.status === 404) return null

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Google Places API error (${response.status}): ${errorText}`)
    }

    return (await response.json()) as GooglePlaceResult
  }

  /**
   * Get a photo download URL from a photo resource name.
   * The Places API returns a redirect to the actual image.
   */
  getPhotoUrl(photoResourceName: string, maxWidthPx = 1200): string {
    return `${PLACES_API_BASE}/${photoResourceName}/media?maxWidthPx=${maxWidthPx}&key=${this.apiKey}`
  }

  /**
   * Download a photo as a Buffer.
   * Follows the redirect from the Places photo endpoint.
   */
  async downloadPhoto(
    photoResourceName: string,
    maxWidthPx = 1200,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const url = this.getPhotoUrl(photoResourceName, maxWidthPx)
    const response = await this.fetchWithRetry(url, { redirect: 'follow' })

    if (!response.ok) {
      throw new Error(`Failed to download photo (${response.status}): ${photoResourceName}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') ?? 'image/jpeg'

    return {
      buffer: Buffer.from(arrayBuffer),
      contentType,
    }
  }
}
