import bcrypt from 'bcryptjs'
import { createHash, randomBytes } from 'crypto'
import { Prisma, Role } from '@prisma/client'

import prisma from '../lib/prisma.js'
import { resolveClientUrls } from '../lib/session.js'
import { AppError, AuthError } from '../middleware/error-handler.js'
import logger from '../lib/logger.js'
import {
  AuthForgotPasswordBody,
  AuthLoginBody,
  AuthRegisterBody,
  AuthResetPasswordBody,
  AuthVerifyEmailBody,
} from '../schemas/auth.schema.js'
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
})

type AuthUserRecord = Prisma.UserGetPayload<{ select: typeof authUserSelect }>
type AuthUserWithPasswordRecord = Prisma.UserGetPayload<{
  select: typeof authUserWithPasswordSelect
}>

export type EmailVerificationRequestResult = {
  status: 'sent' | 'already-verified'
  previewUrl?: string
}

export type VerifyEmailResult = {
  status: 'verified' | 'already-verified'
}

const ONE_TIME_TOKEN_BYTES = 32

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
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.AUTH_EXPOSE_RESET_PREVIEW === 'true'
  )
}

function shouldExposeVerificationPreview(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.AUTH_EXPOSE_VERIFICATION_PREVIEW === 'true'
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
  if (!shouldExposePreview) {
    return null
  }

  const clientUrls = resolveClientUrls()
  const baseUrl =
    clientUrls === '*' || clientUrls.length === 0 ? 'http://localhost:5173' : clientUrls[0]
  const previewUrl = new URL(path, baseUrl)

  previewUrl.searchParams.set('token', token)

  return previewUrl.toString()
}

function resolvePasswordResetPreviewUrl(token: string): string | null {
  return resolvePreviewUrl('/reset-password', token, shouldExposePasswordResetPreview())
}

function resolveEmailVerificationPreviewUrl(token: string): string | null {
  return resolvePreviewUrl('/verify-email', token, shouldExposeVerificationPreview())
}

async function issueEmailVerificationToken(userId: string): Promise<{ previewUrl?: string }> {
  const { rawToken, tokenHash, expiresAt } = issueOneTimeToken(
    resolveEmailVerificationTokenTtlMs(),
  )

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({
      where: {
        userId,
        usedAt: null,
      },
    }),
    prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    }),
  ])

  logger.info(
    {
      userId,
      emailVerificationExpiresAt: expiresAt.toISOString(),
      previewEnabled: shouldExposeVerificationPreview(),
    },
    'Email verification token issued',
  )

  const previewUrl = resolveEmailVerificationPreviewUrl(rawToken)

  return previewUrl ? { previewUrl } : {}
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
    const verificationResult = await issueEmailVerificationToken(user.id)

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
    logger.error({ err: error, userId: user.id }, 'Failed to issue email verification token')
  }

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

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)

  if (!passwordMatches) {
    throw new AuthError('Invalid email or password')
  }

  return toAuthUser(user as AuthUserWithPasswordRecord)
}

export async function requestEmailVerification(
  userId: string,
): Promise<EmailVerificationRequestResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      emailVerified: true,
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

  const previewResult = await issueEmailVerificationToken(user.id)

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

  if (
    emailVerificationToken.usedAt ||
    emailVerificationToken.expiresAt <= new Date()
  ) {
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

  const { rawToken, tokenHash, expiresAt } = issueOneTimeToken(
    resolvePasswordResetTokenTtlMs(),
  )

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
    throw new AppError(
      400,
      'INVALID_RESET_TOKEN',
      'Password reset link is invalid or has expired',
    )
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

export async function getCurrentUser(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: authUserSelect,
  })

  return user ? toAuthUser(user) : null
}
