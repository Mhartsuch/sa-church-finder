import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createChurchEvent,
  deleteChurchEvent,
  fetchChurchEvents,
  fetchEventsFeed,
  updateChurchEvent,
} from '@/api/events';
import {
  IChurchEvent,
  IChurchEventFilters,
  IChurchEventsResponse,
  ICreateChurchEventInput,
  IDeleteChurchEventResult,
  IEventsFeedFilters,
  IEventsFeedResponse,
  IUpdateChurchEventInput,
} from '@/types/event';

const STALE_TIME = 60000;

export const CHURCH_EVENTS_QUERY_KEY = ['church-events'] as const;
export const EVENTS_FEED_QUERY_KEY = ['events-feed'] as const;
export const LEADERS_PORTAL_EVENTS_KEY = ['leaders-portal', 'events'] as const;

export const useChurchEvents = (slug: string, params: IChurchEventFilters) => {
  return useQuery<IChurchEventsResponse, Error>({
    queryKey: [...CHURCH_EVENTS_QUERY_KEY, slug, params],
    queryFn: () => fetchChurchEvents(slug, params),
    staleTime: STALE_TIME,
    enabled: Boolean(slug),
  });
};

export const useEventsFeed = (params: IEventsFeedFilters) => {
  return useQuery<IEventsFeedResponse, Error>({
    queryKey: [...EVENTS_FEED_QUERY_KEY, params],
    queryFn: () => fetchEventsFeed(params),
    staleTime: STALE_TIME,
    placeholderData: (previous) => previous,
  });
};

const invalidateEventQueries = (queryClient: ReturnType<typeof useQueryClient>): void => {
  queryClient.invalidateQueries({ queryKey: CHURCH_EVENTS_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: EVENTS_FEED_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: LEADERS_PORTAL_EVENTS_KEY });
};

export const useCreateChurchEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<IChurchEvent, Error, ICreateChurchEventInput>({
    mutationFn: createChurchEvent,
    onSuccess: () => {
      invalidateEventQueries(queryClient);
    },
  });
};

export const useUpdateChurchEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<IChurchEvent, Error, IUpdateChurchEventInput>({
    mutationFn: updateChurchEvent,
    onSuccess: () => {
      invalidateEventQueries(queryClient);
    },
  });
};

export const useDeleteChurchEvent = () => {
  const queryClient = useQueryClient();

  return useMutation<IDeleteChurchEventResult, Error, string>({
    mutationFn: deleteChurchEvent,
    onSuccess: () => {
      invalidateEventQueries(queryClient);
    },
  });
};
