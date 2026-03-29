import {
  Accessibility,
  Baby,
  Calendar,
  Car,
  Church,
  Coffee,
  Compass,
  Globe,
  Moon,
  Music,
  Sun,
  Users,
  Video,
  X,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { DENOMINATION_OPTIONS } from '@/constants'
import { useSearchStore } from '@/stores/search-store'

interface CategoryItem {
  label: string
  icon: React.ReactNode
  filterKey: string
  filterValue: string | number
}

const CATEGORIES: CategoryItem[] = [
  ...DENOMINATION_OPTIONS.map((denomination) => ({
    label: denomination,
    icon: <Church className='h-4 w-4' />,
    filterKey: 'denomination',
    filterValue: denomination,
  })),
]

const QUICK_FILTERS: CategoryItem[] = [
  { label: 'Sunday', icon: <Calendar className='h-4 w-4' />, filterKey: 'day', filterValue: 0 },
  { label: 'Morning', icon: <Sun className='h-4 w-4' />, filterKey: 'time', filterValue: 'morning' },
  { label: 'Evening', icon: <Moon className='h-4 w-4' />, filterKey: 'time', filterValue: 'evening' },
  { label: 'Spanish', icon: <Globe className='h-4 w-4' />, filterKey: 'language', filterValue: 'Spanish' },
  { label: 'Parking', icon: <Car className='h-4 w-4' />, filterKey: 'amenities', filterValue: 'Parking' },
  { label: 'Accessible', icon: <Accessibility className='h-4 w-4' />, filterKey: 'amenities', filterValue: 'Wheelchair Accessible' },
  { label: 'Nursery', icon: <Baby className='h-4 w-4' />, filterKey: 'amenities', filterValue: 'Nursery' },
  { label: 'Youth', icon: <Users className='h-4 w-4' />, filterKey: 'amenities', filterValue: 'Youth Programs' },
  { label: 'Choir', icon: <Music className='h-4 w-4' />, filterKey: 'amenities', filterValue: 'Choir' },
  { label: 'Livestream', icon: <Video className='h-4 w-4' />, filterKey: 'amenities', filterValue: 'Livestream' },
  { label: 'Coffee Bar', icon: <Coffee className='h-4 w-4' />, filterKey: 'amenities', filterValue: 'Coffee Bar' },
]

interface CategoryFilterProps {
  showQuickFilters?: boolean
}

export const CategoryFilter = ({ showQuickFilters = false }: CategoryFilterProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const filters = useSearchStore((state) => state.filters)
  const setFilter = useSearchStore((state) => state.setFilter)
  const clearFilters = useSearchStore((state) => state.clearFilters)

  const items = showQuickFilters ? QUICK_FILTERS : CATEGORIES
  const activeFilterCount = Object.values(filters).filter((value) => value !== undefined && value !== '').length
  const hasActiveFilters = activeFilterCount > 0
  const isHomePage = location.pathname === '/'

  const isActive = (filterKey: string, filterValue: string | number) => {
    const currentValue = filters[filterKey as keyof typeof filters]
    return currentValue === filterValue
  }

  const handleClick = (filterKey: string, filterValue: string | number) => {
    const currentValue = filters[filterKey as keyof typeof filters]
    setFilter(
      filterKey as keyof typeof filters,
      currentValue === filterValue ? undefined : filterValue,
    )
  }

  return (
    <div className='flex w-full flex-col gap-4 px-4 py-4 sm:px-6 lg:px-10 xl:px-20'>
      <div className='flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9a8f80]'>
            {showQuickFilters ? 'Quick Filters' : 'Browse By Tradition'}
          </p>
          <p className='mt-1 text-sm text-[#5f5a55]'>
            {showQuickFilters
              ? 'Start with the things people usually care about first.'
              : 'Jump straight into the traditions you want to explore.'}
          </p>
        </div>

        {hasActiveFilters ? (
          <button
            type='button'
            onClick={clearFilters}
            className='inline-flex items-center gap-2 self-start rounded-full border border-[#d7d1c5] bg-white px-4 py-2 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef]'
          >
            <X className='h-4 w-4' />
            Clear {activeFilterCount === 1 ? '1 filter' : `${activeFilterCount} filters`}
          </button>
        ) : isHomePage ? (
          <button
            type='button'
            onClick={() => navigate('/search')}
            className='inline-flex items-center gap-2 self-start rounded-full border border-[#d7d1c5] bg-white px-4 py-2 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222] hover:bg-[#f8f5ef]'
          >
            <Compass className='h-4 w-4' />
            Open live map
          </button>
        ) : null}
      </div>

      <div className='category-scroll pb-1'>
        {items.map((item) => {
          const active = isActive(item.filterKey, item.filterValue)

          return (
            <button
              key={`${item.filterKey}-${item.filterValue}`}
              type='button'
              onClick={() => handleClick(item.filterKey, item.filterValue)}
              className={`group inline-flex min-w-max flex-shrink-0 items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold transition-all duration-150 ${
                active
                  ? 'border-[#222222] bg-[#222222] text-white shadow-airbnb-subtle'
                  : 'border-[#ddd6ca] bg-white text-[#5f5a55] hover:border-[#222222] hover:bg-[#f8f5ef] hover:text-[#222222]'
              }`}
            >
              <span className={active ? 'opacity-100' : 'opacity-70 transition-opacity group-hover:opacity-100'}>
                {item.icon}
              </span>
              <span className='whitespace-nowrap leading-none'>{item.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
