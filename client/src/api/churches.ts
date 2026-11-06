import { apiRequest } from '@/lib/api-client';
import { toApiQuery } from '@/lib/search-params';
import { ApiEnvelope } from '@/types/auth';
import {
  IChurch,
  IFilterOptions,
  IPageMeta,
  ISavedChurch,
  ISearchRequest,
  ISearchResponse,
} from '@/types/church';

export const fetchChurches = (request: ISearchRequest): Promise<ISearchResponse> =>
  apiRequest<ISearchResponse>(`/churches?${toApiQuery(request)}`);

export const fetchChurch = async (slug: string): Promise<IChurch> =>
  (await apiRequest<ApiEnvelope<IChurch>>(`/churches/${encodeURIComponent(slug)}`)).data;

export const fetchFilterOptions = async (): Promise<IFilterOptions> =>
  (await apiRequest<ApiEnvelope<IFilterOptions>>('/churches/filter-options')).data;

export const toggleSaved = async (
  churchId: string,
): Promise<{ churchId: string; saved: boolean }> =>
  (
    await apiRequest<ApiEnvelope<{ churchId: string; saved: boolean }>>(
      `/churches/${encodeURIComponent(churchId)}/save`,
      { method: 'POST' },
    )
  ).data;

export const fetchSavedChurches = (
  userId: string,
): Promise<{ data: ISavedChurch[]; meta: IPageMeta }> =>
  apiRequest(`/users/${encodeURIComponent(userId)}/saved?pageSize=100`);
