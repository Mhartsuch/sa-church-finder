import { lazy, Suspense } from 'react'
import { MapPlaceholder } from './MapPlaceholder'

// Lazy-load InteractiveMap to avoid loading mapbox-gl if not needed
const InteractiveMap = lazy(() =>
  import('./InteractiveMap').then((m) => ({ default: m.InteractiveMap }))
)

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

/**
 * Smart map container that renders:
 * - InteractiveMap (Mapbox GL JS) when VITE_MAPBOX_TOKEN is set
 * - MapPlaceholder (SVG fallback) when no token is available
 *
 * Uses lazy loading so mapbox-gl is only downloaded when needed.
 */
export const MapContainer = () => {
  if (!MAPBOX_TOKEN) {
    return <MapPlaceholder />
  }

  return (
    <Suspense
      fallback={
        <div className='w-full h-full bg-[#f5f5f3] flex items-center justify-center'>
          <div className='animate-pulse text-[#717171] text-sm font-medium'>
            Loading map...
          </div>
        </div>
      }
    >
      <InteractiveMap />
    </Suspense>
  )
}
