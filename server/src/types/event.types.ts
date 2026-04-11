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
