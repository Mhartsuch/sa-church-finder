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
 * Normalize a `type` argument (single value, array, `null`, or `undefined`)
 * into the comma-separated wire format both calendar-feed endpoints accept.
 * Empty / whitespace-only entries are dropped so the resulting string never
 * carries stray commas (e.g. `type=,service`). Returns `undefined` when the
 * normalized list is empty so the caller can omit the query param entirely.
 */
const serializeTypeParam = (
  value: string | string[] | null | undefined,
): string | undefined => {
  if (value === undefined || value === null) return undefined;
  const list = Array.isArray(value) ? value : [value];
  const cleaned = list
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);
  if (cleaned.length === 0) return undefined;
  return cleaned.join(',');
};

export const buildChurchEventsFeedUrl = (
  slug: string,
  params?: { type?: string | null },
): string => buildFeedUrl(`/churches/${encodeURIComponent(slug)}/events.ics`, params);

export const buildAggregatedEventsFeedUrl = (params?: {
  type?: string | string[] | null;
}): string => buildFeedUrl('/events.ics', { type: serializeTypeParam(params?.type) });
