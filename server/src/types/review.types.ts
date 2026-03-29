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
  createdAt: Date
  updatedAt: Date
  user: IReviewAuthor
}

export interface IReviewHelpfulVoteResult {
  reviewId: string
  helpfulCount: number
  viewerHasVotedHelpful: boolean
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
