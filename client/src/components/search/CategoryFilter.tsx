import { Scale, SlidersHorizontal } from 'lucide-react';

import { useFilterOptions } from '@/hooks/useChurches';
import { countActiveFilters } from '@/lib/search-state';
import { useSearchStore } from '@/stores/search-store';

interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  queryValue?: string;
  denominationValue?: string;
}

// How many denomination chips to pin to the homepage rail. The rail
// already scrolls horizontally, but a very long row buries the Compare
// and Filters buttons on desktop and pushes the trailing chips off-
// screen on mobile. 6 is enough for discovery; power users open the
// filter modal for the rest. Tradition chips are sorted by church
// count descending (the backend already orders them that way) so the
// most common traditions win the pinned slots.
const CATEGORY_DENOMINATION_LIMIT = 6;

// Fallback icons for the common denomination families. Keeping these
// local to the component (instead of the DB or a seed) avoids touching
// the data model for a purely presentational concern. Missing keys
// fall back to the generic church emoji — the rail still renders, just
// with a default icon.
const DENOMINATION_ICONS: Record<string, string> = {
  catholic: '✝️',
  baptist: '💧',
  methodist: '✨',
  episcopal: '🌅',
  anglican: '🌅',
  lutheran: '🌿',
  'non-denominational': '🌳',
  presbyterian: '📜',
  pentecostal: '🔥',
  orthodox: '☦️',
  adventist: '🌄',
};

const DEFAULT_DENOMINATION_ICON = '⛪';

const iconForDenomination = (value: string): string =>
  DENOMINATION_ICONS[value.toLowerCase()] ?? DEFAULT_DENOMINATION_ICON;

// Service-style chips stay static — they're text-search presets, not
// denominations, and the curated wording/icons are intentional.
const STATIC_CATEGORIES: CategoryItem[] = [
  { id: 'all', label: 'All', icon: '⛪' },
  { id: 'historic', label: 'Historic', icon: '🏛️', queryValue: 'Historic' },
  { id: 'contemporary', label: 'Contemporary', icon: '🎵', queryValue: 'Contemporary' },
  { id: 'traditional', label: 'Traditional', icon: '🏠', queryValue: 'Traditional' },
  { id: 'community', label: 'Community', icon: '💜', queryValue: 'Community' },
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
  const toggleDenomination = useSearchStore((state) => state.toggleDenomination);
  const clearFilters = useSearchStore((state) => state.clearFilters);
  const setQuery = useSearchStore((state) => state.setQuery);
  const { data: filterOptions } = useFilterOptions();

  // Delegate to the shared helper so this badge agrees with the "N filters
  // active" summary on the results header and the footer of the FilterPanel.
  // The naive `Object.values(filters).filter(...)` variant this replaced
  // counted empty multi-select arrays as active and collapsed a 3-item
  // denomination selection down to a single filter, which left the header
  // and the badge telling different stories.
  const activeFilterCount = countActiveFilters(filters);

  // Build the denomination chip list from live filter-options data instead
  // of a hardcoded whitelist. The backend returns `{value, count}` already
  // sorted by count descending, so any denomination that exists in the
  // dataset — Pentecostal, Orthodox, Assembly of God, etc. — surfaces on
  // the homepage rail without a code change. We cap at CATEGORY_DENOMINATION_LIMIT
  // so the rail stays tidy and the trailing Compare/Filters buttons stay
  // reachable.
  const denominationCategories: CategoryItem[] = (filterOptions?.denominations ?? [])
    .slice(0, CATEGORY_DENOMINATION_LIMIT)
    .map((option) => ({
      id: `denom-${option.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      label: option.value,
      icon: iconForDenomination(option.value),
      denominationValue: option.value,
    }));

  const categories: CategoryItem[] = [...STATIC_CATEGORIES, ...denominationCategories];

  // A denomination category chip is considered "on" when its value is in the
  // multi-select array. The "All" chip stays on only when nothing is active.
  const hasAnyDenomination = !!filters.denomination && filters.denomination.length > 0;
  const isDenominationSelected = (value: string) => !!filters.denomination?.includes(value);

  const isActive = (item: CategoryItem) => {
    if (item.id === 'all') {
      return !query.trim() && !hasAnyDenomination;
    }

    if (item.denominationValue) {
      return isDenominationSelected(item.denominationValue);
    }

    return query.trim().toLowerCase() === item.queryValue?.toLowerCase();
  };

  const handleClick = (item: CategoryItem) => {
    if (item.id === 'all') {
      clearFilters();
      return;
    }

    if (item.denominationValue) {
      // Tapping a denomination category toggles its membership in the
      // multi-select array. When activating a brand-new one while a text
      // query is present, clear the query the same way the single-select
      // version did — the user is clearly pivoting from text search to
      // filter search.
      const wasAlreadyOn = isDenominationSelected(item.denominationValue);
      toggleDenomination(item.denominationValue);
      if (!wasAlreadyOn) {
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
