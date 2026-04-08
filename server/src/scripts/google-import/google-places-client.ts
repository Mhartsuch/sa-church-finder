/**
 * Google Places API (New) HTTP client.
 * Uses native fetch — no external dependencies.
 */

import { RateLimiter } from './rate-limiter.js'
import type { GoogleNearbySearchResponse, GooglePlaceResult } from './types.js'

const PLACES_API_BASE = 'https://places.googleapis.com/v1'

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
].join(',')

export class GooglePlacesClient {
  private readonly apiKey: string
  private readonly rateLimiter: RateLimiter

  constructor(apiKey: string, requestsPerSecond = 5) {
    this.apiKey = apiKey
    this.rateLimiter = new RateLimiter(requestsPerSecond)
  }

  /**
   * Search for churches near a given point.
   * Returns all results, following pagination tokens automatically.
   */
  async searchNearbyChurches(
    latitude: number,
    longitude: number,
    radiusMeters: number,
  ): Promise<GooglePlaceResult[]> {
    const allResults: GooglePlaceResult[] = []
    let pageToken: string | undefined

    do {
      await this.rateLimiter.wait()

      const body: Record<string, unknown> = {
        includedTypes: ['church'],
        locationRestriction: {
          circle: {
            center: { latitude, longitude },
            radius: radiusMeters,
          },
        },
        maxResultCount: 20,
      }

      if (pageToken) {
        body.pageToken = pageToken
      }

      const response = await fetch(`${PLACES_API_BASE}/places:searchNearby`, {
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
      if (data.places) {
        allResults.push(...data.places)
      }
      pageToken = data.nextPageToken
    } while (pageToken)

    return allResults
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
    await this.rateLimiter.wait()

    const url = this.getPhotoUrl(photoResourceName, maxWidthPx)
    const response = await fetch(url, { redirect: 'follow' })

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
