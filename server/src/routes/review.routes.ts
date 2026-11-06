import { NextFunction, Request, Response, Router } from 'express'

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
      const params = req.query as IReviewListParams
      res.json(await getChurchReviews(req.params.churchId, params, req.session.userId))
    } catch (error) {
      next(error)
    }
  },
)

router.post(
  '/churches/:churchId/reviews',
  validate(createReviewSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as CreateReviewBody
      const review = await createReview(req.session.userId!, req.params.churchId, input)
      res.status(201).json({ data: review })
    } catch (error) {
      next(error)
    }
  },
)

router.patch(
  '/reviews/:id',
  validate(updateReviewSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as UpdateReviewBody
      res.json({ data: await updateReview(req.params.id, req.session.userId!, input) })
    } catch (error) {
      next(error)
    }
  },
)

router.delete(
  '/reviews/:id',
  validate(reviewIdSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await deleteReview(req.params.id, req.session.userId!) })
    } catch (error) {
      next(error)
    }
  },
)

export default router
