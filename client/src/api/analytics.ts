import { apiRequest } from '@/lib/api-client';
import { IChurchAnalytics } from '@/types/analytics';

type AnalyticsEnvelope = {
  data: IChurchAnalytics[];
};

export const fetchMyChurchAnalytics = async (): Promise<IChurchAnalytics[]> => {
  const envelope = await apiRequest<AnalyticsEnvelope>('/analytics/my-churches');
  return envelope.data;
};
