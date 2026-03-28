import { useQuery } from '@tanstack/react-query'
import { fetchChurches, fetchChurchBySlug } from '@/api/churches'
import { ISearchParams, ISearchResponse, IChurch } from '@/types/church'

const STALE_TIME = 60000 // 60 seconds

export const useChurches = (params: ISearchParams) => {
  return useQuery<ISearchResponse, Error>({
    queryKey: ['churches', params],
    queryFn: () => fetchChurches(params),
    staleTime: STALE_TIME,
    enabled: true
  })
}

export const useChurch = (slug: string) => {
  return useQuery<IChurch, Error>({
    queryKey: ['church', slug],
    queryFn: () => fetchChurchBySlug(slug),
    staleTime: STALE_TIME,
    enabled: !!slug
  })
}
