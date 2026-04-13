import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { requireSiteAdmin } from '../middleware/require-site-admin.js'
import { validate } from '../middleware/validate.js'
import {
  AutoGenerateRibbonCategoriesBody,
  CreateRibbonCategoryBody,
  ReorderRibbonCategoriesBody,
  UpdateRibbonCategoryBody,
  autoGenerateRibbonCategoriesSchema,
  createRibbonCategorySchema,
  reorderRibbonCategoriesSchema,
  ribbonCategoryIdSchema,
  updateRibbonCategorySchema,
} from '../schemas/ribbon-category.schema.js'
import {
  autoGenerateRibbonCategories,
  createRibbonCategory,
  deleteRibbonCategory,
  getAllRibbonCategories,
  getVisibleRibbonCategories,
  reorderRibbonCategories,
  updateRibbonCategory,
} from '../services/ribbon-category.service.js'
import type {
  IAutoGenerateInput,
  ICreateRibbonCategoryInput,
  IUpdateRibbonCategoryInput,
} from '../types/ribbon-category.types.js'

const router = Router()

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

router.get(
  '/ribbon-categories',
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await getVisibleRibbonCategories()
      res.json({ data })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

router.get(
  '/admin/ribbon-categories',
  requireSiteAdmin,
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      logger.info('Fetching all ribbon categories (admin)')
      const data = await getAllRibbonCategories()
      res.json({ data })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/admin/ribbon-categories',
  validate(createRibbonCategorySchema),
  requireSiteAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as CreateRibbonCategoryBody
      const input: ICreateRibbonCategoryInput = {
        label: body.label,
        icon: body.icon,
        slug: body.slug,
        filterType: body.filterType,
        filterValue: body.filterValue,
        position: body.position,
        isVisible: body.isVisible,
        isPinned: body.isPinned,
      }

      logger.info({ label: input.label }, 'Creating ribbon category')
      const data = await createRibbonCategory(input)

      res.status(201).json({
        data,
        message: 'Ribbon category created successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.patch(
  '/admin/ribbon-categories/:id',
  validate(updateRibbonCategorySchema),
  requireSiteAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params
      const body = req.body as UpdateRibbonCategoryBody
      const input: IUpdateRibbonCategoryInput = {
        label: body.label,
        icon: body.icon,
        filterType: body.filterType,
        filterValue: body.filterValue,
        position: body.position,
        isVisible: body.isVisible,
        isPinned: body.isPinned,
      }

      logger.info({ id }, 'Updating ribbon category')
      const data = await updateRibbonCategory(id, input)

      res.json({
        data,
        message: 'Ribbon category updated successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.delete(
  '/admin/ribbon-categories/:id',
  validate(ribbonCategoryIdSchema),
  requireSiteAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      logger.info({ id }, 'Deleting ribbon category')
      const data = await deleteRibbonCategory(id)

      res.json({
        data,
        message: 'Ribbon category deleted successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/admin/ribbon-categories/reorder',
  validate(reorderRibbonCategoriesSchema),
  requireSiteAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { ids } = req.body as ReorderRibbonCategoriesBody

      logger.info({ count: ids.length }, 'Reordering ribbon categories')
      const data = await reorderRibbonCategories(ids)

      res.json({
        data,
        message: 'Ribbon categories reordered successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/admin/ribbon-categories/auto-generate',
  validate(autoGenerateRibbonCategoriesSchema),
  requireSiteAdmin,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body as AutoGenerateRibbonCategoriesBody
      const input: IAutoGenerateInput = { limit: body.limit }

      logger.info({ limit: input.limit }, 'Auto-generating ribbon categories')
      const data = await autoGenerateRibbonCategories(input)

      res.json({
        data,
        message: `Auto-generation complete: ${data.created} created, ${data.updated} updated, ${data.removed} removed`,
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
