import { IPageMeta } from '@/types/church';

export type ReviewSort = 'recent' | 'highest' | 'lowest';

export interface IReview {
  id: string;
  churchId: string;
  userId: string;
  rating: number;
  body: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface IUserReview extends IReview {
  church: {
    id: string;
    name: string;
    slug: string;
    denomination: string | null;
    neighborhood: string | null;
    coverImageUrl: string | null;
  };
}

export interface IChurchReviewsResponse {
  data: IReview[];
  meta: IPageMeta & { sort: ReviewSort };
  currentUserReview: IReview | null;
}

export interface IReviewInput {
  rating: number;
  body: string;
}
