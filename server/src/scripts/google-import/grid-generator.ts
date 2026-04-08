/**
 * Generates a grid of search center points covering the San Antonio metro area.
 * Each point is the center of a 3km-radius search circle.
 * Grid spacing ensures overlapping coverage so no churches are missed.
 */

export interface GridPoint {
  latitude: number
  longitude: number
}

/** San Antonio metro bounding box */
const SA_BOUNDS = {
  minLat: 29.25,
  maxLat: 29.65,
  minLng: -98.75,
  maxLng: -98.3,
} as const

/** Search radius in meters for each grid cell */
export const SEARCH_RADIUS_METERS = 3000

/**
 * Grid step sizes — approximately 4.2km apart.
 * At latitude ~29.4°:
 *   1° latitude ≈ 111 km → 0.038° ≈ 4.2 km
 *   1° longitude ≈ 96.7 km → 0.044° ≈ 4.3 km
 * Overlap factor ensures no gaps between adjacent circles.
 */
const GRID_STEP_LAT = 0.038
const GRID_STEP_LNG = 0.044

export function generateSAMetroGrid(): GridPoint[] {
  const points: GridPoint[] = []

  for (let lat = SA_BOUNDS.minLat; lat <= SA_BOUNDS.maxLat; lat += GRID_STEP_LAT) {
    for (let lng = SA_BOUNDS.minLng; lng <= SA_BOUNDS.maxLng; lng += GRID_STEP_LNG) {
      points.push({
        latitude: Math.round(lat * 1e6) / 1e6,
        longitude: Math.round(lng * 1e6) / 1e6,
      })
    }
  }

  return points
}
