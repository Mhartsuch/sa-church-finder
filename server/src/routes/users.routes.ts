import { NextFunction, Request, Response, Router } from 'express'

import { SESSION_COOKIE_NAME } from '../lib/session.js'
import { AppError } from '../middleware/error-handler.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  deleteAccountSchema,
  updateProfileSchema,
  userReviewsSchema,
  userSavedChurchesSchema,
  DeleteAccountBody,
  UpdateProfileBody,
} from '../schemas/user.schema.js'
import { getUserReviews } from '../services/review.service.js'
import { getSavedChurchesForUser } from '../services/saved-church.service.js'
import { deleteAccount, updateProfile } from '../services/user.service.js'

const router = Router()

/** Every /users/:id route is restricted to the signed-in user's own id. */
const requireSelf = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.session.userId !== req.params.id) {
    next(new AppError(403, 'FORBIDDEN', 'You can only access your own account'))
    return
  }
  next()
}

router.get(
  '/:id/saved',
  validate(userSavedChurchesSchema),
  requireAuth,
  requireSelf,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query as { page?: number; pageSize?: number }
      res.json(await getSavedChurchesForUser(req.params.id, query))
    } catch (error) {
      next(error)
    }
  },
)

router.get(
  '/:id/reviews',
  validate(userReviewsSchema),
  requireAuth,
  requireSelf,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviews = await getUserReviews(req.params.id)
      res.json({ data: reviews, meta: { total: reviews.length } })
    } catch (error) {
      next(error)
    }
  },
)

router.patch(
  '/:id/profile',
  validate(updateProfileSchema),
  requireAuth,
  requireSelf,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await updateProfile(req.params.id, req.body as UpdateProfileBody) })
    } catch (error) {
      next(error)
    }
  },
)

router.delete(
  '/:id',
  validate(deleteAccountSchema),
  requireAuth,
  requireSelf,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await deleteAccount(req.params.id, req.body as DeleteAccountBody)
      await new Promise<void>((resolve, reject) =>
        req.session.destroy((error) => (error ? reject(error) : resolve())),
      )
      res.clearCookie(SESSION_COOKIE_NAME)
      res.json({ data: { deleted: true } })
    } catch (error) {
      next(error)
    }
  },
)

export default router
