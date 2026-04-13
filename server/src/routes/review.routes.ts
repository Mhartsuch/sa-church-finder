import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { requireAuth } from '../middleware/require-auth.js'
import { requireSiteAdmin } from '../middleware/require-site-admin.js'
import { validate } from '../middleware/validate.js'
import {
  churchReviewsSchema,
  createReviewSchema,
  CreateReviewBody,
  ResolveFlaggedReviewBody,
  resolveFlaggedReviewSchema,
  reviewIdSchema,
  reviewResponseSchema,
  ReviewResponseBody,
  updateReviewSchema,
  UpdateReviewBody,
} from '../schemas/review.schema.js'
import {
  addHelpfulVote,
  createReview,
  deleteReview,
  deleteReviewResponse,
  flagReview,
  getFlaggedReviews,
  getChurchReviews,
  removeHelpfulVote,
  respondToReview,
  resolveFlaggedReview,
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

router.post(
  '/reviews/:id/helpful',
  validate(reviewIdSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ reviewId: id, userId }, 'Marking review as helpful')

      const result = await addHelpfulVote(id, userId)

      res.status(201).json({
        data: result,
        message: 'Review marked as helpful',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.delete(
  '/reviews/:id/helpful',
  validate(reviewIdSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ reviewId: id, userId }, 'Removing helpful vote from review')

      const result = await removeHelpfulVote(id, userId)

      res.json({
        data: result,
        message: 'Helpful vote removed',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/reviews/:id/flag',
  validate(reviewIdSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ reviewId: id, userId }, 'Flagging review for moderation')

      const result = await flagReview(id, userId)

      res.status(result.status === 'flagged' ? 201 : 200).json({
        data: result,
        message:
          result.status === 'already-flagged'
            ? 'Review is already in the moderation queue'
            : 'Review flagged for moderation',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/reviews/:id/response',
  validate(reviewResponseSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!
      const input = req.body as ReviewResponseBody

      logger.info({ reviewId: id, userId }, 'Adding response to review')

      const result = await respondToReview(id, userId, { body: input.body })

      res.status(201).json({
        data: result,
        message: 'Review response added successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.delete(
  '/reviews/:id/response',
  validate(reviewIdSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ reviewId: id, userId }, 'Removing response from review')

      const result = await deleteReviewResponse(id, userId)

      res.json({
        data: result,
        message: 'Review response removed successfully',
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

router.get(
  '/admin/flagged-reviews',
  requireSiteAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Fetching flagged reviews for moderation')

      const reviews = await getFlaggedReviews()

      res.json(reviews)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.patch(
  '/admin/flagged-reviews/:id',
  validate(resolveFlaggedReviewSchema),
  requireSiteAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!
      const input = req.body as ResolveFlaggedReviewBody

      logger.info({ reviewId: id, userId, status: input.status }, 'Resolving flagged review')

      const result = await resolveFlaggedReview(id, userId, input)

      res.json({
        data: result,
        message:
          result.status === 'removed'
            ? 'Flagged review removed'
            : 'Flagged review approved and restored',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
