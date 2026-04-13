import { apiRequest } from '@/lib/api-client';
import { ApiEnvelope } from '@/types/api';
import {
  CreateReviewInput,
  IFlaggedReviewsResponse,
  IChurchReviewsResponse,
  IReview,
  IReviewListParams,
  IUserReview,
  IUserReviewsResponse,
  ResolveFlaggedReviewInput,
  ResolveFlaggedReviewResult,
  ReviewFlagResult,
  ReviewHelpfulVoteResult,
  ReviewResponseDeleteResult,
  ReviewResponseResult,
  UpdateReviewInput,
} from '@/types/review';

const buildReviewQueryString = (params: IReviewListParams): string => {
  const qs = new URLSearchParams();

  if (params.sort) qs.append('sort', params.sort);
  if (params.page !== undefined) qs.append('page', params.page.toString());
  if (params.pageSize !== undefined) qs.append('pageSize', params.pageSize.toString());

  const queryString = qs.toString();
  return queryString ? `?${queryString}` : '';
};

export const fetchChurchReviews = async (
  churchId: string,
  params: IReviewListParams = {},
): Promise<IChurchReviewsResponse> => {
  return apiRequest<IChurchReviewsResponse>(
    `/churches/${encodeURIComponent(churchId)}/reviews${buildReviewQueryString(params)}`,
  );
};

export const createReview = async (input: CreateReviewInput): Promise<IReview> => {
  const { churchId, ...payload } = input;
  const envelope = await apiRequest<ApiEnvelope<IReview>>(
    `/churches/${encodeURIComponent(churchId)}/reviews`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  return envelope.data;
};

export const updateReview = async (input: UpdateReviewInput): Promise<IReview> => {
  const { reviewId, ...payload } = input;
  const envelope = await apiRequest<ApiEnvelope<IReview>>(`/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return envelope.data;
};

export const deleteReview = async (reviewId: string): Promise<{ id: string; churchId: string }> => {
  const envelope = await apiRequest<ApiEnvelope<{ id: string; churchId: string }>>(
    `/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: 'DELETE',
    },
  );

  return envelope.data;
};

export const addHelpfulVote = async (reviewId: string): Promise<ReviewHelpfulVoteResult> => {
  const envelope = await apiRequest<ApiEnvelope<ReviewHelpfulVoteResult>>(
    `/reviews/${encodeURIComponent(reviewId)}/helpful`,
    {
      method: 'POST',
    },
  );

  return envelope.data;
};

export const removeHelpfulVote = async (reviewId: string): Promise<ReviewHelpfulVoteResult> => {
  const envelope = await apiRequest<ApiEnvelope<ReviewHelpfulVoteResult>>(
    `/reviews/${encodeURIComponent(reviewId)}/helpful`,
    {
      method: 'DELETE',
    },
  );

  return envelope.data;
};

export const flagReview = async (reviewId: string): Promise<ReviewFlagResult> => {
  const envelope = await apiRequest<ApiEnvelope<ReviewFlagResult>>(
    `/reviews/${encodeURIComponent(reviewId)}/flag`,
    {
      method: 'POST',
    },
  );

  return envelope.data;
};

export const fetchUserReviews = async (userId: string): Promise<IUserReview[]> => {
  const response = await apiRequest<IUserReviewsResponse>(
    `/users/${encodeURIComponent(userId)}/reviews`,
  );

  return response.data;
};

export const fetchFlaggedReviews = async (): Promise<IFlaggedReviewsResponse> => {
  return apiRequest<IFlaggedReviewsResponse>('/admin/flagged-reviews');
};

export const resolveFlaggedReview = async (
  input: ResolveFlaggedReviewInput,
): Promise<ResolveFlaggedReviewResult> => {
  const { reviewId, ...payload } = input;
  const envelope = await apiRequest<ApiEnvelope<ResolveFlaggedReviewResult>>(
    `/admin/flagged-reviews/${encodeURIComponent(reviewId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  return envelope.data;
};

export const respondToReview = async (
  reviewId: string,
  body: string,
): Promise<ReviewResponseResult> => {
  const envelope = await apiRequest<ApiEnvelope<ReviewResponseResult>>(
    `/reviews/${encodeURIComponent(reviewId)}/response`,
    {
      method: 'POST',
      body: JSON.stringify({ body }),
    },
  );

  return envelope.data;
};

export const deleteReviewResponse = async (
  reviewId: string,
): Promise<ReviewResponseDeleteResult> => {
  const envelope = await apiRequest<ApiEnvelope<ReviewResponseDeleteResult>>(
    `/reviews/${encodeURIComponent(reviewId)}/response`,
    {
      method: 'DELETE',
    },
  );

  return envelope.data;
};
