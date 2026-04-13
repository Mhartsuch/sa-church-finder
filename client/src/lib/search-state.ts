import { DAY_OPTIONS, TIME_OPTIONS } from '@/constants';
import { MapBounds, SearchFilters } from '@/stores/search-store';

// `mapBounds` is not part of SearchFilters — it lives at the store root —
// but the SearchPage wants to render it as a chip alongside the real
// filters, so include it in the token-key union. The rest of the module
// only emits `'query'` and `keyof SearchFilters` keys.
export type ActiveSearchTokenKey = 'query' | 'mapBounds' | keyof SearchFilters;

export interface ActiveSearchToken {
  key: ActiveSearchTokenKey;
  label: string;
  value: string;
}

const timeLabelMap = Object.fromEntries(
  TIME_OPTIONS.map((option) => [option.value, option.label]),
) as Record<string, string>;

const dayLabelMap = Object.fromEntries(
  DAY_OPTIONS.map((option) => [String(option.value), option.label]),
) as Record<string, string>;

export const getActiveSearchTokens = (
  query: string,
  filters: SearchFilters,
): ActiveSearchToken[] => {
  const tokens: ActiveSearchToken[] = [];
  const trimmedQuery = query.trim();

  if (trimmedQuery) {
    tokens.push({
      key: 'query',
      label: 'Search',
      value: trimmedQuery,
    });
  }

  if (filters.denomination && filters.denomination.length > 0) {
    for (const denomination of filters.denomination) {
      tokens.push({
        key: 'denomination',
        label: 'Tradition',
        value: denomination,
      });
    }
  }

  if (filters.day !== undefined) {
    const dayLabel = DAY_OPTIONS.find((option) => option.value === filters.day)?.label;

    tokens.push({
      key: 'day',
      label: 'Day',
      value: dayLabel ?? String(filters.day),
    });
  }

  if (filters.time) {
    tokens.push({
      key: 'time',
      label: 'Time',
      value: timeLabelMap[filters.time] ?? filters.time,
    });
  }

  if (filters.languages && filters.languages.length > 0) {
    for (const language of filters.languages) {
      tokens.push({
        key: 'languages',
        label: 'Language',
        value: language,
      });
    }
  }

  if (filters.amenities && filters.amenities.length > 0) {
    for (const amenity of filters.amenities) {
      tokens.push({
        key: 'amenities',
        label: 'Amenity',
        value: amenity,
      });
    }
  }

  if (filters.neighborhood) {
    tokens.push({
      key: 'neighborhood',
      label: 'Neighborhood',
      value: filters.neighborhood,
    });
  }

  if (filters.serviceType) {
    tokens.push({
      key: 'serviceType',
      label: 'Service type',
      value: filters.serviceType,
    });
  }

  if (filters.radius !== undefined) {
    tokens.push({
      key: 'radius',
      label: 'Within',
      value: `${filters.radius} mi`,
    });
  }

  if (filters.minRating !== undefined && filters.minRating > 0) {
    tokens.push({
      key: 'minRating',
      label: 'Rating',
      // Use a cleaner label: 4 → "4+ stars", 4.5 → "4.5+ stars"
      value: `${filters.minRating}+ stars`,
    });
  }

  if (filters.wheelchairAccessible) {
    tokens.push({
      key: 'wheelchairAccessible',
      label: 'Access',
      value: 'Wheelchair',
    });
  }

  if (filters.goodForChildren) {
    tokens.push({
      key: 'goodForChildren',
      label: 'Community',
      value: 'Family friendly',
    });
  }

  if (filters.goodForGroups) {
    tokens.push({
      key: 'goodForGroups',
      label: 'Community',
      value: 'Good for groups',
    });
  }

  if (filters.hasPhotos) {
    tokens.push({
      key: 'hasPhotos',
      label: 'Quality',
      value: 'Has photos',
    });
  }

  if (filters.isClaimed) {
    tokens.push({
      key: 'isClaimed',
      label: 'Quality',
      value: 'Verified',
    });
  }

  if (filters.openNow) {
    tokens.push({
      key: 'openNow',
      label: 'Service',
      value: 'Open now',
    });
  }

  return tokens;
};

/**
 * Counts how many filters the user has actually selected. Each entry in a
 * multi-select array (amenities, languages, denomination) counts separately
 * so the chip in the header reads naturally — "3 filters active" for a user
 * who picked parking + nursery + wifi, or English + Spanish + Vietnamese,
 * not "1 filter active".
 *
 * `mapBounds` lives outside `SearchFilters` in the store, but it narrows the
 * result set exactly like any other filter. Pass it as the optional second
 * argument so the "X filters active" subtitle stays accurate when the user
 * has only pressed "Search this area". Existing callers that don't care
 * about the bounds can keep passing a single argument.
 */
export const countActiveFilters = (
  filters: SearchFilters,
  mapBounds?: MapBounds | null,
): number => {
  let count = 0;

  for (const [, value] of Object.entries(filters) as [keyof SearchFilters, unknown][]) {
    if (value === undefined || value === '' || value === false) {
      continue;
    }

    if (Array.isArray(value)) {
      count += value.length;
      continue;
    }

    count += 1;
  }

  if (mapBounds) {
    count += 1;
  }

  return count;
};

export const getWhenSummary = (filters: SearchFilters): string => {
  const parts: string[] = [];

  if (filters.day !== undefined) {
    parts.push(dayLabelMap[String(filters.day)] ?? String(filters.day));
  }

  if (filters.time) {
    const shortTimeLabel = timeLabelMap[filters.time]?.replace(/\s*\(.*\)/, '').trim();

    parts.push(shortTimeLabel ?? filters.time);
  }

  return parts.join(', ') || 'Any Sunday';
};
