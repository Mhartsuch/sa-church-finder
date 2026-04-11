import { apiRequest } from '@/lib/api-client';
import {
  IChurchEvent,
  IChurchEventFilters,
  IChurchEventsResponse,
  ICreateChurchEventInput,
  IDeleteChurchEventResult,
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
