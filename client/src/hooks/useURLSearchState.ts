import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchSort, useSearchStore } from '@/stores/search-store';

const ALLOWED_SORTS: readonly SearchSort[] = ['relevance', 'distance', 'rating', 'name'];

const isValidSort = (value: string): value is SearchSort =>
  (ALLOWED_SORTS as readonly string[]).includes(value);

/**
 * Syncs the Zustand search store with URL search parameters.
 * - On mount: reads URL params and initializes the store
 * - On store changes: updates the URL (without full navigation)
 *
 * This makes search state shareable and bookmarkable.
 */
export const useURLSearchState = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialized = useRef(false);

  // Store selectors
  const query = useSearchStore((s) => s.query);
  const filters = useSearchStore((s) => s.filters);
  const sort = useSearchStore((s) => s.sort);
  const page = useSearchStore((s) => s.page);
  const userLocation = useSearchStore((s) => s.userLocation);

  // Store actions
  const setQuery = useSearchStore((s) => s.setQuery);
  const setFilter = useSearchStore((s) => s.setFilter);
  const setSort = useSearchStore((s) => s.setSort);
  const setPage = useSearchStore((s) => s.setPage);
  const setUserLocation = useSearchStore((s) => s.setUserLocation);

  // On mount: read URL params → populate store
  useEffect(() => {
    if (isInitialized.current) return;

    const urlQuery = searchParams.get('q');
    const urlDenomination = searchParams.get('denomination');
    const urlDay = searchParams.get('day');
    const urlTime = searchParams.get('time');
    const urlLanguage = searchParams.get('language');
    const urlAmenities = searchParams.get('amenities');
    const urlSort = searchParams.get('sort');
    const urlPage = searchParams.get('page');
    const urlNearLat = searchParams.get('nearLat');
    const urlNearLng = searchParams.get('nearLng');

    if (urlQuery) setQuery(urlQuery);
    if (urlDenomination) setFilter('denomination', urlDenomination);
    if (urlDay) setFilter('day', parseInt(urlDay));
    if (urlTime) setFilter('time', urlTime);
    if (urlLanguage) setFilter('language', urlLanguage);
    if (urlAmenities) setFilter('amenities', urlAmenities);
    if (urlSort && isValidSort(urlSort)) {
      setSort(urlSort);
    }
    if (urlPage) {
      const parsed = parseInt(urlPage);
      if (parsed > 0) setPage(parsed);
    }
    if (urlNearLat && urlNearLng) {
      const lat = parseFloat(urlNearLat);
      const lng = parseFloat(urlNearLng);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        setUserLocation({ lat, lng });
      }
    }

    isInitialized.current = true;
    // `isInitialized.current` keeps this body one-shot even when the ref-like
    // `searchParams` object or any store setter changes on a later render, so
    // we can list the full dependency set without risking a re-run loop.
  }, [searchParams, setQuery, setFilter, setSort, setPage, setUserLocation]);

  // On store change: write store → URL params
  useEffect(() => {
    if (!isInitialized.current) return;

    const params = new URLSearchParams();

    if (query) params.set('q', query);
    if (filters.denomination) params.set('denomination', filters.denomination);
    if (filters.day !== undefined) params.set('day', String(filters.day));
    if (filters.time) params.set('time', filters.time);
    if (filters.language) params.set('language', filters.language);
    if (filters.amenities) params.set('amenities', filters.amenities);
    // `relevance` is the default, so omit it from the URL to keep shared links
    // clean. Any other sort is explicit and worth preserving.
    if (sort !== 'relevance') params.set('sort', sort);
    if (page > 1) params.set('page', String(page));
    if (userLocation) {
      // Round to 4 decimals (~11 m) — plenty of precision for a search center
      // and avoids leaking exact device coordinates into shared URLs.
      params.set('nearLat', userLocation.lat.toFixed(4));
      params.set('nearLng', userLocation.lng.toFixed(4));
    }

    setSearchParams(params, { replace: true });
  }, [query, filters, sort, page, userLocation, setSearchParams]);
};
