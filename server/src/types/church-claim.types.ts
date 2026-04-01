import { ChurchClaimStatus } from './church.types.js'

export interface IChurchClaimChurchSummary {
  id: string
  name: string
  slug: string
  denomination?: string | null
  city: string
  state: string
  neighborhood?: string | null
  isClaimed: boolean
}

export interface IChurchClaimReviewerSummary {
  id: string
  name: string
}

export interface IChurchClaimUserSummary {
  id: string
  name: string
  email: string
}

export interface ICreateChurchClaimInput {
  roleTitle: string
  verificationEmail: string
}

export interface IResolveChurchClaimInput {
  status: Exclude<ChurchClaimStatus, 'pending'>
}

export interface IChurchClaimResult {
  id: string
  churchId: string
  status: ChurchClaimStatus
  roleTitle: string
  verificationEmail: string
  createdAt: Date
  reviewedAt?: Date | null
}

export interface IUserChurchClaim extends IChurchClaimResult {
  church: IChurchClaimChurchSummary
  reviewedBy?: IChurchClaimReviewerSummary | null
}

export interface IUserChurchClaimsResponse {
  data: IUserChurchClaim[]
  meta: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
}

export interface IAdminChurchClaim extends IUserChurchClaim {
  user: IChurchClaimUserSummary
}

export interface IAdminChurchClaimsResponse {
  data: IAdminChurchClaim[]
  meta: {
    total: number
  }
}

export interface IResolveChurchClaimResult {
  claimId: string
  churchId: string
  userId: string
  status: Exclude<ChurchClaimStatus, 'pending'>
}
