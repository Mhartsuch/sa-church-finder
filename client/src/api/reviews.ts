import { apiRequest } from '@/lib/api-client';
import { ApiEnvelope } from '@/types/auth';
import {
  IChurchReviewsResponse,
  IReview,
  IReviewInput,
  IUserReview,
  ReviewSort,
} from '@/types/review';

export const fetchChurchReviews = (
  churchId: string,
  sort: ReviewSort,
  pageSize: number,
): Promise<IChurchReviewsResponse> =>
  apiRequest(
    `/churches/${encodeURIComponent(churchId)}/reviews?sort=${sort}&pageSize=${pageSize}&page=1`,
  );

export const createReview = async (churchId: string, input: IReviewInput): Promise<IReview> =>
  (
    await apiRequest<ApiEnvelope<IReview>>(`/churches/${encodeURIComponent(churchId)}/reviews`, {
      method: 'POST',
      body: JSON.stringify(input),
    })
  ).data;

export const updateReview = async (reviewId: string, input: IReviewInput): Promise<IReview> =>
  (
    await apiRequest<ApiEnvelope<IReview>>(`/reviews/${encodeURIComponent(reviewId)}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  ).data;

export const deleteReview = async (reviewId: string) => {
  await apiRequest(`/reviews/${encodeURIComponent(reviewId)}`, { method: 'DELETE' });
};

export const fetchUserReviews = async (userId: string): Promise<IUserReview[]> =>
  (await apiRequest<ApiEnvelope<IUserReview[]>>(`/users/${encodeURIComponent(userId)}/reviews`))
    .data;
