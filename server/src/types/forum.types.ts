export type ForumCategory = 'general' | 'recommendations' | 'prayer-requests' | 'events' | 'newcomers'

export type ForumPostSort = 'recent' | 'popular' | 'most-replies'

export interface IForumAuthor {
  id: string
  name: string
  avatarUrl: string | null
}

export interface IForumReply {
  id: string
  body: string
  postId: string
  authorId: string
  author: IForumAuthor
  createdAt: Date
  updatedAt: Date
}

export interface IForumPost {
  id: string
  title: string
  body: string
  category: string
  authorId: string
  author: IForumAuthor
  isPinned: boolean
  isLocked: boolean
  viewCount: number
  replyCount: number
  createdAt: Date
  updatedAt: Date
}

export interface IForumPostDetail extends IForumPost {
  replies: IForumReply[]
}

export interface IForumPostListParams {
  category?: ForumCategory
  sort?: ForumPostSort
  page?: number
  pageSize?: number
}

export interface IForumPostListResponse {
  data: IForumPost[]
  meta: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    sort: ForumPostSort
    category: ForumCategory | null
  }
}

export interface IForumPostDetailResponse {
  data: IForumPostDetail
}

export interface ICreateForumPostInput {
  title: string
  body: string
  category?: ForumCategory
}

export interface IUpdateForumPostInput {
  title?: string
  body?: string
  category?: ForumCategory
}

export interface ICreateForumReplyInput {
  body: string
}
