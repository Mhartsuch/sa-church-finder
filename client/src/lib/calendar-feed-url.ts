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
}): string =>
  buildFeedUrl('/events.ics', {
    type: serializeListParam(params?.type),
    denomination: serializeListParam(params?.denomination),
  });
