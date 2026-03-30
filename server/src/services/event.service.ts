import { Event } from '@prisma/client'

import prisma from '../lib/prisma.js'
import {
  ChurchEventType,
  IChurchEvent,
  IChurchEventFilters,
  IChurchEventResponse,
} from '../types/event.types.js'

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
