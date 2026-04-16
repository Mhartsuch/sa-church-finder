import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_RADIUS, SA_CENTER } from '@/constants';
import { IChurchSummary, ISearchResponse } from '@/types/church';

import { useChurchSuggestions } from './useChurchSuggestions';

const fetchChurchesMock = vi.fn();

vi.mock('@/api/churches', () => ({
  fetchChurches: (...args: unknown[]) => fetchChurchesMock(...args),
}));

const buildResponse = (data: Partial<IChurchSummary>[] = []): ISearchResponse => ({
  data: data as IChurchSummary[],
  meta: { page: 1, pageSize: 5, total: data.length, totalPages: 1 },
});

const wrapper = () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryClientTestWrapper';
  return Wrapper;
};

describe('useChurchSuggestions', () => {
  beforeEach(() => {
    fetchChurchesMock.mockReset();
  });

  it('returns no suggestions and does not fetch when the term is shorter than 2 chars', async () => {
    fetchChurchesMock.mockResolvedValue(buildResponse());
    const { result } = renderHook(() => useChurchSuggestions('a'), { wrapper: wrapper() });

    // Give the debounce timer (180ms) room to fire if it were going to.
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(result.current.suggestions).toEqual([]);
    expect(fetchChurchesMock).not.toHaveBeenCalled();
  });

  it('calls fetchChurches with the default center, q, and tiny page size once the term qualifies', async () => {
    fetchChurchesMock.mockResolvedValue(
      buildResponse([{ id: 'church-1', name: 'San Fernando', slug: 'san-fernando' }]),
    );

    const { result, rerender } = renderHook(
      ({ term }: { term: string }) => useChurchSuggestions(term),
      {
        wrapper: wrapper(),
        initialProps: { term: '' },
      },
    );

    // Let the empty-term mount settle and confirm no request goes out.
    await new Promise((resolve) => setTimeout(resolve, 250));
    expect(fetchChurchesMock).not.toHaveBeenCalled();

    rerender({ term: 'sa' });

    await waitFor(
      () => {
        expect(fetchChurchesMock).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 },
    );

    expect(fetchChurchesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        lat: SA_CENTER.lat,
        lng: SA_CENTER.lng,
        radius: DEFAULT_RADIUS,
        q: 'sa',
        page: 1,
        pageSize: 5,
        sort: 'relevance',
      }),
    );

    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(1);
      expect(result.current.suggestions[0]?.name).toBe('San Fernando');
    });
  });

  it('coalesces rapid keystrokes into a single API call for the final term', async () => {
    fetchChurchesMock.mockResolvedValue(buildResponse([]));

    const { rerender } = renderHook(({ term }: { term: string }) => useChurchSuggestions(term), {
      wrapper: wrapper(),
      initialProps: { term: '' },
    });

    // Rapid typing inside one debounce window — the hook should only fire
    // once, and for the most recent term ("san").
    rerender({ term: 's' });
    rerender({ term: 'sa' });
    rerender({ term: 'san' });

    await waitFor(
      () => {
        expect(fetchChurchesMock).toHaveBeenCalledTimes(1);
      },
      { timeout: 1000 },
    );

    expect(fetchChurchesMock.mock.calls[0]?.[0]).toEqual(expect.objectContaining({ q: 'san' }));
  });

  it('trims whitespace before considering the term length', async () => {
    fetchChurchesMock.mockResolvedValue(buildResponse());

    const { result } = renderHook(() => useChurchSuggestions('   '), { wrapper: wrapper() });

    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(result.current.debouncedTerm).toBe('');
    expect(fetchChurchesMock).not.toHaveBeenCalled();
  });
});
