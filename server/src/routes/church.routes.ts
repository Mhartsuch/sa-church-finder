import { Router, Request, Response, NextFunction } from 'express'
import logger from '../lib/logger.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  ChurchUpdateBody,
  churchDetailSchema,
  churchEventsSchema,
  churchIdSchema,
  churchSearchSchema,
  churchUpdateSchema,
} from '../schemas/church.schema.js'
import { toggleSavedChurch } from '../services/saved-church.service.js'
import { searchChurches, getFilterOptions, updateChurch } from '../services/church.service.js'
import { getChurchDetailsBySlug } from '../services/church-detail.service.js'
import { listChurchEventsBySlug } from '../services/event.service.js'
import { ISearchParams } from '../types/church.types.js'
import { IUpdateChurchInput } from '../services/church.service.js'
import { ChurchEventType, IChurchEventFilters } from '../types/event.types.js'

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
        wheelchairAccessible: q.wheelchairAccessible as boolean | undefined,
        goodForChildren: q.goodForChildren as boolean | undefined,
        goodForGroups: q.goodForGroups as boolean | undefined,
        minRating: q.minRating as number | undefined,
        neighborhood: q.neighborhood as string | undefined,
        serviceType: q.serviceType as string | undefined,
        hasPhotos: q.hasPhotos as boolean | undefined,
        isClaimed: q.isClaimed as boolean | undefined,
        openNow: q.openNow as boolean | undefined,
        sort: q.sort as 'relevance' | 'distance' | 'rating' | 'name' | undefined,
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
  },
)

/**
 * GET /api/v1/churches/filter-options
 * Returns available filter values derived from actual database content
 */
router.get('/filter-options', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // `getFilterOptions` wraps the five underlying DISTINCT queries in a
    // 5-minute in-process cache so the common "search page cold load" path
    // doesn't thrash the database. See church.service.ts for the TTL details.
    const data = await getFilterOptions()
    res.json({ data })
    return
  } catch (error) {
    next(error)
    return
  }
})

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
        message: result.saved ? 'Church saved successfully' : 'Church removed from saved list',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

/**
 * PATCH /api/v1/churches/:id
 * Update editable church listing fields (church_admin or site_admin)
 */
router.patch(
  '/:id',
  validate(churchUpdateSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!
      const body = req.body as ChurchUpdateBody

      logger.info({ churchId: id, userId }, 'Updating church listing')

      const input: IUpdateChurchInput = {
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.email !== undefined ? { email: body.email } : {}),
        ...(body.website !== undefined ? { website: body.website } : {}),
        ...(body.pastorName !== undefined ? { pastorName: body.pastorName } : {}),
        ...(body.yearEstablished !== undefined ? { yearEstablished: body.yearEstablished } : {}),
        ...(body.languages !== undefined ? { languages: body.languages } : {}),
        ...(body.amenities !== undefined ? { amenities: body.amenities } : {}),
        ...(body.goodForChildren !== undefined ? { goodForChildren: body.goodForChildren } : {}),
        ...(body.goodForGroups !== undefined ? { goodForGroups: body.goodForGroups } : {}),
        ...(body.wheelchairAccessible !== undefined
          ? { wheelchairAccessible: body.wheelchairAccessible }
          : {}),
      }

      const church = await updateChurch(userId, id, input)

      res.json({
        data: church,
        message: 'Church updated successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.get(
  '/:slug/events',
  validate(churchEventsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { slug } = req.params
      const q = req.query as Record<string, unknown>
      const filters: IChurchEventFilters = {
        type: q.type as ChurchEventType | undefined,
        from: typeof q.from === 'string' ? new Date(q.from) : undefined,
        to: typeof q.to === 'string' ? new Date(q.to) : undefined,
        expand: typeof q.expand === 'boolean' ? q.expand : undefined,
      }

      logger.info({ slug, filters }, 'Fetching church events')

      const eventResponse = await listChurchEventsBySlug(slug, filters)

      if (!eventResponse) {
        res.status(404).json({
          error: {
            code: 'NOT_FOUND',
            message: `Church with slug "${slug}" not found`,
          },
        })
        return
      }

      res.json(eventResponse)
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
  },
)

export default router
