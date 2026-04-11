import { MapPin, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';

import { DAY_OPTIONS, TIME_OPTIONS } from '@/constants';
import { countActiveFilters } from '@/lib/search-state';
import { useSearchStore } from '@/stores/search-store';

interface Suggestion {
  label: string;
  action: () => void;
  icon: React.ReactNode;
}

const dayLabelFor = (day: number): string =>
  DAY_OPTIONS.find((option) => option.value === day)?.label ?? `day ${day}`;

const timeLabelFor = (time: string): string =>
  TIME_OPTIONS.find((option) => option.value === time)?.label ?? time;

export const NoResults = () => {
  const query = useSearchStore((s) => s.query);
  const filters = useSearchStore((s) => s.filters);
  const clearFilters = useSearchStore((s) => s.clearFilters);
  const setQuery = useSearchStore((s) => s.setQuery);
  const setFilter = useSearchStore((s) => s.setFilter);
  const toggleAmenity = useSearchStore((s) => s.toggleAmenity);
  const toggleLanguage = useSearchStore((s) => s.toggleLanguage);
  const toggleDenomination = useSearchStore((s) => s.toggleDenomination);

  const hasQuery = query.trim().length > 0;
  const hasFilters = countActiveFilters(filters) > 0;

  const suggestions: Suggestion[] = [];

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

  // Filter-removal suggestions in priority order — narrow, high-blast-radius
  // filters first (minRating, neighborhood, serviceType), then structural
  // facets, then the soft quality toggles. A zero-result state is almost
  // always caused by one of the top few, so the 4-chip visual cap still
  // surfaces the likely culprit without scrolling.
  if (hasFilters) {
    if (filters.minRating !== undefined && filters.minRating > 0) {
      const value = filters.minRating;
      suggestions.push({
        label: `Remove "${value}+ stars"`,
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('minRating', undefined),
      });
    }
    if (filters.neighborhood) {
      const value = filters.neighborhood;
      suggestions.push({
        label: `Remove "${value}"`,
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('neighborhood', undefined),
      });
    }
    if (filters.serviceType) {
      const value = filters.serviceType;
      suggestions.push({
        label: `Remove "${value}"`,
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('serviceType', undefined),
      });
    }
    if (filters.radius !== undefined) {
      const value = filters.radius;
      suggestions.push({
        label: `Widen "${value} mi"`,
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('radius', undefined),
      });
    }
    if (filters.denomination && filters.denomination.length > 0) {
      for (const denomination of filters.denomination) {
        suggestions.push({
          label: `Remove "${denomination}"`,
          icon: <RotateCcw className="h-4 w-4" />,
          action: () => toggleDenomination(denomination),
        });
      }
    }
    if (filters.day !== undefined) {
      const label = dayLabelFor(filters.day);
      suggestions.push({
        label: `Remove "${label}"`,
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('day', undefined),
      });
    }
    if (filters.time) {
      const label = timeLabelFor(filters.time);
      suggestions.push({
        label: `Remove "${label}"`,
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('time', undefined),
      });
    }
    if (filters.languages && filters.languages.length > 0) {
      for (const language of filters.languages) {
        suggestions.push({
          label: `Remove "${language}"`,
          icon: <RotateCcw className="h-4 w-4" />,
          action: () => toggleLanguage(language),
        });
      }
    }
    if (filters.amenities && filters.amenities.length > 0) {
      for (const amenity of filters.amenities) {
        suggestions.push({
          label: `Remove "${amenity}"`,
          icon: <RotateCcw className="h-4 w-4" />,
          action: () => toggleAmenity(amenity),
        });
      }
    }
    if (filters.hasPhotos) {
      suggestions.push({
        label: 'Remove "Has photos"',
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('hasPhotos', undefined),
      });
    }
    if (filters.isClaimed) {
      suggestions.push({
        label: 'Remove "Verified"',
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('isClaimed', undefined),
      });
    }
    if (filters.wheelchairAccessible) {
      suggestions.push({
        label: 'Remove "Wheelchair accessible"',
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('wheelchairAccessible', undefined),
      });
    }
    if (filters.goodForChildren) {
      suggestions.push({
        label: 'Remove "Family friendly"',
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('goodForChildren', undefined),
      });
    }
    if (filters.goodForGroups) {
      suggestions.push({
        label: 'Remove "Good for groups"',
        icon: <RotateCcw className="h-4 w-4" />,
        action: () => setFilter('goodForGroups', undefined),
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
      <div className="w-full max-w-xl rounded-[32px] border border-dashed border-border bg-card px-6 py-10 text-center sm:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-card text-muted-foreground shadow-airbnb-subtle">
          <MapPin className="h-7 w-7" />
        </div>

        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
          No churches found
        </h3>

        <p className="mx-auto mt-3 max-w-md text-[15px] leading-7 text-muted-foreground">
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
                    ? 'bg-foreground text-background hover:opacity-90'
                    : 'border border-border bg-card text-foreground hover:border-foreground hover:bg-muted'
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
