import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'crypto'
import { Prisma, Role } from '@prisma/client'

import prisma from '../lib/prisma.js'
import { resolveClientUrls } from '../lib/session.js'
import { AppError, AuthError } from '../middleware/error-handler.js'
import logger from '../lib/logger.js'
import { isEmailDeliveryConfigured } from '../lib/email.js'
import { sendWelcomeEmail } from './notification-email.service.js'
import { getGoogleOAuthStatus } from '../lib/integration-status.js'
import {
  AuthForgotPasswordBody,
  AuthLoginBody,
  AuthGoogleOAuthCallbackInput,
  AuthRegisterBody,
  AuthResetPasswordBody,
  AuthVerifyEmailBody,
} from '../schemas/auth.schema.js'
import { sendEmailVerificationEmail, sendPasswordResetEmail } from './auth-email.service.js'
import { AppRole, AuthUser } from '../types/auth.types.js'

const authUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  role: true,
  emailVerified: true,
  createdAt: true,
})

const authUserWithPasswordSelect = Prisma.validator<Prisma.UserSelect>()({
  ...authUserSelect,
  passwordHash: true,
  deactivatedAt: true,
})

const authUserWithGoogleSelect = Prisma.validator<Prisma.UserSelect>()({
  ...authUserSelect,
  googleId: true,
  deactivatedAt: true,
})

type AuthUserRecord = Prisma.UserGetPayload<{ select: typeof authUserSelect }>

type GoogleOAuthTokenResponse = {
  access_token?: string
}

type GoogleUserInfoResponse = {
  sub?: string
  email?: string
  email_verified?: boolean
  name?: string
  picture?: string
}

type NormalizedGoogleUserProfile = {
  googleId: string
  email: string
  emailVerified: boolean
  name: string
  avatarUrl: string | null
}

export type EmailVerificationRequestResult = {
  status: 'sent' | 'already-verified'
  previewUrl?: string
}

export type VerifyEmailResult = {
  status: 'verified' | 'already-verified'
}

const ONE_TIME_TOKEN_BYTES = 32
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'

function resolvePasswordResetTokenTtlMs(): number {
  const configuredTtlMinutes = Number.parseInt(
    process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? '60',
    10,
  )

  return Math.max(configuredTtlMinutes, 5) * 60 * 1000
}

function resolveEmailVerificationTokenTtlMs(): number {
  const configuredTtlMinutes = Number.parseInt(
    process.env.EMAIL_VERIFICATION_TOKEN_TTL_MINUTES ?? '1440',
    10,
  )

  return Math.max(configuredTtlMinutes, 15) * 60 * 1000
}

function shouldExposePasswordResetPreview(): boolean {
  return process.env.NODE_ENV !== 'production' && process.env.AUTH_EXPOSE_RESET_PREVIEW === 'true'
}

function shouldExposeVerificationPreview(): boolean {
  return (
    process.env.NODE_ENV !== 'production' && process.env.AUTH_EXPOSE_VERIFICATION_PREVIEW === 'true'
  )
}

function mapRole(role: Role): AppRole {
  return role.toLowerCase() as AppRole
}

function toAuthUser(user: AuthUserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: mapRole(user.role),
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  }
}

function hashOneTimeToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function issueOneTimeToken(ttlMs: number): {
  rawToken: string
  tokenHash: string
  expiresAt: Date
} {
  const rawToken = randomBytes(ONE_TIME_TOKEN_BYTES).toString('base64url')

  return {
    rawToken,
    tokenHash: hashOneTimeToken(rawToken),
    expiresAt: new Date(Date.now() + ttlMs),
  }
}

function resolvePreviewUrl(
  path: string,
  token: string,
  shouldExposePreview: boolean,
): string | null {
  const authActionUrl = buildAuthActionUrl(path, token)

  if (!shouldExposePreview) {
    return null
  }

  return authActionUrl
}

function resolvePasswordResetPreviewUrl(token: string): string | null {
  return resolvePreviewUrl('/reset-password', token, shouldExposePasswordResetPreview())
}

function resolveEmailVerificationPreviewUrl(token: string): string | null {
  return resolvePreviewUrl('/verify-email', token, shouldExposeVerificationPreview())
}

function buildAuthActionUrl(path: string, token: string): string {
  const clientUrls = resolveClientUrls()
  const baseUrl =
    clientUrls === '*' || clientUrls.length === 0 ? 'http://localhost:5173' : clientUrls[0]
  const actionUrl = new URL(path, baseUrl)

  actionUrl.searchParams.set('token', token)

  return actionUrl.toString()
}

function canDeliverPasswordResetInstructions(): boolean {
  return shouldExposePasswordResetPreview() || isEmailDeliveryConfigured()
}

function canDeliverEmailVerificationInstructions(): boolean {
  return shouldExposeVerificationPreview() || isEmailDeliveryConfigured()
}

async function issueEmailVerificationToken(input: {
  email: string
  name: string | null
  requireDeliverability?: boolean
  userId: string
}): Promise<{ previewUrl?: string }> {
  if (input.requireDeliverability && !canDeliverEmailVerificationInstructions()) {
    throw new AppError(
      503,
      'EMAIL_DELIVERY_UNAVAILABLE',
      'Email delivery is not configured right now',
    )
  }

  const { rawToken, tokenHash, expiresAt } = issueOneTimeToken(resolveEmailVerificationTokenTtlMs())

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({
      where: {
        userId: input.userId,
        usedAt: null,
      },
    }),
    prisma.emailVerificationToken.create({
      data: {
        userId: input.userId,
        tokenHash,
        expiresAt,
      },
    }),
  ])

  logger.info(
    {
      userId: input.userId,
      emailVerificationExpiresAt: expiresAt.toISOString(),
      previewEnabled: shouldExposeVerificationPreview(),
    },
    'Email verification token issued',
  )

  const previewUrl = resolveEmailVerificationPreviewUrl(rawToken)
  const verificationUrl = buildAuthActionUrl('/verify-email', rawToken)

  if (isEmailDeliveryConfigured()) {
    try {
      await sendEmailVerificationEmail({
        email: input.email,
        name: input.name,
        verificationUrl,
      })
    } catch (error) {
      logger.error(
        {
          err: error,
          userId: input.userId,
        },
        'Failed to send email verification email',
      )

      if (!previewUrl) {
        throw new AppError(
          503,
          'EMAIL_DELIVERY_FAILED',
          'Verification email could not be sent right now',
        )
      }
    }
  } else {
    logger.warn(
      { userId: input.userId },
      'Email verification email not sent because SMTP is not configured',
    )
  }

  return previewUrl ? { previewUrl } : {}
}

export function isGoogleOAuthConfigured(): boolean {
  return getGoogleOAuthStatus().configured
}

function requireGoogleOAuthConfig(): {
  clientId: string
  clientSecret: string
} {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()

  if (!clientId || !clientSecret) {
    throw new AppError(
      503,
      'GOOGLE_OAUTH_UNAVAILABLE',
      'Google sign-in is not configured right now',
    )
  }

  return {
    clientId,
    clientSecret,
  }
}

async function parseGoogleJsonResponse(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown
  } catch {
    return null
  }
}

function normalizeGoogleUserProfile(payload: unknown): NormalizedGoogleUserProfile {
  if (!payload || typeof payload !== 'object') {
    throw new AppError(502, 'GOOGLE_OAUTH_FAILED', 'Google sign-in could not be completed')
  }

  const profile = payload as GoogleUserInfoResponse
  const googleId = profile.sub?.trim()
  const email = profile.email?.trim().toLowerCase()
  const emailVerified = profile.email_verified === true
  const displayName = profile.name?.trim()
  const avatarUrl = profile.picture?.trim() || null

  if (!googleId || !email || !emailVerified) {
    throw new AppError(
      400,
      'GOOGLE_EMAIL_NOT_VERIFIED',
      'Google sign-in requires a verified email address',
    )
  }

  return {
    googleId,
    email,
    emailVerified,
    name: displayName || email.split('@')[0],
    avatarUrl,
  }
}

async function exchangeGoogleCodeForUserProfile(
  input: AuthGoogleOAuthCallbackInput,
): Promise<NormalizedGoogleUserProfile> {
  const { clientId, clientSecret } = requireGoogleOAuthConfig()
  const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code: input.code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: input.redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  const tokenPayload = (await parseGoogleJsonResponse(
    tokenResponse,
  )) as GoogleOAuthTokenResponse | null

  if (!tokenResponse.ok || !tokenPayload?.access_token) {
    logger.error(
      {
        googleStatus: tokenResponse.status,
        googleStatusText: tokenResponse.statusText,
        tokenPayload,
      },
      'Google OAuth token exchange failed',
    )
    throw new AppError(502, 'GOOGLE_OAUTH_FAILED', 'Google sign-in could not be completed')
  }

  const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${tokenPayload.access_token}`,
    },
  })
  const userInfoPayload = await parseGoogleJsonResponse(userInfoResponse)

  if (!userInfoResponse.ok) {
    logger.error(
      {
        googleStatus: userInfoResponse.status,
        googleStatusText: userInfoResponse.statusText,
        userInfoPayload,
      },
      'Google OAuth user info request failed',
    )
    throw new AppError(502, 'GOOGLE_OAUTH_FAILED', 'Google sign-in could not be completed')
  }

  return normalizeGoogleUserProfile(userInfoPayload)
}

async function syncGoogleUserProfile(profile: NormalizedGoogleUserProfile): Promise<AuthUser> {
  const existingGoogleUser = await prisma.user.findUnique({
    where: { googleId: profile.googleId },
    select: authUserWithGoogleSelect,
  })

  if (existingGoogleUser) {
    if (existingGoogleUser.deactivatedAt) {
      throw new AppError(
        403,
        'ACCOUNT_DEACTIVATED',
        'This account has been deactivated. Please contact support to reactivate.',
      )
    }

    const nextAvatarUrl = existingGoogleUser.avatarUrl || profile.avatarUrl
    const shouldUpdate =
      existingGoogleUser.email !== profile.email ||
      existingGoogleUser.emailVerified !== profile.emailVerified ||
      existingGoogleUser.avatarUrl !== nextAvatarUrl

    if (!shouldUpdate) {
      return toAuthUser(existingGoogleUser)
    }

    const updatedUser = await prisma.user.update({
      where: { id: existingGoogleUser.id },
      data: {
        email: profile.email,
        emailVerified: profile.emailVerified,
        avatarUrl: nextAvatarUrl,
      },
      select: authUserSelect,
    })

    logger.info(
      {
        userId: updatedUser.id,
        googleId: profile.googleId,
      },
      'Google-linked user refreshed from Google profile',
    )

    return toAuthUser(updatedUser)
  }

  const existingEmailUser = await prisma.user.findUnique({
    where: { email: profile.email },
    select: authUserWithGoogleSelect,
  })

  if (existingEmailUser) {
    if (existingEmailUser.deactivatedAt) {
      throw new AppError(
        403,
        'ACCOUNT_DEACTIVATED',
        'This account has been deactivated. Please contact support to reactivate.',
      )
    }

    if (existingEmailUser.googleId && existingEmailUser.googleId !== profile.googleId) {
      throw new AppError(
        409,
        'GOOGLE_ACCOUNT_CONFLICT',
        'That email is already linked to a different Google account',
      )
    }

    const linkedUser = await prisma.user.update({
      where: { id: existingEmailUser.id },
      data: {
        googleId: profile.googleId,
        emailVerified: existingEmailUser.emailVerified || profile.emailVerified,
        avatarUrl: existingEmailUser.avatarUrl || profile.avatarUrl,
      },
      select: authUserSelect,
    })

    logger.info(
      {
        userId: linkedUser.id,
        googleId: profile.googleId,
      },
      'Google account linked to existing email/password user',
    )

    return toAuthUser(linkedUser)
  }

  const createdUser = await prisma.user.create({
    data: {
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      googleId: profile.googleId,
      emailVerified: profile.emailVerified,
    },
    select: authUserSelect,
  })

  logger.info(
    {
      userId: createdUser.id,
      googleId: profile.googleId,
    },
    'User created from Google OAuth sign-in',
  )

  // Fire-and-forget welcome email for new Google OAuth users
  void sendWelcomeEmail({ email: createdUser.email, name: createdUser.name })

  return toAuthUser(createdUser)
}

export async function authenticateGoogleUser(
  input: AuthGoogleOAuthCallbackInput,
): Promise<AuthUser> {
  try {
    const profile = await exchangeGoogleCodeForUserProfile(input)

    return await syncGoogleUserProfile(profile)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    logger.error({ err: error }, 'Unexpected Google OAuth failure')
    throw new AppError(502, 'GOOGLE_OAUTH_FAILED', 'Google sign-in could not be completed')
  }
}

export async function registerUser(input: AuthRegisterBody): Promise<AuthUser> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  })

  if (existingUser) {
    throw new AppError(409, 'CONFLICT', 'An account with that email already exists')
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      name: input.name,
      emailVerified: false,
    },
    select: authUserSelect,
  })

  try {
    const verificationResult = await issueEmailVerificationToken({
      email: user.email,
      name: user.name,
      userId: user.id,
    })

    if (verificationResult.previewUrl) {
      logger.info(
        {
          userId: user.id,
          previewUrl: verificationResult.previewUrl,
        },
        'Email verification preview ready after registration',
      )
    }
  } catch (error) {
    logger.error(
      { err: error, userId: user.id },
      'Failed to prepare email verification instructions after registration',
    )
  }

  // Fire-and-forget welcome email — don't block registration on it
  void sendWelcomeEmail({ email: user.email, name: user.name })

  return toAuthUser(user)
}

export async function authenticateUser(input: AuthLoginBody): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: authUserWithPasswordSelect,
  })

  if (!user?.passwordHash) {
    throw new AuthError('Invalid email or password')
  }

  if (user.deactivatedAt) {
    throw new AppError(
      403,
      'ACCOUNT_DEACTIVATED',
      'This account has been deactivated. Please contact support to reactivate.',
    )
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)

  if (!passwordMatches) {
    throw new AuthError('Invalid email or password')
  }

  return toAuthUser(user)
}

export async function requestEmailVerification(
  userId: string,
): Promise<EmailVerificationRequestResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      name: true,
    },
  })

  if (!user) {
    throw new AuthError('Not authenticated')
  }

  if (user.emailVerified) {
    return {
      status: 'already-verified',
    }
  }

  const previewResult = await issueEmailVerificationToken({
    email: user.email,
    name: user.name,
    requireDeliverability: true,
    userId: user.id,
  })

  return {
    status: 'sent',
    ...previewResult,
  }
}

export async function verifyEmail(input: AuthVerifyEmailBody): Promise<VerifyEmailResult> {
  const tokenHash = hashOneTimeToken(input.token)
  const emailVerificationToken = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
      user: {
        select: {
          emailVerified: true,
        },
      },
    },
  })

  if (!emailVerificationToken) {
    throw new AppError(
      400,
      'INVALID_EMAIL_VERIFICATION_TOKEN',
      'Email verification link is invalid or has expired',
    )
  }

  if (emailVerificationToken.user.emailVerified) {
    return {
      status: 'already-verified',
    }
  }

  if (emailVerificationToken.usedAt || emailVerificationToken.expiresAt <= new Date()) {
    throw new AppError(
      400,
      'INVALID_EMAIL_VERIFICATION_TOKEN',
      'Email verification link is invalid or has expired',
    )
  }

  const usedAt = new Date()

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: emailVerificationToken.id },
      data: {
        usedAt,
      },
    }),
    prisma.user.update({
      where: { id: emailVerificationToken.userId },
      data: {
        emailVerified: true,
      },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: {
        userId: emailVerificationToken.userId,
        usedAt: null,
      },
    }),
  ])

  logger.info({ userId: emailVerificationToken.userId }, 'Email verification completed')

  return {
    status: 'verified',
  }
}

export async function requestPasswordReset(input: AuthForgotPasswordBody): Promise<{
  previewUrl?: string
}> {
  if (!canDeliverPasswordResetInstructions()) {
    throw new AppError(
      503,
      'EMAIL_DELIVERY_UNAVAILABLE',
      'Password reset email delivery is not configured right now',
    )
  }

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
    },
  })

  if (!user) {
    return {}
  }

  const { rawToken, tokenHash, expiresAt } = issueOneTimeToken(resolvePasswordResetTokenTtlMs())

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    }),
    prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    }),
  ])

  logger.info(
    {
      userId: user.id,
      resetTokenExpiresAt: expiresAt.toISOString(),
      previewEnabled: shouldExposePasswordResetPreview(),
    },
    'Password reset requested',
  )

  const previewUrl = resolvePasswordResetPreviewUrl(rawToken)
  const resetUrl = buildAuthActionUrl('/reset-password', rawToken)

  if (isEmailDeliveryConfigured()) {
    try {
      await sendPasswordResetEmail({
        email: user.email,
        name: null,
        resetUrl,
      })
    } catch (error) {
      logger.error(
        {
          err: error,
          userId: user.id,
        },
        'Failed to send password reset email',
      )
    }
  } else {
    logger.warn({ userId: user.id }, 'Password reset email not sent because SMTP is not configured')
  }

  return previewUrl ? { previewUrl } : {}
}

export async function resetPassword(input: AuthResetPasswordBody): Promise<void> {
  const tokenHash = hashOneTimeToken(input.token)
  const passwordResetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      usedAt: true,
    },
  })

  if (
    !passwordResetToken ||
    passwordResetToken.usedAt ||
    passwordResetToken.expiresAt <= new Date()
  ) {
    throw new AppError(400, 'INVALID_RESET_TOKEN', 'Password reset link is invalid or has expired')
  }

  const passwordHash = await bcrypt.hash(input.password, 12)
  const usedAt = new Date()

  await prisma.$transaction([
    prisma.passwordResetToken.update({
      where: { id: passwordResetToken.id },
      data: {
        usedAt,
      },
    }),
    prisma.user.update({
      where: { id: passwordResetToken.userId },
      data: {
        passwordHash,
      },
    }),
    prisma.passwordResetToken.deleteMany({
      where: {
        userId: passwordResetToken.userId,
        usedAt: null,
      },
    }),
  ])

  logger.info({ userId: passwordResetToken.userId }, 'Password reset completed')
}

export async function issueEmailVerificationForUser(input: {
  email: string
  name: string | null
  userId: string
}): Promise<{ previewUrl?: string }> {
  return issueEmailVerificationToken(input)
}

export async function getCurrentUser(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { ...authUserSelect, deactivatedAt: true },
  })

  if (!user || user.deactivatedAt) {
    return null
  }

  return toAuthUser(user)
}
