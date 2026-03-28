import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSearchStore } from '@/stores/search-store'

/**
 * Syncs the Zustand search store with URL search parameters.
 * - On mount: reads URL params and initializes the store
 * - On store changes: updates the URL (without full navigation)
 *
 * This makes search state shareable and bookmarkable.
 */
export const useURLSearchState = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const isInitialized = useRef(false)

  // Store selectors
  const query = useSearchStore((s) => s.query)
  const filters = useSearchStore((s) => s.filters)
  const sort = useSearchStore((s) => s.sort)
  const page = useSearchStore((s) => s.page)

  // Store actions
  const setQuery = useSearchStore((s) => s.setQuery)
  const setFilter = useSearchStore((s) => s.setFilter)
  const setSort = useSearchStore((s) => s.setSort)
  const setPage = useSearchStore((s) => s.setPage)

  // On mount: read URL params → populate store
  useEffect(() => {
    if (isInitialized.current) return

    const urlQuery = searchParams.get('q')
    const urlDenomination = searchParams.get('denomination')
    const urlDay = searchParams.get('day')
    const urlTime = searchParams.get('time')
    const urlLanguage = searchParams.get('language')
    const urlAmenities = searchParams.get('amenities')
    const urlSort = searchParams.get('sort')
    const urlPage = searchParams.get('page')

    if (urlQuery) setQuery(urlQuery)
    if (urlDenomination) setFilter('denomination', urlDenomination)
    if (urlDay) setFilter('day', parseInt(urlDay))
    if (urlTime) setFilter('time', urlTime)
    if (urlLanguage) setFilter('language', urlLanguage)
    if (urlAmenities) setFilter('amenities', urlAmenities)
    if (urlSort && ['distance', 'rating', 'name'].includes(urlSort)) {
      setSort(urlSort as 'distance' | 'rating' | 'name')
    }
    if (urlPage) {
      const parsed = parseInt(urlPage)
      if (parsed > 0) setPage(parsed)
    }

    isInitialized.current = true
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // On store change: write store → URL params
  useEffect(() => {
    if (!isInitialized.current) return

    const params = new URLSearchParams()

    if (query) params.set('q', query)
    if (filters.denomination) params.set('denomination', filters.denomination)
    if (filters.day !== undefined) params.set('day', String(filters.day))
    if (filters.time) params.set('time', filters.time)
    if (filters.language) params.set('language', filters.language)
    if (filters.amenities) params.set('amenities', filters.amenities)
    if (sort !== 'distance') params.set('sort', sort)
    if (page > 1) params.set('page', String(page))

    setSearchParams(params, { replace: true })
  }, [query, filters, sort, page, setSearchParams])
}
