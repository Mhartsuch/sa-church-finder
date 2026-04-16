import { z } from 'zod'

const forumCategories = ['general', 'recommendations', 'prayer-requests', 'events', 'newcomers'] as const
const forumSortOptions = ['recent', 'popular', 'most-replies'] as const

export const listForumPostsSchema = z.object({
  params: z.object({}).passthrough(),
  query: z
    .object({
      category: z.enum(forumCategories).optional(),
      sort: z.enum(forumSortOptions).optional(),
      page: z.coerce.number().int().positive().optional(),
      pageSize: z.coerce.number().int().positive().max(50).optional(),
    })
    .passthrough(),
  body: z.object({}).passthrough(),
})

export const getForumPostSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export const createForumPostSchema = z.object({
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      title: z.string().trim().min(3).max(200),
      body: z.string().trim().min(10).max(5000),
      category: z.enum(forumCategories).optional(),
    })
    .passthrough(),
})

export const updateForumPostSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      title: z.string().trim().min(3).max(200).optional(),
      body: z.string().trim().min(10).max(5000).optional(),
      category: z.enum(forumCategories).optional(),
    })
    .passthrough()
    .refine((value) => Object.values(value).some((field) => field !== undefined), {
      message: 'At least one field is required',
    }),
})

export const createForumReplySchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z
    .object({
      body: z.string().trim().min(1).max(5000),
    })
    .passthrough(),
})

export const deleteForumPostSchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export const deleteForumReplySchema = z.object({
  params: z
    .object({
      id: z.string().min(1),
    })
    .passthrough(),
  query: z.object({}).passthrough(),
  body: z.object({}).passthrough(),
})

export type CreateForumPostBody = z.infer<typeof createForumPostSchema>['body']
export type UpdateForumPostBody = z.infer<typeof updateForumPostSchema>['body']
export type CreateForumReplyBody = z.infer<typeof createForumReplySchema>['body']
