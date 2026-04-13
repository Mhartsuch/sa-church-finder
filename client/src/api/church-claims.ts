import { apiRequest } from '@/lib/api-client';
import {
  CreateChurchClaimInput,
  IAdminChurchClaimsResponse,
  IChurchAdmin,
  IUserChurchClaimsResponse,
  IViewerChurchClaim,
  ResolveChurchClaimInput,
  ResolveChurchClaimResult,
} from '@/types/church-claim';

type ApiEnvelope<T> = {
  data: T;
};

type SubmitChurchClaimEnvelope = {
  data: IViewerChurchClaim & {
    churchId: string;
  };
};

export const submitChurchClaim = async (
  input: CreateChurchClaimInput,
): Promise<SubmitChurchClaimEnvelope['data']> => {
  const envelope = await apiRequest<SubmitChurchClaimEnvelope>(
    `/churches/${encodeURIComponent(input.churchId)}/claim`,
    {
      method: 'POST',
      body: JSON.stringify({
        roleTitle: input.roleTitle,
        verificationEmail: input.verificationEmail,
      }),
    },
  );

  return envelope.data;
};

export const fetchUserChurchClaims = async (userId: string): Promise<IUserChurchClaimsResponse> => {
  return apiRequest<IUserChurchClaimsResponse>(`/users/${encodeURIComponent(userId)}/claims`);
};

export const fetchAdminChurchClaims = async (): Promise<IAdminChurchClaimsResponse> => {
  return apiRequest<IAdminChurchClaimsResponse>('/admin/claims');
};

export const resolveChurchClaim = async (
  input: ResolveChurchClaimInput,
): Promise<ResolveChurchClaimResult> => {
  const envelope = await apiRequest<ApiEnvelope<ResolveChurchClaimResult>>(
    `/admin/claims/${encodeURIComponent(input.claimId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status: input.status,
      }),
    },
  );

  return envelope.data;
};

export const fetchChurchAdmins = async (churchId: string): Promise<IChurchAdmin[]> => {
  const envelope = await apiRequest<ApiEnvelope<IChurchAdmin[]>>(
    `/churches/${encodeURIComponent(churchId)}/admins`,
  );
  return envelope.data;
};

export const removeChurchAdminRequest = async (
  churchId: string,
  adminUserId: string,
): Promise<void> => {
  await apiRequest(
    `/churches/${encodeURIComponent(churchId)}/admins/${encodeURIComponent(adminUserId)}`,
    { method: 'DELETE' },
  );
};
