import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  CreateChurchServiceBody,
  UpdateChurchServiceBody,
  churchServiceIdSchema,
  createChurchServiceSchema,
  updateChurchServiceSchema,
} from '../schemas/church-service.schema.js'
import {
  createChurchService,
  deleteChurchService,
  updateChurchService,
} from '../services/church-service.service.js'

const router = Router()

router.post(
  '/churches/:churchId/services',
  validate(createChurchServiceSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { churchId } = req.params
      const userId = req.session.userId!
      const input = req.body as CreateChurchServiceBody

      logger.info({ churchId, userId }, 'Creating church service')

      const service = await createChurchService(userId, churchId, {
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime ?? null,
        serviceType: input.serviceType,
        language: input.language,
        description: input.description ?? null,
      })

      res.status(201).json({
        data: service,
        message: 'Service time created successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.patch(
  '/services/:id',
  validate(updateChurchServiceSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!
      const input = req.body as UpdateChurchServiceBody

      logger.info({ serviceId: id, userId }, 'Updating church service')

      const service = await updateChurchService(userId, id, {
        ...(input.dayOfWeek !== undefined ? { dayOfWeek: input.dayOfWeek } : {}),
        ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
        ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
        ...(input.serviceType !== undefined ? { serviceType: input.serviceType } : {}),
        ...(input.language !== undefined ? { language: input.language } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
      })

      res.json({
        data: service,
        message: 'Service time updated successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.delete(
  '/services/:id',
  validate(churchServiceIdSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ serviceId: id, userId }, 'Deleting church service')

      const result = await deleteChurchService(userId, id)

      res.json({
        data: result,
        message: 'Service time deleted successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
