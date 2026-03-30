import { apiRequest } from '@/lib/api-client';
import { IChurchEventFilters, IChurchEventsResponse } from '@/types/event';

const buildQueryString = (params: IChurchEventFilters): string => {
  const qs = new URLSearchParams();

  if (params.type) qs.append('type', params.type);
  if (params.from) qs.append('from', params.from);
  if (params.to) qs.append('to', params.to);

  const queryStr = qs.toString();
  return queryStr ? `?${queryStr}` : '';
};

export const fetchChurchEvents = async (
  slug: string,
  params: IChurchEventFilters,
): Promise<IChurchEventsResponse> => {
  return apiRequest<IChurchEventsResponse>(
    `/churches/${encodeURIComponent(slug)}/events${buildQueryString(params)}`,
  );
};
