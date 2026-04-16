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

/**
 * Sort options for the aggregated events feed. `soonest` (the default) is the
 * historical ordering — ascending by occurrence start time. `recent` reorders
 * by announcement date so newly added events lead the feed; start time breaks
 * ties inside a single announcement so a new recurring series' occurrences
 * still read chronologically. Values match the wire format accepted by the
 * server's `sort` query param.
 */
export const EVENT_SORT_OPTIONS = ['soonest', 'recent'] as const;

export type EventSortOption = (typeof EVENT_SORT_OPTIONS)[number];

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
  neighborhood: string | null;
  coverImageUrl: string | null;
}

export interface IAggregatedEvent extends IChurchEvent {
  church: IEventChurchSummary;
}

export interface IEventsFeedFilters {
  /**
   * Multi-select event type filter. The wire format is a single
   * comma-separated `type` query param (e.g. `type=service,community`); the
   * server normalizes single, comma-separated, and repeated query params into
   * the same shape. An empty array or `undefined` means "no filter".
   */
  type?: ChurchEventType[];
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
  /**
   * Restrict the feed to events from churches in the given San Antonio
   * neighborhood (case-insensitive match against the church's stored
   * `neighborhood` column). Source the list of valid options from the
   * `/churches/filter-options` endpoint.
   */
  neighborhood?: string;
  /**
   * Multi-select denomination family filter (e.g. `["Baptist", "Methodist"]`).
   * The wire format is a comma-separated `denomination` query param matching
   * the church search endpoint. Matching is case-insensitive against
   * `church.denominationFamily`. Source the list of valid options from the
   * `/churches/filter-options` endpoint (`denominations[].value`).
   */
  denomination?: string[];
  /**
   * Restrict the feed to events hosted by churches flagged as wheelchair
   * accessible. Churches whose accessibility flag is `false` or unknown
   * (`null`) are excluded so visitors can trust the narrowed result set.
   */
  accessibleOnly?: boolean;
  /**
   * Restrict the feed to events hosted by churches flagged as good for
   * children (`church.goodForChildren = true`). Mirrors `accessibleOnly` —
   * churches whose flag is `false` or unknown (`null`) are excluded so
   * families can trust the narrowed result set.
   */
  familyFriendly?: boolean;
  /**
   * Feed ordering. Defaults to `soonest`. `recent` surfaces newly announced
   * events first (ordered by the stored series' `createdAt` descending) while
   * still restricting to occurrences inside the requested `from`/`to` window.
   */
  sort?: EventSortOption;
}

export interface IEventsFeedResponse {
  data: IAggregatedEvent[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    filters: {
      type?: ChurchEventType[];
      from: string;
      to?: string;
      q?: string;
      savedOnly?: boolean;
      timeOfDay?: EventTimeOfDay;
      neighborhood?: string;
      denomination?: string[];
      accessibleOnly?: boolean;
      familyFriendly?: boolean;
      sort?: EventSortOption;
    };
  };
}
