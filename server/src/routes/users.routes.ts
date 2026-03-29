import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { AppError } from '../middleware/error-handler.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import { userSavedChurchesSchema } from '../schemas/user.schema.js'
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

export default router
