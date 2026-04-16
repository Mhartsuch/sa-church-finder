import { apiRequest } from '@/lib/api-client';
import {
  IChurchEvent,
  IChurchEventFilters,
  IChurchEventsResponse,
  ICreateChurchEventInput,
  IDeleteChurchEventResult,
  IEventsFeedFilters,
  IEventsFeedResponse,
  IUpdateChurchEventInput,
} from '@/types/event';

type EventEnvelope = {
  data: IChurchEvent;
};

type DeleteEventEnvelope = {
  data: IDeleteChurchEventResult;
};

const buildQueryString = (params: IChurchEventFilters): string => {
  const qs = new URLSearchParams();

  if (params.type) qs.append('type', params.type);
  if (params.from) qs.append('from', params.from);
  if (params.to) qs.append('to', params.to);
  if (params.expand === false) qs.append('expand', 'false');

  const queryStr = qs.toString();
  return queryStr ? `?${queryStr}` : '';
};

const buildFeedQueryString = (params: IEventsFeedFilters): string => {
  const qs = new URLSearchParams();

  // Event types are multi-select and OR-combined on the backend. Serialize as
  // a single comma-separated `type` query param so the same wire format works
  // for one or many values; an empty array means "no filter".
  if (params.type && params.type.length > 0) {
    qs.append('type', params.type.join(','));
  }
  if (params.from) qs.append('from', params.from);
  if (params.to) qs.append('to', params.to);
  if (params.q && params.q.trim()) qs.append('q', params.q.trim());
  if (params.page && params.page > 1) qs.append('page', String(params.page));
  if (params.pageSize) qs.append('pageSize', String(params.pageSize));
  if (params.savedOnly) qs.append('savedOnly', 'true');
  if (params.timeOfDay) qs.append('timeOfDay', params.timeOfDay);
  // Neighborhoods are multi-select and OR-combined on the backend. Match the
  // shared wire format (`?neighborhood=Downtown,Alamo%20Heights`) used by the
  // other multi-select chip filters (`denomination`, `language`) so cached
  // state can round-trip cleanly.
  if (params.neighborhood && params.neighborhood.length > 0) {
    const cleaned = Array.from(
      new Set(params.neighborhood.map((value) => value.trim()).filter((value) => value.length > 0)),
    );
    if (cleaned.length > 0) {
      qs.append('neighborhood', cleaned.join(','));
    }
  }
  // Denomination families are multi-select and OR-combined on the backend.
  // Match the shared wire format (`?denomination=Baptist,Methodist`) used by
  // the church search endpoint so cached state can round-trip cleanly.
  if (params.denomination && params.denomination.length > 0) {
    const cleaned = Array.from(
      new Set(params.denomination.map((value) => value.trim()).filter((value) => value.length > 0)),
    );
    if (cleaned.length > 0) {
      qs.append('denomination', cleaned.join(','));
    }
  }
  if (params.accessibleOnly) {
    qs.append('accessibleOnly', 'true');
  }
  if (params.familyFriendly) {
    qs.append('familyFriendly', 'true');
  }
  if (params.groupFriendly) {
    qs.append('groupFriendly', 'true');
  }
  // Service languages are multi-select and OR-combined on the backend. Match
  // the shared wire format (`?language=English,Spanish`) used by the church
  // search endpoint so cached state can round-trip cleanly.
  if (params.language && params.language.length > 0) {
    const cleaned = Array.from(
      new Set(params.language.map((value) => value.trim()).filter((value) => value.length > 0)),
    );
    if (cleaned.length > 0) {
      qs.append('language', cleaned.join(','));
    }
  }
  // Only send `sort` when the caller explicitly narrowed it — omitting the
  // param keeps the URL clean for the default (`soonest`) ordering and lets
  // the server's default travel with the request.
  if (params.sort && params.sort !== 'soonest') {
    qs.append('sort', params.sort);
  }

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

export const fetchEventsFeed = async (params: IEventsFeedFilters): Promise<IEventsFeedResponse> => {
  return apiRequest<IEventsFeedResponse>(`/events${buildFeedQueryString(params)}`);
};

export const createChurchEvent = async (input: ICreateChurchEventInput): Promise<IChurchEvent> => {
  const { churchId, ...payload } = input;
  const envelope = await apiRequest<EventEnvelope>(
    `/churches/${encodeURIComponent(churchId)}/events`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  return envelope.data;
};

export const updateChurchEvent = async (input: IUpdateChurchEventInput): Promise<IChurchEvent> => {
  const { eventId, ...payload } = input;
  const envelope = await apiRequest<EventEnvelope>(`/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return envelope.data;
};

export const deleteChurchEvent = async (eventId: string): Promise<IDeleteChurchEventResult> => {
  const envelope = await apiRequest<DeleteEventEnvelope>(`/events/${encodeURIComponent(eventId)}`, {
    method: 'DELETE',
  });

  return envelope.data;
};
