import { useQuery } from '@tanstack/react-query';

import { fetchChurchEvents } from '@/api/events';
import { IChurchEventFilters, IChurchEventsResponse } from '@/types/event';

const STALE_TIME = 60000;

export const CHURCH_EVENTS_QUERY_KEY = ['church-events'] as const;

export const useChurchEvents = (slug: string, params: IChurchEventFilters) => {
  return useQuery<IChurchEventsResponse, Error>({
    queryKey: [...CHURCH_EVENTS_QUERY_KEY, slug, params],
    queryFn: () => fetchChurchEvents(slug, params),
    staleTime: STALE_TIME,
    enabled: Boolean(slug),
  });
};
