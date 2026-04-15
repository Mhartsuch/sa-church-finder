export const EVENT_TYPES = ['service', 'community', 'volunteer', 'study', 'youth', 'other'] as const

export type ChurchEventType = (typeof EVENT_TYPES)[number]

export const EVENT_TIME_OF_DAY = ['morning', 'afternoon', 'evening'] as const

export type EventTimeOfDay = (typeof EVENT_TIME_OF_DAY)[number]

export interface IChurchEvent {
  id: string
  /**
   * Stable key unique per *occurrence*. Equals `id` for non-recurring events
   * and for the raw series record (see `expand=false`). For expanded
   * occurrences of a recurring series it is `${id}::${seriesStartIso}`, which
   * lets clients use it safely as a React key when a single series renders
   * as multiple list items.
   */
  occurrenceId: string
  churchId: string
  title: string
  description?: string | null
  eventType: ChurchEventType
  /**
   * The start of *this* occurrence. Non-recurring events always have
   * `startTime === seriesStartTime`.
   */
  startTime: Date
  endTime?: Date | null
  /**
   * The original DTSTART of the stored series. For non-recurring events
   * this is identical to `startTime`; for expanded occurrences it keeps the
   * pointer back to the template row clients need for edits.
   */
  seriesStartTime: Date
  locationOverride?: string | null
  isRecurring: boolean
  recurrenceRule?: string | null
  /**
   * True when this payload represents an expanded occurrence of a recurring
   * series rather than the stored template row.
   */
  isOccurrence: boolean
  createdById?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface IChurchEventFilters {
  type?: ChurchEventType
  from?: Date
  to?: Date
  /**
   * When true (the default) recurring events are expanded into concrete
   * occurrences that intersect the requested window. When false the raw
   * series row is returned unchanged — use this from admin/editor surfaces
   * where the user is managing the template rather than a single occurrence.
   */
  expand?: boolean
}

export interface IChurchEventResponse {
  data: IChurchEvent[]
  meta: {
    total: number
    filters: {
      type?: ChurchEventType
      from: Date
      to?: Date
      expand: boolean
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
  neighborhood: string | null
  coverImageUrl: string | null
}

export interface IAggregatedEvent extends IChurchEvent {
  church: IEventChurchSummary
}

export interface IEventsFeedFilters {
  /**
   * Multi-select event type filter. When more than one type is supplied the
   * feed returns the union (OR) of those event types. An empty array or
   * `undefined` means "no filter".
   */
  type?: ChurchEventType[]
  from?: Date
  to?: Date
  q?: string
  page?: number
  pageSize?: number
  /**
   * When provided, restricts the feed to events belonging to churches saved by
   * the given user. The route layer populates this from the authenticated
   * session when the caller sets `savedOnly=true`; the service layer never
   * trusts a client-supplied user id directly.
   */
  savedByUserId?: string
  /**
   * Restrict the feed to event occurrences whose start time falls inside the
   * named bucket of the day, evaluated in San Antonio local time
   * (America/Chicago):
   *   - morning   05:00–11:59
   *   - afternoon 12:00–16:59
   *   - evening   17:00–21:59
   */
  timeOfDay?: EventTimeOfDay
  /**
   * Restrict the feed to events belonging to churches in the given
   * neighborhood. Matching is case-insensitive against the church's stored
   * `neighborhood` value. Callers typically source the list of valid options
   * from `GET /api/v1/churches/filter-options`.
   */
  neighborhood?: string
  /**
   * Restrict the feed to events whose hosting church belongs to one of the
   * named denomination families (e.g. `["Baptist", "Methodist"]`). Matching
   * is case-insensitive against `church.denominationFamily`, mirroring the
   * shape used by the church search endpoint. Callers should source valid
   * options from `GET /api/v1/churches/filter-options` (`denominations[].value`).
   */
  denomination?: string[]
  /**
   * Restrict the feed to events hosted by churches flagged as wheelchair
   * accessible (`church.wheelchairAccessible = true`). Churches where the
   * field is `false` or `null` (unknown) are filtered out so visitors can
   * trust the narrowed result set. Mirrors the same-named flag on the church
   * search endpoint.
   */
  accessibleOnly?: boolean
}

export interface IEventsFeedResponse {
  data: IAggregatedEvent[]
  meta: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    filters: {
      type?: ChurchEventType[]
      from: Date
      to: Date
      q?: string
      savedOnly?: boolean
      timeOfDay?: EventTimeOfDay
      neighborhood?: string
      denomination?: string[]
      accessibleOnly?: boolean
    }
  }
}
