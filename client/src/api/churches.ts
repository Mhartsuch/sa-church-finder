import { apiRequest } from '@/lib/api-client';
import {
  IChurch,
  IFilterOptions,
  ISavedChurchesParams,
  ISavedChurchesResponse,
  ISearchParams,
  ISearchResponse,
  IUpdateChurchInput,
} from '@/types/church';

type ChurchEnvelope = {
  data: IChurch;
};

type FilterOptionsEnvelope = {
  data: IFilterOptions;
};

type SavedChurchesEnvelope = ISavedChurchesResponse;

type ToggleSavedChurchEnvelope = {
  data: {
    churchId: string;
    saved: boolean;
  };
};

const buildQueryString = (params: ISearchParams): string => {
  const qs = new URLSearchParams();

  if (params.lat !== undefined) qs.append('lat', params.lat.toString());
  if (params.lng !== undefined) qs.append('lng', params.lng.toString());
  if (params.radius !== undefined) qs.append('radius', params.radius.toString());
  if (params.q) qs.append('q', params.q);
  // Denominations are multi-select and OR-combined on the backend. Serialize
  // as a single comma-separated string on the existing `denomination` wire
  // param, matching the language convention. A one-element array produces
  // `denomination=Baptist`, so legacy single-value callers stay compatible.
  if (params.denomination && params.denomination.length > 0) {
    qs.append('denomination', params.denomination.join(','));
  }
  if (params.day !== undefined) qs.append('day', params.day.toString());
  if (params.time) qs.append('time', params.time);
  // Languages are multi-select and OR-combined on the backend. Serialize as a
  // single comma-separated string on the `language` param so the same wire
  // format works for both single and multi-select callers.
  if (params.languages && params.languages.length > 0) {
    qs.append('language', params.languages.join(','));
  }
  // Amenities are multi-select — the backend splits on comma and AND-combines
  // them, so a single `amenities=parking,nursery` request matches the UI's
  // expectation. Empty arrays and undefined both mean "no filter".
  if (params.amenities && params.amenities.length > 0) {
    qs.append('amenities', params.amenities.join(','));
  }
  // Boolean toggles — only serialize when `true`. Omitting them entirely when
  // unset keeps the query key (and shared URL) free of `...=false` noise.
  if (params.wheelchairAccessible) qs.append('wheelchairAccessible', 'true');
  if (params.goodForChildren) qs.append('goodForChildren', 'true');
  if (params.goodForGroups) qs.append('goodForGroups', 'true');
  if (params.hasPhotos) qs.append('hasPhotos', 'true');
  if (params.isClaimed) qs.append('isClaimed', 'true');
  if (params.openNow) qs.append('openNow', 'true');
  if (params.minRating !== undefined && params.minRating > 0) {
    qs.append('minRating', params.minRating.toString());
  }
  if (params.neighborhood) qs.append('neighborhood', params.neighborhood);
  if (params.serviceType) qs.append('serviceType', params.serviceType);
  if (params.sort) qs.append('sort', params.sort);
  if (params.page !== undefined) qs.append('page', params.page.toString());
  if (params.pageSize !== undefined) qs.append('pageSize', params.pageSize.toString());
  if (params.bounds) qs.append('bounds', params.bounds);

  const queryStr = qs.toString();
  return queryStr ? `?${queryStr}` : '';
};

export const fetchChurches = async (params: ISearchParams): Promise<ISearchResponse> => {
  return apiRequest<ISearchResponse>(`/churches${buildQueryString(params)}`);
};

export const fetchChurchBySlug = async (slug: string): Promise<IChurch> => {
  const envelope = await apiRequest<ChurchEnvelope>(`/churches/${encodeURIComponent(slug)}`);
  return envelope.data;
};

export const toggleSavedChurch = async (
  churchId: string,
): Promise<ToggleSavedChurchEnvelope['data']> => {
  const envelope = await apiRequest<ToggleSavedChurchEnvelope>(
    `/churches/${encodeURIComponent(churchId)}/save`,
    {
      method: 'POST',
    },
  );

  return envelope.data;
};

export const fetchFilterOptions = async (): Promise<IFilterOptions> => {
  const envelope = await apiRequest<FilterOptionsEnvelope>('/churches/filter-options');
  return envelope.data;
};

export const updateChurch = async (
  churchId: string,
  input: IUpdateChurchInput,
): Promise<IChurch> => {
  const envelope = await apiRequest<ChurchEnvelope>(`/churches/${encodeURIComponent(churchId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return envelope.data;
};

export const fetchSavedChurches = async (
  userId: string,
  params?: ISavedChurchesParams,
): Promise<ISavedChurchesResponse> => {
  const qs = new URLSearchParams();
  if (params?.sort) qs.append('sort', params.sort);
  if (params?.order) qs.append('order', params.order);
  if (params?.q) qs.append('q', params.q);
  if (params?.page !== undefined) qs.append('page', params.page.toString());
  if (params?.pageSize !== undefined) qs.append('pageSize', params.pageSize.toString());
  const queryStr = qs.toString();
  const path = `/users/${encodeURIComponent(userId)}/saved${queryStr ? `?${queryStr}` : ''}`;

  return apiRequest<SavedChurchesEnvelope>(path);
};
