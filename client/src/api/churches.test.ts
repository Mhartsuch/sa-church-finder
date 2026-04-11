import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchChurches } from './churches';

const fetchMock = vi.fn();

const jsonResponse = (body: unknown): Response =>
  ({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => JSON.stringify(body),
  }) as Response;

describe('churches api — query string', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: [],
        meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      }),
    );
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllGlobals();
  });

  const getRequestUrl = (): string => {
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    return url;
  };

  it('serializes active accessibility & community booleans as "true"', async () => {
    await fetchChurches({
      wheelchairAccessible: true,
      goodForChildren: true,
      goodForGroups: true,
    });

    const url = getRequestUrl();
    expect(url).toContain('wheelchairAccessible=true');
    expect(url).toContain('goodForChildren=true');
    expect(url).toContain('goodForGroups=true');
  });

  it('omits accessibility booleans that are false or undefined', async () => {
    await fetchChurches({
      wheelchairAccessible: false,
      goodForChildren: undefined,
    });

    const url = getRequestUrl();
    expect(url).not.toContain('wheelchairAccessible');
    expect(url).not.toContain('goodForChildren');
    expect(url).not.toContain('goodForGroups');
  });

  it('preserves other filters alongside boolean filters', async () => {
    await fetchChurches({
      denomination: 'Catholic',
      language: 'Spanish',
      wheelchairAccessible: true,
    });

    const url = getRequestUrl();
    expect(url).toContain('denomination=Catholic');
    expect(url).toContain('language=Spanish');
    expect(url).toContain('wheelchairAccessible=true');
  });
});
