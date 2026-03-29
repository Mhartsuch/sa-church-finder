import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createReview,
  deleteReview,
  fetchChurchReviews,
  fetchUserReviews,
  updateReview,
} from '@/api/reviews'
import {
  CHURCHES_QUERY_KEY,
  CHURCH_QUERY_KEY,
  SAVED_CHURCHES_QUERY_KEY,
} from '@/hooks/useChurches'
import {
  CreateReviewInput,
  IChurchReviewsResponse,
  IReview,
  IReviewListParams,
  IUserReview,
  UpdateReviewInput,
} from '@/types/review'

const STALE_TIME = 60000

export const CHURCH_REVIEWS_QUERY_KEY = ['church-reviews'] as const
export const USER_REVIEWS_QUERY_KEY = ['user-reviews'] as const

const invalidateReviewAwareQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: CHURCHES_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: CHURCH_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: SAVED_CHURCHES_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: CHURCH_REVIEWS_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: USER_REVIEWS_QUERY_KEY })
}

export const useChurchReviews = (
  churchId: string,
  viewerId: string | null,
  params: IReviewListParams,
) => {
  return useQuery<IChurchReviewsResponse, Error>({
    queryKey: [...CHURCH_REVIEWS_QUERY_KEY, churchId, viewerId, params],
    queryFn: () => fetchChurchReviews(churchId, params),
    staleTime: STALE_TIME,
    enabled: Boolean(churchId),
  })
}

export const useUserReviews = (userId: string | null) => {
  return useQuery<IUserReview[], Error>({
    queryKey: [...USER_REVIEWS_QUERY_KEY, userId],
    queryFn: () => fetchUserReviews(userId!),
    staleTime: STALE_TIME,
    enabled: Boolean(userId),
  })
}

export const useCreateReview = () => {
  const queryClient = useQueryClient()

  return useMutation<IReview, Error, CreateReviewInput>({
    mutationFn: createReview,
    onSuccess: () => {
      invalidateReviewAwareQueries(queryClient)
    },
  })
}

export const useUpdateReview = () => {
  const queryClient = useQueryClient()

  return useMutation<IReview, Error, UpdateReviewInput>({
    mutationFn: updateReview,
    onSuccess: () => {
      invalidateReviewAwareQueries(queryClient)
    },
  })
}

export const useDeleteReview = () => {
  const queryClient = useQueryClient()

  return useMutation<{ id: string; churchId: string }, Error, string>({
    mutationFn: deleteReview,
    onSuccess: () => {
      invalidateReviewAwareQueries(queryClient)
    },
  })
}
