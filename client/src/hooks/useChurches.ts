import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchChurchBySlug,
  fetchChurches,
  fetchSavedChurches,
  toggleSavedChurch,
} from '@/api/churches'
import { IChurch, ISavedChurch, ISearchParams, ISearchResponse } from '@/types/church'

const STALE_TIME = 60000 // 60 seconds

export const CHURCHES_QUERY_KEY = ['churches'] as const
export const CHURCH_QUERY_KEY = ['church'] as const
export const SAVED_CHURCHES_QUERY_KEY = ['saved-churches'] as const

export const useChurches = (params: ISearchParams) => {
  return useQuery<ISearchResponse, Error>({
    queryKey: [...CHURCHES_QUERY_KEY, params],
    queryFn: () => fetchChurches(params),
    staleTime: STALE_TIME,
    enabled: true,
  })
}

export const useChurch = (slug: string) => {
  return useQuery<IChurch, Error>({
    queryKey: [...CHURCH_QUERY_KEY, slug],
    queryFn: () => fetchChurchBySlug(slug),
    staleTime: STALE_TIME,
    enabled: !!slug,
  })
}

export const useSavedChurches = (userId: string | null) => {
  return useQuery<ISavedChurch[], Error>({
    queryKey: [...SAVED_CHURCHES_QUERY_KEY, userId],
    queryFn: () => fetchSavedChurches(userId!),
    staleTime: STALE_TIME,
    enabled: Boolean(userId),
  })
}

export const useToggleSavedChurch = () => {
  const queryClient = useQueryClient()

  return useMutation<{ churchId: string; saved: boolean }, Error, string>({
    mutationFn: toggleSavedChurch,
    onSuccess: ({ churchId, saved }) => {
      queryClient.setQueriesData<ISearchResponse>(
        { queryKey: CHURCHES_QUERY_KEY },
        (current) =>
          current
            ? {
                ...current,
                data: current.data.map((church) =>
                  church.id === churchId ? { ...church, isSaved: saved } : church,
                ),
              }
            : current,
      )

      queryClient.setQueriesData<IChurch>(
        { queryKey: CHURCH_QUERY_KEY },
        (current) =>
          current && current.id === churchId
            ? {
                ...current,
                isSaved: saved,
              }
            : current,
      )

      void queryClient.invalidateQueries({
        queryKey: SAVED_CHURCHES_QUERY_KEY,
      })
    },
  })
}
