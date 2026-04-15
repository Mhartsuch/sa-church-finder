export const EVENT_TYPES = [
  'service',
  'community',
  'volunteer',
  'study',
  'youth',
  'other',
] as const;

export type ChurchEventType = (typeof EVENT_TYPES)[number];

export const EVENT_TIME_OF_DAY = ['morning', 'afternoon', 'evening'] as const;

export type EventTimeOfDay = (typeof EVENT_TIME_OF_DAY)[number];

export interface IChurchEvent {
  /**
   * The stored series (template) id. For non-recurring events this uniquely
   * identifies the event; for recurring events every expanded occurrence
   * shares the same `id` so admin edit/delete operations target the series.
   */
  id: string;
  /**
   * Stable key unique per occurrence. Use this as the React key when a
   * recurring series may appear multiple times in one list.
   */
  occurrenceId: string;
  churchId: string;
  title: string;
  description: string | null;
  eventType: ChurchEventType;
  /**
   * Start of this particular occurrence. For non-recurring events this is
   * equal to `seriesStartTime`.
   */
  startTime: string;
  endTime: string | null;
  /**
   * Original DTSTART of the stored series — always identical to `startTime`
   * for non-recurring events, but the anchor for the rule on expanded
   * occurrences.
   */
  seriesStartTime: string;
  locationOverride: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  /** True when this record is an expanded occurrence of a recurring series. */
  isOccurrence: boolean;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IChurchEventFilters {
  type?: ChurchEventType;
  from?: string;
  to?: string;
  /**
   * When false, the server returns the raw stored series rows rather than
   * expanding recurring events into occurrences. Defaults to true.
   */
  expand?: boolean;
}

export interface IChurchEventsResponse {
  data: IChurchEvent[];
  meta: {
    total: number;
    filters: {
      type?: ChurchEventType;
      from: string;
      to?: string;
      expand: boolean;
    };
  };
}

export interface ICreateChurchEventInput {
  churchId: string;
  title: string;
  description?: string | null;
  eventType: ChurchEventType;
  startTime: string;
  endTime?: string | null;
  locationOverride?: string | null;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
}

export interface IUpdateChurchEventInput {
  eventId: string;
  title?: string;
  description?: string | null;
  eventType?: ChurchEventType;
  startTime?: string;
  endTime?: string | null;
  locationOverride?: string | null;
  isRecurring?: boolean;
  recurrenceRule?: string | null;
}

export interface IDeleteChurchEventResult {
  id: string;
  churchId: string;
  deleted: true;
}

export interface IEventChurchSummary {
  id: string;
  slug: string;
  name: string;
  city: string;
  denomination: string | null;
  coverImageUrl: string | null;
}

export interface IAggregatedEvent extends IChurchEvent {
  church: IEventChurchSummary;
}

export interface IEventsFeedFilters {
  type?: ChurchEventType;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  /**
   * When true, the server restricts the feed to events from churches the
   * authenticated user has saved. Requires an active session — the request
   * will fail with 401 otherwise.
   */
  savedOnly?: boolean;
  /**
   * Restrict the feed to events whose start time falls inside the named
   * bucket of the day (San Antonio local time):
   *   - morning   05:00–11:59
   *   - afternoon 12:00–16:59
   *   - evening   17:00–21:59
   */
  timeOfDay?: EventTimeOfDay;
}

export interface IEventsFeedResponse {
  data: IAggregatedEvent[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    filters: {
      type?: ChurchEventType;
      from: string;
      to?: string;
      q?: string;
      savedOnly?: boolean;
      timeOfDay?: EventTimeOfDay;
    };
  };
}
