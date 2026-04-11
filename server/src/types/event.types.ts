export const EVENT_TYPES = ['service', 'community', 'volunteer', 'study', 'youth', 'other'] as const

export type ChurchEventType = (typeof EVENT_TYPES)[number]

export interface IChurchEvent {
  id: string
  churchId: string
  title: string
  description?: string | null
  eventType: ChurchEventType
  startTime: Date
  endTime?: Date | null
  locationOverride?: string | null
  isRecurring: boolean
  recurrenceRule?: string | null
  createdById?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IChurchEventFilters {
  type?: ChurchEventType
  from?: Date
  to?: Date
}

export interface IChurchEventResponse {
  data: IChurchEvent[]
  meta: {
    total: number
    filters: {
      type?: ChurchEventType
      from: Date
      to?: Date
    }
  }
}

export interface ICreateChurchEventInput {
  title: string
  description?: string | null
  eventType: ChurchEventType
  startTime: Date
  endTime?: Date | null
  locationOverride?: string | null
  isRecurring?: boolean
  recurrenceRule?: string | null
}

export interface IUpdateChurchEventInput {
  title?: string
  description?: string | null
  eventType?: ChurchEventType
  startTime?: Date
  endTime?: Date | null
  locationOverride?: string | null
  isRecurring?: boolean
  recurrenceRule?: string | null
}

export interface IDeleteChurchEventResult {
  id: string
  churchId: string
  deleted: true
}

export interface IEventChurchSummary {
  id: string
  slug: string
  name: string
  city: string
  denomination: string | null
  coverImageUrl: string | null
}

export interface IAggregatedEvent extends IChurchEvent {
  church: IEventChurchSummary
}

export interface IEventsFeedFilters {
  type?: ChurchEventType
  from?: Date
  to?: Date
  q?: string
  page?: number
  pageSize?: number
}

export interface IEventsFeedResponse {
  data: IAggregatedEvent[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    filters: {
      type?: ChurchEventType
      from: Date
      to?: Date
      q?: string
    }
  }
}
