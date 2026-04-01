import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchAdminChurchClaims,
  fetchUserChurchClaims,
  resolveChurchClaim,
  submitChurchClaim,
} from '@/api/church-claims'
import { AUTH_SESSION_QUERY_KEY } from '@/hooks/useAuth'
import { CHURCHES_QUERY_KEY, CHURCH_QUERY_KEY } from '@/hooks/useChurches'
import {
  CreateChurchClaimInput,
  IAdminChurchClaimsResponse,
  IViewerChurchClaim,
  IUserChurchClaimsResponse,
  ResolveChurchClaimInput,
  ResolveChurchClaimResult,
} from '@/types/church-claim'

const STALE_TIME = 60000

export const USER_CHURCH_CLAIMS_QUERY_KEY = ['user-church-claims'] as const
export const ADMIN_CHURCH_CLAIMS_QUERY_KEY = ['admin-church-claims'] as const

const invalidateClaimAwareQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: CHURCHES_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: CHURCH_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: USER_CHURCH_CLAIMS_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: ADMIN_CHURCH_CLAIMS_QUERY_KEY })
  void queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY })
}

export const useUserChurchClaims = (userId: string | null) => {
  return useQuery<IUserChurchClaimsResponse, Error>({
    queryKey: [...USER_CHURCH_CLAIMS_QUERY_KEY, userId],
    queryFn: () => fetchUserChurchClaims(userId!),
    staleTime: STALE_TIME,
    enabled: Boolean(userId),
  })
}

export const useAdminChurchClaims = (enabled: boolean) => {
  return useQuery<IAdminChurchClaimsResponse, Error>({
    queryKey: ADMIN_CHURCH_CLAIMS_QUERY_KEY,
    queryFn: fetchAdminChurchClaims,
    staleTime: STALE_TIME,
    enabled,
  })
}

export const useSubmitChurchClaim = () => {
  const queryClient = useQueryClient()

  return useMutation<
    IViewerChurchClaim & { churchId: string },
    Error,
    CreateChurchClaimInput
  >({
    mutationFn: submitChurchClaim,
    onSuccess: () => {
      invalidateClaimAwareQueries(queryClient)
    },
  })
}

export const useResolveChurchClaim = () => {
  const queryClient = useQueryClient()

  return useMutation<ResolveChurchClaimResult, Error, ResolveChurchClaimInput>({
    mutationFn: resolveChurchClaim,
    onSuccess: () => {
      invalidateClaimAwareQueries(queryClient)
    },
  })
}
