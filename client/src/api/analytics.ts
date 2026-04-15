import { apiRequest } from '@/lib/api-client';
import { IChurchAnalytics } from '@/types/analytics';

type AnalyticsListEnvelope = {
  data: IChurchAnalytics[];
};

type AnalyticsEnvelope = {
  data: IChurchAnalytics;
};

export const fetchMyChurchAnalytics = async (): Promise<IChurchAnalytics[]> => {
  const envelope = await apiRequest<AnalyticsListEnvelope>('/analytics/my-churches');
  return envelope.data;
};

export const fetchChurchAnalytics = async (churchId: string): Promise<IChurchAnalytics> => {
  const envelope = await apiRequest<AnalyticsEnvelope>(
    `/analytics/churches/${encodeURIComponent(churchId)}`,
  );
  return envelope.data;
};
