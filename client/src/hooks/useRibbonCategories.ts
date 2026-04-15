import { useQuery } from '@tanstack/react-query';

import { fetchRibbonCategories } from '@/api/ribbon-categories';
import { IRibbonCategoriesResponse } from '@/types/ribbon-category';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes — matches server-side cache TTL

export const RIBBON_CATEGORIES_QUERY_KEY = ['ribbon-categories'] as const;

export const useRibbonCategories = () => {
  return useQuery<IRibbonCategoriesResponse, Error>({
    queryKey: RIBBON_CATEGORIES_QUERY_KEY,
    queryFn: fetchRibbonCategories,
    staleTime: STALE_TIME,
  });
};
