import { NextFunction, Request, Response, Router } from 'express'

import { buildCalendarFeed } from '../lib/ics.js'
import logger from '../lib/logger.js'
import { resolvePublicSiteUrl } from '../lib/public-url.js'
import { AuthError } from '../middleware/error-handler.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  CreateChurchEventBody,
  UpdateChurchEventBody,
  aggregatedCalendarFeedSchema,
  createChurchEventSchema,
  eventIdSchema,
  eventsFeedSchema,
  updateChurchEventSchema,
} from '../schemas/event.schema.js'
import {
  createChurchEvent,
  deleteChurchEvent,
  getAggregatedCalendarFeed,
  listEventsFeed,
  updateChurchEvent,
} from '../services/event.service.js'
import {
  ChurchEventType,
  EventSortOption,
  EventTimeOfDay,
  ICreateChurchEventInput,
  IEventsFeedFilters,
  IUpdateChurchEventInput,
} from '../types/event.types.js'

const router = Router()

router.get(
  '/events.ics',
  validate(aggregatedCalendarFeedSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query as Record<string, unknown>
      // The Zod schema normalizes single, comma-separated, and repeated
      // `type` query params into a deduped `ChurchEventType[]`. An empty
      // list / missing param means "no filter" — matches the wire format of
      // the JSON aggregated feed (`GET /events`).
      const types = Array.isArray(q.type) ? (q.type as ChurchEventType[]) : undefined

      logger.info({ types }, 'Generating aggregated calendar feed')

      const feed = await getAggregatedCalendarFeed({ type: types })
      const siteUrl = resolvePublicSiteUrl()

      const ics = buildCalendarFeed({
        calendarName: feed.calendarName,
        calendarDescription: feed.calendarDescription,
        events: feed.events.map((event) => ({
          id: event.id,
          title: `${event.title} · ${event.church.name}`,
          description: event.description,
          eventType: event.eventType,
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.locationOverride ?? event.church.address,
          url: `${siteUrl}/churches/${event.church.slug}`,
          isRecurring: event.isRecurring,
          recurrenceRule: event.recurrenceRule,
          updatedAt: event.updatedAt,
        })),
      })

      // Filename surfaces the chosen types so downloads stay self-descriptive
      // (`sa-church-finder-service-community-events.ics`). The join order
      // follows the deduped list the Zod schema returns, which preserves the
      // user's chip-selection order from the discovery page.
      const filenameSuffix = types && types.length > 0 ? `-${types.join('-')}` : ''

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
      res.setHeader(
        'Content-Disposition',
        `inline; filename="sa-church-finder${filenameSuffix}-events.ics"`,
      )
      res.setHeader('Cache-Control', 'public, max-age=300')
      res.send(ics)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.get(
  '/events',
  validate(eventsFeedSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = req.query as Record<string, unknown>
      const savedOnly = q.savedOnly === true

      if (savedOnly && !req.session.userId) {
        throw new AuthError('Sign in to filter events by your saved churches')
      }

      const filters: IEventsFeedFilters = {
        // The Zod schema normalizes single, comma-separated, and repeated
        // `type` query params into a deduped `ChurchEventType[]`.
        type: Array.isArray(q.type) ? (q.type as ChurchEventType[]) : undefined,
        from: typeof q.from === 'string' ? new Date(q.from) : undefined,
        to: typeof q.to === 'string' ? new Date(q.to) : undefined,
        q: typeof q.q === 'string' && q.q.trim().length > 0 ? q.q.trim() : undefined,
        page: typeof q.page === 'number' ? q.page : undefined,
        pageSize: typeof q.pageSize === 'number' ? q.pageSize : undefined,
        savedByUserId: savedOnly ? req.session.userId : undefined,
        timeOfDay: typeof q.timeOfDay === 'string' ? (q.timeOfDay as EventTimeOfDay) : undefined,
        neighborhood:
          typeof q.neighborhood === 'string' && q.neighborhood.trim().length > 0
            ? q.neighborhood.trim()
            : undefined,
        // The Zod schema normalizes single, comma-separated, and repeated
        // `denomination` query params into a deduped `string[]`.
        denomination: Array.isArray(q.denomination) ? (q.denomination as string[]) : undefined,
        accessibleOnly: q.accessibleOnly === true ? true : undefined,
        sort: typeof q.sort === 'string' ? (q.sort as EventSortOption) : undefined,
      }

      logger.info({ filters }, 'Fetching aggregated events feed')

      const response = await listEventsFeed(filters)

      res.json(response)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

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
