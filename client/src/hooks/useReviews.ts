import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createReview,
  deleteReview,
  fetchChurchReviews,
  fetchUserReviews,
  updateReview,
} from '@/api/reviews';
import { IReviewInput, ReviewSort } from '@/types/review';

export const useChurchReviews = (churchId: string | undefined, sort: ReviewSort, limit: number) =>
  useQuery({
    queryKey: ['reviews', churchId, sort, limit],
    queryFn: () => fetchChurchReviews(churchId!, sort, limit),
    enabled: Boolean(churchId),
  });

export const useUserReviews = (userId: string | undefined) =>
  useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: () => fetchUserReviews(userId!),
    enabled: Boolean(userId),
  });

/** Create, update, or delete the viewer's review, then refresh ratings everywhere. */
export const useSaveReview = (churchId: string) => {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['reviews', churchId] }),
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] }),
      queryClient.invalidateQueries({ queryKey: ['churches'] }),
    ]);

  const save = useMutation({
    mutationFn: ({ reviewId, input }: { reviewId?: string; input: IReviewInput }) =>
      reviewId ? updateReview(reviewId, input) : createReview(churchId, input),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: refresh,
  });

  return { save, remove };
};
