import { Event, Prisma, Role } from '@prisma/client'

import prisma from '../lib/prisma.js'
import { AppError, NotFoundError } from '../middleware/error-handler.js'
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

function mapEventWithChurch(event: EventWithChurch): IAggregatedEvent {
  return {
    ...mapEvent(event),
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

function mapEvent(event: Event): IChurchEvent {
  return {
    id: event.id,
    churchId: event.churchId,
    title: event.title,
    description: event.description,
    eventType: event.eventType as ChurchEventType,
    startTime: event.startTime,
    endTime: event.endTime,
    locationOverride: event.locationOverride,
    isRecurring: event.isRecurring,
    recurrenceRule: event.recurrenceRule,
    createdById: event.createdById,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
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

  const events = await prisma.event.findMany({
    where: {
      churchId: church.id,
      ...(filters.type ? { eventType: filters.type } : {}),
      startTime: {
        gte: from,
        ...(filters.to ? { lte: filters.to } : {}),
      },
    },
    orderBy: [{ startTime: 'asc' }, { title: 'asc' }],
  })

  return {
    data: events.map(mapEvent),
    meta: {
      total: events.length,
      filters: {
        type: filters.type,
        from,
        to: filters.to,
      },
    },
  }
}

export async function listEventsFeed(filters: IEventsFeedFilters): Promise<IEventsFeedResponse> {
  const from = filters.from ?? new Date()
  const requestedPageSize = filters.pageSize ?? DEFAULT_FEED_PAGE_SIZE
  const pageSize = Math.min(Math.max(requestedPageSize, 1), MAX_FEED_PAGE_SIZE)
  const page = filters.page && filters.page > 0 ? filters.page : 1
  const skip = (page - 1) * pageSize

  const trimmedQuery = filters.q?.trim()
  const hasQuery = Boolean(trimmedQuery)

  const where: Prisma.EventWhereInput = {
    ...(filters.type ? { eventType: filters.type } : {}),
    startTime: {
      gte: from,
      ...(filters.to ? { lte: filters.to } : {}),
    },
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

  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
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
      skip,
      take: pageSize,
    }),
  ])

  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)

  return {
    data: events.map(mapEventWithChurch),
    meta: {
      total,
      page,
      pageSize,
      totalPages,
      filters: {
        type: filters.type,
        from,
        to: filters.to,
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

  const event = await prisma.event.create({
    data: {
      churchId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      eventType: input.eventType,
      startTime: input.startTime,
      endTime: input.endTime ?? null,
      locationOverride: input.locationOverride?.trim() || null,
      isRecurring: input.isRecurring ?? false,
      recurrenceRule: input.recurrenceRule?.trim() || null,
      createdById: userId,
    },
  })

  return mapEvent(event)
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
    },
  })

  if (!existingEvent) {
    throw new NotFoundError('Event not found')
  }

  await authorizeChurchEventManager(userId, existingEvent.churchId)

  const nextStartTime = input.startTime ?? existingEvent.startTime
  const nextEndTime = input.endTime === undefined ? existingEvent.endTime : input.endTime

  ensureValidEventTimes(nextStartTime, nextEndTime)

  const event = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined
        ? { description: input.description?.trim() || null }
        : {}),
      ...(input.eventType !== undefined ? { eventType: input.eventType } : {}),
      ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
      ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
      ...(input.locationOverride !== undefined
        ? { locationOverride: input.locationOverride?.trim() || null }
        : {}),
      ...(input.isRecurring !== undefined ? { isRecurring: input.isRecurring } : {}),
      ...(input.recurrenceRule !== undefined
        ? { recurrenceRule: input.recurrenceRule?.trim() || null }
        : {}),
    },
  })

  return mapEvent(event)
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
