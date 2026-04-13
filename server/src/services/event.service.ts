import { Event, EventStatus, Prisma, Role } from '@prisma/client'

import prisma from '../lib/prisma.js'
import {
  IParsedRRule,
  RecurrenceRuleError,
  expandOccurrences,
  parseRRule,
  validateAndNormalizeRRule,
} from '../lib/recurrence.js'
import { AppError, NotFoundError, ValidationError } from '../middleware/error-handler.js'
import {
  ChurchEventType,
  IAggregatedEvent,
  ICreateChurchEventInput,
  IChurchEvent,
  IChurchEventFilters,
  IChurchEventResponse,
  IDeleteChurchEventResult,
  IEventsFeedFilters,
  IEventsFeedResponse,
  IUpdateChurchEventInput,
} from '../types/event.types.js'

const DEFAULT_FEED_PAGE_SIZE = 20
const MAX_FEED_PAGE_SIZE = 50

/**
 * Safety caps for in-memory recurrence expansion. A single recurring event
 * is never expanded into more than MAX_OCCURRENCES_PER_SERIES, and the
 * aggregated feed pulls at most MAX_CANDIDATE_EVENTS stored rows before
 * applying pagination.
 */
const MAX_OCCURRENCES_PER_SERIES = 366
const MAX_CANDIDATE_EVENTS = 1000

/**
 * Default expansion horizon (90 days) when a caller does not supply an
 * explicit `to`. Keeps the aggregated feed bounded without requiring every
 * call site to think about end dates.
 */
const DEFAULT_EXPANSION_WINDOW_MS = 90 * 24 * 60 * 60 * 1000

type EventWithChurch = Event & {
  church: {
    id: string
    slug: string
    name: string
    city: string
    denomination: string | null
    coverImageUrl: string | null
  }
}

const buildOccurrenceId = (id: string, startTime: Date): string =>
  `${id}::${startTime.toISOString()}`

function mapEventRow(event: Event): IChurchEvent {
  return {
    id: event.id,
    occurrenceId: event.id,
    churchId: event.churchId,
    title: event.title,
    description: event.description,
    eventType: event.eventType as ChurchEventType,
    startTime: event.startTime,
    endTime: event.endTime,
    seriesStartTime: event.startTime,
    locationOverride: event.locationOverride,
    isRecurring: event.isRecurring,
    recurrenceRule: event.recurrenceRule,
    isOccurrence: false,
    source: event.source,
    status: event.status,
    sourceUrl: event.sourceUrl,
    createdById: event.createdById,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }
}

function mapEventRowWithChurch(event: EventWithChurch): IAggregatedEvent {
  return {
    ...mapEventRow(event),
    church: {
      id: event.church.id,
      slug: event.church.slug,
      name: event.church.name,
      city: event.church.city,
      denomination: event.church.denomination,
      coverImageUrl: event.church.coverImageUrl,
    },
  }
}

/**
 * Build an expanded occurrence payload by overlaying the occurrence-specific
 * start/end times onto a base mapped event. For non-recurring events this
 * just returns the base mapping unchanged.
 */
function buildOccurrence<T extends IChurchEvent>(
  base: T,
  occurrenceStart: Date,
  durationMs: number | null,
): T {
  return {
    ...base,
    occurrenceId: buildOccurrenceId(base.id, occurrenceStart),
    startTime: occurrenceStart,
    endTime: durationMs === null ? null : new Date(occurrenceStart.getTime() + durationMs),
    isOccurrence: true,
  }
}

const getDurationMs = (startTime: Date, endTime: Date | null | undefined): number | null => {
  if (!endTime) {
    return null
  }
  const diff = endTime.getTime() - startTime.getTime()
  return diff > 0 ? diff : null
}

/**
 * Expand a mapped event into one or more event payloads that intersect the
 * requested window. Non-recurring events are returned if they fall inside
 * the window; recurring events produce one entry per occurrence. When a
 * recurring event has an invalid stored RRULE the raw row is returned
 * unchanged so the series still surfaces rather than disappearing silently.
 */
function expandEventIntoWindow<T extends IChurchEvent>(
  event: T,
  windowStart: Date,
  windowEnd: Date,
): T[] {
  if (!event.isRecurring || !event.recurrenceRule) {
    const startMs = event.startTime.getTime()
    if (startMs > windowEnd.getTime()) return []
    if (startMs < windowStart.getTime()) return []
    return [event]
  }

  let parsed: IParsedRRule
  try {
    parsed = parseRRule(event.recurrenceRule)
  } catch (error) {
    if (error instanceof RecurrenceRuleError) {
      // Stored rule is malformed (shouldn't happen post-validation) — fall
      // back to the template row so the event remains visible for admins
      // who need to repair it.
      const startMs = event.startTime.getTime()
      if (startMs >= windowStart.getTime() && startMs <= windowEnd.getTime()) {
        return [event]
      }
      return []
    }
    throw error
  }

  const durationMs = getDurationMs(event.startTime, event.endTime ?? null)

  const occurrences = expandOccurrences({
    dtstart: event.seriesStartTime,
    rule: parsed,
    windowStart,
    windowEnd,
    maxOccurrences: MAX_OCCURRENCES_PER_SERIES,
  })

  return occurrences.map((occurrenceStart) => buildOccurrence(event, occurrenceStart, durationMs))
}

function assertValidRecurrenceInput(
  isRecurring: boolean | undefined,
  recurrenceRule: string | null | undefined,
): string | null {
  const trimmed = recurrenceRule?.trim() || null

  if (isRecurring && !trimmed) {
    throw new ValidationError('A recurrenceRule is required when isRecurring is true')
  }

  if (!isRecurring && trimmed) {
    throw new ValidationError('recurrenceRule must be empty when isRecurring is false or omitted')
  }

  if (!trimmed) {
    return null
  }

  try {
    return validateAndNormalizeRRule(trimmed)
  } catch (error) {
    if (error instanceof RecurrenceRuleError) {
      throw new ValidationError(`Invalid recurrence rule: ${error.message}`)
    }
    throw error
  }
}

export async function listChurchEventsBySlug(
  slug: string,
  filters: IChurchEventFilters,
): Promise<IChurchEventResponse | null> {
  const church = await prisma.church.findUnique({
    where: { slug },
    select: { id: true },
  })

  if (!church) {
    return null
  }

  const from = filters.from ?? new Date()
  const to = filters.to ?? new Date(from.getTime() + DEFAULT_EXPANSION_WINDOW_MS)
  const expand = filters.expand !== false

  const statusFilter: EventStatus = filters.status ?? EventStatus.PUBLISHED

  const where: Prisma.EventWhereInput = expand
    ? {
        churchId: church.id,
        status: statusFilter,
        ...(filters.type ? { eventType: filters.type } : {}),
        // Candidates: non-recurring events inside the window, plus every
        // recurring event that could conceivably reach the window (start on
        // or before `to` — until/count bounds are enforced during expansion).
        OR: [
          {
            isRecurring: false,
            startTime: { gte: from, lte: to },
          },
          {
            isRecurring: true,
            startTime: { lte: to },
          },
        ],
      }
    : {
        churchId: church.id,
        status: statusFilter,
        ...(filters.type ? { eventType: filters.type } : {}),
        startTime: { gte: from, lte: to },
      }

  const rows = await prisma.event.findMany({
    where,
    orderBy: [{ startTime: 'asc' }, { title: 'asc' }],
    take: MAX_CANDIDATE_EVENTS,
  })

  const mapped = rows.map(mapEventRow)

  const expanded = expand
    ? mapped.flatMap((event) => expandEventIntoWindow(event, from, to))
    : mapped

  expanded.sort((a, b) => {
    const diff = a.startTime.getTime() - b.startTime.getTime()
    return diff !== 0 ? diff : a.title.localeCompare(b.title)
  })

  return {
    data: expanded,
    meta: {
      total: expanded.length,
      filters: {
        type: filters.type,
        from,
        to: filters.to,
        expand,
      },
    },
  }
}

export async function listEventsFeed(filters: IEventsFeedFilters): Promise<IEventsFeedResponse> {
  const from = filters.from ?? new Date()
  const to = filters.to ?? new Date(from.getTime() + DEFAULT_EXPANSION_WINDOW_MS)

  const requestedPageSize = filters.pageSize ?? DEFAULT_FEED_PAGE_SIZE
  const pageSize = Math.min(Math.max(requestedPageSize, 1), MAX_FEED_PAGE_SIZE)
  const page = filters.page && filters.page > 0 ? filters.page : 1

  const trimmedQuery = filters.q?.trim()
  const hasQuery = Boolean(trimmedQuery)

  const feedStatusFilter: EventStatus = filters.status ?? EventStatus.PUBLISHED

  const baseQueryFilters: Prisma.EventWhereInput = {
    status: feedStatusFilter,
    ...(filters.type ? { eventType: filters.type } : {}),
    ...(hasQuery
      ? {
          OR: [
            { title: { contains: trimmedQuery!, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: trimmedQuery!, mode: Prisma.QueryMode.insensitive } },
            { church: { name: { contains: trimmedQuery!, mode: Prisma.QueryMode.insensitive } } },
          ],
        }
      : {}),
  }

  // Fetch both non-recurring candidates in-window and every recurring series
  // that might produce an occurrence in-window. Bounded by MAX_CANDIDATE_EVENTS.
  const where: Prisma.EventWhereInput = {
    AND: [
      baseQueryFilters,
      {
        OR: [
          {
            isRecurring: false,
            startTime: { gte: from, lte: to },
          },
          {
            isRecurring: true,
            startTime: { lte: to },
          },
        ],
      },
    ],
  }

  const rows = await prisma.event.findMany({
    where,
    include: {
      church: {
        select: {
          id: true,
          slug: true,
          name: true,
          city: true,
          denomination: true,
          coverImageUrl: true,
        },
      },
    },
    orderBy: [{ startTime: 'asc' }, { title: 'asc' }],
    take: MAX_CANDIDATE_EVENTS,
  })

  const mapped = rows.map(mapEventRowWithChurch)

  const expanded = mapped.flatMap((event) => expandEventIntoWindow(event, from, to))

  expanded.sort((a, b) => {
    const diff = a.startTime.getTime() - b.startTime.getTime()
    return diff !== 0 ? diff : a.title.localeCompare(b.title)
  })

  const total = expanded.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)
  const skip = (page - 1) * pageSize
  const paged = expanded.slice(skip, skip + pageSize)

  return {
    data: paged,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
      filters: {
        type: filters.type,
        from,
        to,
        q: hasQuery ? trimmedQuery : undefined,
      },
    },
  }
}

const ensureValidEventTimes = (startTime: Date, endTime: Date | null | undefined): void => {
  if (Number.isNaN(startTime.getTime())) {
    throw new AppError(400, 'INVALID_EVENT_TIMES', 'Start time is not a valid date')
  }

  if (endTime) {
    if (Number.isNaN(endTime.getTime())) {
      throw new AppError(400, 'INVALID_EVENT_TIMES', 'End time is not a valid date')
    }

    if (endTime.getTime() <= startTime.getTime()) {
      throw new AppError(400, 'INVALID_EVENT_TIMES', 'Event end time must be after the start time')
    }
  }
}

/**
 * Ensure the given user is authorized to manage events for the church.
 *
 * SITE_ADMIN users can manage events for any church.
 * CHURCH_ADMIN users can only manage events for churches they have claimed
 * (ie. the church's `claimedById` matches their user id).
 */
const authorizeChurchEventManager = async (userId: string, churchId: string): Promise<void> => {
  const [user, church] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    }),
    prisma.church.findUnique({
      where: { id: churchId },
      select: { id: true, claimedById: true, isClaimed: true },
    }),
  ])

  if (!user) {
    throw new AppError(401, 'AUTH_ERROR', 'Not authenticated')
  }

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  if (user.role === Role.SITE_ADMIN) {
    return
  }

  if (user.role === Role.CHURCH_ADMIN && church.isClaimed && church.claimedById === user.id) {
    return
  }

  throw new AppError(
    403,
    'FORBIDDEN',
    'You do not have permission to manage events for this church',
  )
}

export async function createChurchEvent(
  userId: string,
  churchId: string,
  input: ICreateChurchEventInput,
): Promise<IChurchEvent> {
  await authorizeChurchEventManager(userId, churchId)

  ensureValidEventTimes(input.startTime, input.endTime ?? null)

  const normalizedRecurrenceRule = assertValidRecurrenceInput(
    input.isRecurring,
    input.recurrenceRule,
  )

  const event = await prisma.event.create({
    data: {
      churchId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      eventType: input.eventType,
      startTime: input.startTime,
      endTime: input.endTime ?? null,
      locationOverride: input.locationOverride?.trim() || null,
      isRecurring: Boolean(input.isRecurring),
      recurrenceRule: normalizedRecurrenceRule,
      createdById: userId,
    },
  })

  return mapEventRow(event)
}

export async function updateChurchEvent(
  userId: string,
  eventId: string,
  input: IUpdateChurchEventInput,
): Promise<IChurchEvent> {
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      churchId: true,
      startTime: true,
      endTime: true,
      isRecurring: true,
      recurrenceRule: true,
    },
  })

  if (!existingEvent) {
    throw new NotFoundError('Event not found')
  }

  await authorizeChurchEventManager(userId, existingEvent.churchId)

  const nextStartTime = input.startTime ?? existingEvent.startTime
  const nextEndTime = input.endTime === undefined ? existingEvent.endTime : input.endTime

  ensureValidEventTimes(nextStartTime, nextEndTime)

  const nextIsRecurring =
    input.isRecurring === undefined ? existingEvent.isRecurring : input.isRecurring
  const nextRecurrenceRuleRaw =
    input.recurrenceRule === undefined ? existingEvent.recurrenceRule : input.recurrenceRule

  const normalizedRecurrenceRule = assertValidRecurrenceInput(
    nextIsRecurring,
    nextRecurrenceRuleRaw,
  )

  const data: Prisma.EventUpdateInput = {
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.description !== undefined ? { description: input.description?.trim() || null } : {}),
    ...(input.eventType !== undefined ? { eventType: input.eventType } : {}),
    ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
    ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
    ...(input.locationOverride !== undefined
      ? { locationOverride: input.locationOverride?.trim() || null }
      : {}),
  }

  if (input.isRecurring !== undefined || input.recurrenceRule !== undefined) {
    data.isRecurring = nextIsRecurring
    data.recurrenceRule = normalizedRecurrenceRule
  }

  const event = await prisma.event.update({
    where: { id: eventId },
    data,
  })

  return mapEventRow(event)
}

export async function deleteChurchEvent(
  userId: string,
  eventId: string,
): Promise<IDeleteChurchEventResult> {
  const existingEvent = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      churchId: true,
    },
  })

  if (!existingEvent) {
    throw new NotFoundError('Event not found')
  }

  await authorizeChurchEventManager(userId, existingEvent.churchId)

  await prisma.event.delete({
    where: { id: eventId },
  })

  return {
    id: existingEvent.id,
    churchId: existingEvent.churchId,
    deleted: true,
  }
}
