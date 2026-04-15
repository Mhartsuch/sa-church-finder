import { apiRequest } from '@/lib/api-client';
import { IRibbonCategoriesResponse } from '@/types/ribbon-category';

export const fetchRibbonCategories = async (): Promise<IRibbonCategoriesResponse> => {
  return apiRequest<IRibbonCategoriesResponse>('/ribbon-categories');
};
