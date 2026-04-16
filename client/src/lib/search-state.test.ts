import { describe, expect, it } from 'vitest';

import { SearchFilters } from '@/stores/search-store';

import { countActiveFilters, getActiveSearchTokens } from './search-state';

describe('search-state helpers', () => {
  describe('countActiveFilters', () => {
    it('returns zero for an empty filter object', () => {
      expect(countActiveFilters({})).toBe(0);
    });

    it('counts each selected amenity separately instead of treating the array as one filter', () => {
      const filters: SearchFilters = {
        amenities: ['Parking', 'Nursery', 'Wifi'],
      };

      expect(countActiveFilters(filters)).toBe(3);
    });

    it('combines amenity count with other active filters', () => {
      const filters: SearchFilters = {
        denomination: ['Catholic'],
        amenities: ['Parking', 'Nursery'],
        wheelchairAccessible: true,
      };

      // 1 denomination + 2 amenities + 1 boolean = 4
      expect(countActiveFilters(filters)).toBe(4);
    });

    it('counts each selected language separately like amenities', () => {
      // Regression guard for the PR-#9 follow-up — previously languages were
      // treated as a single filter because only amenities had the array
      // special case.
      const filters: SearchFilters = {
        languages: ['English', 'Spanish', 'Vietnamese'],
      };

      expect(countActiveFilters(filters)).toBe(3);
    });

    it('counts each selected denomination separately', () => {
      const filters: SearchFilters = {
        denomination: ['Baptist', 'Methodist'],
      };

      expect(countActiveFilters(filters)).toBe(2);
    });

    it('ignores an empty amenities array', () => {
      const filters: SearchFilters = {
        amenities: [],
        denomination: ['Baptist'],
      };

      expect(countActiveFilters(filters)).toBe(1);
    });

    it('ignores boolean filters that are explicitly false', () => {
      const filters: SearchFilters = {
        // `false` is produced by setFilter(key, false), which shouldn't register
        // as an active filter in the UI chip.
        wheelchairAccessible: false as unknown as true,
      };

      expect(countActiveFilters(filters)).toBe(0);
    });
  });

  describe('getActiveSearchTokens', () => {
    it('emits one token per amenity so each chip can be dismissed individually', () => {
      const filters: SearchFilters = {
        amenities: ['Parking', 'Nursery'],
      };

      const tokens = getActiveSearchTokens('', filters);

      expect(tokens).toEqual([
        { key: 'amenities', label: 'Amenity', value: 'Parking' },
        { key: 'amenities', label: 'Amenity', value: 'Nursery' },
      ]);
    });

    it('emits nothing for an empty amenities array', () => {
      const tokens = getActiveSearchTokens('', { amenities: [] });

      expect(tokens).toEqual([]);
    });

    it('includes query, denomination, and amenity tokens together', () => {
      const filters: SearchFilters = {
        denomination: ['Methodist'],
        amenities: ['Wifi'],
      };

      const tokens = getActiveSearchTokens('community', filters);

      expect(tokens).toEqual([
        { key: 'query', label: 'Search', value: 'community' },
        { key: 'denomination', label: 'Tradition', value: 'Methodist' },
        { key: 'amenities', label: 'Amenity', value: 'Wifi' },
      ]);
    });

    it('emits one denomination token per selected value for per-chip removal', () => {
      const filters: SearchFilters = {
        denomination: ['Baptist', 'Methodist', 'Non-denominational'],
      };

      const tokens = getActiveSearchTokens('', filters);

      expect(tokens).toEqual([
        { key: 'denomination', label: 'Tradition', value: 'Baptist' },
        { key: 'denomination', label: 'Tradition', value: 'Methodist' },
        { key: 'denomination', label: 'Tradition', value: 'Non-denominational' },
      ]);
    });
  });
});
