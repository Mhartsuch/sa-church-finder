import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchStore } from '@/stores/search-store'
import { useChurches } from '@/hooks/useChurches'
import { SA_CENTER, DEFAULT_RADIUS, PAGE_SIZE } from '@/constants'
import { ChurchCard } from './ChurchCard'

export const ChurchList = () => {
  const query = useSearchStore((state) => state.query)
  const filters = useSearchStore((state) => state.filters)
  const sort = useSearchStore((state) => state.sort)
  const page = useSearchStore((state) => state.page)
  const hoveredChurchId = useSearchStore((state) => state.hoveredChurchId)
  const setHoveredChurch = useSearchStore((state) => state.setHoveredChurch)
  const setSelectedChurch = useSearchStore((state) => state.setSelectedChurch)
  const setPage = useSearchStore((state) => state.setPage)

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
    page: page,
    pageSize: PAGE_SIZE
  }

  const { data, isLoading, error } = useChurches(searchParams)

  if (error) {
    return (
      <div className='w-96 bg-white border-l border-gray-200 flex flex-col'>
        <div className='flex-1 flex items-center justify-center p-4'>
          <div className='text-center'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>Error loading churches</h3>
            <p className='text-sm text-gray-600'>{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  const churches = data?.data || []
  const meta = data?.meta
  const totalPages = meta?.totalPages || 1

  return (
    <div className='w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden'>
      {/* Header */}
      <div className='px-4 py-4 border-b border-gray-200 flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-gray-900'>Churches</h2>
          {meta && (
            <p className='text-sm text-gray-500'>
              {meta.total === 0 ? 'No churches found' : `${meta.total} churches found`}
            </p>
          )}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sort}
          onChange={(e) => useSearchStore.getState().setSort(e.target.value as 'distance' | 'rating' | 'name')}
          className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-white'
        >
          <option value='distance'>Distance</option>
          <option value='rating'>Rating</option>
          <option value='name'>Name</option>
        </select>
      </div>

      {/* List */}
      <div className='flex-1 overflow-y-auto'>
        {isLoading ? (
          // Loading skeleton
          <div className='p-4 space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='bg-gray-100 rounded-lg h-48 animate-pulse' />
            ))}
          </div>
        ) : churches.length === 0 ? (
          // Empty state
          <div className='flex items-center justify-center h-full p-4'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No churches found</h3>
              <p className='text-sm text-gray-600'>Try adjusting your filters or search term</p>
            </div>
          </div>
        ) : (
          // Church list
          <div className='p-4 space-y-4'>
            {churches.map((church) => (
              <ChurchCard
                key={church.id}
                church={church}
                isHovered={hoveredChurchId === church.id}
                onHover={setHoveredChurch}
                onClick={(_slug) => setSelectedChurch(church.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {meta && totalPages > 1 && (
        <div className='px-4 py-4 border-t border-gray-200 flex items-center justify-between'>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className='p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            aria-label='Previous page'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>

          <span className='text-sm text-gray-600'>
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className='p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            aria-label='Next page'
          >
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      )}
    </div>
  )
}
