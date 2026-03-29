import { Router, Request, Response, NextFunction } from 'express'
import logger from '../lib/logger.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  churchDetailSchema,
  churchIdSchema,
  churchSearchSchema,
} from '../schemas/church.schema.js'
import { toggleSavedChurch } from '../services/saved-church.service.js'
import { searchChurches } from '../services/church.service.js'
import { getChurchDetailsBySlug } from '../services/church-detail.service.js'
import { ISearchParams } from '../types/church.types.js'

const router = Router()

/**
 * GET /api/v1/churches
 * Search and list churches with filtering, sorting, and pagination
 */
router.get(
  '/',
  validate(churchSearchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // After validation middleware, query values are already coerced to proper types
      const q = req.query as Record<string, unknown>
      const params: ISearchParams = {
        lat: q.lat as number | undefined,
        lng: q.lng as number | undefined,
        radius: q.radius as number | undefined,
        q: q.q as string | undefined,
        denomination: q.denomination as string | undefined,
        day: q.day as number | undefined,
        time: q.time as 'morning' | 'afternoon' | 'evening' | undefined,
        language: q.language as string | undefined,
        amenities: q.amenities as string | undefined,
        sort: q.sort as 'distance' | 'rating' | 'name' | undefined,
        page: q.page as number | undefined,
        pageSize: q.pageSize as number | undefined,
        bounds: q.bounds as string | undefined,
      }

      logger.info({ params }, 'Searching churches')

      const response = await searchChurches(params, req.session.userId)

      res.json(response)
      return
    } catch (error) {
      next(error)
      return
    }
  }
)

router.post(
  '/:id/save',
  validate(churchIdSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ churchId: id, userId }, 'Toggling saved church')

      const result = await toggleSavedChurch(userId, id)

      res.json({
        data: result,
        message: result.saved
          ? 'Church saved successfully'
          : 'Church removed from saved list',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

/**
 * GET /api/v1/churches/:slug
 * Get full details for a single church by slug
 */
router.get(
  '/:slug',
  validate(churchDetailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params
      logger.info({ slug }, 'Fetching church by slug')

      const church = await getChurchDetailsBySlug(slug, req.session.userId)

      if (!church) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Church with slug "${slug}" not found`,
          },
        })
        return
      }

      res.json({
        data: church,
      })
      return
    } catch (error) {
      next(error)
      return
    }
  }
)

export default router
