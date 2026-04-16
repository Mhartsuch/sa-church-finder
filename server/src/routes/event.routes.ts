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
      // Same story for denomination: schema deduplicates and normalizes the
      // input into a `string[]` (or `undefined`). Passed straight through to
      // the service layer, which matches case-insensitively but echoes the
      // caller's casing back for display.
      const denominations = Array.isArray(q.denomination) ? (q.denomination as string[]) : undefined
      // Same story for neighborhood: schema deduplicates and normalizes the
      // input into a `string[]` (or `undefined`). The service layer matches
      // case-insensitively against `church.neighborhood` but echoes the
      // caller's casing back for filename/calendar-name display.
      const neighborhoods = Array.isArray(q.neighborhood) ? (q.neighborhood as string[]) : undefined
      // Multi-select language filter mirrors the JSON feed's wire format.
      // The service layer matches case-sensitively against `church.languages`
      // (the canonical casing already exposed via `/churches/filter-options`)
      // but echoes the caller's casing back for filename/calendar-name display.
      const languages = Array.isArray(q.language) ? (q.language as string[]) : undefined
      // Wheelchair-accessible narrowing mirrors the JSON feed's
      // `accessibleOnly` boolean. The shared `booleanishFlag` Zod parser
      // accepts `true` / `1` / `yes` / `on` so URL share-links coming from
      // either the discovery page or hand-typed subscriptions resolve the
      // same way.
      const accessibleOnly = q.accessibleOnly === true
      // Family-friendly narrowing mirrors the JSON feed's `familyFriendly`
      // boolean — same `booleanishFlag` parser so the discovery page's
      // `family=1` URL param and a hand-typed `familyFriendly=true`
      // subscription resolve identically.
      const familyFriendly = q.familyFriendly === true
      // Group-friendly narrowing mirrors the JSON feed's `groupFriendly`
      // boolean — same `booleanishFlag` parser so the discovery page's
      // `groups=1` URL param and a hand-typed `groupFriendly=true`
      // subscription resolve identically.
      const groupFriendly = q.groupFriendly === true
      // Verified-only narrowing mirrors the JSON feed's `verifiedOnly`
      // boolean — same `booleanishFlag` parser so the discovery page's
      // `verified=1` URL param and a hand-typed `verifiedOnly=true`
      // subscription resolve identically.
      const verifiedOnly = q.verifiedOnly === true
      // Time-of-day narrowing mirrors the JSON feed's `timeOfDay` enum. The
      // schema's `z.enum(EVENT_TIME_OF_DAY)` restricts the value to
      // `morning` / `afternoon` / `evening` — anything else 400s before we
      // reach this handler, so a plain string cast is safe here.
      const timeOfDay =
        typeof q.timeOfDay === 'string' ? (q.timeOfDay as EventTimeOfDay) : undefined
      // Keyword search mirrors the JSON feed. The Zod schema trims and
      // caps the value at 200 characters, so anything that reaches this
      // handler is safe to forward as-is. Empty / whitespace-only strings
      // collapse to `undefined` so the service layer skips the filter.
      const keyword = typeof q.q === 'string' && q.q.trim().length > 0 ? q.q.trim() : undefined

      logger.info(
        {
          types,
          denominations,
          neighborhoods,
          languages,
          accessibleOnly,
          familyFriendly,
          groupFriendly,
          verifiedOnly,
          timeOfDay,
          q: keyword,
        },
        'Generating aggregated calendar feed',
      )

      const feed = await getAggregatedCalendarFeed({
        type: types,
        denomination: denominations,
        neighborhood: neighborhoods,
        language: languages,
        accessibleOnly: accessibleOnly || undefined,
        familyFriendly: familyFriendly || undefined,
        groupFriendly: groupFriendly || undefined,
        verifiedOnly: verifiedOnly || undefined,
        timeOfDay,
        q: keyword,
      })
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

      // Filename surfaces the chosen filters so downloads stay self-descriptive
      // (e.g. `sa-church-finder-service-community-events.ics`, or
      // `sa-church-finder-baptist-events.ics` for a denomination-only feed).
      // Denomination, neighborhood, and language slugs are lowercased and
      // non-alphanumerics collapsed to hyphens so the filename stays
      // filesystem-safe across operating systems.
      const slugifyForFilename = (value: string): string =>
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      const filenameParts: string[] = []
      if (types && types.length > 0) filenameParts.push(...types)
      if (denominations && denominations.length > 0) {
        filenameParts.push(
          ...denominations.map(slugifyForFilename).filter((value) => value.length > 0),
        )
      }
      if (neighborhoods && neighborhoods.length > 0) {
        filenameParts.push(
          ...neighborhoods.map(slugifyForFilename).filter((value) => value.length > 0),
        )
      }
      if (languages && languages.length > 0) {
        filenameParts.push(...languages.map(slugifyForFilename).filter((value) => value.length > 0))
      }
      // Wheelchair-accessible has no per-value list to slug, so it adds a
      // single static segment (`accessible`) so the saved filename surfaces
      // the narrowing alongside any type/denomination/neighborhood/language
      // chips the visitor toggled.
      if (accessibleOnly) filenameParts.push('accessible')
      // Family-friendly mirrors the wheelchair-accessible pattern: a single
      // static `family-friendly` segment when the narrowing is on, so the
      // saved filename surfaces the chip without needing a per-value list.
      if (familyFriendly) filenameParts.push('family-friendly')
      // Group-friendly mirrors the family-friendly pattern: a single static
      // `group-friendly` segment when the narrowing is on, so the saved
      // filename surfaces the chip without needing a per-value list.
      if (groupFriendly) filenameParts.push('group-friendly')
      // Verified-only mirrors the group-friendly pattern: a single static
      // `verified` segment when the narrowing is on, so the saved filename
      // surfaces the chip without needing a per-value list.
      if (verifiedOnly) filenameParts.push('verified')
      // Time-of-day surfaces the bucket label (`morning` / `afternoon` /
      // `evening`) so the saved filename still reads naturally when a
      // visitor subscribes to just the slice of the day they care about.
      if (timeOfDay) filenameParts.push(timeOfDay)
      // Keyword narrowing appends a slugified `matching-<query>` segment
      // so the saved filename surfaces the keyword alongside any other
      // chips. The slugifier collapses punctuation and diacritics so the
      // filename stays filesystem-safe across operating systems. An
      // all-punctuation keyword (e.g. `q=!!!`) collapses to nothing after
      // slugification, so we only append when the slugified form is
      // non-empty.
      if (keyword) {
        const slugged = slugifyForFilename(keyword)
        if (slugged.length > 0) {
          filenameParts.push(`matching-${slugged}`)
        }
      }
      const filenameSuffix = filenameParts.length > 0 ? `-${filenameParts.join('-')}` : ''

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
        // The Zod schema normalizes single, comma-separated, and repeated
        // `neighborhood` query params into a deduped `string[]` (or
        // `undefined`). Matches the wire format used by `denomination` and
        // `language`.
        neighborhood: Array.isArray(q.neighborhood) ? (q.neighborhood as string[]) : undefined,
        // The Zod schema normalizes single, comma-separated, and repeated
        // `denomination` query params into a deduped `string[]`.
        denomination: Array.isArray(q.denomination) ? (q.denomination as string[]) : undefined,
        accessibleOnly: q.accessibleOnly === true ? true : undefined,
        familyFriendly: q.familyFriendly === true ? true : undefined,
        groupFriendly: q.groupFriendly === true ? true : undefined,
        verifiedOnly: q.verifiedOnly === true ? true : undefined,
        // The Zod schema normalizes single, comma-separated, and repeated
        // `language` query params into a deduped `string[]` (or `undefined`).
        language: Array.isArray(q.language) ? (q.language as string[]) : undefined,
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
