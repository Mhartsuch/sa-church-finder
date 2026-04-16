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
  responseBody: string | null
  respondedAt: Date | null
  createdAt: Date
  updatedAt: Date
  user: IReviewAuthor
}

export interface IReviewHelpfulVoteResult {
  reviewId: string
  helpfulCount: number
  viewerHasVotedHelpful: boolean
}

export interface IReviewFlagResult {
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
  flaggedAt: Date
}

export interface IReviewListResponse {
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

export interface IUserReviewHistoryResponse {
  data: IUserReview[]
  meta: {
    total: number
  }
}

export interface IFlaggedReviewListResponse {
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

export interface ICreateReviewInput {
  rating: number
  body: string
  welcomeRating?: number | null
  worshipRating?: number | null
  sermonRating?: number | null
  facilitiesRating?: number | null
}

export interface IUpdateReviewInput {
  rating?: number
  body?: string
  welcomeRating?: number | null
  worshipRating?: number | null
  sermonRating?: number | null
  facilitiesRating?: number | null
}

export interface IResolveFlaggedReviewInput {
  status: 'approved' | 'removed'
}

export interface IFlaggedReviewResolutionResult {
  reviewId: string
  status: 'approved' | 'removed'
}

export interface IReviewResponseInput {
  body: string
}

export interface IReviewResponseResult {
  reviewId: string
  responseBody: string
  respondedAt: Date
}

export interface IReviewResponseDeleteResult {
  reviewId: string
}

// Service time management types
export interface ICreateChurchServiceInput {
  dayOfWeek: number
  startTime: string
  endTime?: string | null
  serviceType: string
  language?: string
  description?: string | null
}

export interface IUpdateChurchServiceInput {
  dayOfWeek?: number
  startTime?: string
  endTime?: string | null
  serviceType?: string
  language?: string
  description?: string | null
}

export interface IChurchServiceResult {
  id: string
  churchId: string
  dayOfWeek: number
  startTime: string
  endTime: string | null
  serviceType: string
  language: string
  description: string | null
  isAutoImported: boolean
  createdAt: Date
  updatedAt: Date
}
