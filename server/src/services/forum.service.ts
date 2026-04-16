import { Prisma, Role } from '@prisma/client'

import prisma from '../lib/prisma.js'
import { AppError, NotFoundError } from '../middleware/error-handler.js'
import {
  ForumPostSort,
  ICreateForumPostInput,
  ICreateForumReplyInput,
  IForumAuthor,
  IForumPost,
  IForumPostDetail,
  IForumPostDetailResponse,
  IForumPostListParams,
  IForumPostListResponse,
  IForumReply,
  IUpdateForumPostInput,
} from '../types/forum.types.js'

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 50

const authorSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  name: true,
  avatarUrl: true,
})

type PostWithAuthorAndCount = Prisma.ForumPostGetPayload<{
  include: {
    author: { select: typeof authorSelect }
    _count: { select: { replies: true } }
  }
}>

type PostWithAuthorAndReplies = Prisma.ForumPostGetPayload<{
  include: {
    author: { select: typeof authorSelect }
    replies: {
      include: {
        author: { select: typeof authorSelect }
      }
    }
  }
}>

const mapAuthor = (user: { id: string; name: string; avatarUrl: string | null }): IForumAuthor => ({
  id: user.id,
  name: user.name,
  avatarUrl: user.avatarUrl,
})

const mapPost = (post: PostWithAuthorAndCount): IForumPost => ({
  id: post.id,
  title: post.title,
  body: post.body,
  category: post.category,
  authorId: post.authorId,
  author: mapAuthor(post.author),
  isPinned: post.isPinned,
  isLocked: post.isLocked,
  viewCount: post.viewCount,
  replyCount: post._count.replies,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
})

const mapReply = (
  reply: Prisma.ForumReplyGetPayload<{
    include: { author: { select: typeof authorSelect } }
  }>,
): IForumReply => ({
  id: reply.id,
  body: reply.body,
  postId: reply.postId,
  authorId: reply.authorId,
  author: mapAuthor(reply.author),
  createdAt: reply.createdAt,
  updatedAt: reply.updatedAt,
})

const mapPostDetail = (post: PostWithAuthorAndReplies, replyCount: number): IForumPostDetail => ({
  id: post.id,
  title: post.title,
  body: post.body,
  category: post.category,
  authorId: post.authorId,
  author: mapAuthor(post.author),
  isPinned: post.isPinned,
  isLocked: post.isLocked,
  viewCount: post.viewCount,
  replyCount,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  replies: post.replies.map(mapReply),
})

function buildOrderBy(sort: ForumPostSort): Prisma.ForumPostOrderByWithRelationInput[] {
  switch (sort) {
    case 'popular':
      return [{ isPinned: 'desc' }, { viewCount: 'desc' }, { createdAt: 'desc' }]
    case 'most-replies':
      return [{ isPinned: 'desc' }, { replies: { _count: 'desc' } }, { createdAt: 'desc' }]
    case 'recent':
    default:
      return [{ isPinned: 'desc' }, { createdAt: 'desc' }]
  }
}

export async function listPosts(params: IForumPostListParams): Promise<IForumPostListResponse> {
  const page = params.page && params.page > 0 ? params.page : DEFAULT_PAGE
  const requestedPageSize = params.pageSize ?? DEFAULT_PAGE_SIZE
  const pageSize = Math.min(Math.max(requestedPageSize, 1), MAX_PAGE_SIZE)
  const sort: ForumPostSort = params.sort ?? 'recent'
  const category = params.category ?? null

  const where: Prisma.ForumPostWhereInput = category ? { category } : {}

  const [total, posts] = await Promise.all([
    prisma.forumPost.count({ where }),
    prisma.forumPost.findMany({
      where,
      include: {
        author: { select: authorSelect },
        _count: { select: { replies: true } },
      },
      orderBy: buildOrderBy(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)

  return {
    data: posts.map(mapPost),
    meta: {
      page,
      pageSize,
      total,
      totalPages,
      sort,
      category,
    },
  }
}

export async function getPost(id: string): Promise<IForumPostDetailResponse> {
  const post = await prisma.forumPost.findUnique({
    where: { id },
    include: {
      author: { select: authorSelect },
      replies: {
        include: {
          author: { select: authorSelect },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!post) {
    throw new NotFoundError('Forum post not found')
  }

  // Increment view count without blocking the response
  void prisma.forumPost
    .update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {
      // Silently ignore view count failures — non-critical
    })

  return {
    data: mapPostDetail(post, post.replies.length),
  }
}

export async function createPost(
  authorId: string,
  input: ICreateForumPostInput,
): Promise<IForumPost> {
  const post = await prisma.forumPost.create({
    data: {
      title: input.title.trim(),
      body: input.body.trim(),
      category: input.category ?? 'general',
      authorId,
    },
    include: {
      author: { select: authorSelect },
      _count: { select: { replies: true } },
    },
  })

  return mapPost(post)
}

export async function updatePost(
  id: string,
  authorId: string,
  input: IUpdateForumPostInput,
): Promise<IForumPost> {
  const existing = await prisma.forumPost.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  })

  if (!existing) {
    throw new NotFoundError('Forum post not found')
  }

  if (existing.authorId !== authorId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only edit your own posts')
  }

  const data: Prisma.ForumPostUpdateInput = {}
  if (input.title !== undefined) data.title = input.title.trim()
  if (input.body !== undefined) data.body = input.body.trim()
  if (input.category !== undefined) data.category = input.category

  const post = await prisma.forumPost.update({
    where: { id },
    data,
    include: {
      author: { select: authorSelect },
      _count: { select: { replies: true } },
    },
  })

  return mapPost(post)
}

export async function deletePost(
  id: string,
  requesterId: string,
): Promise<{ id: string; deleted: boolean }> {
  const existing = await prisma.forumPost.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  })

  if (!existing) {
    throw new NotFoundError('Forum post not found')
  }

  if (existing.authorId !== requesterId) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true },
    })

    if (!requester || requester.role !== Role.SITE_ADMIN) {
      throw new AppError(403, 'FORBIDDEN', 'You can only delete your own posts')
    }
  }

  await prisma.forumPost.delete({ where: { id } })

  return { id, deleted: true }
}

export async function createReply(
  postId: string,
  authorId: string,
  input: ICreateForumReplyInput,
): Promise<IForumReply> {
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { id: true, isLocked: true },
  })

  if (!post) {
    throw new NotFoundError('Forum post not found')
  }

  if (post.isLocked) {
    throw new AppError(403, 'POST_LOCKED', 'This post is locked and cannot receive new replies')
  }

  const reply = await prisma.forumReply.create({
    data: {
      body: input.body.trim(),
      postId,
      authorId,
    },
    include: {
      author: { select: authorSelect },
    },
  })

  return mapReply(reply)
}

export async function deleteReply(
  replyId: string,
  requesterId: string,
): Promise<{ id: string; deleted: boolean }> {
  const existing = await prisma.forumReply.findUnique({
    where: { id: replyId },
    select: { id: true, authorId: true },
  })

  if (!existing) {
    throw new NotFoundError('Forum reply not found')
  }

  if (existing.authorId !== requesterId) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true },
    })

    if (!requester || requester.role !== Role.SITE_ADMIN) {
      throw new AppError(403, 'FORBIDDEN', 'You can only delete your own replies')
    }
  }

  await prisma.forumReply.delete({ where: { id: replyId } })

  return { id: replyId, deleted: true }
}
