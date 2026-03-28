import { MapPin, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSearchStore } from '@/stores/search-store'
import { useChurches } from '@/hooks/useChurches'
import { SA_CENTER, DEFAULT_RADIUS, PAGE_SIZE } from '@/constants'

export const MapPlaceholder = () => {
  const navigate = useNavigate()
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
    pageSize: PAGE_SIZE,
  }

  const { data } = useChurches(searchParams)
  const churches = data?.data || []

  // San Antonio bounds (approximate)
  const bounds = {
    minLat: 29.3,
    maxLat: 29.55,
    minLng: -98.65,
    maxLng: -98.3,
  }

  const latToY = (lat: number) => {
    const ratio = (bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)
    return ratio * 100
  }

  const lngToX = (lng: number) => {
    const ratio = (lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)
    return ratio * 100
  }

  return (
    <div className='w-full h-full bg-[#f5f5f3] flex flex-col relative overflow-hidden'>
      {/* Info banner */}
      <div className='absolute top-4 left-4 right-4 z-10'>
        <div className='inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-airbnb text-sm'>
          <AlertCircle className='w-4 h-4 text-sage-600 flex-shrink-0' />
          <span className='text-[#222222] font-medium'>
            Interactive map coming soon
          </span>
        </div>
      </div>

      {/* Map container */}
      <div className='flex-1 relative overflow-hidden'>
        <svg className='w-full h-full' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid slice'>
          <defs>
            <pattern id='grid' width='5' height='5' patternUnits='userSpaceOnUse'>
              <path d='M 5 0 L 0 0 0 5' fill='none' stroke='#e0e0dc' strokeWidth='0.08' />
            </pattern>
          </defs>

          <rect width='100' height='100' fill='#f5f5f3' />
          <rect width='100' height='100' fill='url(#grid)' />

          {/* Center marker */}
          <circle
            cx={lngToX(mapCenter.lng)}
            cy={latToY(mapCenter.lat)}
            r='1.5'
            fill='none'
            stroke='hsl(146, 26%, 31%)'
            strokeWidth='0.15'
            opacity='0.3'
          />

          {/* Church pins — Airbnb-style price/name bubbles */}
          {churches.map((church) => {
            const x = lngToX(church.longitude)
            const y = latToY(church.latitude)
            const isHovered = church.id === hoveredChurchId
            const isSelected = church.id === selectedChurchId
            const isHighlighted = isHovered || isSelected

            return (
              <g
                key={church.id}
                onClick={() => navigate(`/churches/${church.slug}`)}
                onMouseEnter={() => setHoveredChurch(church.id)}
                onMouseLeave={() => setHoveredChurch(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pin bubble */}
                <rect
                  x={x - 2.8}
                  y={y - 0.8}
                  width='5.6'
                  height='1.6'
                  rx='0.8'
                  fill={isHighlighted ? '#222222' : 'white'}
                  stroke={isHighlighted ? '#222222' : '#b0b0b0'}
                  strokeWidth='0.08'
                  className='transition-all'
                />
                <text
                  x={x}
                  y={y + 0.35}
                  textAnchor='middle'
                  fontSize='0.75'
                  fill={isHighlighted ? 'white' : '#222222'}
                  fontWeight='700'
                  fontFamily='Nunito Sans, sans-serif'
                  className='pointer-events-none select-none'
                >
                  {church.name.length > 10 ? church.name.substring(0, 10) + '...' : church.name}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Empty state */}
        {churches.length === 0 && (
          <div className='absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm'>
            <div className='text-center'>
              <MapPin className='w-10 h-10 text-gray-300 mx-auto mb-3' />
              <h3 className='text-base font-semibold text-[#222222] mb-1'>No churches on map</h3>
              <p className='text-sm text-[#717171]'>Adjust your filters to see results</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
