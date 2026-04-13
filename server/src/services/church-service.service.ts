import { ChurchService, Role } from '@prisma/client'

import prisma from '../lib/prisma.js'
import { AppError, NotFoundError } from '../middleware/error-handler.js'
import {
  IChurchServiceResult,
  ICreateChurchServiceInput,
  IUpdateChurchServiceInput,
} from '../types/review.types.js'

const mapChurchService = (service: ChurchService): IChurchServiceResult => ({
  id: service.id,
  churchId: service.churchId,
  dayOfWeek: service.dayOfWeek,
  startTime: service.startTime,
  endTime: service.endTime,
  serviceType: service.serviceType,
  language: service.language,
  description: service.description,
  isAutoImported: service.isAutoImported,
  createdAt: service.createdAt,
  updatedAt: service.updatedAt,
})

const authorizeServiceManager = async (userId: string, churchId: string): Promise<void> => {
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
    'You do not have permission to manage services for this church',
  )
}

export async function createChurchService(
  userId: string,
  churchId: string,
  input: ICreateChurchServiceInput,
): Promise<IChurchServiceResult> {
  await authorizeServiceManager(userId, churchId)

  const service = await prisma.churchService.create({
    data: {
      churchId,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime ?? null,
      serviceType: input.serviceType,
      language: input.language ?? 'English',
      description: input.description ?? null,
      isAutoImported: false,
    },
  })

  return mapChurchService(service)
}

export async function updateChurchService(
  userId: string,
  serviceId: string,
  input: IUpdateChurchServiceInput,
): Promise<IChurchServiceResult> {
  const existingService = await prisma.churchService.findUnique({
    where: { id: serviceId },
    select: { id: true, churchId: true },
  })

  if (!existingService) {
    throw new NotFoundError('Church service not found')
  }

  await authorizeServiceManager(userId, existingService.churchId)

  const service = await prisma.churchService.update({
    where: { id: serviceId },
    data: {
      ...(input.dayOfWeek !== undefined ? { dayOfWeek: input.dayOfWeek } : {}),
      ...(input.startTime !== undefined ? { startTime: input.startTime } : {}),
      ...(input.endTime !== undefined ? { endTime: input.endTime } : {}),
      ...(input.serviceType !== undefined ? { serviceType: input.serviceType } : {}),
      ...(input.language !== undefined ? { language: input.language } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    },
  })

  return mapChurchService(service)
}

export async function deleteChurchService(
  userId: string,
  serviceId: string,
): Promise<{ id: string; churchId: string }> {
  const existingService = await prisma.churchService.findUnique({
    where: { id: serviceId },
    select: { id: true, churchId: true },
  })

  if (!existingService) {
    throw new NotFoundError('Church service not found')
  }

  await authorizeServiceManager(userId, existingService.churchId)

  await prisma.churchService.delete({
    where: { id: serviceId },
  })

  return {
    id: serviceId,
    churchId: existingService.churchId,
  }
}
