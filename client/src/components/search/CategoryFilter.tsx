import { Scale, SlidersHorizontal } from 'lucide-react';

import { useFilterOptions } from '@/hooks/useChurches';
import { useSearchStore } from '@/stores/search-store';

interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  queryValue?: string;
  denominationValue?: string;
}

const ALL_CATEGORIES: CategoryItem[] = [
  { id: 'all', label: 'All', icon: '⛪' },
  { id: 'historic', label: 'Historic', icon: '🏛️', queryValue: 'Historic' },
  { id: 'contemporary', label: 'Contemporary', icon: '🎵', queryValue: 'Contemporary' },
  { id: 'traditional', label: 'Traditional', icon: '🏠', queryValue: 'Traditional' },
  { id: 'community', label: 'Community', icon: '💜', queryValue: 'Community' },
  { id: 'catholic', label: 'Catholic', icon: '✝️', denominationValue: 'Catholic' },
  { id: 'baptist', label: 'Baptist', icon: '💧', denominationValue: 'Baptist' },
  { id: 'methodist', label: 'Methodist', icon: '✨', denominationValue: 'Methodist' },
  { id: 'episcopal', label: 'Episcopal', icon: '🌅', denominationValue: 'Anglican' },
  { id: 'lutheran', label: 'Lutheran', icon: '🌿', denominationValue: 'Lutheran' },
  { id: 'non-denom', label: 'Non-Denom', icon: '🌳', denominationValue: 'Non-denominational' },
  {
    id: 'presbyterian',
    label: 'Presbyterian',
    icon: '📜',
    denominationValue: 'Presbyterian',
  },
  { id: 'missions', label: 'Missions', icon: '🏛️', queryValue: 'Mission' },
  { id: 'megachurch', label: 'Megachurch', icon: '🏢', queryValue: 'Megachurch' },
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
  const { data: filterOptions } = useFilterOptions();

  const activeFilterCount = Object.values(filters).filter(
    (value) => value !== undefined && value !== '',
  ).length;

  const availableDenominations = new Set(
    (filterOptions?.denominations ?? []).map((d) => d.toLowerCase()),
  );

  const categories = ALL_CATEGORIES.filter((item) => {
    if (!item.denominationValue) return true;
    return availableDenominations.has(item.denominationValue.toLowerCase());
  });

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
      <div className="hide-scrollbar flex flex-1 items-center gap-0.5 overflow-x-auto py-3">
        {categories.map((item) => {
          const active = isActive(item);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className={`flex flex-shrink-0 flex-col items-center gap-1 border-b-2 px-3 pb-3 pt-2 transition-all duration-200 ${
                active
                  ? 'border-foreground opacity-100'
                  : 'border-transparent opacity-[0.64] hover:border-[#b0b0b0] hover:opacity-100'
              }`}
            >
              <span className="text-2xl leading-none">{item.icon}</span>
              <span
                className={`whitespace-nowrap text-[12px] font-semibold leading-none ${
                  active ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="hidden items-center gap-3 border-l border-border pl-4 lg:flex">
        {onCompare ? (
          <button
            type="button"
            onClick={onCompare}
            className="relative inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-foreground"
          >
            <Scale className="h-4 w-4" />
            Compare
            {compareCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-background">
                {compareCount}
              </span>
            ) : null}
          </button>
        ) : null}

        {onOpenFilters ? (
          <button
            type="button"
            onClick={onOpenFilters}
            className="relative inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF385C] px-1 text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        ) : null}
      </div>
    </div>
  );
};
