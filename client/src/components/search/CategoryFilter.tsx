import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Building2,
  Church,
  Cross,
  Droplets,
  Handshake,
  Landmark,
  Leaf,
  Music4,
  Scale,
  ScrollText,
  SlidersHorizontal,
  Sparkles,
  Sunrise,
  Trees,
} from 'lucide-react';

import { useSearchStore } from '@/stores/search-store';

interface CategoryItem {
  id: string;
  label: string;
  icon: LucideIcon;
  queryValue?: string;
  denominationValue?: string;
}

const CATEGORIES: CategoryItem[] = [
  { id: 'all', label: 'All', icon: Church },
  { id: 'historic', label: 'Historic', icon: Landmark, queryValue: 'Historic' },
  { id: 'contemporary', label: 'Contemporary', icon: Music4, queryValue: 'Contemporary' },
  { id: 'traditional', label: 'Traditional', icon: BookOpen, queryValue: 'Traditional' },
  { id: 'community', label: 'Community', icon: Handshake, queryValue: 'Community' },
  { id: 'catholic', label: 'Catholic', icon: Cross, denominationValue: 'Catholic' },
  { id: 'baptist', label: 'Baptist', icon: Droplets, denominationValue: 'Baptist' },
  { id: 'methodist', label: 'Methodist', icon: Sparkles, denominationValue: 'Methodist' },
  { id: 'episcopal', label: 'Episcopal', icon: Sunrise, queryValue: 'Episcopal' },
  { id: 'lutheran', label: 'Lutheran', icon: Leaf, denominationValue: 'Lutheran' },
  { id: 'non-denom', label: 'Non-Denom', icon: Trees, denominationValue: 'Non-denominational' },
  {
    id: 'presbyterian',
    label: 'Presbyterian',
    icon: ScrollText,
    denominationValue: 'Presbyterian',
  },
  { id: 'missions', label: 'Missions', icon: Landmark, queryValue: 'Mission' },
  { id: 'megachurch', label: 'Megachurch', icon: Building2, queryValue: 'Megachurch' },
];

interface CategoryFilterProps {
  compareCount?: number;
  onCompare?: () => void;
  onOpenFilters?: () => void;
}

export const CategoryFilter = ({
  compareCount = 0,
  onCompare,
  onOpenFilters,
}: CategoryFilterProps) => {
  const query = useSearchStore((state) => state.query);
  const filters = useSearchStore((state) => state.filters);
  const setFilter = useSearchStore((state) => state.setFilter);
  const clearFilters = useSearchStore((state) => state.clearFilters);
  const setQuery = useSearchStore((state) => state.setQuery);

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== '',
  ).length;

  const isActive = (item: CategoryItem) => {
    if (item.id === 'all') {
      return !query.trim() && !filters.denomination;
    }

    if (item.denominationValue) {
      return filters.denomination === item.denominationValue;
    }

    return query.trim().toLowerCase() === item.queryValue?.toLowerCase();
  };

  const handleClick = (item: CategoryItem) => {
    if (item.id === 'all') {
      clearFilters();
      return;
    }

    if (item.denominationValue) {
      const isSame = filters.denomination === item.denominationValue;
      setFilter('denomination', isSame ? undefined : item.denominationValue);
      if (!isSame) {
        setQuery('');
      }
      return;
    }

    const nextQuery = item.queryValue ?? '';
    setQuery(query.trim().toLowerCase() === nextQuery.toLowerCase() ? '' : nextQuery);
    setFilter('denomination', undefined);
  };

  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-10 xl:px-12">
      <div className="hide-scrollbar flex flex-1 items-center gap-1 overflow-x-auto py-3">
        {CATEGORIES.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className={`group flex min-w-[84px] flex-shrink-0 flex-col items-center gap-2 border-b-2 px-3 pb-3 pt-2 text-center transition-all duration-150 ${
                active
                  ? 'border-[#1a1a1a] text-[#1a1a1a]'
                  : 'border-transparent text-[#9a8f7f] hover:border-[#c4bdb0] hover:text-[#1a1a1a]'
              }`}
            >
              <span
                className={`${active ? 'opacity-100' : 'opacity-75 transition-opacity group-hover:opacity-100'}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="whitespace-nowrap text-[12px] font-semibold leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="hidden items-center gap-3 border-l border-[#e8e2d8] pl-4 lg:flex">
        {onCompare ? (
          <button
            type="button"
            onClick={onCompare}
            className="relative inline-flex items-center gap-2 rounded-xl border border-[#e0ddd8] bg-white px-4 py-2.5 pr-10 text-sm font-semibold text-[#1a1a1a] transition-colors hover:border-[#1a1a1a]"
          >
            <Scale className="h-4 w-4" />
            Compare
            {compareCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1a1a1a] px-1 text-[10px] font-bold text-white">
                {compareCount}
              </span>
            ) : null}
          </button>
        ) : null}

        {onOpenFilters ? (
          <button
            type="button"
            onClick={onOpenFilters}
            className="relative inline-flex items-center gap-2 rounded-xl border border-[#e0ddd8] bg-white px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors hover:border-[#1a1a1a]"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#d90b45] px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        ) : null}

        {activeFilterCount > 0 ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e0ddd8] bg-white px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-colors hover:border-[#1a1a1a]"
          >
            Reset
          </button>
        ) : (
          <div className="rounded-xl border border-[#e8e2d8] bg-white px-4 py-2.5 text-sm font-medium text-[#9a8f7f]">
            Browse by style or denomination
          </div>
        )}
      </div>
    </div>
  );
};
