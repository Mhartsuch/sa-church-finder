import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createChurchEvent,
  deleteChurchEvent,
  fetchChurchEvents,
  updateChurchEvent,
} from './events';

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

  it('creates a church event with the correct payload', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 201,
      statusText: 'Created',
      text: async () =>
        JSON.stringify({
          data: {
            id: 'event-1',
            churchId: 'church-1',
            title: 'Easter Worship',
            eventType: 'service',
          },
          message: 'Event created successfully',
        }),
    } as Response);

    const result = await createChurchEvent({
      churchId: 'church-1',
      title: 'Easter Worship',
      eventType: 'service',
      startTime: '2026-04-05T14:00:00.000Z',
      endTime: '2026-04-05T16:00:00.000Z',
      description: 'A special gathering',
    });

    expect(result.id).toBe('event-1');

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/churches/church-1/events');
    expect(options.method).toBe('POST');
    expect(options.credentials).toBe('include');

    const body = JSON.parse(options.body as string) as Record<string, unknown>;
    expect(body).toMatchObject({
      title: 'Easter Worship',
      eventType: 'service',
      description: 'A special gathering',
    });
    expect(body).not.toHaveProperty('churchId');
  });

  it('updates a church event via PATCH', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          data: {
            id: 'event-9',
            title: 'Updated title',
            eventType: 'community',
          },
        }),
    } as Response);

    const result = await updateChurchEvent({
      eventId: 'event-9',
      title: 'Updated title',
    });

    expect(result.id).toBe('event-9');

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/events/event-9');
    expect(options.method).toBe('PATCH');

    const body = JSON.parse(options.body as string) as Record<string, unknown>;
    expect(body).toEqual({ title: 'Updated title' });
  });

  it('deletes a church event via DELETE', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          data: {
            id: 'event-3',
            churchId: 'church-1',
            deleted: true,
          },
        }),
    } as Response);

    const result = await deleteChurchEvent('event-3');

    expect(result.deleted).toBe(true);

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('/api/v1/events/event-3');
    expect(options.method).toBe('DELETE');
  });
});
