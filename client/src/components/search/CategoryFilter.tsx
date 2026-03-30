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
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { DENOMINATION_OPTIONS } from '@/constants';
import { useSearchStore } from '@/stores/search-store';

interface CategoryItem {
  label: string;
  icon: React.ReactNode;
  filterKey: string;
  filterValue: string | number;
}

const CATEGORIES: CategoryItem[] = [
  ...DENOMINATION_OPTIONS.map((denomination) => ({
    label: denomination,
    icon: <Church className="h-5 w-5" />,
    filterKey: 'denomination',
    filterValue: denomination,
  })),
];

const QUICK_FILTERS: CategoryItem[] = [
  { label: 'Sunday', icon: <Calendar className="h-5 w-5" />, filterKey: 'day', filterValue: 0 },
  {
    label: 'Morning',
    icon: <Sun className="h-5 w-5" />,
    filterKey: 'time',
    filterValue: 'morning',
  },
  {
    label: 'Evening',
    icon: <Moon className="h-5 w-5" />,
    filterKey: 'time',
    filterValue: 'evening',
  },
  {
    label: 'Spanish',
    icon: <Globe className="h-5 w-5" />,
    filterKey: 'language',
    filterValue: 'Spanish',
  },
  {
    label: 'Parking',
    icon: <Car className="h-5 w-5" />,
    filterKey: 'amenities',
    filterValue: 'Parking',
  },
  {
    label: 'Accessible',
    icon: <Accessibility className="h-5 w-5" />,
    filterKey: 'amenities',
    filterValue: 'Wheelchair Accessible',
  },
  {
    label: 'Nursery',
    icon: <Baby className="h-5 w-5" />,
    filterKey: 'amenities',
    filterValue: 'Nursery',
  },
  {
    label: 'Youth',
    icon: <Users className="h-5 w-5" />,
    filterKey: 'amenities',
    filterValue: 'Youth Programs',
  },
  {
    label: 'Choir',
    icon: <Music className="h-5 w-5" />,
    filterKey: 'amenities',
    filterValue: 'Choir',
  },
  {
    label: 'Livestream',
    icon: <Video className="h-5 w-5" />,
    filterKey: 'amenities',
    filterValue: 'Livestream',
  },
  {
    label: 'Coffee',
    icon: <Coffee className="h-5 w-5" />,
    filterKey: 'amenities',
    filterValue: 'Coffee Bar',
  },
];

interface CategoryFilterProps {
  showQuickFilters?: boolean;
}

export const CategoryFilter = ({ showQuickFilters = false }: CategoryFilterProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const filters = useSearchStore((state) => state.filters);
  const setFilter = useSearchStore((state) => state.setFilter);
  const clearFilters = useSearchStore((state) => state.clearFilters);

  const items = showQuickFilters ? QUICK_FILTERS : CATEGORIES;
  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== '',
  ).length;
  const hasActiveFilters = activeFilterCount > 0;
  const isHomePage = location.pathname === '/';

  const isActive = (filterKey: string, filterValue: string | number) => {
    const currentValue = filters[filterKey as keyof typeof filters];
    return currentValue === filterValue;
  };

  const handleClick = (filterKey: string, filterValue: string | number) => {
    const currentValue = filters[filterKey as keyof typeof filters];
    setFilter(
      filterKey as keyof typeof filters,
      currentValue === filterValue ? undefined : filterValue,
    );
  };

  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-10 xl:px-12">
      <div className="hide-scrollbar flex flex-1 items-center gap-1 overflow-x-auto py-3">
        {items.map((item) => {
          const active = isActive(item.filterKey, item.filterValue);

          return (
            <button
              key={`${item.filterKey}-${item.filterValue}`}
              type="button"
              onClick={() => handleClick(item.filterKey, item.filterValue)}
              className={`group flex min-w-[84px] flex-shrink-0 flex-col items-center gap-2 border-b-2 px-3 pb-3 pt-2 text-center transition-all duration-150 ${
                active
                  ? 'border-[#222222] text-[#222222]'
                  : 'border-transparent text-[#8c8174] hover:border-[#b9b0a5] hover:text-[#222222]'
              }`}
            >
              <span
                className={`${active ? 'opacity-100' : 'opacity-75 transition-opacity group-hover:opacity-100'}`}
              >
                {item.icon}
              </span>
              <span className="whitespace-nowrap text-[12px] font-semibold leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="hidden items-center gap-3 border-l border-[#ece4d7] pl-4 lg:flex">
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-[#ddd6ca] bg-white px-4 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222]"
          >
            <X className="h-4 w-4" />
            Clear {activeFilterCount === 1 ? '1 filter' : `${activeFilterCount} filters`}
          </button>
        ) : isHomePage ? (
          <button
            type="button"
            onClick={() => navigate('/search')}
            className="inline-flex items-center gap-2 rounded-xl border border-[#ddd6ca] bg-white px-4 py-2.5 text-sm font-semibold text-[#222222] transition-colors hover:border-[#222222]"
          >
            <Compass className="h-4 w-4" />
            Open live map
          </button>
        ) : (
          <div className="rounded-xl border border-[#ece4d7] bg-white px-4 py-2.5 text-sm font-medium text-[#6f6a64]">
            Tap a category to narrow the list
          </div>
        )}
      </div>
    </div>
  );
};
