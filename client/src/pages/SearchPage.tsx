import { useEffect, useMemo, useState } from 'react'
import { List, Map, SlidersHorizontal, X } from 'lucide-react'

import { ChurchList } from '@/components/church/ChurchList'
import { MapContainer } from '@/components/map/MapContainer'
import { FilterPanel } from '@/components/search/FilterPanel'
import { CategoryFilter } from '@/components/search/CategoryFilter'
import { SearchBar } from '@/components/search/SearchBar'
import {
  useChurchSearchParams,
  useChurches,
} from '@/hooks/useChurches'
import { useURLSearchState } from '@/hooks/useURLSearchState'
import { getActiveSearchTokens } from '@/lib/search-state'
import { SearchFilters, useSearchStore } from '@/stores/search-store'

const MOBILE_BREAKPOINT = 768

const SORT_OPTIONS = [
  { value: 'distance', label: 'Nearest first' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'name', label: 'Name (A-Z)' },
] as const

export const SearchPage = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  )
  const [showMap, setShowMap] = useState(!isMobile)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const query = useSearchStore((state) => state.query)
  const filters = useSearchStore((state) => state.filters)
  const sort = useSearchStore((state) => state.sort)
  const mapBounds = useSearchStore((state) => state.mapBounds)
  const setFilter = useSearchStore((state) => state.setFilter)
  const setQuery = useSearchStore((state) => state.setQuery)
  const setSort = useSearchStore((state) => state.setSort)
  const clearFilters = useSearchStore((state) => state.clearFilters)

  useURLSearchState()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!isMobile) {
      setShowMap(true)
    }
  }, [isMobile])

  useEffect(() => {
    if (!isFiltersOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFiltersOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isFiltersOpen])

  const searchParams = useChurchSearchParams()
  const { data, error, isLoading } = useChurches(searchParams)
  const activeTokens = useMemo(
    () => getActiveSearchTokens(query, filters),
    [filters, query],
  )
  const totalResults = data?.meta.total ?? 0
  const activeAdvancedFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== '',
  ).length

  const resultsHeading = isLoading
    ? 'Finding churches that fit'
    : error
      ? 'Search results are temporarily unavailable'
      : totalResults === 1
        ? '1 church matches right now'
        : `${totalResults} churches match right now`

  const resultsDescription = error
    ? 'The list below will show the detailed error, but your filters and search state are still intact.'
    : mapBounds
      ? 'The directory is following the part of San Antonio that is currently visible on the map.'
      : 'The directory is starting around central San Antonio until you move the map or refine the filters.'

  const removeToken = (tokenKey: 'query' | keyof SearchFilters) => {
    if (tokenKey === 'query') {
      setQuery('')
      return
    }

    setFilter(tokenKey, undefined)
  }

  return (
    <>
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden bg-[#fcfaf6]'>
        <div className='border-b border-[#ece4d7] bg-white'>
          <div className='mx-auto max-w-[2520px]'>
            <CategoryFilter showQuickFilters />
          </div>
        </div>

        <div className='border-b border-[#ece4d7] bg-[#fcfaf6]'>
          <div className='mx-auto max-w-[2520px] px-4 py-5 sm:px-6 lg:px-8'>
            <section className='rounded-[32px] border border-[#e8dfd2] bg-white/92 p-4 shadow-airbnb-subtle backdrop-blur-sm sm:p-5'>
              <div className='flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
                <div className='max-w-3xl'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8f80]'>
                    Search workspace
                  </p>
                  <h1 className='mt-2 text-2xl font-semibold tracking-tight text-[#1d1d1b] sm:text-3xl'>
                    {resultsHeading}
                  </h1>
                  <p className='mt-2 text-sm leading-6 text-[#5f5a55]'>
                    {query.trim()
                      ? `You are currently searching for "${query.trim()}". `
                      : ''}
                    {resultsDescription}
                  </p>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {!isMobile ? (
                    <button
                      type='button'
                      onClick={() => setShowMap((current) => !current)}
                      className='inline-flex items-center gap-2 rounded-full border border-[#d7d1c5] bg-white px-4 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef]'
                    >
                      {showMap ? (
                        <>
                          <List className='h-4 w-4' />
                          Focus on list
                        </>
                      ) : (
                        <>
                          <Map className='h-4 w-4' />
                          Bring back map
                        </>
                      )}
                    </button>
                  ) : null}

                  <button
                    type='button'
                    onClick={() => setIsFiltersOpen(true)}
                    className='inline-flex items-center gap-2 rounded-full bg-[#222222] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black'
                  >
                    <SlidersHorizontal className='h-4 w-4' />
                    {activeAdvancedFilterCount > 0
                      ? `All filters (${activeAdvancedFilterCount})`
                      : 'All filters'}
                  </button>
                </div>
              </div>

              <div className='mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr),220px]'>
                <SearchBar
                  variant='compact'
                  onSubmit={() => {
                    if (isMobile) {
                      setShowMap(false)
                    }
                  }}
                />

                <label className='w-full'>
                  <span className='text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9a8f80]'>
                    Sort by
                  </span>
                  <select
                    value={sort}
                    onChange={(event) => {
                      setSort(event.target.value as (typeof SORT_OPTIONS)[number]['value'])
                    }}
                    className='mt-2 w-full rounded-full border border-[#d7d1c5] bg-white px-4 py-3 text-sm font-semibold text-[#222222] outline-none transition-colors focus:border-[#222222]'
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className='mt-4 flex flex-wrap items-center gap-2'>
                {activeTokens.length > 0 ? (
                  <>
                    {activeTokens.map((token) => (
                      <button
                        key={`${token.key}-${token.value}`}
                        type='button'
                        onClick={() => removeToken(token.key)}
                        className='inline-flex items-center gap-2 rounded-full border border-[#ddd6ca] bg-[#fcfaf6] px-4 py-2 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef]'
                      >
                        <span>
                          {token.label}: {token.value}
                        </span>
                        <X className='h-3.5 w-3.5 text-[#8f8f8f]' />
                      </button>
                    ))}

                    <button
                      type='button'
                      onClick={clearFilters}
                      className='inline-flex items-center gap-2 rounded-full px-2 py-2 text-sm font-semibold text-[#5f5a55] underline decoration-[#d5cab9] underline-offset-4 transition-colors hover:text-[#222222]'
                    >
                      Clear everything
                    </button>
                  </>
                ) : (
                  <p className='text-sm leading-6 text-[#5f5a55]'>
                    Use the quick filters above for fast narrowing, or open the full
                    filter panel when you want a more deliberate pass.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        <div className='flex min-h-0 flex-1 overflow-hidden'>
          {(!isMobile || !showMap) && (
            <div
              className={`min-h-0 overflow-y-auto ${
                !isMobile && showMap ? 'w-[55%] xl:w-[58%]' : 'w-full'
              }`}
            >
              <div className='px-4 py-5 sm:px-6 lg:px-8 lg:py-6'>
                <ChurchList variant={isMobile ? 'grid' : 'sidebar'} />
              </div>
            </div>
          )}

          {showMap && (
            <div
              className={`min-h-0 ${
                isMobile
                  ? 'w-full'
                  : 'flex-1 border-l border-[#ece4d7] bg-white'
              }`}
            >
              <MapContainer />
            </div>
          )}
        </div>

        {isMobile ? (
          <button
            type='button'
            onClick={() => setShowMap((current) => !current)}
            className='fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#222222] px-5 py-3 text-[14px] font-semibold text-white shadow-lg transition-all hover:scale-[1.04] hover:bg-black'
          >
            {showMap ? (
              <>
                Show list
                <List className='h-4 w-4' />
              </>
            ) : (
              <>
                Show map
                <Map className='h-4 w-4' />
              </>
            )}
          </button>
        ) : null}
      </div>

      {isFiltersOpen ? (
        <div
          className='fixed inset-0 z-[60] bg-black/35 backdrop-blur-[2px]'
          onClick={() => setIsFiltersOpen(false)}
        >
          <div
            role='dialog'
            aria-modal='true'
            aria-label='Advanced filters'
            className='ml-auto h-full w-full max-w-[440px] shadow-2xl'
            onClick={(event) => event.stopPropagation()}
          >
            <FilterPanel
              onClose={() => {
                setIsFiltersOpen(false)
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
