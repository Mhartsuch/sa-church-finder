export type ForumCategory = 'general' | 'recommendations' | 'prayer-requests' | 'events' | 'newcomers';

export type ForumPostSort = 'recent' | 'popular' | 'most-replies';

export const FORUM_CATEGORIES: ForumCategory[] = [
  'general',
  'recommendations',
  'prayer-requests',
  'events',
  'newcomers',
];

export const FORUM_CATEGORY_LABELS: Record<ForumCategory, string> = {
  general: 'General',
  recommendations: 'Church Recommendations',
  'prayer-requests': 'Prayer Requests',
  events: 'Events',
  newcomers: 'Newcomers',
};

export const FORUM_SORT_OPTIONS: { value: ForumPostSort; label: string }[] = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Viewed' },
  { value: 'most-replies', label: 'Most Replies' },
];

export interface IForumAuthor {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface IForumReply {
  id: string;
  body: string;
  postId: string;
  authorId: string;
  author: IForumAuthor;
  createdAt: string;
  updatedAt: string;
}

export interface IForumPost {
  id: string;
  title: string;
  body: string;
  category: string;
  authorId: string;
  author: IForumAuthor;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IForumPostDetail extends IForumPost {
  replies: IForumReply[];
}

export interface IForumPostListResponse {
  data: IForumPost[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    sort: ForumPostSort;
    category: ForumCategory | null;
  };
}

export interface IForumPostDetailResponse {
  data: IForumPostDetail;
}

export interface IForumPostListParams {
  category?: ForumCategory;
  sort?: ForumPostSort;
  page?: number;
  pageSize?: number;
}

export interface CreateForumPostInput {
  title: string;
  body: string;
  category?: ForumCategory;
}

export interface CreateForumReplyInput {
  postId: string;
  body: string;
}
