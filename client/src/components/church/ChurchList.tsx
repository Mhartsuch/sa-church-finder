import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSearchStore } from '@/stores/search-store'
import { useChurches } from '@/hooks/useChurches'
import { SA_CENTER, DEFAULT_RADIUS, PAGE_SIZE } from '@/constants'
import { ChurchCard } from './ChurchCard'
import { ChurchCardSkeletonGrid } from './ChurchCardSkeleton'
import { NoResults } from '@/components/search/NoResults'

interface ChurchListProps {
  variant?: 'grid' | 'sidebar'
}

export const ChurchList = ({ variant = 'sidebar' }: ChurchListProps) => {
  const navigate = useNavigate()
  const query = useSearchStore((state) => state.query)
  const filters = useSearchStore((state) => state.filters)
  const sort = useSearchStore((state) => state.sort)
  const page = useSearchStore((state) => state.page)
  const hoveredChurchId = useSearchStore((state) => state.hoveredChurchId)
  const setHoveredChurch = useSearchStore((state) => state.setHoveredChurch)
  const setPage = useSearchStore((state) => state.setPage)
  const mapBounds = useSearchStore((state) => state.mapBounds)
  const mapCenter = useSearchStore((state) => state.mapCenter)

  // Use bounds-based query when map has reported its viewport,
  // otherwise fall back to radius-based search from SA center
  const boundsString = mapBounds
    ? `${mapBounds.swLat},${mapBounds.swLng},${mapBounds.neLat},${mapBounds.neLng}`
    : undefined

  const searchParams = {
    lat: mapBounds ? mapCenter.lat : SA_CENTER.lat,
    lng: mapBounds ? mapCenter.lng : SA_CENTER.lng,
    radius: DEFAULT_RADIUS,
    q: query || undefined,
    denomination: filters.denomination,
    day: filters.day,
    time: filters.time,
    language: filters.language,
    amenities: filters.amenities,
    sort: sort,
    page: page,
    pageSize: PAGE_SIZE,
    bounds: boundsString,
  }

  const { data, isLoading, error } = useChurches(searchParams)

  const churches = data?.data || []
  const meta = data?.meta
  const totalPages = meta?.totalPages || 1

  // Loading skeleton — Airbnb-style shimmer cards
  if (isLoading) {
    return <ChurchCardSkeletonGrid count={variant === 'grid' ? 8 : 6} variant={variant} />
  }

  if (error) {
    return (
      <div className='flex items-center justify-center py-20'>
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-[#222222] mb-2'>Something went wrong</h3>
          <p className='text-sm text-[#717171]'>{error.message}</p>
        </div>
      </div>
    )
  }

  if (churches.length === 0) {
    return <NoResults />
  }

  return (
    <div>
      {/* Card grid — Airbnb uses 4-6 columns with generous gap */}
      <div className={variant === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10'
        : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10'
      }>
        {churches.map((church) => (
          <ChurchCard
            key={church.id}
            church={church}
            isHovered={hoveredChurchId === church.id}
            onHover={setHoveredChurch}
            onClick={(slug) => navigate(`/churches/${slug}`)}
          />
        ))}
      </div>

      {/* Pagination — Airbnb style centered */}
      {totalPages > 1 && (
        <nav className='flex items-center justify-center gap-2 pt-12 pb-4'>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className='w-8 h-8 rounded-full flex items-center justify-center text-[#222222] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors'
            aria-label='Previous page'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>

          <div className='flex items-center gap-1'>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 7) {
                pageNum = i + 1
              } else if (page <= 4) {
                pageNum = i + 1
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i
              } else {
                pageNum = page - 3 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors ${
                    page === pageNum
                      ? 'bg-[#222222] text-white'
                      : 'text-[#222222] hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className='w-8 h-8 rounded-full flex items-center justify-center text-[#222222] hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors'
            aria-label='Next page'
          >
            <ChevronRight className='w-4 h-4' />
          </button>
        </nav>
      )}
    </div>
  )
}
