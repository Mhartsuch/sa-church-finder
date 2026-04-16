import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildAggregatedEventsFeedUrl, buildChurchEventsFeedUrl } from './calendar-feed-url';

const apiUrlMocks = vi.hoisted(() => ({ value: '' }));

vi.mock('@/lib/api-url', () => ({
  resolveApiBaseUrl: (): string => apiUrlMocks.value,
}));

describe('calendar-feed-url helpers', () => {
  beforeEach(() => {
    apiUrlMocks.value = 'https://api.sachurchfinder.com';
  });

  afterEach(() => {
    apiUrlMocks.value = '';
  });

  it('builds the per-church ICS feed URL from the configured API base', () => {
    expect(buildChurchEventsFeedUrl('grace-fellowship')).toBe(
      'https://api.sachurchfinder.com/api/v1/churches/grace-fellowship/events.ics',
    );
  });

  it('URL-encodes slugs with special characters', () => {
    expect(buildChurchEventsFeedUrl('grace church')).toBe(
      'https://api.sachurchfinder.com/api/v1/churches/grace%20church/events.ics',
    );
  });

  it('appends the type filter when provided', () => {
    expect(buildChurchEventsFeedUrl('grace-fellowship', { type: 'service' })).toBe(
      'https://api.sachurchfinder.com/api/v1/churches/grace-fellowship/events.ics?type=service',
    );
  });

  it('builds the aggregated feed URL without a filter', () => {
    expect(buildAggregatedEventsFeedUrl()).toBe('https://api.sachurchfinder.com/api/v1/events.ics');
  });

  it('appends type filter to aggregated feed when provided', () => {
    expect(buildAggregatedEventsFeedUrl({ type: 'community' })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?type=community',
    );
  });

  it('omits empty/null filter values', () => {
    expect(buildAggregatedEventsFeedUrl({ type: null })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics',
    );
  });

  it('joins a multi-type array with commas on the aggregated feed', () => {
    // Mirrors the wire format the server schema normalizes back into a
    // deduped `ChurchEventType[]` so the subscribe button can reflect the
    // exact chips the user toggled on the discovery page.
    expect(buildAggregatedEventsFeedUrl({ type: ['service', 'community'] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?type=service%2Ccommunity',
    );
  });

  it('trims and drops empty entries from a multi-type array', () => {
    expect(buildAggregatedEventsFeedUrl({ type: ['  service  ', '', 'community'] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?type=service%2Ccommunity',
    );
  });

  it('omits the type param when the array is empty', () => {
    expect(buildAggregatedEventsFeedUrl({ type: [] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics',
    );
  });
});
