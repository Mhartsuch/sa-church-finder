import {
  keepPreviousData,
  type QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from '@tanstack/react-query';

import {
  fetchChurch,
  fetchChurches,
  fetchFilterOptions,
  fetchSavedChurches,
  toggleSaved,
} from '@/api/churches';
import { ApiRequestError } from '@/lib/api-client';
import { IChurch, IChurchFilters, IChurchSummary, ISearchResponse } from '@/types/church';

export const PAGE_SIZE = 24;

export const useChurchSearch = (filters: IChurchFilters, bounds?: string) =>
  useInfiniteQuery({
    queryKey: ['churches', 'search', filters, bounds ?? null],
    queryFn: ({ pageParam }) =>
      fetchChurches({ ...filters, bounds, page: pageParam, pageSize: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    placeholderData: keepPreviousData,
  });

const detailQuery = (slug: string) => ({
  queryKey: ['churches', 'detail', slug],
  queryFn: () => fetchChurch(slug),
  staleTime: 5 * 60 * 1000,
  // A missing church won't appear on retry; only retry network/server errors.
  retry: (failures: number, error: Error) =>
    failures < 1 && !(error instanceof ApiRequestError && error.status < 500),
});

/** The card-sized copy of a church from any cached search page, if we have one. */
const findCachedSummary = (queryClient: QueryClient, slug: string): IChurch | undefined => {
  for (const [, data] of queryClient.getQueriesData<InfiniteData<ISearchResponse>>({
    queryKey: ['churches', 'search'],
  })) {
    const match: IChurchSummary | undefined = data?.pages
      .flatMap((page) => page.data)
      .find((church) => church.slug === slug);
    if (match) {
      return {
        ...match,
        email: null,
        pastorName: null,
        yearEstablished: null,
        googleMapsUrl: null,
      };
    }
  }
  return undefined;
};

/**
 * Church detail. Renders instantly from the browse grid's cached copy (name,
 * photos, services) while the full record loads in the background.
 */
export const useChurch = (slug: string | undefined) => {
  const queryClient = useQueryClient();
  return useQuery({
    ...detailQuery(slug ?? ''),
    enabled: Boolean(slug),
    placeholderData: () => (slug ? findCachedSummary(queryClient, slug) : undefined),
  });
};

/** Warm the detail cache (and the profile page code) before the visitor clicks. */
export const usePrefetchChurch = () => {
  const queryClient = useQueryClient();
  return (slug: string) => {
    void import('@/pages/ChurchPage');
    void queryClient.prefetchQuery(detailQuery(slug));
  };
};

export const useFilterOptions = () =>
  useQuery({
    queryKey: ['filter-options'],
    queryFn: fetchFilterOptions,
    staleTime: 30 * 60 * 1000,
  });

export const useSavedChurches = (userId: string | undefined) =>
  useQuery({
    queryKey: ['saved', userId],
    queryFn: () => fetchSavedChurches(userId!),
    enabled: Boolean(userId),
  });

/** Toggle a church's saved state, optimistically updating every cached copy. */
export const useToggleSaved = () => {
  const queryClient = useQueryClient();

  const setSaved = (churchId: string, saved: boolean) => {
    queryClient.setQueriesData<InfiniteData<ISearchResponse>>(
      { queryKey: ['churches', 'search'] },
      (data) =>
        data && {
          ...data,
          pages: data.pages.map((page) => ({
            ...page,
            data: page.data.map((church) =>
              church.id === churchId ? { ...church, isSaved: saved } : church,
            ),
          })),
        },
    );
    queryClient.setQueriesData<IChurch>({ queryKey: ['churches', 'detail'] }, (church) =>
      church && church.id === churchId ? { ...church, isSaved: saved } : church,
    );
  };

  return useMutation({
    mutationFn: ({ churchId }: { churchId: string; saved: boolean }) => toggleSaved(churchId),
    onMutate: ({ churchId, saved }) => setSaved(churchId, saved),
    onError: (_error, { churchId, saved }) => setSaved(churchId, !saved),
    onSuccess: ({ churchId, saved }) => setSaved(churchId, saved),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['saved'] }),
  });
};
