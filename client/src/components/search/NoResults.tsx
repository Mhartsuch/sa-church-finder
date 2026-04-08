import { MapPin, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';

import { DAY_OPTIONS } from '@/constants';
import { useSearchStore } from '@/stores/search-store';

export const NoResults = () => {
  const query = useSearchStore((s) => s.query);
  const filters = useSearchStore((s) => s.filters);
  const clearFilters = useSearchStore((s) => s.clearFilters);
  const setQuery = useSearchStore((s) => s.setQuery);
  const setFilter = useSearchStore((s) => s.setFilter);

  const hasQuery = query.trim().length > 0;
  const activeFilterKeys = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key]) => key);
  const hasFilters = activeFilterKeys.length > 0;

  const suggestions: { label: string; action: () => void; icon: React.ReactNode }[] = [];

  if (hasQuery && hasFilters) {
    suggestions.push({
      label: 'Clear filters and keep search',
      icon: <SlidersHorizontal className="h-4 w-4" />,
      action: () => {
        const currentQuery = query;
        clearFilters();
        setQuery(currentQuery);
      },
    });
  }

  if (hasQuery) {
    suggestions.push({
      label: 'Clear search text',
      icon: <Search className="h-4 w-4" />,
      action: () => setQuery(''),
    });
  }

  if (hasFilters) {
    if (filters.denomination) {
      suggestions.push({
        label: `Remove "${filters.denomination}"`,
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('denomination', undefined),
      });
    }
    if (filters.day !== undefined) {
      const dayLabel = DAY_OPTIONS.find((day) => day.value === filters.day)?.label || 'day';
      suggestions.push({
        label: `Remove "${dayLabel}"`,
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('day', undefined),
      });
    }
    if (filters.language) {
      suggestions.push({
        label: `Remove "${filters.language}"`,
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('language', undefined),
      });
    }
  }

  if (hasQuery || hasFilters) {
    suggestions.push({
      label: 'Reset everything',
      icon: <RotateCcw className="h-4 w-4" />,
      action: clearFilters,
    });
  }

  return (
    <div className="flex items-center justify-center py-14 sm:py-20">
      <div className="w-full max-w-xl rounded-[32px] border border-dashed border-[#e0ddd8] bg-[#faf8f5] px-6 py-10 text-center sm:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-[#6b6560] shadow-airbnb-subtle">
          <MapPin className="h-7 w-7" />
        </div>

        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[#1a1a1a]">
          No churches found
        </h3>

        <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-[#6b6560]">
          {hasQuery && hasFilters
            ? `Nothing matched "${query}" with your current filters. Try broadening the search a little.`
            : hasQuery
              ? `Nothing matched "${query}". Check the spelling or try a nearby neighborhood or denomination.`
              : hasFilters
                ? 'No churches fit the current filter stack. Remove one or two constraints to widen the list.'
                : 'No churches are available in this area yet.'}
        </p>

        {suggestions.length > 0 ? (
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {suggestions.slice(0, 4).map((suggestion, index) => (
              <button
                key={`${suggestion.label}-${index}`}
                type="button"
                onClick={suggestion.action}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
                  index === 0
                    ? 'bg-[#1a1a1a] text-white hover:bg-black'
                    : 'border border-[#e0ddd8] bg-white text-[#1a1a1a] hover:border-[#1a1a1a] hover:bg-[#f5f2ed]'
                }`}
              >
                {suggestion.icon}
                {suggestion.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
