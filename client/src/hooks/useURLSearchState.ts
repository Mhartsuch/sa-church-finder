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
    const urlWheelchair = searchParams.get('wheelchairAccessible');
    const urlGoodForChildren = searchParams.get('goodForChildren');
    const urlGoodForGroups = searchParams.get('goodForGroups');
    const urlHasPhotos = searchParams.get('hasPhotos');
    const urlIsClaimed = searchParams.get('isClaimed');
    const urlMinRating = searchParams.get('minRating');
    const urlNeighborhood = searchParams.get('neighborhood');
    const urlServiceType = searchParams.get('serviceType');
    const urlRadius = searchParams.get('radius');
    const urlSort = searchParams.get('sort');
    const urlPage = searchParams.get('page');
    const urlNearLat = searchParams.get('nearLat');
    const urlNearLng = searchParams.get('nearLng');

    if (urlQuery) setQuery(urlQuery);
    if (urlDenomination) setFilter('denomination', urlDenomination);
    if (urlDay) setFilter('day', parseInt(urlDay));
    if (urlTime) setFilter('time', urlTime);
    if (urlLanguage) {
      // Comma-separated for multi-select; a single value still works because
      // split(',') returns a one-element array.
      const parsedLanguages = urlLanguage
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      if (parsedLanguages.length > 0) {
        setFilter('languages', parsedLanguages);
      }
    }
    if (urlAmenities) {
      const parsedAmenities = urlAmenities
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean);
      if (parsedAmenities.length > 0) {
        setFilter('amenities', parsedAmenities);
      }
    }
    // Booleans are only written to the URL when `true`, so any presence of the
    // param means the filter is active.
    if (urlWheelchair === 'true') setFilter('wheelchairAccessible', true);
    if (urlGoodForChildren === 'true') setFilter('goodForChildren', true);
    if (urlGoodForGroups === 'true') setFilter('goodForGroups', true);
    if (urlHasPhotos === 'true') setFilter('hasPhotos', true);
    if (urlIsClaimed === 'true') setFilter('isClaimed', true);
    if (urlMinRating) {
      const parsed = parseFloat(urlMinRating);
      if (Number.isFinite(parsed) && parsed > 0 && parsed <= 5) {
        setFilter('minRating', parsed);
      }
    }
    if (urlNeighborhood) setFilter('neighborhood', urlNeighborhood);
    if (urlServiceType) setFilter('serviceType', urlServiceType);
    if (urlRadius) {
      const parsed = parseFloat(urlRadius);
      if (Number.isFinite(parsed) && parsed > 0 && parsed <= 25) {
        setFilter('radius', parsed);
      }
    }
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
    if (filters.languages && filters.languages.length > 0) {
      params.set('language', filters.languages.join(','));
    }
    if (filters.amenities && filters.amenities.length > 0) {
      params.set('amenities', filters.amenities.join(','));
    }
    if (filters.wheelchairAccessible) params.set('wheelchairAccessible', 'true');
    if (filters.goodForChildren) params.set('goodForChildren', 'true');
    if (filters.goodForGroups) params.set('goodForGroups', 'true');
    if (filters.hasPhotos) params.set('hasPhotos', 'true');
    if (filters.isClaimed) params.set('isClaimed', 'true');
    if (filters.minRating !== undefined && filters.minRating > 0) {
      params.set('minRating', String(filters.minRating));
    }
    if (filters.neighborhood) params.set('neighborhood', filters.neighborhood);
    if (filters.serviceType) params.set('serviceType', filters.serviceType);
    if (filters.radius !== undefined) params.set('radius', String(filters.radius));
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
