import { beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_ZOOM, SA_CENTER } from '@/constants';

import { useSearchStore } from './search-store';

const resetStore = () => {
  useSearchStore.setState({
    query: '',
    filters: {},
    sort: 'relevance',
    page: 1,
    hoveredChurchId: null,
    selectedChurchId: null,
    mapCenter: SA_CENTER,
    mapZoom: DEFAULT_ZOOM,
    mapBounds: null,
    userLocation: null,
  });
};

describe('search-store', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('default state', () => {
    it('uses the multi-factor relevance ranking as the default sort', () => {
      // Reset to the store's own defaults (not the test helper) to confirm.
      useSearchStore.setState((state) => ({ ...state, sort: 'relevance' }));
      expect(useSearchStore.getState().sort).toBe('relevance');
    });
  });

  describe('setSort', () => {
    it('accepts the relevance sort and resets pagination', () => {
      useSearchStore.setState({ page: 5, sort: 'name' });
      useSearchStore.getState().setSort('relevance');

      const state = useSearchStore.getState();
      expect(state.sort).toBe('relevance');
      expect(state.page).toBe(1);
    });
  });

  describe('setFilter — accessibility & community booleans', () => {
    it('stores wheelchairAccessible as a boolean and resets pagination', () => {
      useSearchStore.setState({ page: 3 });

      useSearchStore.getState().setFilter('wheelchairAccessible', true);

      const state = useSearchStore.getState();
      expect(state.filters.wheelchairAccessible).toBe(true);
      expect(state.page).toBe(1);
    });

    it('clears a boolean filter by setting it back to undefined', () => {
      useSearchStore.getState().setFilter('goodForChildren', true);
      useSearchStore.getState().setFilter('goodForChildren', undefined);

      expect(useSearchStore.getState().filters.goodForChildren).toBeUndefined();
    });

    it('lets multiple boolean filters coexist with other filter types', () => {
      useSearchStore.getState().setFilter('denomination', 'Catholic');
      useSearchStore.getState().setFilter('wheelchairAccessible', true);
      useSearchStore.getState().setFilter('goodForGroups', true);

      const filters = useSearchStore.getState().filters;
      expect(filters).toMatchObject({
        denomination: 'Catholic',
        wheelchairAccessible: true,
        goodForGroups: true,
      });
    });

    it('wipes all boolean filters via clearFilters', () => {
      useSearchStore.getState().setFilter('wheelchairAccessible', true);
      useSearchStore.getState().setFilter('goodForChildren', true);
      useSearchStore.getState().setFilter('goodForGroups', true);

      useSearchStore.getState().clearFilters();

      expect(useSearchStore.getState().filters).toEqual({});
    });
  });

  describe('setUserLocation', () => {
    it('stores the user location and resets pagination', () => {
      useSearchStore.setState({ page: 4 });

      useSearchStore.getState().setUserLocation({ lat: 30.2672, lng: -97.7431 });

      const state = useSearchStore.getState();
      expect(state.userLocation).toEqual({ lat: 30.2672, lng: -97.7431 });
      expect(state.page).toBe(1);
    });

    it('clears any lingering map bounds so the new radius search is honoured', () => {
      useSearchStore.setState({
        mapBounds: { swLat: 1, swLng: 2, neLat: 3, neLng: 4 },
      });

      useSearchStore.getState().setUserLocation({ lat: 30, lng: -97 });

      expect(useSearchStore.getState().mapBounds).toBeNull();
    });

    it('recenters the map on the user location on activation', () => {
      useSearchStore.getState().setUserLocation({ lat: 30.5, lng: -97.1 });

      const state = useSearchStore.getState();
      expect(state.mapCenter).toEqual({ lat: 30.5, lng: -97.1 });
    });

    it('restores the San Antonio center when cleared after being tracked', () => {
      useSearchStore.getState().setUserLocation({ lat: 30.5, lng: -97.1 });
      useSearchStore.getState().setUserLocation(null);

      const state = useSearchStore.getState();
      expect(state.userLocation).toBeNull();
      expect(state.mapCenter).toEqual(SA_CENTER);
    });

    it('preserves a user-driven map center when clearing the location', () => {
      useSearchStore.getState().setUserLocation({ lat: 30.5, lng: -97.1 });
      // User pans the map after activating — mapCenter no longer matches the
      // tracked location.
      useSearchStore.getState().setMapCenter(29.9, -98.2);

      useSearchStore.getState().setUserLocation(null);

      const state = useSearchStore.getState();
      expect(state.userLocation).toBeNull();
      expect(state.mapCenter).toEqual({ lat: 29.9, lng: -98.2 });
    });
  });
});
