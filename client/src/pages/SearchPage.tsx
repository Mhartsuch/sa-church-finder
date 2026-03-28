import { useState, useEffect } from 'react'
import { Map, List } from 'lucide-react'
import { CategoryFilter } from '@/components/search/CategoryFilter'
import { MapContainer } from '@/components/map/MapContainer'
import { ChurchList } from '@/components/church/ChurchList'
import { useURLSearchState } from '@/hooks/useURLSearchState'

const MOBILE_BREAKPOINT = 768

export const SearchPage = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )
  // On mobile: start with list view. On desktop: show both.
  const [showMap, setShowMap] = useState(!isMobile)

  // Sync search store ↔ URL params for shareable/bookmarkable URLs
  useURLSearchState()

  // Track viewport size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT
      setIsMobile(mobile)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className='flex flex-col flex-1 overflow-hidden'>
      {/* Category filter bar — sticky below header */}
      <div className='bg-white border-b border-gray-200'>
        <div className='max-w-[2520px] mx-auto'>
          <CategoryFilter showQuickFilters />
        </div>
      </div>

      {/* Main content: list + map split */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Church list panel — full width on mobile or when map hidden */}
        {(!isMobile || !showMap) && (
          <div className={`${
            !isMobile && showMap
              ? 'w-[55%] xl:w-[58%]'
              : 'w-full'
          } overflow-y-auto transition-all duration-300`}>
            <div className='px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
              <ChurchList variant={isMobile ? 'grid' : 'sidebar'} />
            </div>
          </div>
        )}

        {/* Map panel — full width on mobile, side panel on desktop */}
        {showMap && (
          <div className={`${
            isMobile
              ? 'w-full h-[calc(100vh-80px-57px)]'
              : 'flex-1 sticky top-0 h-[calc(100vh-80px-65px)] border-l border-gray-200'
          }`}>
            <MapContainer />
          </div>
        )}
      </div>

      {/* Floating map toggle button — Airbnb style */}
      <button
        onClick={() => setShowMap(!showMap)}
        className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-[#222222] text-white rounded-full shadow-lg hover:bg-[#000000] hover:scale-[1.04] transition-all font-semibold text-[14px]'
      >
        {showMap ? (
          <>
            Show list
            <List className='w-4 h-4' />
          </>
        ) : (
          <>
            Show map
            <Map className='w-4 h-4' />
          </>
        )}
      </button>
    </div>
  )
}
