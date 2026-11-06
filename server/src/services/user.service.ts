import bcrypt from 'bcryptjs'

import prisma from '../lib/prisma.js'
import logger from '../lib/logger.js'
import { AppError, AuthError } from '../middleware/error-handler.js'
import { AuthUser } from '../types/auth.types.js'
import { ChangePasswordBody, DeleteAccountBody, UpdateProfileBody } from '../schemas/user.schema.js'
import { authUserSelect, toAuthUser } from './auth.service.js'
import { refreshChurchRating } from './review.service.js'

export async function updateProfile(userId: string, input: UpdateProfileBody): Promise<AuthUser> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: input.name },
    select: authUserSelect,
  })

  logger.info({ userId }, 'User profile updated')
  return toAuthUser(user)
}

export async function changePassword(userId: string, input: ChangePasswordBody): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  })

  if (!user) throw new AuthError('Not authenticated')

  if (!user.passwordHash) {
    throw new AppError(
      400,
      'NO_PASSWORD',
      'Your account uses Google sign-in and does not have a password to change',
    )
  }

  if (!(await bcrypt.compare(input.currentPassword, user.passwordHash))) {
    throw new AppError(400, 'INVALID_PASSWORD', 'Current password is incorrect')
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(input.newPassword, 12) },
  })

  logger.info({ userId }, 'User password changed')
}

/**
 * Permanently deletes the account. Reviews, saved churches and tokens cascade
 * in the database; the affected churches' rating aggregates are recomputed.
 */
export async function deleteAccount(userId: string, input: DeleteAccountBody): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true, reviews: { select: { churchId: true } } },
  })

  if (!user) throw new AuthError('Not authenticated')

  if (user.passwordHash) {
    if (!input.password) {
      throw new AppError(
        400,
        'PASSWORD_REQUIRED',
        'Password confirmation is required to delete your account',
      )
    }

    if (!(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new AppError(400, 'INVALID_PASSWORD', 'Password is incorrect')
    }
  }

  await prisma.user.delete({ where: { id: userId } })

  const churchIds = [...new Set(user.reviews.map((review) => review.churchId))]
  await Promise.all(churchIds.map((churchId) => refreshChurchRating(churchId)))

  logger.info({ userId }, 'User account deleted')
}
