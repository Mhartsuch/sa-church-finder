import { apiRequest } from '@/lib/api-client';
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

interface ChurchServiceEnvelope {
  data: IChurchService;
}

interface DeleteServiceEnvelope {
  data: { id: string; churchId: string };
}

export const createChurchService = async (
  input: CreateChurchServiceInput,
): Promise<IChurchService> => {
  const { churchId, ...payload } = input;
  const envelope = await apiRequest<ChurchServiceEnvelope>(
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
  const envelope = await apiRequest<ChurchServiceEnvelope>(`/services/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return envelope.data;
};

export const deleteChurchService = async (id: string): Promise<DeleteServiceEnvelope['data']> => {
  const envelope = await apiRequest<DeleteServiceEnvelope>(`/services/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  return envelope.data;
};
