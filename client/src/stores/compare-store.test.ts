import { describe, it, expect, beforeEach } from 'vitest';

import { IChurchSummary } from '@/types/church';
import { MAX_COMPARE, useCompareStore } from './compare-store';

function makeChurch(overrides: Partial<IChurchSummary> & { id: string }): IChurchSummary {
  return {
    name: `Church ${overrides.id}`,
    slug: `church-${overrides.id}`,
    denomination: null,
    denominationFamily: null,
    description: null,
    address: '123 Main St',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78205',
    neighborhood: null,
    latitude: 29.4241,
    longitude: -98.4936,
    phone: null,
    email: null,
    website: null,
    pastorName: null,
    yearEstablished: null,
    avgRating: 0,
    reviewCount: 0,
    googleRating: null,
    googleReviewCount: null,
    isClaimed: false,
    isSaved: false,
    languages: [],
    amenities: [],
    coverImageUrl: null,
    businessStatus: null,
    googleMapsUrl: null,
    primaryType: null,
    goodForChildren: null,
    goodForGroups: null,
    wheelchairAccessible: null,
    services: [],
    distance: 0,
    ...overrides,
  };
}

describe('useCompareStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useCompareStore.setState({ selectedChurches: [] });
  });

  describe('addChurch', () => {
    it('adds a church to the selection', () => {
      const church = makeChurch({ id: '1', name: 'Grace Baptist', slug: 'grace-baptist' });

      useCompareStore.getState().addChurch(church);

      const state = useCompareStore.getState();
      expect(state.selectedChurches).toHaveLength(1);
      expect(state.selectedChurches[0].id).toBe('1');
    });

    it('does not add duplicates', () => {
      const church = makeChurch({ id: '1', name: 'Grace Baptist', slug: 'grace-baptist' });

      useCompareStore.getState().addChurch(church);
      useCompareStore.getState().addChurch(church);

      expect(useCompareStore.getState().selectedChurches).toHaveLength(1);
    });

    it('does not exceed MAX_COMPARE (4)', () => {
      for (let i = 1; i <= 5; i++) {
        useCompareStore
          .getState()
          .addChurch(makeChurch({ id: String(i), name: `Church ${i}`, slug: `church-${i}` }));
      }

      expect(useCompareStore.getState().selectedChurches).toHaveLength(MAX_COMPARE);
    });
  });

  describe('removeChurch', () => {
    it('removes a church by ID', () => {
      const church1 = makeChurch({ id: '1', name: 'Church A', slug: 'church-a' });
      const church2 = makeChurch({ id: '2', name: 'Church B', slug: 'church-b' });

      useCompareStore.getState().addChurch(church1);
      useCompareStore.getState().addChurch(church2);

      expect(useCompareStore.getState().selectedChurches).toHaveLength(2);

      useCompareStore.getState().removeChurch('1');

      const state = useCompareStore.getState();
      expect(state.selectedChurches).toHaveLength(1);
      expect(state.selectedChurches[0].id).toBe('2');
    });
  });

  describe('toggleChurch', () => {
    it('adds if not selected, removes if already selected', () => {
      const church = makeChurch({ id: '1', name: 'Grace Baptist', slug: 'grace-baptist' });

      // Toggle on
      useCompareStore.getState().toggleChurch(church);
      expect(useCompareStore.getState().selectedChurches).toHaveLength(1);

      // Toggle off
      useCompareStore.getState().toggleChurch(church);
      expect(useCompareStore.getState().selectedChurches).toHaveLength(0);
    });

    it('respects MAX_COMPARE limit', () => {
      for (let i = 1; i <= MAX_COMPARE; i++) {
        useCompareStore
          .getState()
          .addChurch(makeChurch({ id: String(i), name: `Church ${i}`, slug: `church-${i}` }));
      }

      expect(useCompareStore.getState().selectedChurches).toHaveLength(MAX_COMPARE);

      // Toggling a 5th church should not add it
      const fifthChurch = makeChurch({ id: '5', name: 'Church 5', slug: 'church-5' });
      useCompareStore.getState().toggleChurch(fifthChurch);

      expect(useCompareStore.getState().selectedChurches).toHaveLength(MAX_COMPARE);
      expect(
        useCompareStore.getState().selectedChurches.some((c) => c.id === '5'),
      ).toBe(false);
    });
  });

  describe('clearChurches', () => {
    it('empties the list', () => {
      useCompareStore
        .getState()
        .addChurch(makeChurch({ id: '1', name: 'Church A', slug: 'church-a' }));
      useCompareStore
        .getState()
        .addChurch(makeChurch({ id: '2', name: 'Church B', slug: 'church-b' }));

      expect(useCompareStore.getState().selectedChurches).toHaveLength(2);

      useCompareStore.getState().clearChurches();

      expect(useCompareStore.getState().selectedChurches).toHaveLength(0);
    });
  });
});
