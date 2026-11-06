import prisma from '../lib/prisma.js'
import { NotFoundError } from '../middleware/error-handler.js'
import { ISavedChurch } from '../types/church.types.js'
import { churchSummaryInclude, toChurchSummary } from './church.service.js'

export async function toggleSavedChurch(
  userId: string,
  churchId: string,
): Promise<{ churchId: string; saved: boolean }> {
  const church = await prisma.church.findUnique({ where: { id: churchId }, select: { id: true } })
  if (!church) throw new NotFoundError('Church not found')

  const key = { userId_churchId: { userId, churchId } }
  const existing = await prisma.userSavedChurch.findUnique({
    where: key,
    select: { churchId: true },
  })

  if (existing) {
    await prisma.userSavedChurch.delete({ where: key })
    return { churchId, saved: false }
  }

  await prisma.userSavedChurch.create({ data: { userId, churchId } })
  return { churchId, saved: true }
}

export interface ISavedChurchesResponse {
  data: ISavedChurch[]
  meta: { page: number; pageSize: number; total: number; totalPages: number }
}

export async function getSavedChurchesForUser(
  userId: string,
  { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {},
): Promise<ISavedChurchesResponse> {
  const [total, saved] = await Promise.all([
    prisma.userSavedChurch.count({ where: { userId } }),
    prisma.userSavedChurch.findMany({
      where: { userId },
      orderBy: { savedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { church: { include: churchSummaryInclude(userId) } },
    }),
  ])

  return {
    data: saved.map(({ church, savedAt }) => ({
      ...toChurchSummary(church),
      isSaved: true,
      savedAt,
    })),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  }
}
