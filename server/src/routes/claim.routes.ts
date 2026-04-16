import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { requireAuth } from '../middleware/require-auth.js'
import { requireSiteAdmin } from '../middleware/require-site-admin.js'
import { validate } from '../middleware/validate.js'
import {
  createChurchClaimSchema,
  CreateChurchClaimBody,
  resolveChurchClaimSchema,
  ResolveChurchClaimBody,
} from '../schemas/claim.schema.js'
import {
  createChurchClaim,
  getChurchAdmins,
  getPendingChurchClaims,
  removeChurchAdmin,
  resolveChurchClaim,
} from '../services/church-claim.service.js'

const router = Router()

router.post(
  '/churches/:id/claim',
  validate(createChurchClaimSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!
      const input = req.body as CreateChurchClaimBody

      logger.info({ churchId: id, userId }, 'Submitting church claim request')

      const result = await createChurchClaim(userId, id, input)

      res.status(201).json({
        data: result,
        message: 'Church claim request submitted successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.get(
  '/admin/claims',
  requireSiteAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Fetching pending church claim requests')

      const claims = await getPendingChurchClaims()

      res.json(claims)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.patch(
  '/admin/claims/:id',
  validate(resolveChurchClaimSchema),
  requireSiteAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!
      const input = req.body as ResolveChurchClaimBody

      logger.info(
        { claimId: id, moderatorUserId: userId, status: input.status },
        'Resolving church claim request',
      )

      const result = await resolveChurchClaim(id, userId, input)

      res.json({
        data: result,
        message:
          result.status === 'approved'
            ? 'Church claim approved successfully'
            : 'Church claim rejected',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

/**
 * GET /churches/:id/admins
 * List approved admins for a church. Requires auth — caller must be an admin of the church.
 */
router.get(
  '/churches/:id/admins',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      const admins = await getChurchAdmins(id, userId)

      res.json({ data: admins })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

/**
 * DELETE /churches/:id/admins/:userId
 * Remove an admin from a church. Only the primary claimant or site admins can remove.
 */
router.delete(
  '/churches/:id/admins/:adminUserId',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, adminUserId } = req.params
      const userId = req.session.userId!

      logger.info(
        { churchId: id, targetUserId: adminUserId, actorUserId: userId },
        'Removing church admin',
      )

      await removeChurchAdmin(id, userId, adminUserId)

      res.json({ message: 'Admin removed successfully' })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
