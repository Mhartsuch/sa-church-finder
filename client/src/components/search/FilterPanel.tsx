import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSearchStore } from '@/stores/search-store'
import {
  DENOMINATION_OPTIONS,
  DAY_OPTIONS,
  TIME_OPTIONS,
  LANGUAGE_OPTIONS,
  AMENITY_OPTIONS
} from '@/constants'

export const FilterPanel = () => {
  const filters = useSearchStore((state) => state.filters)
  const setFilter = useSearchStore((state) => state.setFilter)
  const clearFilters = useSearchStore((state) => state.clearFilters)
  const [expandedSection, setExpandedSection] = useState<string | null>('denomination')

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '')

  return (
    <aside className='w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col'>
      <div className='p-4 border-b border-gray-200'>
        <h2 className='text-lg font-semibold text-gray-900 mb-3'>Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className='text-sm text-blue-600 hover:text-blue-700 font-medium'
          >
            Clear all filters
          </button>
        )}
      </div>

      <div className='flex-1 overflow-y-auto'>
        {/* Denomination */}
        <div className='border-b border-gray-200'>
          <button
            onClick={() => toggleSection('denomination')}
            className='w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50'
          >
            <span className='font-medium text-gray-900'>Denomination</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSection === 'denomination' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSection === 'denomination' && (
            <div className='px-4 py-3 bg-gray-50'>
              <select
                value={filters.denomination || ''}
                onChange={(e) => setFilter('denomination', e.target.value || undefined)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>All denominations</option>
                {DENOMINATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Service Day */}
        <div className='border-b border-gray-200'>
          <button
            onClick={() => toggleSection('day')}
            className='w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50'
          >
            <span className='font-medium text-gray-900'>Service Day</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSection === 'day' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSection === 'day' && (
            <div className='px-4 py-3 bg-gray-50'>
              <select
                value={filters.day !== undefined ? filters.day : ''}
                onChange={(e) =>
                  setFilter('day', e.target.value !== '' ? parseInt(e.target.value) : undefined)
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Any day</option>
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Time of Day */}
        <div className='border-b border-gray-200'>
          <button
            onClick={() => toggleSection('time')}
            className='w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50'
          >
            <span className='font-medium text-gray-900'>Time of Day</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSection === 'time' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSection === 'time' && (
            <div className='px-4 py-3 bg-gray-50'>
              <select
                value={filters.time || ''}
                onChange={(e) => setFilter('time', e.target.value || undefined)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Any time</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Language */}
        <div className='border-b border-gray-200'>
          <button
            onClick={() => toggleSection('language')}
            className='w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50'
          >
            <span className='font-medium text-gray-900'>Language</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSection === 'language' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSection === 'language' && (
            <div className='px-4 py-3 bg-gray-50'>
              <select
                value={filters.language || ''}
                onChange={(e) => setFilter('language', e.target.value || undefined)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Any language</option>
                {LANGUAGE_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Amenities */}
        <div className='border-b border-gray-200'>
          <button
            onClick={() => toggleSection('amenities')}
            className='w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50'
          >
            <span className='font-medium text-gray-900'>Amenities</span>
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSection === 'amenities' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSection === 'amenities' && (
            <div className='px-4 py-3 bg-gray-50 space-y-2'>
              <select
                value={filters.amenities || ''}
                onChange={(e) => setFilter('amenities', e.target.value || undefined)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500'
              >
                <option value=''>Any amenities</option>
                {AMENITY_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
