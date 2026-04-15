import { useQuery } from '@tanstack/react-query';

import { fetchChurches } from '@/api/churches';
import { SA_CENTER } from '@/constants';
import { ISearchResponse } from '@/types/church';

const FEATURED_STALE_TIME = 300000; // 5 minutes — featured list is stable

/**
 * Fetches a small set of top-rated churches with photos for the landing page.
 * Uses the existing search endpoint sorted by rating, filtered to only
 * churches that have photos so the cards look polished.
 */
export const useFeaturedChurches = () => {
  return useQuery<ISearchResponse, Error>({
    queryKey: ['featured-churches'],
    queryFn: () =>
      fetchChurches({
        lat: SA_CENTER.lat,
        lng: SA_CENTER.lng,
        radius: 25,
        sort: 'rating',
        hasPhotos: true,
        pageSize: 8,
        page: 1,
      }),
    staleTime: FEATURED_STALE_TIME,
  });
};
