import { ClaimStatus, Prisma, Role } from '@prisma/client'

import prisma from '../lib/prisma.js'
import { isEmailDeliveryConfigured } from '../lib/email.js'
import logger from '../lib/logger.js'
import { AppError, ConflictError, NotFoundError } from '../middleware/error-handler.js'
import { sendClaimApprovedEmail, sendClaimRejectedEmail } from './notification-email.service.js'
import {
  IAdminChurchClaim,
  IAdminChurchClaimsResponse,
  ICreateChurchClaimInput,
  IChurchClaimResult,
  IResolveChurchClaimInput,
  IResolveChurchClaimResult,
  IUserChurchClaim,
  IUserChurchClaimsResponse,
} from '../types/church-claim.types.js'
import { ChurchClaimStatus, IViewerChurchClaim } from '../types/church.types.js'

const viewerClaimSelect = Prisma.validator<Prisma.ChurchClaimSelect>()({
  id: true,
  churchId: true,
  roleTitle: true,
  verificationEmail: true,
  status: true,
  createdAt: true,
  reviewedAt: true,
})

const userClaimInclude = Prisma.validator<Prisma.ChurchClaimInclude>()({
  church: {
    select: {
      id: true,
      name: true,
      slug: true,
      denomination: true,
      city: true,
      state: true,
      neighborhood: true,
      isClaimed: true,
    },
  },
  reviewedBy: {
    select: {
      id: true,
      name: true,
    },
  },
})

const adminClaimInclude = Prisma.validator<Prisma.ChurchClaimInclude>()({
  ...userClaimInclude,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
})

type ViewerClaimRecord = Prisma.ChurchClaimGetPayload<{ select: typeof viewerClaimSelect }>
type UserClaimRecord = Prisma.ChurchClaimGetPayload<{ include: typeof userClaimInclude }>
type AdminClaimRecord = Prisma.ChurchClaimGetPayload<{ include: typeof adminClaimInclude }>

const mapClaimStatus = (status: ClaimStatus): ChurchClaimStatus =>
  status.toLowerCase() as ChurchClaimStatus

const mapClaimResult = (claim: ViewerClaimRecord): IChurchClaimResult => ({
  id: claim.id,
  churchId: claim.churchId,
  status: mapClaimStatus(claim.status),
  roleTitle: claim.roleTitle,
  verificationEmail: claim.verificationEmail,
  createdAt: claim.createdAt,
  reviewedAt: claim.reviewedAt,
})

const mapViewerClaim = (claim: ViewerClaimRecord): IViewerChurchClaim => ({
  id: claim.id,
  status: mapClaimStatus(claim.status),
  roleTitle: claim.roleTitle,
  verificationEmail: claim.verificationEmail,
  createdAt: claim.createdAt,
  reviewedAt: claim.reviewedAt,
})

const mapUserClaim = (claim: UserClaimRecord): IUserChurchClaim => ({
  ...mapClaimResult(claim),
  church: {
    id: claim.church.id,
    name: claim.church.name,
    slug: claim.church.slug,
    denomination: claim.church.denomination,
    city: claim.church.city,
    state: claim.church.state,
    neighborhood: claim.church.neighborhood,
    isClaimed: claim.church.isClaimed,
  },
  reviewedBy: claim.reviewedBy
    ? {
        id: claim.reviewedBy.id,
        name: claim.reviewedBy.name,
      }
    : null,
})

const mapAdminClaim = (claim: AdminClaimRecord): IAdminChurchClaim => ({
  ...mapUserClaim(claim),
  user: {
    id: claim.user.id,
    name: claim.user.name,
    email: claim.user.email,
  },
})

const normalizeEmailDomain = (email: string): string | null => {
  const trimmedEmail = email.trim().toLowerCase()
  const atIndex = trimmedEmail.lastIndexOf('@')

  if (atIndex <= 0 || atIndex === trimmedEmail.length - 1) {
    return null
  }

  const domain = trimmedEmail.slice(atIndex + 1)
  return domain.includes('.') ? domain : null
}

const normalizeWebsiteDomain = (website: string | null | undefined): string | null => {
  if (!website?.trim()) {
    return null
  }

  try {
    const withProtocol = /^https?:\/\//i.test(website) ? website : `https://${website}`
    const hostname = new URL(withProtocol).hostname.trim().toLowerCase()

    if (!hostname) {
      return null
    }

    const normalizedHostname = hostname.replace(/^www\./, '')
    return normalizedHostname.includes('.') ? normalizedHostname : null
  } catch {
    return null
  }
}

const domainsMatch = (candidate: string, allowed: string): boolean => {
  return (
    candidate === allowed || candidate.endsWith(`.${allowed}`) || allowed.endsWith(`.${candidate}`)
  )
}

const ensureVerificationDomainMatchesChurch = (
  church: {
    email: string | null
    website: string | null
  },
  verificationEmail: string,
): void => {
  const verificationDomain = normalizeEmailDomain(verificationEmail)

  if (!verificationDomain) {
    throw new AppError(
      400,
      'INVALID_VERIFICATION_EMAIL',
      'Use a church email address with a public domain for verification',
    )
  }

  const allowedDomains = new Set<string>()
  const churchEmailDomain = normalizeEmailDomain(church.email ?? '')
  const websiteDomain = normalizeWebsiteDomain(church.website)

  if (churchEmailDomain) {
    allowedDomains.add(churchEmailDomain)
  }

  if (websiteDomain) {
    allowedDomains.add(websiteDomain)
  }

  if (allowedDomains.size === 0) {
    throw new AppError(
      400,
      'CLAIM_VERIFICATION_UNAVAILABLE',
      'This listing does not have a public website or email domain available for claim verification yet',
    )
  }

  if (
    ![...allowedDomains].some((allowedDomain) => domainsMatch(verificationDomain, allowedDomain))
  ) {
    throw new AppError(
      400,
      'CLAIM_EMAIL_DOMAIN_MISMATCH',
      "Use an email address that matches this church's public website or contact domain",
      {
        allowedDomains: [...allowedDomains],
      },
    )
  }
}

export async function getViewerClaimForChurch(
  churchId: string,
  userId: string,
): Promise<IViewerChurchClaim | null> {
  const claim = await prisma.churchClaim.findFirst({
    where: {
      churchId,
      userId,
    },
    orderBy: [{ createdAt: 'desc' }],
    select: viewerClaimSelect,
  })

  return claim ? mapViewerClaim(claim) : null
}

export async function createChurchClaim(
  userId: string,
  churchId: string,
  input: ICreateChurchClaimInput,
): Promise<IChurchClaimResult> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: {
      id: true,
      isClaimed: true,
      email: true,
      website: true,
    },
  })

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  if (church.isClaimed) {
    throw new ConflictError('This church is already claimed')
  }

  const existingApprovedClaim = await prisma.churchClaim.findFirst({
    where: {
      churchId,
      userId,
      status: ClaimStatus.APPROVED,
    },
    select: {
      id: true,
    },
  })

  if (existingApprovedClaim) {
    throw new ConflictError('You already manage this church listing')
  }

  const existingPendingClaim = await prisma.churchClaim.findFirst({
    where: {
      churchId,
      userId,
      status: ClaimStatus.PENDING,
    },
    select: {
      id: true,
    },
  })

  if (existingPendingClaim) {
    throw new ConflictError('You already have a pending claim request for this church')
  }

  ensureVerificationDomainMatchesChurch(church, input.verificationEmail)

  const claim = await prisma.churchClaim.create({
    data: {
      churchId,
      userId,
      roleTitle: input.roleTitle.trim(),
      verificationEmail: input.verificationEmail.trim().toLowerCase(),
    },
    select: viewerClaimSelect,
  })

  return mapClaimResult(claim)
}

export async function getUserChurchClaims(userId: string): Promise<IUserChurchClaimsResponse> {
  const claims = await prisma.churchClaim.findMany({
    where: {
      userId,
    },
    orderBy: [{ createdAt: 'desc' }],
    include: userClaimInclude,
  })

  return {
    data: claims.map(mapUserClaim),
    meta: {
      total: claims.length,
      pending: claims.filter((claim) => claim.status === ClaimStatus.PENDING).length,
      approved: claims.filter((claim) => claim.status === ClaimStatus.APPROVED).length,
      rejected: claims.filter((claim) => claim.status === ClaimStatus.REJECTED).length,
    },
  }
}

export async function getPendingChurchClaims(): Promise<IAdminChurchClaimsResponse> {
  const claims = await prisma.churchClaim.findMany({
    where: {
      status: ClaimStatus.PENDING,
    },
    orderBy: [{ createdAt: 'asc' }],
    include: adminClaimInclude,
  })

  return {
    data: claims.map(mapAdminClaim),
    meta: {
      total: claims.length,
    },
  }
}

export async function resolveChurchClaim(
  claimId: string,
  moderatorUserId: string,
  input: IResolveChurchClaimInput,
): Promise<IResolveChurchClaimResult> {
  const claim = await prisma.churchClaim.findUnique({
    where: { id: claimId },
    include: {
      church: {
        select: {
          id: true,
          name: true,
          slug: true,
          isClaimed: true,
          claimedById: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  })

  if (!claim) {
    throw new NotFoundError('Church claim not found')
  }

  if (claim.status !== ClaimStatus.PENDING) {
    throw new ConflictError('This church claim has already been reviewed')
  }

  if (input.status === 'rejected') {
    await prisma.churchClaim.update({
      where: { id: claimId },
      data: {
        status: ClaimStatus.REJECTED,
        reviewedById: moderatorUserId,
        reviewedAt: new Date(),
      },
    })

    if (isEmailDeliveryConfigured()) {
      sendClaimRejectedEmail({
        email: claim.user.email,
        name: claim.user.name,
        churchName: claim.church.name,
      }).catch((error) => {
        logger.error({ err: error, claimId }, 'Failed to send claim rejected email')
      })
    }

    return {
      claimId,
      churchId: claim.churchId,
      userId: claim.userId,
      status: 'rejected',
    }
  }

  const reviewTimestamp = new Date()
  const operations: Prisma.PrismaPromise<unknown>[] = [
    prisma.churchClaim.update({
      where: { id: claimId },
      data: {
        status: ClaimStatus.APPROVED,
        reviewedById: moderatorUserId,
        reviewedAt: reviewTimestamp,
      },
    }),
    prisma.church.update({
      where: { id: claim.churchId },
      data: {
        isClaimed: true,
        claimedById: claim.church.claimedById ?? claim.userId,
      },
    }),
  ]

  if (claim.user.role === Role.USER) {
    operations.push(
      prisma.user.update({
        where: { id: claim.userId },
        data: {
          role: Role.CHURCH_ADMIN,
        },
      }),
    )
  }

  await prisma.$transaction(operations)

  if (isEmailDeliveryConfigured()) {
    sendClaimApprovedEmail({
      email: claim.user.email,
      name: claim.user.name,
      churchName: claim.church.name,
      churchSlug: claim.church.slug,
    }).catch((error) => {
      logger.error({ err: error, claimId }, 'Failed to send claim approved email')
    })
  }

  return {
    claimId,
    churchId: claim.churchId,
    userId: claim.userId,
    status: 'approved',
  }
}
