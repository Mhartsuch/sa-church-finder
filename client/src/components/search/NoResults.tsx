import { Search, SlidersHorizontal, MapPin, RotateCcw } from 'lucide-react'
import { useSearchStore } from '@/stores/search-store'
import { DAY_OPTIONS } from '@/constants'

/**
 * Contextual "no results" empty state with smart suggestions
 * based on which filters/query are currently active.
 */
export const NoResults = () => {
  const query = useSearchStore((s) => s.query)
  const filters = useSearchStore((s) => s.filters)
  const clearFilters = useSearchStore((s) => s.clearFilters)
  const setQuery = useSearchStore((s) => s.setQuery)
  const setFilter = useSearchStore((s) => s.setFilter)

  const hasQuery = query.trim().length > 0
  const activeFilterKeys = Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k]) => k)
  const hasFilters = activeFilterKeys.length > 0

  // Build contextual suggestions
  const suggestions: { label: string; action: () => void; icon: React.ReactNode }[] = []

  if (hasQuery && hasFilters) {
    suggestions.push({
      label: 'Clear filters and keep search',
      icon: <SlidersHorizontal className='w-4 h-4' />,
      action: () => {
        const currentQuery = query
        clearFilters() // clears both query and filters
        setQuery(currentQuery)
      },
    })
  }

  if (hasQuery) {
    suggestions.push({
      label: 'Clear search text',
      icon: <Search className='w-4 h-4' />,
      action: () => setQuery(''),
    })
  }

  if (hasFilters) {
    // Suggest removing individual filters
    if (filters.denomination) {
      suggestions.push({
        label: `Remove "${filters.denomination}" filter`,
        icon: <RotateCcw className='w-4 h-4' />,
        action: () => setFilter('denomination', undefined),
      })
    }
    if (filters.day !== undefined) {
      const dayLabel = DAY_OPTIONS.find((d) => d.value === filters.day)?.label || 'day'
      suggestions.push({
        label: `Remove "${dayLabel}" filter`,
        icon: <RotateCcw className='w-4 h-4' />,
        action: () => setFilter('day', undefined),
      })
    }
    if (filters.language) {
      suggestions.push({
        label: `Remove "${filters.language}" filter`,
        icon: <RotateCcw className='w-4 h-4' />,
        action: () => setFilter('language', undefined),
      })
    }
  }

  if (hasQuery || hasFilters) {
    suggestions.push({
      label: 'Reset everything',
      icon: <RotateCcw className='w-4 h-4' />,
      action: clearFilters,
    })
  }

  return (
    <div className='flex items-center justify-center py-16 sm:py-20'>
      <div className='text-center max-w-md px-4'>
        {/* Icon */}
        <div className='mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-5'>
          <MapPin className='w-7 h-7 text-[#717171]' />
        </div>

        {/* Heading */}
        <h3 className='text-xl font-semibold text-[#222222] mb-2'>
          No churches found
        </h3>

        {/* Contextual description */}
        <p className='text-[15px] text-[#717171] mb-6'>
          {hasQuery && hasFilters
            ? `We couldn't find churches matching "${query}" with those filters. Try broadening your search.`
            : hasQuery
              ? `We couldn't find churches matching "${query}". Check the spelling or try a different search.`
              : hasFilters
                ? 'No churches match your current filters. Try removing some to see more results.'
                : 'No churches are available in this area yet.'}
        </p>

        {/* Suggestion buttons */}
        {suggestions.length > 0 && (
          <div className='flex flex-col gap-2 items-center'>
            {suggestions.slice(0, 3).map((suggestion, i) => (
              <button
                key={i}
                onClick={suggestion.action}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  i === 0
                    ? 'bg-[#222222] text-white hover:bg-[#000000]'
                    : 'bg-gray-100 text-[#222222] hover:bg-gray-200'
                }`}
              >
                {suggestion.icon}
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
