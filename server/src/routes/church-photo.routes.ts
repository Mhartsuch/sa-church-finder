import { randomUUID } from 'crypto'
import { existsSync, mkdirSync } from 'fs'
import multer from 'multer'
import path from 'path'
import { NextFunction, Request, Response, Router } from 'express'

import logger from '../lib/logger.js'
import { AppError } from '../middleware/error-handler.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  churchPhotoParamsSchema,
  deleteChurchPhotoSchema,
  reorderChurchPhotosSchema,
  updateChurchPhotoSchema,
  uploadChurchPhotoSchema,
  ReorderChurchPhotosBody,
  UpdateChurchPhotoBody,
} from '../schemas/church-photo.schema.js'
import {
  deleteChurchPhoto,
  getChurchPhotos,
  reorderChurchPhotos,
  updateChurchPhoto,
  uploadChurchPhoto,
} from '../services/church-photo.service.js'

const router = Router()

const PHOTO_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'church-photos')
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

if (!existsSync(PHOTO_UPLOAD_DIR)) {
  mkdirSync(PHOTO_UPLOAD_DIR, { recursive: true })
}

const photoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PHOTO_UPLOAD_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, `${randomUUID()}${ext}`)
  },
})

const photoUpload = multer({
  storage: photoStorage,
  limits: {
    fileSize: MAX_PHOTO_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG, and WebP images are allowed'))
    }
  },
})

// GET /churches/:churchId/photos — list all photos for a church
router.get(
  '/churches/:churchId/photos',
  validate(churchPhotoParamsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { churchId } = req.params
      const photos = await getChurchPhotos(churchId)

      res.json({
        data: photos,
        meta: { total: photos.length },
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// POST /churches/:churchId/photos — upload a new photo
router.post(
  '/churches/:churchId/photos',
  validate(uploadChurchPhotoSchema),
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    photoUpload.single('photo')(req, res, async (uploadError) => {
      if (uploadError) {
        if (uploadError instanceof multer.MulterError) {
          if (uploadError.code === 'LIMIT_FILE_SIZE') {
            next(new AppError(400, 'FILE_TOO_LARGE', 'Photo must be 10 MB or smaller'))
            return
          }

          next(new AppError(400, 'UPLOAD_ERROR', uploadError.message))
          return
        }

        next(uploadError)
        return
      }

      try {
        const { churchId } = req.params
        const userId = req.session.userId!

        if (!req.file) {
          throw new AppError(400, 'NO_FILE', 'A photo image file is required')
        }

        const altText = typeof req.body.altText === 'string' ? req.body.altText.trim() : null

        logger.info({ churchId, userId, filename: req.file.filename }, 'Uploading church photo')

        const photo = await uploadChurchPhoto(userId, churchId, req.file.filename, altText)

        res.status(201).json({
          data: photo,
          message: 'Photo uploaded successfully',
        })
        return
      } catch (error) {
        next(error)
        return
      }
    })
  },
)

// PATCH /churches/photos/:photoId — update alt text
router.patch(
  '/churches/photos/:photoId',
  validate(updateChurchPhotoSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { photoId } = req.params
      const userId = req.session.userId!
      const input = req.body as UpdateChurchPhotoBody

      logger.info({ photoId, userId }, 'Updating church photo')

      const photo = await updateChurchPhoto(userId, photoId, input.altText)

      res.json({
        data: photo,
        message: 'Photo updated successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// PUT /churches/:churchId/photos/reorder — reorder photos
router.put(
  '/churches/:churchId/photos/reorder',
  validate(reorderChurchPhotosSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { churchId } = req.params
      const userId = req.session.userId!
      const input = req.body as ReorderChurchPhotosBody

      logger.info({ churchId, userId, count: input.ordering.length }, 'Reordering church photos')

      const photos = await reorderChurchPhotos(userId, churchId, input.ordering)

      res.json({
        data: photos,
        message: 'Photos reordered successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// DELETE /churches/photos/:photoId — delete a photo
router.delete(
  '/churches/photos/:photoId',
  validate(deleteChurchPhotoSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { photoId } = req.params
      const userId = req.session.userId!

      logger.info({ photoId, userId }, 'Deleting church photo')

      const result = await deleteChurchPhoto(userId, photoId)

      res.json({
        data: result,
        message: 'Photo deleted successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
