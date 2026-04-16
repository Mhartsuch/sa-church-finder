import { ClaimStatus, Role } from '@prisma/client'
import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import prisma from '../lib/prisma.js'
import { AppError } from '../middleware/error-handler.js'
import { requireAuth } from '../middleware/require-auth.js'
import { getChurchAnalytics } from '../services/analytics.service.js'

const router = Router()

/**
 * GET /api/v1/analytics/churches/:churchId
 * Get analytics for a single church.
 * Requires auth + user must be SITE_ADMIN or have an APPROVED claim on the church.
 */
router.get(
  '/churches/:churchId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { churchId } = req.params
      const userId = req.session.userId!

      // Authorization: SITE_ADMIN or approved claimant
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      if (!user) {
        next(new AppError(401, 'AUTH_ERROR', 'Not authenticated'))
        return
      }

      if (user.role !== Role.SITE_ADMIN) {
        const approvedClaim = await prisma.churchClaim.findFirst({
          where: {
            churchId,
            userId,
            status: ClaimStatus.APPROVED,
          },
          select: { id: true },
        })

        if (!approvedClaim) {
          next(
            new AppError(403, 'FORBIDDEN', 'You do not have permission to view analytics for this church'),
          )
          return
        }
      }

      logger.info({ churchId, userId }, 'Fetching church analytics')

      const analytics = await getChurchAnalytics(churchId)

      res.json({ data: analytics })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

/**
 * GET /api/v1/analytics/my-churches
 * Get analytics for all churches managed by the current user.
 * SITE_ADMIN sees all churches; others see only their approved claims.
 */
router.get(
  '/my-churches',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session.userId!

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      })

      if (!user) {
        next(new AppError(401, 'AUTH_ERROR', 'Not authenticated'))
        return
      }

      let churchIds: string[]

      if (user.role === Role.SITE_ADMIN) {
        // Site admins see all churches
        const churches = await prisma.church.findMany({
          select: { id: true },
        })
        churchIds = churches.map((c) => c.id)
      } else {
        // Regular users see only churches they have approved claims on
        const claims = await prisma.churchClaim.findMany({
          where: {
            userId,
            status: ClaimStatus.APPROVED,
          },
          select: { churchId: true },
        })
        churchIds = claims.map((c) => c.churchId)
      }

      logger.info({ userId, churchCount: churchIds.length }, 'Fetching analytics for managed churches')

      const analytics = await Promise.all(
        churchIds.map((churchId) => getChurchAnalytics(churchId)),
      )

      res.json({ data: analytics })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
