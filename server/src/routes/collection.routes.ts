import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  addChurchToCollectionSchema,
  collectionIdSchema,
  createCollectionSchema,
  removeChurchFromCollectionSchema,
  updateCollectionSchema,
} from '../schemas/collection.schema.js'
import {
  addChurchToCollection,
  createCollection,
  deleteCollection,
  getCollection,
  removeChurchFromCollection,
  updateCollection,
} from '../services/collection.service.js'

const router = Router()

// POST /collections — Create a new collection
router.post(
  '/collections',
  validate(createCollectionSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session.userId!

      logger.info({ userId }, 'Creating collection')

      const collection = await createCollection(userId, req.body)

      res.status(201).json({
        data: collection,
        message: 'Collection created successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// GET /collections/:id — Get a collection with churches
router.get(
  '/collections/:id',
  validate(collectionIdSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const viewerId = req.session.userId

      const collection = await getCollection(id, viewerId)

      res.json({
        data: collection,
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// PATCH /collections/:id — Update a collection
router.patch(
  '/collections/:id',
  validate(updateCollectionSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ userId, collectionId: id }, 'Updating collection')

      const collection = await updateCollection(id, userId, req.body)

      res.json({
        data: collection,
        message: 'Collection updated successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// DELETE /collections/:id — Delete a collection
router.delete(
  '/collections/:id',
  validate(collectionIdSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const userId = req.session.userId!

      logger.info({ userId, collectionId: id }, 'Deleting collection')

      await deleteCollection(id, userId)

      res.json({
        data: { id },
        message: 'Collection deleted successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// POST /collections/:id/churches/:churchId — Add church to collection
router.post(
  '/collections/:id/churches/:churchId',
  validate(addChurchToCollectionSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: collectionId, churchId } = req.params
      const userId = req.session.userId!

      logger.info({ userId, collectionId, churchId }, 'Adding church to collection')

      const church = await addChurchToCollection(collectionId, churchId, userId, req.body.notes)

      res.status(201).json({
        data: church,
        message: 'Church added to collection',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// DELETE /collections/:id/churches/:churchId — Remove church from collection
router.delete(
  '/collections/:id/churches/:churchId',
  validate(removeChurchFromCollectionSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: collectionId, churchId } = req.params
      const userId = req.session.userId!

      logger.info({ userId, collectionId, churchId }, 'Removing church from collection')

      await removeChurchFromCollection(collectionId, churchId, userId)

      res.json({
        data: { collectionId, churchId },
        message: 'Church removed from collection',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
