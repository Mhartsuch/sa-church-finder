export type ReviewSort = 'recent' | 'highest' | 'lowest' | 'helpful'

export interface IReviewAuthor {
  id: string
  name: string
  avatarUrl: string | null
}

export interface IReview {
  id: string
  churchId: string
  userId: string
  rating: number
  body: string
  welcomeRating: number | null
  worshipRating: number | null
  sermonRating: number | null
  facilitiesRating: number | null
  helpfulCount: number
  viewerHasVotedHelpful: boolean
  createdAt: string
  updatedAt: string
  user: IReviewAuthor
}

export interface ReviewHelpfulVoteResult {
  reviewId: string
  helpfulCount: number
  viewerHasVotedHelpful: boolean
}

export interface ReviewFlagResult {
  reviewId: string
  status: 'flagged' | 'already-flagged'
}

export interface IReviewChurchSummary {
  id: string
  name: string
  slug: string
  denomination: string | null
  city: string
  state: string
  neighborhood: string | null
}

export interface IUserReview extends IReview {
  church: IReviewChurchSummary
}

export interface IFlaggedReview extends IUserReview {
  flaggedAt: string
}

export interface IChurchReviewsResponse {
  data: IReview[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    sort: ReviewSort
  }
  currentUserReview: IReview | null
}

export interface IUserReviewsResponse {
  data: IUserReview[]
  meta: {
    total: number
  }
}

export interface IFlaggedReviewsResponse {
  data: IFlaggedReview[]
  meta: {
    total: number
  }
}

export interface IReviewListParams {
  sort?: ReviewSort
  page?: number
  pageSize?: number
}

export interface CreateReviewInput {
  churchId: string
  rating: number
  body: string
  welcomeRating?: number | null
  worshipRating?: number | null
  sermonRating?: number | null
  facilitiesRating?: number | null
}

export interface UpdateReviewInput {
  reviewId: string
  rating: number
  body: string
  welcomeRating?: number | null
  worshipRating?: number | null
  sermonRating?: number | null
  facilitiesRating?: number | null
}

export interface ResolveFlaggedReviewInput {
  reviewId: string
  status: 'approved' | 'removed'
}

export interface ResolveFlaggedReviewResult {
  reviewId: string
  status: 'approved' | 'removed'
}
