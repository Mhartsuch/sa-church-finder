import {
  Church,
  Sun,
  Moon,
  Globe,
  Car,
  Accessibility,
  Baby,
  Users,
  Music,
  Video,
  Coffee,
  Calendar,
  SlidersHorizontal,
} from 'lucide-react'
import { useSearchStore } from '@/stores/search-store'
import {
  DENOMINATION_OPTIONS,
} from '@/constants'

interface CategoryItem {
  label: string
  icon: React.ReactNode
  filterKey: string
  filterValue: string | number
}

const CATEGORIES: CategoryItem[] = [
  // Denominations
  ...DENOMINATION_OPTIONS.map((d) => ({
    label: d,
    icon: <Church className='w-6 h-6' />,
    filterKey: 'denomination',
    filterValue: d,
  })),
]

const QUICK_FILTERS = [
  { label: 'Sunday', icon: <Calendar className='w-6 h-6' />, filterKey: 'day', filterValue: 0 },
  { label: 'Morning', icon: <Sun className='w-6 h-6' />, filterKey: 'time', filterValue: 'morning' },
  { label: 'Evening', icon: <Moon className='w-6 h-6' />, filterKey: 'time', filterValue: 'evening' },
  { label: 'Spanish', icon: <Globe className='w-6 h-6' />, filterKey: 'language', filterValue: 'Spanish' },
  { label: 'Parking', icon: <Car className='w-6 h-6' />, filterKey: 'amenities', filterValue: 'Parking' },
  { label: 'Accessible', icon: <Accessibility className='w-6 h-6' />, filterKey: 'amenities', filterValue: 'Wheelchair Accessible' },
  { label: 'Nursery', icon: <Baby className='w-6 h-6' />, filterKey: 'amenities', filterValue: 'Nursery' },
  { label: 'Youth', icon: <Users className='w-6 h-6' />, filterKey: 'amenities', filterValue: 'Youth Programs' },
  { label: 'Choir', icon: <Music className='w-6 h-6' />, filterKey: 'amenities', filterValue: 'Choir' },
  { label: 'Livestream', icon: <Video className='w-6 h-6' />, filterKey: 'amenities', filterValue: 'Livestream' },
  { label: 'Coffee Bar', icon: <Coffee className='w-6 h-6' />, filterKey: 'amenities', filterValue: 'Coffee Bar' },
]

interface CategoryFilterProps {
  showQuickFilters?: boolean
}

export const CategoryFilter = ({ showQuickFilters = false }: CategoryFilterProps) => {
  const filters = useSearchStore((state) => state.filters)
  const setFilter = useSearchStore((state) => state.setFilter)
  const clearFilters = useSearchStore((state) => state.clearFilters)

  const items = showQuickFilters ? QUICK_FILTERS : CATEGORIES

  const isActive = (filterKey: string, filterValue: string | number) => {
    const currentValue = filters[filterKey as keyof typeof filters]
    return currentValue === filterValue
  }

  const handleClick = (filterKey: string, filterValue: string | number) => {
    const currentValue = filters[filterKey as keyof typeof filters]
    if (currentValue === filterValue) {
      setFilter(filterKey as keyof typeof filters, undefined)
    } else {
      setFilter(filterKey as keyof typeof filters, filterValue)
    }
  }

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== '')

  return (
    <div className='w-full flex items-center'>
      <div className='category-scroll px-4 sm:px-6 lg:px-10 xl:px-20 py-3'>
        {items.map((item) => {
          const active = isActive(item.filterKey, item.filterValue)
          return (
            <button
              key={`${item.filterKey}-${item.filterValue}`}
              onClick={() => handleClick(item.filterKey, item.filterValue)}
              className={`flex flex-col items-center gap-2 min-w-[56px] pt-2 pb-3 px-1 border-b-[3px] transition-all duration-150 flex-shrink-0 group ${
                active
                  ? 'border-[#222222] text-[#222222]'
                  : 'border-transparent text-[#717171] hover:text-[#222222] hover:border-gray-300'
              }`}
            >
              <span className={`transition-opacity ${
                active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
              }`}>
                {item.icon}
              </span>
              <span className='text-xs font-semibold whitespace-nowrap leading-none'>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Filters button — Airbnb style */}
      <div className='flex-shrink-0 pr-4 sm:pr-6 lg:pr-10 xl:pr-20 pl-4 border-l border-gray-200'>
        {hasActiveFilters ? (
          <button
            onClick={clearFilters}
            className='pill-btn text-[#222222] border-[#222222]'
          >
            <SlidersHorizontal className='w-4 h-4' />
            Clear
          </button>
        ) : (
          <button className='pill-btn text-[#222222]'>
            <SlidersHorizontal className='w-4 h-4' />
            Filters
          </button>
        )}
      </div>
    </div>
  )
}
