import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  churchReviewsSchema,
  createReviewSchema,
  CreateReviewBody,
  reviewIdSchema,
  updateReviewSchema,
  UpdateReviewBody,
} from '../schemas/review.schema.js'
import {
  createReview,
  deleteReview,
  getChurchReviews,
  updateReview,
} from '../services/review.service.js'
import { IReviewListParams } from '../types/review.types.js'

const router = Router()

router.get(
  '/churches/:churchId/reviews',
  validate(churchReviewsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { churchId } = req.params
      const q = req.query as Record<string, unknown>
      const params: IReviewListParams = {
        sort: q.sort as IReviewListParams['sort'],
        page: q.page as number | undefined,
        pageSize: q.pageSize as number | undefined,
      }

      logger.info({ churchId, params }, 'Fetching church reviews')

      const reviews = await getChurchReviews(churchId, params, req.session.userId)

      res.json(reviews)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/churches/:churchId/reviews',
  validate(createReviewSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { churchId } = req.params
      const input = req.body as CreateReviewBody
      const userId = req.session.userId!

      logger.info({ churchId, userId }, 'Creating church review')

      const review = await createReview(userId, churchId, input)

      res.status(201).json({
        data: review,
        message: 'Review created successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.patch(
  '/reviews/:id',
  validate(updateReviewSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const input = req.body as UpdateReviewBody
      const userId = req.session.userId!

      logger.info({ reviewId: id, userId }, 'Updating review')

      const review = await updateReview(id, userId, input)

      res.json({
        data: review,
        message: 'Review updated successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.delete(
  '/reviews/:id',
  validate(reviewIdSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ reviewId: id, userId }, 'Deleting review')

      const result = await deleteReview(id, userId)

      res.json({
        data: result,
        message: 'Review deleted successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
