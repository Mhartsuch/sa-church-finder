import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { AppError } from '../middleware/error-handler.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  userClaimsSchema,
  userReviewsSchema,
  userSavedChurchesSchema,
} from '../schemas/user.schema.js'
import { getUserChurchClaims } from '../services/church-claim.service.js'
import { getUserReviewHistory } from '../services/review.service.js'
import { getSavedChurchesForUser } from '../services/saved-church.service.js'

const router = Router()

router.get(
  '/:id/saved',
  validate(userSavedChurchesSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const sessionUserId = req.session.userId

      if (sessionUserId !== id) {
        throw new AppError(
          403,
          'FORBIDDEN',
          'You can only access your own saved churches',
        )
      }

      logger.info({ userId: id }, 'Fetching saved churches')

      const savedChurches = await getSavedChurchesForUser(id)

      res.json({
        data: savedChurches,
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.get(
  '/:id/claims',
  validate(userClaimsSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const sessionUserId = req.session.userId

      if (sessionUserId !== id) {
        throw new AppError(
          403,
          'FORBIDDEN',
          'You can only access your own church claims',
        )
      }

      logger.info({ userId: id }, 'Fetching user church claims')

      const claims = await getUserChurchClaims(id)

      res.json(claims)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.get(
  '/:id/reviews',
  validate(userReviewsSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const sessionUserId = req.session.userId

      if (sessionUserId !== id) {
        throw new AppError(
          403,
          'FORBIDDEN',
          'You can only access your own reviews',
        )
      }

      logger.info({ userId: id }, 'Fetching user reviews')

      const reviews = await getUserReviewHistory(id)

      res.json(reviews)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
