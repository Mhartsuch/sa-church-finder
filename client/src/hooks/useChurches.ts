import {
  keepPreviousData,
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
import { IChurch, IChurchFilters, ISearchResponse } from '@/types/church';

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

export const useChurch = (slug: string | undefined) =>
  useQuery({
    queryKey: ['churches', 'detail', slug],
    queryFn: () => fetchChurch(slug!),
    enabled: Boolean(slug),
  });

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
