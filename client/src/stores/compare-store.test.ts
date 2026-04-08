import { beforeEach, describe, expect, it } from 'vitest';

import { COMPARE_STORAGE_KEY, useCompareStore } from './compare-store';

const churchA = {
  id: 'church-a',
  name: 'Grace Church',
  slug: 'grace-church',
  denomination: 'Baptist',
  denominationFamily: 'Protestant',
  description: null,
  address: '123 Main St',
  city: 'San Antonio',
  state: 'TX',
  zipCode: '78205',
  neighborhood: 'Downtown',
  latitude: 29.4241,
  longitude: -98.4936,
  phone: null,
  email: null,
  website: null,
  pastorName: null,
  yearEstablished: 1980,
  avgRating: 4.9,
  reviewCount: 22,
  googleRating: null,
  googleReviewCount: null,
  isClaimed: true,
  isSaved: false,
  languages: ['English'],
  amenities: ['Parking'],
  coverImageUrl: null,
  services: [],
  distance: 2.4,
};

describe('useCompareStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useCompareStore.setState({ selectedChurches: [] });
  });

  it('toggles churches without duplicates and persists the selection', () => {
    const { addChurch, toggleChurch } = useCompareStore.getState();

    addChurch(churchA);
    addChurch(churchA);

    expect(useCompareStore.getState().selectedChurches).toEqual([churchA]);
    expect(JSON.parse(window.localStorage.getItem(COMPARE_STORAGE_KEY) ?? '[]')).toEqual([churchA]);

    toggleChurch(churchA);

    expect(useCompareStore.getState().selectedChurches).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem(COMPARE_STORAGE_KEY) ?? '[]')).toEqual([]);
  });
});
