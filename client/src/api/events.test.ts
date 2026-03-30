import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchChurchEvents } from './events';

const fetchMock = vi.fn();

describe('events api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('fetches church events with type and date filters', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          data: [
            {
              id: 'event-1',
              title: 'Neighborhood Dinner',
              eventType: 'community',
            },
          ],
          meta: {
            total: 1,
            filters: {
              type: 'community',
              from: '2026-03-30T00:00:00.000Z',
              to: '2026-04-30T00:00:00.000Z',
            },
          },
        }),
    } as Response);

    const result = await fetchChurchEvents('grace-fellowship', {
      type: 'community',
      from: '2026-03-30T00:00:00.000Z',
      to: '2026-04-30T00:00:00.000Z',
    });

    expect(result.meta.total).toBe(1);

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(
      '/api/v1/churches/grace-fellowship/events?type=community&from=2026-03-30T00%3A00%3A00.000Z&to=2026-04-30T00%3A00%3A00.000Z',
    );
    expect(options.credentials).toBe('include');
  });
});
