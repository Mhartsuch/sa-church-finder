import { NextFunction, Request, Response, Router } from 'express'

import { validate } from '../middleware/validate.js'
import { userCollectionsSchema, userPassportSchema } from '../schemas/collection.schema.js'
import { userVisitsSchema } from '../schemas/visit.schema.js'
import { getUserCollections } from '../services/collection.service.js'
import { getPassport } from '../services/passport.service.js'
import { getUserVisits } from '../services/visit.service.js'

const router = Router()

// GET /users/:id/passport — Get a user's passport (public)
router.get(
  '/:id/passport',
  validate(userPassportSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      const passport = await getPassport(id)

      res.json({
        data: passport,
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// GET /users/:id/visits — Get a user's visits (public)
router.get(
  '/:id/visits',
  validate(userVisitsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const page = Number(req.query.page) || 1
      const pageSize = Number(req.query.pageSize) || 20

      const { visits, total } = await getUserVisits(id, page, pageSize)

      res.json({
        data: visits,
        meta: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// GET /users/:id/collections — Get a user's collections
router.get(
  '/:id/collections',
  validate(userCollectionsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const viewerId = req.session.userId

      const collections = await getUserCollections(id, viewerId)

      res.json({
        data: collections,
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
