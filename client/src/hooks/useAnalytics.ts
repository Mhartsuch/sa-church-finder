import { useQuery } from '@tanstack/react-query';

import { fetchMyChurchAnalytics } from '@/api/analytics';

export const useMyChurchAnalytics = (enabled: boolean) => {
  return useQuery({
    queryKey: ['analytics', 'my-churches'],
    queryFn: fetchMyChurchAnalytics,
    staleTime: 5 * 60 * 1000,
    enabled,
  });
};
