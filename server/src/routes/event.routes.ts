import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  CreateChurchEventBody,
  UpdateChurchEventBody,
  createChurchEventSchema,
  eventIdSchema,
  updateChurchEventSchema,
} from '../schemas/event.schema.js'
import {
  createChurchEvent,
  deleteChurchEvent,
  updateChurchEvent,
} from '../services/event.service.js'
import { ICreateChurchEventInput, IUpdateChurchEventInput } from '../types/event.types.js'

const router = Router()

const toOptionalDate = (value: string | null | undefined): Date | null | undefined => {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  return new Date(value)
}

router.post(
  '/churches/:churchId/events',
  validate(createChurchEventSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { churchId } = req.params
      const userId = req.session.userId!
      const input = req.body as CreateChurchEventBody

      logger.info({ churchId, userId }, 'Creating church event')

      const payload: ICreateChurchEventInput = {
        title: input.title,
        description: input.description ?? null,
        eventType: input.eventType,
        startTime: new Date(input.startTime),
        endTime: toOptionalDate(input.endTime) ?? null,
        locationOverride: input.locationOverride ?? null,
        isRecurring: input.isRecurring ?? false,
        recurrenceRule: input.recurrenceRule ?? null,
      }

      const event = await createChurchEvent(userId, churchId, payload)

      res.status(201).json({
        data: event,
        message: 'Event created successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.patch(
  '/events/:id',
  validate(updateChurchEventSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!
      const input = req.body as UpdateChurchEventBody

      logger.info({ eventId: id, userId }, 'Updating church event')

      const payload: IUpdateChurchEventInput = {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.eventType !== undefined ? { eventType: input.eventType } : {}),
        ...(input.startTime !== undefined ? { startTime: new Date(input.startTime) } : {}),
        ...(input.endTime !== undefined ? { endTime: toOptionalDate(input.endTime) } : {}),
        ...(input.locationOverride !== undefined
          ? { locationOverride: input.locationOverride }
          : {}),
        ...(input.isRecurring !== undefined ? { isRecurring: input.isRecurring } : {}),
        ...(input.recurrenceRule !== undefined ? { recurrenceRule: input.recurrenceRule } : {}),
      }

      const event = await updateChurchEvent(userId, id, payload)

      res.json({
        data: event,
        message: 'Event updated successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.delete(
  '/events/:id',
  validate(eventIdSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ eventId: id, userId }, 'Deleting church event')

      const result = await deleteChurchEvent(userId, id)

      res.json({
        data: result,
        message: 'Event deleted successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
