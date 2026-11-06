import { Router, Request, Response, NextFunction } from 'express'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import { churchDetailSchema, churchIdSchema, churchSearchSchema } from '../schemas/church.schema.js'
import { getChurchBySlug, getFilterOptions, searchChurches } from '../services/church.service.js'
import { toggleSavedChurch } from '../services/saved-church.service.js'
import { NotFoundError } from '../middleware/error-handler.js'
import { ISearchParams } from '../types/church.types.js'

const router = Router()

/** GET /api/v1/churches — search with filters, sorting and pagination */
router.get(
  '/',
  validate(churchSearchSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validation has already coerced the query into ISearchParams.
      const params = req.query as unknown as ISearchParams
      res.json(await searchChurches(params, req.session.userId))
    } catch (error) {
      next(error)
    }
  },
)

/** GET /api/v1/churches/filter-options */
router.get('/filter-options', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ data: await getFilterOptions() })
  } catch (error) {
    next(error)
  }
})

/** POST /api/v1/churches/:id/save — toggle saved state */
router.post(
  '/:id/save',
  validate(churchIdSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({ data: await toggleSavedChurch(req.session.userId!, req.params.id) })
    } catch (error) {
      next(error)
    }
  },
)

/** GET /api/v1/churches/:slug — full church profile */
router.get(
  '/:slug',
  validate(churchDetailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const church = await getChurchBySlug(req.params.slug, req.session.userId)
      if (!church) throw new NotFoundError(`Church with slug "${req.params.slug}" not found`)
      res.json({ data: church })
    } catch (error) {
      next(error)
    }
  },
)

export default router
