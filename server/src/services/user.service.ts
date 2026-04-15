import bcrypt from 'bcryptjs'
import { unlink } from 'fs/promises'
import path from 'path'
import { Prisma } from '@prisma/client'

import prisma from '../lib/prisma.js'
import logger from '../lib/logger.js'
import { AppError, AuthError } from '../middleware/error-handler.js'
import { AuthUser } from '../types/auth.types.js'
import {
  UpdateProfileBody,
  ChangePasswordBody,
  DeactivateAccountBody,
} from '../schemas/user.schema.js'
import { issueEmailVerificationForUser } from './auth.service.js'

const authUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  role: true,
  emailVerified: true,
  createdAt: true,
})

type AuthUserRecord = Prisma.UserGetPayload<{ select: typeof authUserSelect }>

type AppRole = 'user' | 'church_admin' | 'site_admin'

function mapRole(role: string): AppRole {
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

export type UpdateProfileResult = {
  user: AuthUser
  emailChanged: boolean
  previewUrl?: string
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileBody,
): Promise<UpdateProfileResult> {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  })

  if (!currentUser) {
    throw new AuthError('Not authenticated')
  }

  const emailChanged = input.email !== undefined && input.email !== currentUser.email

  if (emailChanged) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      select: { id: true },
    })

    if (existingUser && existingUser.id !== userId) {
      throw new AppError(409, 'CONFLICT', 'An account with that email already exists')
    }
  }

  const updateData: Prisma.UserUpdateInput = {}

  if (input.name !== undefined) {
    updateData.name = input.name
  }

  if (emailChanged) {
    updateData.email = input.email
    updateData.emailVerified = false
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: authUserSelect,
  })

  logger.info(
    {
      userId,
      emailChanged,
      nameUpdated: input.name !== undefined,
    },
    'User profile updated',
  )

  let previewUrl: string | undefined

  if (emailChanged) {
    try {
      const verificationResult = await issueEmailVerificationForUser({
        email: updatedUser.email,
        name: updatedUser.name,
        userId: updatedUser.id,
      })

      previewUrl = verificationResult.previewUrl
    } catch (error) {
      logger.error({ err: error, userId }, 'Failed to send email verification after email change')
    }
  }

  return {
    user: toAuthUser(updatedUser),
    emailChanged,
    previewUrl,
  }
}

export async function changePassword(userId: string, input: ChangePasswordBody): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  })

  if (!user) {
    throw new AuthError('Not authenticated')
  }

  if (!user.passwordHash) {
    throw new AppError(
      400,
      'NO_PASSWORD',
      'Your account uses Google sign-in and does not have a password to change',
    )
  }

  const passwordMatches = await bcrypt.compare(input.currentPassword, user.passwordHash)

  if (!passwordMatches) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Current password is incorrect')
  }

  const newPasswordHash = await bcrypt.hash(input.newPassword, 12)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newPasswordHash },
  })

  logger.info({ userId }, 'User password changed')
}

export async function uploadAvatar(
  userId: string,
  filePath: string,
  fileName: string,
): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, avatarUrl: true },
  })

  if (!user) {
    throw new AuthError('Not authenticated')
  }

  if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
    try {
      const oldFilePath = path.join(process.cwd(), user.avatarUrl)

      await unlink(oldFilePath)
    } catch {
      // Old file may not exist; ignore
    }
  }

  const avatarUrl = `/uploads/avatars/${fileName}`

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    select: authUserSelect,
  })

  logger.info({ userId, avatarUrl, filePath }, 'User avatar uploaded')

  return toAuthUser(updatedUser)
}

export async function removeAvatar(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, avatarUrl: true },
  })

  if (!user) {
    throw new AuthError('Not authenticated')
  }

  if (user.avatarUrl && user.avatarUrl.startsWith('/uploads/avatars/')) {
    try {
      const filePath = path.join(process.cwd(), user.avatarUrl)

      await unlink(filePath)
    } catch {
      // File may not exist; ignore
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: null },
    select: authUserSelect,
  })

  logger.info({ userId }, 'User avatar removed')

  return toAuthUser(updatedUser)
}

export async function deactivateAccount(
  userId: string,
  input: DeactivateAccountBody,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true, deactivatedAt: true },
  })

  if (!user) {
    throw new AuthError('Not authenticated')
  }

  if (user.deactivatedAt) {
    throw new AppError(400, 'ALREADY_DEACTIVATED', 'This account is already deactivated')
  }

  if (user.passwordHash) {
    if (!input.password) {
      throw new AppError(
        400,
        'PASSWORD_REQUIRED',
        'Password confirmation is required to deactivate your account',
      )
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash)

    if (!passwordMatches) {
      throw new AppError(400, 'INVALID_PASSWORD', 'Password is incorrect')
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { deactivatedAt: new Date() },
  })

  logger.info({ userId }, 'User account deactivated')
}
