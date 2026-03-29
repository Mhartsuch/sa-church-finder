import { apiRequest } from '@/lib/api-client'
import {
  CreateReviewInput,
  IChurchReviewsResponse,
  IReview,
  IReviewListParams,
  IUserReview,
  IUserReviewsResponse,
  ReviewHelpfulVoteResult,
  UpdateReviewInput,
} from '@/types/review'

type ReviewEnvelope = {
  data: IReview
}

type DeleteReviewEnvelope = {
  data: {
    id: string
    churchId: string
  }
}

type HelpfulVoteEnvelope = {
  data: ReviewHelpfulVoteResult
}

const buildReviewQueryString = (params: IReviewListParams): string => {
  const qs = new URLSearchParams()

  if (params.sort) qs.append('sort', params.sort)
  if (params.page !== undefined) qs.append('page', params.page.toString())
  if (params.pageSize !== undefined) qs.append('pageSize', params.pageSize.toString())

  const queryString = qs.toString()
  return queryString ? `?${queryString}` : ''
}

export const fetchChurchReviews = async (
  churchId: string,
  params: IReviewListParams = {},
): Promise<IChurchReviewsResponse> => {
  return apiRequest<IChurchReviewsResponse>(
    `/churches/${encodeURIComponent(churchId)}/reviews${buildReviewQueryString(params)}`,
  )
}

export const createReview = async (input: CreateReviewInput): Promise<IReview> => {
  const { churchId, ...payload } = input
  const envelope = await apiRequest<ReviewEnvelope>(
    `/churches/${encodeURIComponent(churchId)}/reviews`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )

  return envelope.data
}

export const updateReview = async (input: UpdateReviewInput): Promise<IReview> => {
  const { reviewId, ...payload } = input
  const envelope = await apiRequest<ReviewEnvelope>(`/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return envelope.data
}

export const deleteReview = async (
  reviewId: string,
): Promise<DeleteReviewEnvelope['data']> => {
  const envelope = await apiRequest<DeleteReviewEnvelope>(
    `/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: 'DELETE',
    },
  )

  return envelope.data
}

export const addHelpfulVote = async (
  reviewId: string,
): Promise<ReviewHelpfulVoteResult> => {
  const envelope = await apiRequest<HelpfulVoteEnvelope>(
    `/reviews/${encodeURIComponent(reviewId)}/helpful`,
    {
      method: 'POST',
    },
  )

  return envelope.data
}

export const removeHelpfulVote = async (
  reviewId: string,
): Promise<ReviewHelpfulVoteResult> => {
  const envelope = await apiRequest<HelpfulVoteEnvelope>(
    `/reviews/${encodeURIComponent(reviewId)}/helpful`,
    {
      method: 'DELETE',
    },
  )

  return envelope.data
}

export const fetchUserReviews = async (userId: string): Promise<IUserReview[]> => {
  const response = await apiRequest<IUserReviewsResponse>(
    `/users/${encodeURIComponent(userId)}/reviews`,
  )

  return response.data
}
