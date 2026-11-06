import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { filtersToParams, parseFilters } from '@/lib/search-params';
import { IChurchFilters } from '@/types/church';

/** Browse filters backed by the URL so every view is shareable. */
export const useFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);

  const setFilters = useCallback(
    (next: IChurchFilters) => {
      const params = filtersToParams(next);
      const view = searchParams.get('view');
      if (view) params.set('view', view);
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  return { filters, setFilters };
};
