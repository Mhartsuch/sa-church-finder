import { apiRequest } from '@/lib/api-client';
import { ApiEnvelope } from '@/types/api';
import { IChurchService } from '@/types/church';

export interface CreateChurchServiceInput {
  churchId: string;
  dayOfWeek: number;
  startTime: string;
  endTime?: string | null;
  serviceType: string;
  language?: string;
  description?: string | null;
}

export interface UpdateChurchServiceInput {
  id: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string | null;
  serviceType?: string;
  language?: string;
  description?: string | null;
}

export const createChurchService = async (
  input: CreateChurchServiceInput,
): Promise<IChurchService> => {
  const { churchId, ...payload } = input;
  const envelope = await apiRequest<ApiEnvelope<IChurchService>>(
    `/churches/${encodeURIComponent(churchId)}/services`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  return envelope.data;
};

export const updateChurchService = async (
  input: UpdateChurchServiceInput,
): Promise<IChurchService> => {
  const { id, ...payload } = input;
  const envelope = await apiRequest<ApiEnvelope<IChurchService>>(`/services/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return envelope.data;
};

export const deleteChurchService = async (id: string): Promise<{ id: string; churchId: string }> => {
  const envelope = await apiRequest<ApiEnvelope<{ id: string; churchId: string }>>(`/services/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  return envelope.data;
};
