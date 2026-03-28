import { MapPin, AlertCircle } from 'lucide-react'
import { useSearchStore } from '@/stores/search-store'
import { useChurches } from '@/hooks/useChurches'
import { SA_CENTER, DEFAULT_RADIUS, PAGE_SIZE } from '@/constants'

export const MapPlaceholder = () => {
  const query = useSearchStore((state) => state.query)
  const filters = useSearchStore((state) => state.filters)
  const sort = useSearchStore((state) => state.sort)
  const mapCenter = useSearchStore((state) => state.mapCenter)
  const hoveredChurchId = useSearchStore((state) => state.hoveredChurchId)
  const selectedChurchId = useSearchStore((state) => state.selectedChurchId)
  const setHoveredChurch = useSearchStore((state) => state.setHoveredChurch)
  const setSelectedChurch = useSearchStore((state) => state.setSelectedChurch)

  const searchParams = {
    lat: SA_CENTER.lat,
    lng: SA_CENTER.lng,
    radius: DEFAULT_RADIUS,
    q: query || undefined,
    denomination: filters.denomination,
    day: filters.day,
    time: filters.time,
    language: filters.language,
    amenities: filters.amenities,
    sort: sort,
    page: 1,
    pageSize: PAGE_SIZE
  }

  const { data } = useChurches(searchParams)
  const churches = data?.data || []

  // San Antonio bounds (approximate)
  const bounds = {
    minLat: 29.3,
    maxLat: 29.55,
    minLng: -98.65,
    maxLng: -98.3
  }

  // Map church lat/lng to SVG coordinates
  const latToY = (lat: number) => {
    const ratio = (bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)
    return ratio * 100
  }

  const lngToX = (lng: number) => {
    const ratio = (lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)
    return ratio * 100
  }

  return (
    <div className='flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col relative overflow-hidden'>
      {/* Banner */}
      <div className='bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center gap-2'>
        <AlertCircle className='w-5 h-5 text-blue-600 flex-shrink-0' />
        <span className='text-sm text-blue-700'>
          Interactive map coming soon — Mapbox integration pending
        </span>
      </div>

      {/* Map Container */}
      <div className='flex-1 relative overflow-hidden'>
        <svg className='w-full h-full' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid slice'>
          {/* Map outline and grid */}
          <defs>
            <pattern id='grid' width='5' height='5' patternUnits='userSpaceOnUse'>
              <path d='M 5 0 L 0 0 0 5' fill='none' stroke='#e5e7eb' strokeWidth='0.1' />
            </pattern>
          </defs>

          {/* Background */}
          <rect width='100' height='100' fill='#f9fafb' />

          {/* Grid pattern */}
          <rect width='100' height='100' fill='url(#grid)' />

          {/* Border */}
          <rect width='100' height='100' fill='none' stroke='#d1d5db' strokeWidth='0.5' />

          {/* Center marker */}
          <circle
            cx={lngToX(mapCenter.lng)}
            cy={latToY(mapCenter.lat)}
            r='0.8'
            fill='#3b82f6'
            opacity='0.3'
          />

          {/* Church pins */}
          {churches.map((church) => {
            const x = lngToX(church.longitude)
            const y = latToY(church.latitude)
            const isHovered = church.id === hoveredChurchId
            const isSelected = church.id === selectedChurchId

            return (
              <g
                key={church.id}
                onClick={() => setSelectedChurch(church.id)}
                onMouseEnter={() => setHoveredChurch(church.id)}
                onMouseLeave={() => setHoveredChurch(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pin circle */}
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered || isSelected ? 1.2 : 0.8}
                  fill={isSelected ? '#dc2626' : isHovered ? '#2563eb' : '#1f2937'}
                  opacity={isHovered || isSelected ? 0.9 : 0.7}
                  className='transition-all'
                />

                {/* Halo for selected */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={2.2}
                    fill='#dc2626'
                    opacity='0.15'
                    className='transition-all'
                  />
                )}

                {/* Label on hover */}
                {isHovered && (
                  <g>
                    <rect
                      x={x - 2.5}
                      y={y - 2.5}
                      width='5'
                      height='1.2'
                      rx='0.2'
                      fill='#1f2937'
                      opacity='0.9'
                    />
                    <text
                      x={x}
                      y={y - 1.8}
                      textAnchor='middle'
                      fontSize='0.6'
                      fill='white'
                      fontWeight='bold'
                      className='pointer-events-none'
                    >
                      {church.name.length > 12 ? church.name.substring(0, 12) + '...' : church.name}
                    </text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Map label */}
          <text
            x='50'
            y='95'
            textAnchor='middle'
            fontSize='0.8'
            fill='#6b7280'
            opacity='0.5'
            className='pointer-events-none'
          >
            San Antonio, TX
          </text>
        </svg>

        {/* Empty state */}
        {churches.length === 0 && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm'>
            <div className='text-center'>
              <MapPin className='w-12 h-12 text-gray-400 mx-auto mb-3' />
              <h3 className='text-lg font-semibold text-gray-700 mb-1'>No churches on map</h3>
              <p className='text-sm text-gray-600'>Adjust your filters to see results</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
