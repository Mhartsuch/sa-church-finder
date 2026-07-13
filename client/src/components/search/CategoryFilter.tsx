import { Scale, SlidersHorizontal } from 'lucide-react';

import { useRibbonCategories } from '@/hooks/useRibbonCategories';
import { countActiveFilters } from '@/lib/search-state';
import { useSearchStore } from '@/stores/search-store';
import type { IRibbonCategory } from '@/types/ribbon-category';

// Fallback shown when the ribbon-categories API errors or returns no rows.
// Mirrors the 6 default categories seeded by server/src/scripts/seed-ribbon-categories.ts.
const FALLBACK_TIMESTAMP = new Date(0).toISOString();

type DefaultCategorySeed = Pick<
  IRibbonCategory,
  'label' | 'icon' | 'slug' | 'filterType' | 'filterValue' | 'position'
>;

const DEFAULT_CATEGORY_SEEDS: DefaultCategorySeed[] = [
  { label: 'Historic', icon: '🏛️', slug: 'historic', filterType: 'QUERY', filterValue: 'Historic', position: 0 },
  { label: 'Contemporary', icon: '🎵', slug: 'contemporary', filterType: 'QUERY', filterValue: 'Contemporary', position: 1 },
  { label: 'Traditional', icon: '🏠', slug: 'traditional', filterType: 'QUERY', filterValue: 'Traditional', position: 2 },
  { label: 'Community', icon: '💜', slug: 'community', filterType: 'QUERY', filterValue: 'Community', position: 3 },
  { label: 'Missions', icon: '🏛️', slug: 'missions', filterType: 'QUERY', filterValue: 'Mission', position: 4 },
  { label: 'Megachurch', icon: '🏢', slug: 'megachurch', filterType: 'QUERY', filterValue: 'Megachurch', position: 5 },
];

const DEFAULT_CATEGORIES: IRibbonCategory[] = DEFAULT_CATEGORY_SEEDS.map((seed) => ({
  ...seed,
  id: `default-${seed.slug}`,
  isVisible: true,
  source: 'MANUAL',
  isPinned: true,
  createdAt: FALLBACK_TIMESTAMP,
  updatedAt: FALLBACK_TIMESTAMP,
}));

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
  const toggleDenomination = useSearchStore((state) => state.toggleDenomination);
  const clearFilters = useSearchStore((state) => state.clearFilters);
  const setQuery = useSearchStore((state) => state.setQuery);
  const { data: ribbonData } = useRibbonCategories();

  // Fall back to the default chips when the API errors or has no rows,
  // so the ribbon never collapses to just the "All" chip.
  const categories: IRibbonCategory[] = ribbonData?.data?.length
    ? ribbonData.data
    : DEFAULT_CATEGORIES;

  const activeFilterCount = countActiveFilters(filters);

  const hasAnyDenomination = !!filters.denomination && filters.denomination.length > 0;
  const isDenominationSelected = (value: string) => !!filters.denomination?.includes(value);

  const isAllActive = !query.trim() && !hasAnyDenomination;

  const isActive = (item: IRibbonCategory) => {
    if (item.filterType === 'DENOMINATION') {
      return isDenominationSelected(item.filterValue);
    }

    return query.trim().toLowerCase() === item.filterValue.toLowerCase();
  };

  const handleAllClick = () => {
    clearFilters();
  };

  const handleClick = (item: IRibbonCategory) => {
    if (item.filterType === 'DENOMINATION') {
      const wasAlreadyOn = isDenominationSelected(item.filterValue);
      toggleDenomination(item.filterValue);
      if (!wasAlreadyOn) {
        setQuery('');
      }
      return;
    }

    // QUERY type — toggle text search
    const nextQuery = item.filterValue;
    setQuery(query.trim().toLowerCase() === nextQuery.toLowerCase() ? '' : nextQuery);
    setFilter('denomination', undefined);
  };

  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-10 xl:px-12">
      <div className="hide-scrollbar flex flex-1 items-center gap-0.5 overflow-x-auto py-3">
        {/* "All" chip — always first, not stored in DB */}
        <button
          type="button"
          onClick={handleAllClick}
          className={`flex flex-shrink-0 flex-col items-center gap-1 border-b-2 px-3 pb-3 pt-2 transition-all duration-200 ${
            isAllActive
              ? 'border-foreground opacity-100'
              : 'border-transparent opacity-[0.64] hover:border-[#b0b0b0] hover:opacity-100'
          }`}
        >
          <span className="text-2xl leading-none">⛪</span>
          <span
            className={`whitespace-nowrap text-[12px] font-semibold leading-none ${
              isAllActive ? 'text-foreground' : 'text-muted-foreground'
            }`}
          >
            All
          </span>
        </button>

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

      {/* Mobile-only filters button — visible below lg breakpoint */}
      {onOpenFilters ? (
        <button
          type="button"
          onClick={onOpenFilters}
          className="relative inline-flex min-h-[44px] flex-shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-foreground lg:hidden"
          aria-label="Open filters"
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
