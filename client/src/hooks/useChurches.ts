import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DEFAULT_RADIUS, PAGE_SIZE, SA_CENTER } from '@/constants';
import {
  fetchChurchBySlug,
  fetchChurches,
  fetchFilterOptions,
  fetchSavedChurches,
  toggleSavedChurch,
} from '@/api/churches';
import { useSearchStore } from '@/stores/search-store';
import {
  IChurch,
  IFilterOptions,
  ISavedChurch,
  ISearchParams,
  ISearchResponse,
} from '@/types/church';

const STALE_TIME = 60000; // 60 seconds
const FILTER_OPTIONS_STALE_TIME = 300000; // 5 minutes — filter options change rarely

export const CHURCHES_QUERY_KEY = ['churches'] as const;
export const CHURCH_QUERY_KEY = ['church'] as const;
export const SAVED_CHURCHES_QUERY_KEY = ['saved-churches'] as const;
export const FILTER_OPTIONS_QUERY_KEY = ['filter-options'] as const;

export const useChurches = (params: ISearchParams) => {
  return useQuery<ISearchResponse, Error>({
    queryKey: [...CHURCHES_QUERY_KEY, params],
    queryFn: () => fetchChurches(params),
    staleTime: STALE_TIME,
    enabled: true,
  });
};

export const useChurchSearchParams = () => {
  const query = useSearchStore((state) => state.query);
  const filters = useSearchStore((state) => state.filters);
  const sort = useSearchStore((state) => state.sort);
  const page = useSearchStore((state) => state.page);
  const mapBounds = useSearchStore((state) => state.mapBounds);
  const userLocation = useSearchStore((state) => state.userLocation);

  const boundsString = mapBounds
    ? `${mapBounds.swLat},${mapBounds.swLng},${mapBounds.neLat},${mapBounds.neLng}`
    : undefined;

  // Resolve the search center in priority order:
  //   1. Map bounds — the user is actively exploring a specific area on the map.
  //      Using the bounds midpoint keeps the query key stable while the user
  //      pans without applying; only "Search this area" triggers a refetch.
  //   2. User location — the user opted in to "find near me".
  //   3. San Antonio default — cold start / anonymous browse.
  let searchLat = SA_CENTER.lat;
  let searchLng = SA_CENTER.lng;
  if (mapBounds) {
    searchLat = (mapBounds.swLat + mapBounds.neLat) / 2;
    searchLng = (mapBounds.swLng + mapBounds.neLng) / 2;
  } else if (userLocation) {
    searchLat = userLocation.lat;
    searchLng = userLocation.lng;
  }

  return {
    lat: searchLat,
    lng: searchLng,
    radius: DEFAULT_RADIUS,
    q: query || undefined,
    denomination: filters.denomination,
    day: filters.day,
    time: filters.time,
    language: filters.language,
    amenities: filters.amenities,
    sort,
    page,
    pageSize: PAGE_SIZE,
    bounds: boundsString,
  } satisfies ISearchParams;
};

export const useFilterOptions = () => {
  return useQuery<IFilterOptions, Error>({
    queryKey: [...FILTER_OPTIONS_QUERY_KEY],
    queryFn: fetchFilterOptions,
    staleTime: FILTER_OPTIONS_STALE_TIME,
  });
};

export const useChurch = (slug: string) => {
  return useQuery<IChurch, Error>({
    queryKey: [...CHURCH_QUERY_KEY, slug],
    queryFn: () => fetchChurchBySlug(slug),
    staleTime: STALE_TIME,
    enabled: !!slug,
  });
};

export const useSavedChurches = (userId: string | null) => {
  return useQuery<ISavedChurch[], Error>({
    queryKey: [...SAVED_CHURCHES_QUERY_KEY, userId],
    queryFn: () => fetchSavedChurches(userId!),
    staleTime: STALE_TIME,
    enabled: Boolean(userId),
  });
};

export const useToggleSavedChurch = () => {
  const queryClient = useQueryClient();

  return useMutation<{ churchId: string; saved: boolean }, Error, string>({
    mutationFn: toggleSavedChurch,
    onSuccess: ({ churchId, saved }) => {
      queryClient.setQueriesData<ISearchResponse>({ queryKey: CHURCHES_QUERY_KEY }, (current) =>
        current
          ? {
              ...current,
              data: current.data.map((church) =>
                church.id === churchId ? { ...church, isSaved: saved } : church,
              ),
            }
          : current,
      );

      queryClient.setQueriesData<IChurch>({ queryKey: CHURCH_QUERY_KEY }, (current) =>
        current && current.id === churchId
          ? {
              ...current,
              isSaved: saved,
            }
          : current,
      );

      void queryClient.invalidateQueries({
        queryKey: SAVED_CHURCHES_QUERY_KEY,
      });
    },
  });
};
