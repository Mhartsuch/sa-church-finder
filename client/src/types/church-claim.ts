export type ChurchClaimStatus = 'pending' | 'approved' | 'rejected';

export interface IViewerChurchClaim {
  id: string;
  status: ChurchClaimStatus;
  roleTitle: string;
  verificationEmail: string;
  createdAt: string;
  reviewedAt: string | null;
}

export interface IChurchClaimChurchSummary {
  id: string;
  name: string;
  slug: string;
  denomination: string | null;
  city: string;
  state: string;
  neighborhood: string | null;
  isClaimed: boolean;
}

export interface IChurchClaimReviewerSummary {
  id: string;
  name: string;
}

export interface IChurchClaimUserSummary {
  id: string;
  name: string;
  email: string;
}

export interface IChurchClaim extends IViewerChurchClaim {
  churchId: string;
  church: IChurchClaimChurchSummary;
  reviewedBy: IChurchClaimReviewerSummary | null;
}

export interface IUserChurchClaimsResponse {
  data: IChurchClaim[];
  meta: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface IAdminChurchClaim extends IChurchClaim {
  user: IChurchClaimUserSummary;
}

export interface IAdminChurchClaimsResponse {
  data: IAdminChurchClaim[];
  meta: {
    total: number;
  };
}

export interface CreateChurchClaimInput {
  churchId: string;
  roleTitle: string;
  verificationEmail: string;
}

export interface ResolveChurchClaimInput {
  claimId: string;
  status: 'approved' | 'rejected';
}

export interface ResolveChurchClaimResult {
  claimId: string;
  churchId: string;
  userId: string;
  status: 'approved' | 'rejected';
}

export interface IChurchAdmin {
  userId: string;
  name: string;
  email: string;
  roleTitle: string;
  isPrimary: boolean;
  approvedAt: string | null;
}
