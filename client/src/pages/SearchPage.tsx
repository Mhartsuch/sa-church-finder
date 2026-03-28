import { SearchBar } from '@/components/search/SearchBar'
import { FilterPanel } from '@/components/search/FilterPanel'
import { MapPlaceholder } from '@/components/map/MapPlaceholder'
import { ChurchList } from '@/components/church/ChurchList'

export const SearchPage = () => {
  return (
    <div className='flex flex-col flex-1 overflow-hidden'>
      {/* Search Bar */}
      <div className='px-6 py-4 bg-white border-b border-gray-200'>
        <SearchBar />
      </div>

      {/* Main Content */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Filter Panel */}
        <FilterPanel />

        {/* Map */}
        <MapPlaceholder />

        {/* List */}
        <ChurchList />
      </div>
    </div>
  )
}
