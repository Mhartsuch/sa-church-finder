import { useRef, useCallback, useMemo, useState } from 'react'
import MapGL, {
  Source,
  Layer,
  Popup,
  NavigationControl,
  GeolocateControl,
  MapRef,
  ViewStateChangeEvent,
  MapLayerMouseEvent,
} from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useNavigate } from 'react-router-dom'
import { useSearchStore } from '@/stores/search-store'
import { useChurches } from '@/hooks/useChurches'
import { DEFAULT_RADIUS } from '@/constants'
import { IChurchSummary } from '@/types/church'
import { formatRating, getNextService } from '@/utils/format'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

/**
 * Full Mapbox GL JS interactive map with:
 * - Church pins with Airbnb-style price-bubble markers
 * - Clustering at lower zoom levels
 * - Viewport-based querying (updates results as you pan/zoom)
 * - Hover/select sync with the ChurchList
 * - Popup cards on click
 */
export const InteractiveMap = () => {
  const mapRef = useRef<MapRef>(null)
  const navigate = useNavigate()

  // Store state
  const query = useSearchStore((s) => s.query)
  const filters = useSearchStore((s) => s.filters)
  const sort = useSearchStore((s) => s.sort)
  const mapCenter = useSearchStore((s) => s.mapCenter)
  const mapZoom = useSearchStore((s) => s.mapZoom)
  const hoveredChurchId = useSearchStore((s) => s.hoveredChurchId)
  const mapBounds = useSearchStore((s) => s.mapBounds)

  // Store actions
  const setMapCenter = useSearchStore((s) => s.setMapCenter)
  const setMapZoom = useSearchStore((s) => s.setMapZoom)
  const setMapBounds = useSearchStore((s) => s.setMapBounds)
  const setHoveredChurch = useSearchStore((s) => s.setHoveredChurch)

  // Popup state
  const [popupChurch, setPopupChurch] = useState<IChurchSummary | null>(null)

  // Fetch churches — use bounds-based query when map bounds are available
  const boundsString = mapBounds
    ? `${mapBounds.swLat},${mapBounds.swLng},${mapBounds.neLat},${mapBounds.neLng}`
    : undefined

  const searchParams = {
    lat: mapCenter.lat,
    lng: mapCenter.lng,
    radius: DEFAULT_RADIUS,
    q: query || undefined,
    denomination: filters.denomination,
    day: filters.day,
    time: filters.time,
    language: filters.language,
    amenities: filters.amenities,
    sort: sort,
    page: 1,
    pageSize: 200, // fetch more for map display
    bounds: boundsString,
  }

  const { data } = useChurches(searchParams)
  const churches = useMemo(() => data?.data || [], [data])

  // Build GeoJSON from church data
  const geojson: GeoJSON.FeatureCollection = useMemo(() => ({
    type: 'FeatureCollection',
    features: churches.map((church) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [church.longitude, church.latitude],
      },
      properties: {
        id: church.id,
        slug: church.slug,
        name: church.name,
        denomination: church.denomination || '',
        avgRating: church.avgRating,
        distance: church.distance,
        isHovered: church.id === hoveredChurchId,
      },
    })),
  }), [churches, hoveredChurchId])

  // Handle map viewport changes — debounced bounds update
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMoveEnd = useCallback(
    (evt: ViewStateChangeEvent) => {
      const { latitude, longitude, zoom } = evt.viewState
      setMapCenter(latitude, longitude)
      setMapZoom(zoom)

      // Debounce bounds update to avoid excessive API calls
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current)
      moveTimeoutRef.current = setTimeout(() => {
        const map = mapRef.current?.getMap()
        if (map) {
          const bounds = map.getBounds()
          if (bounds) {
            setMapBounds({
              swLat: bounds.getSouthWest().lat,
              swLng: bounds.getSouthWest().lng,
              neLat: bounds.getNorthEast().lat,
              neLng: bounds.getNorthEast().lng,
            })
          }
        }
      }, 300)
    },
    [setMapCenter, setMapZoom, setMapBounds]
  )

  // Set initial bounds once map loads
  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (map) {
      const bounds = map.getBounds()
      if (bounds) {
        setMapBounds({
          swLat: bounds.getSouthWest().lat,
          swLng: bounds.getSouthWest().lng,
          neLat: bounds.getNorthEast().lat,
          neLng: bounds.getNorthEast().lng,
        })
      }
    }
  }, [setMapBounds])

  // Handle cluster click — zoom into the cluster
  const handleClick = useCallback(
    (evt: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap()
      if (!map) return

      // Check cluster layer first
      const clusterFeatures = map.queryRenderedFeatures(evt.point, {
        layers: ['cluster-circles'],
      })
      if (clusterFeatures.length > 0) {
        const feature = clusterFeatures[0]
        const clusterId = feature.properties?.cluster_id
        const source = map.getSource('churches') as mapboxgl.GeoJSONSource
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom == null) return
          const geometry = feature.geometry as GeoJSON.Point
          map.easeTo({
            center: geometry.coordinates as [number, number],
            zoom: zoom,
          })
        })
        return
      }

      // Check individual pin click
      const pinFeatures = map.queryRenderedFeatures(evt.point, {
        layers: ['unclustered-pins'],
      })
      if (pinFeatures.length > 0) {
        const props = pinFeatures[0].properties
        const churchId = props?.id
        const church = churches.find((c) => c.id === churchId)
        if (church) {
          setPopupChurch(church)
        }
      }
    },
    [churches]
  )

  // Handle hover for cursor style and store sync
  const handleMouseMove = useCallback(
    (evt: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap()
      if (!map) return

      const features = map.queryRenderedFeatures(evt.point, {
        layers: ['unclustered-pins', 'cluster-circles'],
      })

      map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : ''

      if (features.length > 0 && features[0].layer?.id === 'unclustered-pins') {
        const churchId = features[0].properties?.id
        if (churchId !== hoveredChurchId) {
          setHoveredChurch(churchId)
        }
      } else if (hoveredChurchId) {
        setHoveredChurch(null)
      }
    },
    [hoveredChurchId, setHoveredChurch]
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredChurch(null)
  }, [setHoveredChurch])

  return (
    <div className='w-full h-full relative'>
      <MapGL
        ref={mapRef}
        initialViewState={{
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
          zoom: mapZoom,
        }}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle='mapbox://styles/mapbox/light-v11'
        onMoveEnd={handleMoveEnd}
        onLoad={handleLoad}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        attributionControl={false}
        reuseMaps
      >
        {/* Navigation controls — zoom buttons + compass */}
        <NavigationControl position='bottom-right' showCompass={false} />
        <GeolocateControl position='bottom-right' trackUserLocation={false} />

        {/* Church data source with clustering */}
        <Source
          id='churches'
          type='geojson'
          data={geojson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={60}
        >
          {/* Cluster circles */}
          <Layer
            id='cluster-circles'
            type='circle'
            filter={['has', 'point_count']}
            paint={{
              'circle-color': '#222222',
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                18,   // radius for count < 10
                10, 22, // radius for count 10-24
                25, 28, // radius for count >= 25
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
            }}
          />

          {/* Cluster count labels */}
          <Layer
            id='cluster-count'
            type='symbol'
            filter={['has', 'point_count']}
            layout={{
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 13,
            }}
            paint={{
              'text-color': '#ffffff',
            }}
          />

          {/* Individual (unclustered) church pins — Airbnb-style bubbles */}
          <Layer
            id='unclustered-pins'
            type='symbol'
            filter={['!', ['has', 'point_count']]}
            layout={{
              'text-field': ['get', 'name'],
              'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
              'text-size': 12,
              'text-max-width': 8,
              'text-anchor': 'center',
              'text-allow-overlap': false,
              'icon-allow-overlap': false,
              'symbol-sort-key': [
                'case',
                ['get', 'isHovered'], 0,
                1,
              ],
            }}
            paint={{
              'text-color': [
                'case',
                ['get', 'isHovered'], '#ffffff',
                '#222222',
              ],
              'text-halo-color': [
                'case',
                ['get', 'isHovered'], '#222222',
                '#ffffff',
              ],
              'text-halo-width': 6,
              'text-halo-blur': 0,
            }}
          />
        </Source>

        {/* Popup on pin click */}
        {popupChurch && (
          <Popup
            longitude={popupChurch.longitude}
            latitude={popupChurch.latitude}
            anchor='bottom'
            onClose={() => setPopupChurch(null)}
            closeOnClick={false}
            className='church-popup'
            maxWidth='280px'
          >
            <div
              className='cursor-pointer'
              onClick={() => navigate(`/churches/${popupChurch.slug}`)}
            >
              <h3 className='text-[15px] font-semibold text-[#222222] mb-1 leading-tight'>
                {popupChurch.name}
              </h3>
              {popupChurch.denomination && (
                <p className='text-[13px] text-[#717171] mb-0.5'>
                  {popupChurch.denomination}
                </p>
              )}
              <div className='flex items-center gap-2 text-[13px] text-[#717171]'>
                {popupChurch.avgRating > 0 && (
                  <span className='text-[#222222] font-semibold'>
                    ★ {formatRating(popupChurch.avgRating)}
                  </span>
                )}
                <span>{popupChurch.distance} mi away</span>
              </div>
              {(() => {
                const next = getNextService(popupChurch.services)
                return next ? (
                  <p className='text-[13px] text-[#222222] font-semibold mt-1'>{next}</p>
                ) : null
              })()}
              <p className='text-[12px] text-[#FF385C] font-semibold mt-1.5'>
                View profile →
              </p>
            </div>
          </Popup>
        )}
      </MapGL>

      {/* "Search as I move the map" indicator */}
      <div className='absolute top-4 left-1/2 -translate-x-1/2 z-10'>
        <div className='inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-lg text-sm'>
          <div className='w-2 h-2 rounded-full bg-green-500' />
          <span className='text-[#222222] font-medium text-[13px]'>
            Updating results as you move
          </span>
        </div>
      </div>
    </div>
  )
}
