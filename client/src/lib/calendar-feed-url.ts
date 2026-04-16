import { resolveApiBaseUrl } from '@/lib/api-url';

const buildFeedUrl = (path: string, params?: Record<string, string | null | undefined>): string => {
  const base = resolveApiBaseUrl();
  const origin =
    base ||
    (typeof window !== 'undefined' && window.location?.origin ? window.location.origin : '');
  const url = `${origin}/api/v1${path}`;
  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.set(key, value);
      }
    }
  }
  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

/**
 * Normalize a list-valued query argument (single value, array, `null`, or
 * `undefined`) into the comma-separated wire format the calendar-feed
 * endpoints accept. Empty / whitespace-only entries are dropped so the
 * resulting string never carries stray commas (e.g. `type=,service`). Returns
 * `undefined` when the normalized list is empty so the caller can omit the
 * query param entirely.
 *
 * The same serializer handles every multi-select param (`type`,
 * `denomination`, etc.) — the wire format is identical, and keeping them in
 * one helper guarantees the query strings stay predictable across the
 * different calendar surfaces.
 */
const serializeListParam = (value: string | string[] | null | undefined): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const list = Array.isArray(value) ? value : [value];
  const cleaned = list
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);
  if (cleaned.length === 0) return undefined;
  return cleaned.join(',');
};

export const buildChurchEventsFeedUrl = (slug: string, params?: { type?: string | null }): string =>
  buildFeedUrl(`/churches/${encodeURIComponent(slug)}/events.ics`, params);

export const buildAggregatedEventsFeedUrl = (params?: {
  type?: string | string[] | null;
  /**
   * Multi-select denomination family filter. Mirrors the discovery page's
   * `denomination` chips so the subscribe button serializes exactly the
   * families a visitor has toggled on. Accepts a single value, an array, or
   * `null`/`undefined` ("no filter").
   */
  denomination?: string | string[] | null;
  /**
   * Multi-select neighborhood filter. Mirrors the discovery page's
   * `neighborhood` chips so the subscribe button serializes exactly the
   * neighborhoods a visitor has toggled on. Accepts a single value, an array,
   * or `null`/`undefined` ("no filter").
   */
  neighborhood?: string | string[] | null;
  /**
   * Multi-select service-language filter. Mirrors the discovery page's
   * `language` chips so the subscribe button serializes exactly the
   * languages a visitor has toggled on. Accepts a single value, an array,
   * or `null`/`undefined` ("no filter").
   */
  language?: string | string[] | null;
  /**
   * Wheelchair-accessible toggle. Mirrors the discovery page's accessibility
   * chip — when `true` the calendar feed is restricted to events at churches
   * flagged as wheelchair accessible. `false` / `null` / `undefined` omits
   * the param so the server skips the filter. The serialized wire format is
   * `accessibleOnly=true` to match the JSON feed (`?accessibleOnly=true`).
   */
  accessibleOnly?: boolean | null;
  /**
   * Family-friendly toggle. Mirrors the discovery page's "Good for kids"
   * chip — when `true` the calendar feed is restricted to events at churches
   * flagged as good for children. `false` / `null` / `undefined` omits the
   * param so the server skips the filter. The serialized wire format is
   * `familyFriendly=true` to match the JSON feed (`?familyFriendly=true`).
   */
  familyFriendly?: boolean | null;
  /**
   * Group-friendly toggle. Mirrors the discovery page's "Good for groups"
   * chip — when `true` the calendar feed is restricted to events at churches
   * flagged as good for groups. `false` / `null` / `undefined` omits the
   * param so the server skips the filter. The serialized wire format is
   * `groupFriendly=true` to match the JSON feed (`?groupFriendly=true`).
   */
  groupFriendly?: boolean | null;
  /**
   * Time-of-day bucket. Mirrors the discovery page's "Morning" / "Afternoon"
   * / "Evening" chip — the calendar feed is restricted to events whose local
   * start time falls inside the named bucket. `null` / `undefined` / empty
   * string omits the param so the server returns the unfiltered feed. The
   * wire format is `timeOfDay=morning|afternoon|evening` to match the JSON
   * feed.
   */
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | null;
  /**
   * Keyword search. Mirrors the discovery page's `q` URL param — the
   * calendar feed is restricted to events whose title, description, or
   * host church name contains the keyword (case-insensitive). Trimmed to
   * match the server's contract; an empty / whitespace-only value omits
   * the param so the server returns the unfiltered feed. The wire format
   * is `q=<keyword>` to match the JSON feed.
   */
  q?: string | null;
}): string => {
  const trimmedQ = typeof params?.q === 'string' ? params.q.trim() : '';
  return buildFeedUrl('/events.ics', {
    type: serializeListParam(params?.type),
    denomination: serializeListParam(params?.denomination),
    neighborhood: serializeListParam(params?.neighborhood),
    language: serializeListParam(params?.language),
    accessibleOnly: params?.accessibleOnly === true ? 'true' : undefined,
    familyFriendly: params?.familyFriendly === true ? 'true' : undefined,
    groupFriendly: params?.groupFriendly === true ? 'true' : undefined,
    timeOfDay: params?.timeOfDay ?? undefined,
    q: trimmedQ.length > 0 ? trimmedQ : undefined,
  });
};
