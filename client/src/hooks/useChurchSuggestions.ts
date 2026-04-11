import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { fetchChurches } from '@/api/churches';
import { DEFAULT_RADIUS, SA_CENTER } from '@/constants';
import { IChurchSummary, ISearchResponse } from '@/types/church';

const SUGGESTIONS_STALE_TIME = 60_000; // 1 minute — same idea as main search results
const SUGGESTIONS_PAGE_SIZE = 5;
const MIN_TERM_LENGTH = 2;
const DEBOUNCE_MS = 180;

export const CHURCH_SUGGESTIONS_QUERY_KEY = ['church-suggestions'] as const;

/**
 * Internal helper — defers a rapidly-changing value so we don't re-query
 * React Query on every keystroke. 180ms is a good balance between feeling
 * live and not firing a request per keypress.
 */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export interface UseChurchSuggestionsResult {
  suggestions: IChurchSummary[];
  isFetching: boolean;
  /** The debounced term actually used for the last query — handy for tests. */
  debouncedTerm: string;
}

/**
 * Fetches a short list of churches whose name/description/amenities match the
 * current input. Backed by the same `/churches` endpoint used by the main
 * results page, but with a tiny `pageSize` to keep payloads small.
 *
 * Intentionally uses the default San Antonio center / radius so that results
 * stay stable as the user types — the suggestions dropdown is about surfacing
 * matches, not about honoring the user's active map or "near me" context.
 */
export function useChurchSuggestions(term: string): UseChurchSuggestionsResult {
  const trimmed = term.trim();
  const debouncedTerm = useDebouncedValue(trimmed, DEBOUNCE_MS);
  const isEligible = debouncedTerm.length >= MIN_TERM_LENGTH;

  const query = useQuery<ISearchResponse, Error>({
    queryKey: [...CHURCH_SUGGESTIONS_QUERY_KEY, debouncedTerm],
    queryFn: () =>
      fetchChurches({
        lat: SA_CENTER.lat,
        lng: SA_CENTER.lng,
        radius: DEFAULT_RADIUS,
        q: debouncedTerm,
        page: 1,
        pageSize: SUGGESTIONS_PAGE_SIZE,
        sort: 'relevance',
      }),
    enabled: isEligible,
    staleTime: SUGGESTIONS_STALE_TIME,
  });

  return {
    suggestions: isEligible ? (query.data?.data ?? []) : [],
    isFetching: isEligible && query.isFetching,
    debouncedTerm,
  };
}
