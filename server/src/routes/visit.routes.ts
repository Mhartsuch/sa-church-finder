import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import { createVisitSchema, deleteVisitSchema, updateVisitSchema } from '../schemas/visit.schema.js'
import { createVisit, deleteVisit, updateVisit } from '../services/visit.service.js'

const router = Router()

// POST /churches/:id/visits — Log a visit to a church
router.post(
  '/churches/:id/visits',
  validate(createVisitSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: churchId } = req.params
      const userId = req.session.userId!

      logger.info({ userId, churchId }, 'Logging church visit')

      const { visit, newAwards } = await createVisit(userId, churchId, req.body)

      res.status(201).json({
        data: visit,
        meta: { newAwards },
        message: 'Visit logged successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// PATCH /visits/:id — Update a visit
router.patch(
  '/visits/:id',
  validate(updateVisitSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ userId, visitId: id }, 'Updating visit')

      const visit = await updateVisit(id, userId, req.body)

      res.json({
        data: visit,
        message: 'Visit updated successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// DELETE /visits/:id — Delete a visit
router.delete(
  '/visits/:id',
  validate(deleteVisitSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ userId, visitId: id }, 'Deleting visit')

      await deleteVisit(id, userId)

      res.json({
        data: { id },
        message: 'Visit deleted successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
