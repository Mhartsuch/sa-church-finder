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

  it('appends the denomination filter on the aggregated feed', () => {
    expect(buildAggregatedEventsFeedUrl({ denomination: 'Baptist' })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?denomination=Baptist',
    );
  });

  it('joins a multi-denomination array with commas on the aggregated feed', () => {
    // Mirrors the wire format the server schema normalizes back into a
    // deduped `string[]` so the subscribe button can reflect the exact
    // denomination chips the user toggled on the discovery page.
    expect(buildAggregatedEventsFeedUrl({ denomination: ['Baptist', 'Methodist'] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?denomination=Baptist%2CMethodist',
    );
  });

  it('trims and drops empty entries from a multi-denomination array', () => {
    expect(buildAggregatedEventsFeedUrl({ denomination: ['  Baptist  ', '', 'Methodist'] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?denomination=Baptist%2CMethodist',
    );
  });

  it('omits the denomination param when the array is empty', () => {
    expect(buildAggregatedEventsFeedUrl({ denomination: [] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics',
    );
  });

  it('combines the type and denomination filters into one query string', () => {
    expect(buildAggregatedEventsFeedUrl({ type: ['service'], denomination: ['Baptist'] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?type=service&denomination=Baptist',
    );
  });

  it('appends the neighborhood filter on the aggregated feed', () => {
    expect(buildAggregatedEventsFeedUrl({ neighborhood: 'Downtown' })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?neighborhood=Downtown',
    );
  });

  it('joins a multi-neighborhood array with commas on the aggregated feed', () => {
    // Mirrors the wire format the server schema normalizes back into a
    // deduped `string[]` so the subscribe button can reflect the exact
    // neighborhood chips the user toggled on the discovery page.
    expect(buildAggregatedEventsFeedUrl({ neighborhood: ['Downtown', 'Alamo Heights'] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?neighborhood=Downtown%2CAlamo+Heights',
    );
  });

  it('trims and drops empty entries from a multi-neighborhood array', () => {
    expect(
      buildAggregatedEventsFeedUrl({ neighborhood: ['  Downtown  ', '', 'Alamo Heights'] }),
    ).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?neighborhood=Downtown%2CAlamo+Heights',
    );
  });

  it('omits the neighborhood param when the array is empty', () => {
    expect(buildAggregatedEventsFeedUrl({ neighborhood: [] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics',
    );
  });

  it('combines type, denomination, and neighborhood filters into one query string', () => {
    expect(
      buildAggregatedEventsFeedUrl({
        type: ['service'],
        denomination: ['Baptist'],
        neighborhood: ['Downtown'],
      }),
    ).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?type=service&denomination=Baptist&neighborhood=Downtown',
    );
  });

  it('appends the language filter on the aggregated feed', () => {
    expect(buildAggregatedEventsFeedUrl({ language: 'Spanish' })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?language=Spanish',
    );
  });

  it('joins a multi-language array with commas on the aggregated feed', () => {
    // Mirrors the wire format the server schema normalizes back into a
    // deduped `string[]` so the subscribe button can reflect the exact
    // language chips the user toggled on the discovery page.
    expect(buildAggregatedEventsFeedUrl({ language: ['English', 'Spanish'] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?language=English%2CSpanish',
    );
  });

  it('trims and drops empty entries from a multi-language array', () => {
    expect(buildAggregatedEventsFeedUrl({ language: ['  English  ', '', 'Spanish'] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?language=English%2CSpanish',
    );
  });

  it('omits the language param when the array is empty', () => {
    expect(buildAggregatedEventsFeedUrl({ language: [] })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics',
    );
  });

  it('combines type, denomination, neighborhood, and language filters into one query string', () => {
    expect(
      buildAggregatedEventsFeedUrl({
        type: ['service'],
        denomination: ['Baptist'],
        neighborhood: ['Downtown'],
        language: ['Spanish'],
      }),
    ).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?type=service&denomination=Baptist&neighborhood=Downtown&language=Spanish',
    );
  });

  it('appends the wheelchair-accessible flag when accessibleOnly=true', () => {
    // The wire format mirrors the JSON feed (`accessibleOnly=true`) so the
    // calendar-feed query string and the discovery page's URL stay in sync.
    expect(buildAggregatedEventsFeedUrl({ accessibleOnly: true })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?accessibleOnly=true',
    );
  });

  it('omits the accessibleOnly param when false / null / undefined', () => {
    // The chip toggled off (or omitted entirely) must not surface a query
    // param so the server keeps the city-wide default contract.
    expect(buildAggregatedEventsFeedUrl({ accessibleOnly: false })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics',
    );
    expect(buildAggregatedEventsFeedUrl({ accessibleOnly: null })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics',
    );
    expect(buildAggregatedEventsFeedUrl({})).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics',
    );
  });

  it('combines accessibleOnly with the other narrowing axes in one query string', () => {
    expect(
      buildAggregatedEventsFeedUrl({
        type: ['service'],
        denomination: ['Baptist'],
        neighborhood: ['Downtown'],
        language: ['Spanish'],
        accessibleOnly: true,
      }),
    ).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?type=service&denomination=Baptist&neighborhood=Downtown&language=Spanish&accessibleOnly=true',
    );
  });

  it('appends the family-friendly flag when familyFriendly=true', () => {
    // Mirrors the JSON feed's wire format (`familyFriendly=true`) so the
    // calendar-feed query string stays in sync with the discovery page
    // URL param the "Good for kids" chip toggles on.
    expect(buildAggregatedEventsFeedUrl({ familyFriendly: true })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?familyFriendly=true',
    );
  });

  it('omits the familyFriendly param when false / null / undefined', () => {
    // Chip toggled off (or omitted entirely) must not surface a query
    // param so the server keeps the city-wide default contract.
    expect(buildAggregatedEventsFeedUrl({ familyFriendly: false })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics',
    );
    expect(buildAggregatedEventsFeedUrl({ familyFriendly: null })).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics',
    );
  });

  it('combines familyFriendly with the other narrowing axes in one query string', () => {
    expect(
      buildAggregatedEventsFeedUrl({
        type: ['service'],
        denomination: ['Baptist'],
        neighborhood: ['Downtown'],
        language: ['Spanish'],
        accessibleOnly: true,
        familyFriendly: true,
      }),
    ).toBe(
      'https://api.sachurchfinder.com/api/v1/events.ics?type=service&denomination=Baptist&neighborhood=Downtown&language=Spanish&accessibleOnly=true&familyFriendly=true',
    );
  });
});
