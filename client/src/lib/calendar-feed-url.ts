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

export const buildChurchEventsFeedUrl = (slug: string, params?: { type?: string | null }): string =>
  buildFeedUrl(`/churches/${encodeURIComponent(slug)}/events.ics`, params);

export const buildAggregatedEventsFeedUrl = (params?: { type?: string | null }): string =>
  buildFeedUrl('/events.ics', params);
