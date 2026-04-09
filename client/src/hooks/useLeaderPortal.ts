import { useQueries } from '@tanstack/react-query';
import { useState } from 'react';

import { fetchChurchBySlug } from '@/api/churches';
import { fetchChurchEvents } from '@/api/events';
import { useUserChurchClaims } from '@/hooks/useChurchClaims';
import { IChurch } from '@/types/church';
import { IChurchClaim } from '@/types/church-claim';
import { IChurchEvent } from '@/types/event';

const STALE_TIME = 60000;
const EVENT_WINDOW_DAYS = 30;

const buildEventWindow = (): { from: string; to: string } => {
  const from = new Date();
  const to = new Date(from);
  to.setDate(to.getDate() + EVENT_WINDOW_DAYS);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
};

const dedupeApprovedClaims = (claims: IChurchClaim[]): IChurchClaim[] => {
  const approvedClaims = claims.filter((claim) => claim.status === 'approved');
  const dedupedClaims = new Map<string, IChurchClaim>();

  for (const claim of approvedClaims) {
    if (!dedupedClaims.has(claim.churchId)) {
      dedupedClaims.set(claim.churchId, claim);
    }
  }

  return Array.from(dedupedClaims.values());
};

export interface IManagedChurchPortal {
  claim: IChurchClaim;
  church: IChurch | null;
  upcomingEvents: IChurchEvent[];
  isChurchLoading: boolean;
  isEventsLoading: boolean;
  churchError: Error | null;
  eventsError: Error | null;
}

export const useLeaderPortal = (userId: string | null) => {
  const [eventWindow] = useState(buildEventWindow);
  const claimsQuery = useUserChurchClaims(userId);
  const approvedClaims = dedupeApprovedClaims(claimsQuery.data?.data ?? []);

  const churchQueries = useQueries({
    queries: approvedClaims.map((claim) => ({
      queryKey: ['leaders-portal', 'church', claim.church.slug],
      queryFn: () => fetchChurchBySlug(claim.church.slug),
      staleTime: STALE_TIME,
      enabled: Boolean(userId),
    })),
  });

  const eventQueries = useQueries({
    queries: approvedClaims.map((claim) => ({
      queryKey: ['leaders-portal', 'events', claim.church.slug, eventWindow.from, eventWindow.to],
      queryFn: () =>
        fetchChurchEvents(claim.church.slug, {
          from: eventWindow.from,
          to: eventWindow.to,
        }),
      staleTime: STALE_TIME,
      enabled: Boolean(userId),
    })),
  });

  const managedChurches: IManagedChurchPortal[] = approvedClaims.map((claim, index) => ({
    claim,
    church: churchQueries[index]?.data ?? null,
    upcomingEvents: eventQueries[index]?.data?.data ?? [],
    isChurchLoading: churchQueries[index]?.isLoading ?? false,
    isEventsLoading: eventQueries[index]?.isLoading ?? false,
    churchError: churchQueries[index]?.error ?? null,
    eventsError: eventQueries[index]?.error ?? null,
  }));

  const pendingClaims = (claimsQuery.data?.data ?? []).filter(
    (claim) => claim.status === 'pending',
  );
  const rejectedClaims = (claimsQuery.data?.data ?? []).filter(
    (claim) => claim.status === 'rejected',
  );
  const isManagedChurchesLoading = managedChurches.some(
    (church) => church.isChurchLoading || church.isEventsLoading,
  );

  return {
    claimsQuery,
    eventWindow,
    approvedClaims,
    pendingClaims,
    rejectedClaims,
    managedChurches,
    isManagedChurchesLoading,
  };
};
