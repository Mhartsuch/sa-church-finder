import { useCallback, useMemo, useRef, useState } from 'react'
import { ArrowRight, Star } from 'lucide-react'
import MapGL, {
  GeolocateControl,
  Layer,
  MapLayerMouseEvent,
  MapRef,
  NavigationControl,
  Popup,
  Source,
  ViewStateChangeEvent,
} from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useNavigate } from 'react-router-dom'
import { DEFAULT_RADIUS } from '@/constants'
import { useChurches } from '@/hooks/useChurches'
import { useSearchStore } from '@/stores/search-store'
import { IChurchSummary } from '@/types/church'
import { formatDistance, formatRating, getNextService } from '@/utils/format'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

export const InteractiveMap = () => {
  const mapRef = useRef<MapRef>(null)
  const moveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const navigate = useNavigate()

  const query = useSearchStore((state) => state.query)
  const filters = useSearchStore((state) => state.filters)
  const sort = useSearchStore((state) => state.sort)
  const mapCenter = useSearchStore((state) => state.mapCenter)
  const mapZoom = useSearchStore((state) => state.mapZoom)
  const hoveredChurchId = useSearchStore((state) => state.hoveredChurchId)
  const mapBounds = useSearchStore((state) => state.mapBounds)

  const setMapCenter = useSearchStore((state) => state.setMapCenter)
  const setMapZoom = useSearchStore((state) => state.setMapZoom)
  const setMapBounds = useSearchStore((state) => state.setMapBounds)
  const setHoveredChurch = useSearchStore((state) => state.setHoveredChurch)

  const [popupChurch, setPopupChurch] = useState<IChurchSummary | null>(null)

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
    pageSize: 200,
    bounds: boundsString,
  }

  const { data } = useChurches(searchParams)
  const churches = useMemo(() => data?.data || [], [data])

  const geojson: GeoJSON.FeatureCollection = useMemo(
    () => ({
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
    }),
    [churches, hoveredChurchId]
  )

  const handleMoveEnd = useCallback(
    (event: ViewStateChangeEvent) => {
      const { latitude, longitude, zoom } = event.viewState
      setMapCenter(latitude, longitude)
      setMapZoom(zoom)

      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current)
      }

      moveTimeoutRef.current = setTimeout(() => {
        const map = mapRef.current?.getMap()
        if (!map) {
          return
        }

        const bounds = map.getBounds()
        if (!bounds) {
          return
        }

        setMapBounds({
          swLat: bounds.getSouthWest().lat,
          swLng: bounds.getSouthWest().lng,
          neLat: bounds.getNorthEast().lat,
          neLng: bounds.getNorthEast().lng,
        })
      }, 300)
    },
    [setMapBounds, setMapCenter, setMapZoom]
  )

  const handleLoad = useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map) {
      return
    }

    const bounds = map.getBounds()
    if (!bounds) {
      return
    }

    setMapBounds({
      swLat: bounds.getSouthWest().lat,
      swLng: bounds.getSouthWest().lng,
      neLat: bounds.getNorthEast().lat,
      neLng: bounds.getNorthEast().lng,
    })
  }, [setMapBounds])

  const handleClick = useCallback(
    (event: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap()
      if (!map) {
        return
      }

      const clusterFeatures = map.queryRenderedFeatures(event.point, {
        layers: ['cluster-circles'],
      })

      if (clusterFeatures.length > 0) {
        const feature = clusterFeatures[0]
        const clusterId = feature.properties?.cluster_id
        const source = map.getSource('churches') as mapboxgl.GeoJSONSource

        source.getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (error || zoom == null) {
            return
          }

          const geometry = feature.geometry as GeoJSON.Point
          map.easeTo({
            center: geometry.coordinates as [number, number],
            zoom: zoom,
          })
        })
        return
      }

      const pinFeatures = map.queryRenderedFeatures(event.point, {
        layers: ['unclustered-pins'],
      })

      if (pinFeatures.length === 0) {
        return
      }

      const churchId = pinFeatures[0].properties?.id
      const church = churches.find((item) => item.id === churchId)
      if (church) {
        setPopupChurch(church)
      }
    },
    [churches]
  )

  const handleMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap()
      if (!map) {
        return
      }

      const features = map.queryRenderedFeatures(event.point, {
        layers: ['unclustered-pins', 'cluster-circles'],
      })

      map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : ''

      if (features.length > 0 && features[0].layer?.id === 'unclustered-pins') {
        const churchId = features[0].properties?.id
        if (churchId !== hoveredChurchId) {
          setHoveredChurch(churchId)
        }
        return
      }

      if (hoveredChurchId) {
        setHoveredChurch(null)
      }
    },
    [hoveredChurchId, setHoveredChurch]
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredChurch(null)
  }, [setHoveredChurch])

  return (
    <div className='relative h-full w-full'>
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
        <NavigationControl position='bottom-right' showCompass={false} />
        <GeolocateControl position='bottom-right' trackUserLocation={false} />

        <Source
          id='churches'
          type='geojson'
          data={geojson}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={60}
        >
          <Layer
            id='cluster-circles'
            type='circle'
            filter={['has', 'point_count']}
            paint={{
              'circle-color': '#222222',
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                18,
                10, 22,
                25, 28,
              ],
              'circle-stroke-width': 3,
              'circle-stroke-color': '#ffffff',
            }}
          />

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
            <button
              type='button'
              className='w-full cursor-pointer rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] focus-visible:ring-offset-2'
              onClick={() => navigate(`/churches/${popupChurch.slug}`)}
              aria-label={`View ${popupChurch.name} profile`}
            >
              <h3 className='mb-1 text-[15px] font-semibold leading-tight text-[#222222]'>
                {popupChurch.name}
              </h3>
              {popupChurch.denomination && (
                <p className='mb-0.5 text-[13px] text-[#717171]'>
                  {popupChurch.denomination}
                </p>
              )}
              <div className='flex items-center gap-2 text-[13px] text-[#717171]'>
                {popupChurch.avgRating > 0 && (
                  <span className='inline-flex items-center gap-1 font-semibold text-[#222222]'>
                    <Star className='h-3 w-3 fill-current' />
                    {formatRating(popupChurch.avgRating)}
                  </span>
                )}
                <span>{formatDistance(popupChurch.distance)} away</span>
              </div>
              {(() => {
                const nextService = getNextService(popupChurch.services)
                return nextService ? (
                  <p className='mt-1 text-[13px] font-semibold text-[#222222]'>
                    {nextService}
                  </p>
                ) : null
              })()}
              <span className='mt-1.5 inline-flex items-center gap-1 text-[12px] font-semibold text-[#FF385C]'>
                View profile
                <ArrowRight className='h-3.5 w-3.5' />
              </span>
            </button>
          </Popup>
        )}
      </MapGL>

      <div className='absolute left-1/2 top-4 z-10 -translate-x-1/2'>
        <div className='inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm shadow-lg'>
          <div className='h-2 w-2 rounded-full bg-green-500' />
          <span className='text-[13px] font-medium text-[#222222]'>
            Updating results as you move
          </span>
        </div>
      </div>
    </div>
  )
}
