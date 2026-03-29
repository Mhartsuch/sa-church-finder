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

const PASSWORD_RESET_TOKEN_BYTES = 32

function resolvePasswordResetTokenTtlMs(): number {
  const configuredTtlMinutes = Number.parseInt(
    process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? '60',
    10,
  )

  return Math.max(configuredTtlMinutes, 5) * 60 * 1000
}

function shouldExposePasswordResetPreview(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.AUTH_EXPOSE_RESET_PREVIEW === 'true'
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

function hashPasswordResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function resolvePasswordResetPreviewUrl(token: string): string | null {
  if (!shouldExposePasswordResetPreview()) {
    return null
  }

  const clientUrls = resolveClientUrls()
  const baseUrl =
    clientUrls === '*' || clientUrls.length === 0 ? 'http://localhost:5173' : clientUrls[0]
  const resetUrl = new URL('/reset-password', baseUrl)

  resetUrl.searchParams.set('token', token)

  return resetUrl.toString()
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

  const rawToken = randomBytes(PASSWORD_RESET_TOKEN_BYTES).toString('base64url')
  const tokenHash = hashPasswordResetToken(rawToken)
  const expiresAt = new Date(Date.now() + resolvePasswordResetTokenTtlMs())

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
  const tokenHash = hashPasswordResetToken(input.token)
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
