import { unlink } from 'fs/promises'
import path from 'path'

import { Role } from '@prisma/client'

import prisma from '../lib/prisma.js'
import { AppError, NotFoundError } from '../middleware/error-handler.js'
import { invalidateFilterOptionsCache } from './church.service.js'

export interface IChurchPhotoResult {
  id: string
  churchId: string
  url: string
  altText: string | null
  displayOrder: number
  createdAt: Date
}

export interface IReorderPhotoInput {
  photoId: string
  displayOrder: number
}

/**
 * Checks that the given user has permission to manage photos for the church.
 * Allowed: SITE_ADMIN, or CHURCH_ADMIN who is the claimant of the church.
 */
async function authorizePhotoManager(userId: string, churchId: string): Promise<void> {
  const [user, church] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    }),
    prisma.church.findUnique({
      where: { id: churchId },
      select: { id: true, claimedById: true, isClaimed: true },
    }),
  ])

  if (!user) {
    throw new AppError(401, 'AUTH_ERROR', 'Not authenticated')
  }

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  if (user.role === Role.SITE_ADMIN) {
    return
  }

  if (user.role === Role.CHURCH_ADMIN && church.isClaimed && church.claimedById === user.id) {
    return
  }

  throw new AppError(
    403,
    'FORBIDDEN',
    'You do not have permission to manage photos for this church',
  )
}

/**
 * Returns all photos for the given church, ordered by displayOrder ASC.
 */
export async function getChurchPhotos(churchId: string): Promise<IChurchPhotoResult[]> {
  const church = await prisma.church.findUnique({
    where: { id: churchId },
    select: { id: true },
  })

  if (!church) {
    throw new NotFoundError('Church not found')
  }

  const photos = await prisma.churchPhoto.findMany({
    where: { churchId },
    orderBy: { displayOrder: 'asc' },
  })

  return photos.map((photo) => ({
    id: photo.id,
    churchId: photo.churchId,
    url: photo.url,
    altText: photo.altText,
    displayOrder: photo.displayOrder,
    createdAt: photo.createdAt,
  }))
}

/**
 * Uploads a photo for the given church. The file is already saved to disk by
 * multer; this function creates the database record and links it.
 */
export async function uploadChurchPhoto(
  userId: string,
  churchId: string,
  filename: string,
  altText: string | null,
): Promise<IChurchPhotoResult> {
  await authorizePhotoManager(userId, churchId)

  // Determine the next display order
  const maxOrder = await prisma.churchPhoto.aggregate({
    where: { churchId },
    _max: { displayOrder: true },
  })

  const nextOrder = (maxOrder._max.displayOrder ?? -1) + 1

  const photo = await prisma.churchPhoto.create({
    data: {
      churchId,
      url: `/uploads/church-photos/${filename}`,
      altText,
      displayOrder: nextOrder,
      uploadedById: userId,
    },
  })

  // Invalidate filter-options cache since hasPhotos counts may change
  invalidateFilterOptionsCache()

  return {
    id: photo.id,
    churchId: photo.churchId,
    url: photo.url,
    altText: photo.altText,
    displayOrder: photo.displayOrder,
    createdAt: photo.createdAt,
  }
}

/**
 * Updates the alt text of a church photo.
 */
export async function updateChurchPhoto(
  userId: string,
  photoId: string,
  altText: string | null,
): Promise<IChurchPhotoResult> {
  const existing = await prisma.churchPhoto.findUnique({
    where: { id: photoId },
    select: { id: true, churchId: true },
  })

  if (!existing) {
    throw new NotFoundError('Photo not found')
  }

  await authorizePhotoManager(userId, existing.churchId)

  const photo = await prisma.churchPhoto.update({
    where: { id: photoId },
    data: { altText },
  })

  return {
    id: photo.id,
    churchId: photo.churchId,
    url: photo.url,
    altText: photo.altText,
    displayOrder: photo.displayOrder,
    createdAt: photo.createdAt,
  }
}

/**
 * Reorders photos for a church. Accepts an array of { photoId, displayOrder }
 * pairs and updates them in a transaction.
 */
export async function reorderChurchPhotos(
  userId: string,
  churchId: string,
  ordering: IReorderPhotoInput[],
): Promise<IChurchPhotoResult[]> {
  await authorizePhotoManager(userId, churchId)

  // Validate that all photo IDs belong to this church
  const existingPhotos = await prisma.churchPhoto.findMany({
    where: { churchId },
    select: { id: true },
  })

  const existingIds = new Set(existingPhotos.map((p) => p.id))

  for (const item of ordering) {
    if (!existingIds.has(item.photoId)) {
      throw new AppError(
        400,
        'INVALID_PHOTO',
        `Photo ${item.photoId} does not belong to this church`,
      )
    }
  }

  // Apply all order updates in a transaction
  await prisma.$transaction(
    ordering.map((item) =>
      prisma.churchPhoto.update({
        where: { id: item.photoId },
        data: { displayOrder: item.displayOrder },
      }),
    ),
  )

  return getChurchPhotos(churchId)
}

/**
 * Deletes a church photo. Removes the DB record and attempts to delete the
 * file from disk. File deletion failures are logged but do not cause the
 * request to fail.
 */
export async function deleteChurchPhoto(
  userId: string,
  photoId: string,
): Promise<{ id: string; churchId: string }> {
  const existing = await prisma.churchPhoto.findUnique({
    where: { id: photoId },
    select: { id: true, churchId: true, url: true },
  })

  if (!existing) {
    throw new NotFoundError('Photo not found')
  }

  await authorizePhotoManager(userId, existing.churchId)

  await prisma.churchPhoto.delete({
    where: { id: photoId },
  })

  // Best-effort file cleanup for locally uploaded photos
  if (existing.url.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), existing.url)
    unlink(filePath).catch(() => {
      // File may already be gone or may be a Google-imported URL; ignore
    })
  }

  // Invalidate filter-options cache since hasPhotos counts may change
  invalidateFilterOptionsCache()

  return {
    id: photoId,
    churchId: existing.churchId,
  }
}
