export type ReviewSort = 'recent' | 'highest' | 'lowest'

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
  createdAt: Date
  updatedAt: Date
  user: IReviewAuthor
}

export interface IReviewChurch {
  id: string
  name: string
  slug: string
  denomination: string | null
  neighborhood: string | null
  coverImageUrl: string | null
}

export interface IUserReview extends IReview {
  church: IReviewChurch
}

export interface IReviewListParams {
  page?: number
  pageSize?: number
  sort?: ReviewSort
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

export interface IReviewInput {
  rating: number
  body: string
}
