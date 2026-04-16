import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  createForumPostSchema,
  createForumReplySchema,
  deleteForumPostSchema,
  deleteForumReplySchema,
  getForumPostSchema,
  listForumPostsSchema,
  updateForumPostSchema,
  CreateForumPostBody,
  UpdateForumPostBody,
  CreateForumReplyBody,
} from '../schemas/forum.schema.js'
import {
  createPost,
  createReply,
  deletePost,
  deleteReply,
  getPost,
  listPosts,
  updatePost,
} from '../services/forum.service.js'
import { IForumPostListParams } from '../types/forum.types.js'

const router = Router()

router.get(
  '/forum/posts',
  validate(listForumPostsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query as Record<string, unknown>
      const params: IForumPostListParams = {
        category: q.category as IForumPostListParams['category'],
        sort: q.sort as IForumPostListParams['sort'],
        page: q.page as number | undefined,
        pageSize: q.pageSize as number | undefined,
      }

      logger.info({ params }, 'Listing forum posts')

      const response = await listPosts(params)

      res.json(response)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.get(
  '/forum/posts/:id',
  validate(getForumPostSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      logger.info({ postId: id }, 'Fetching forum post')

      const response = await getPost(id)

      res.json(response)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/forum/posts',
  validate(createForumPostSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session.userId!
      const input = req.body as CreateForumPostBody

      logger.info({ userId }, 'Creating forum post')

      const post = await createPost(userId, input)

      res.status(201).json({
        data: post,
        message: 'Post created successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.patch(
  '/forum/posts/:id',
  validate(updateForumPostSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!
      const input = req.body as UpdateForumPostBody

      logger.info({ postId: id, userId }, 'Updating forum post')

      const post = await updatePost(id, userId, input)

      res.json({
        data: post,
        message: 'Post updated successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.delete(
  '/forum/posts/:id',
  validate(deleteForumPostSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ postId: id, userId }, 'Deleting forum post')

      const result = await deletePost(id, userId)

      res.json({
        data: result,
        message: 'Post deleted successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/forum/posts/:id/replies',
  validate(createForumReplySchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!
      const input = req.body as CreateForumReplyBody

      logger.info({ postId: id, userId }, 'Creating forum reply')

      const reply = await createReply(id, userId, input)

      res.status(201).json({
        data: reply,
        message: 'Reply created successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.delete(
  '/forum/replies/:id',
  validate(deleteForumReplySchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ replyId: id, userId }, 'Deleting forum reply')

      const result = await deleteReply(id, userId)

      res.json({
        data: result,
        message: 'Reply deleted successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
