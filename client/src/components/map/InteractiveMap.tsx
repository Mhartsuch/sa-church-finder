import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

const getShortLabel = (name: string) => {
  const stripped = name
    .replace(/\b(Church|Cathedral|Mission|Episcopal|Baptist|Methodist|Saint|St\.?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

  const words = (stripped || name).split(' ').filter(Boolean)
  return words.slice(0, 2).join(' ')
}

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
  const selectedChurchId = useSearchStore((state) => state.selectedChurchId)
  const mapBounds = useSearchStore((state) => state.mapBounds)

  const setMapCenter = useSearchStore((state) => state.setMapCenter)
  const setMapZoom = useSearchStore((state) => state.setMapZoom)
  const setMapBounds = useSearchStore((state) => state.setMapBounds)
  const setHoveredChurch = useSearchStore((state) => state.setHoveredChurch)
  const setSelectedChurch = useSearchStore((state) => state.setSelectedChurch)

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
    sort,
    page: 1,
    pageSize: 200,
    bounds: boundsString,
  }

  const { data } = useChurches(searchParams)
  const churches = useMemo(() => data?.data || [], [data])

  useEffect(() => {
    if (popupChurch && !churches.some((church) => church.id === popupChurch.id)) {
      setPopupChurch(null)
      setSelectedChurch(null)
    }
  }, [churches, popupChurch, setSelectedChurch])

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
          shortLabel: getShortLabel(church.name),
          denomination: church.denomination || '',
          avgRating: church.avgRating,
          distance: church.distance,
          isHovered: church.id === hoveredChurchId,
          isSelected: church.id === selectedChurchId,
        },
      })),
    }),
    [churches, hoveredChurchId, selectedChurchId],
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
    [setMapBounds, setMapCenter, setMapZoom],
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
            zoom,
          })
        })
        return
      }

      const pinFeatures = map.queryRenderedFeatures(event.point, {
        layers: ['unclustered-points'],
      })

      if (pinFeatures.length === 0) {
        return
      }

      const churchId = pinFeatures[0].properties?.id
      const church = churches.find((item) => item.id === churchId)
      if (church) {
        setSelectedChurch(church.id)
        setPopupChurch(church)
      }
    },
    [churches, setSelectedChurch],
  )

  const handleMouseMove = useCallback(
    (event: MapLayerMouseEvent) => {
      const map = mapRef.current?.getMap()
      if (!map) {
        return
      }

      const features = map.queryRenderedFeatures(event.point, {
        layers: ['unclustered-points', 'cluster-circles'],
      })

      map.getCanvas().style.cursor = features.length > 0 ? 'pointer' : ''

      if (features.length > 0 && features[0].layer?.id === 'unclustered-points') {
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
    [hoveredChurchId, setHoveredChurch],
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
              'circle-radius': ['step', ['get', 'point_count'], 18, 10, 22, 25, 28],
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
            id='unclustered-shadow'
            type='circle'
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': 'rgba(15, 23, 42, 0.14)',
              'circle-radius': [
                'case',
                ['any', ['get', 'isHovered'], ['get', 'isSelected']],
                14,
                11,
              ],
              'circle-blur': 0.6,
            }}
          />

          <Layer
            id='unclustered-points'
            type='circle'
            filter={['!', ['has', 'point_count']]}
            paint={{
              'circle-color': [
                'case',
                ['any', ['get', 'isHovered'], ['get', 'isSelected']],
                '#FF385C',
                '#111827',
              ],
              'circle-radius': [
                'case',
                ['any', ['get', 'isHovered'], ['get', 'isSelected']],
                9,
                6.75,
              ],
              'circle-stroke-width': 2.5,
              'circle-stroke-color': '#ffffff',
            }}
          />

          <Layer
            id='unclustered-labels'
            type='symbol'
            filter={['!', ['has', 'point_count']]}
            layout={{
              'text-field': ['get', 'shortLabel'],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 11,
              'text-anchor': 'top',
              'text-offset': [0, 1.6],
              'text-allow-overlap': false,
              'symbol-sort-key': [
                'case',
                ['any', ['get', 'isHovered'], ['get', 'isSelected']],
                0,
                1,
              ],
            }}
            paint={{
              'text-color': '#111827',
              'text-opacity': [
                'case',
                ['any', ['get', 'isHovered'], ['get', 'isSelected']],
                1,
                0,
              ],
              'text-halo-color': '#ffffff',
              'text-halo-width': 2,
              'text-halo-blur': 0,
            }}
          />
        </Source>

        {popupChurch && (
          <Popup
            longitude={popupChurch.longitude}
            latitude={popupChurch.latitude}
            anchor='bottom'
            onClose={() => {
              setPopupChurch(null)
              setSelectedChurch(null)
            }}
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
        <div className='inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/95 px-4 py-2 text-sm shadow-lg backdrop-blur-sm'>
          <div className='h-2 w-2 rounded-full bg-green-500' />
          <span className='text-[13px] font-medium text-[#222222]'>
            {churches.length} churches updating as you move
          </span>
        </div>
      </div>
    </div>
  )
}
