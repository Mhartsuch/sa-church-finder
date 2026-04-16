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
  deactivateAccountSchema,
  removeAvatarSchema,
  updateProfileSchema,
  uploadAvatarSchema,
  userClaimsSchema,
  userReviewsSchema,
  userSavedChurchesSchema,
  DeactivateAccountBody,
  UpdateProfileBody,
} from '../schemas/user.schema.js'
import { getUserChurchClaims } from '../services/church-claim.service.js'
import { getUserReviewHistory } from '../services/review.service.js'
import { getSavedChurchesForUser, SavedChurchSort } from '../services/saved-church.service.js'
import {
  deactivateAccount,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from '../services/user.service.js'
import { SESSION_COOKIE_NAME } from '../lib/session.js'

const router = Router()

const AVATAR_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'avatars')
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

if (!existsSync(AVATAR_UPLOAD_DIR)) {
  mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true })
}

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, AVATAR_UPLOAD_DIR)
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    cb(null, `${randomUUID()}${ext}`)
  },
})

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: MAX_AVATAR_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError(400, 'INVALID_FILE_TYPE', 'Only JPEG, PNG, WebP, and GIF images are allowed'))
    }
  },
})

function requireOwnProfile(req: Request, paramName: string = 'id'): void {
  const sessionUserId = req.session.userId
  const targetUserId = req.params[paramName]

  if (sessionUserId !== targetUserId) {
    throw new AppError(403, 'FORBIDDEN', 'You can only access your own profile')
  }
}

async function destroySession(req: Request): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    req.session.destroy((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}

// --- Existing routes ---

router.get(
  '/:id/saved',
  validate(userSavedChurchesSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      requireOwnProfile(req)

      const q = req.query as Record<string, unknown>

      logger.info({ userId: id }, 'Fetching saved churches')

      const result = await getSavedChurchesForUser(id, {
        sort: q.sort as SavedChurchSort | undefined,
        order: q.order as 'asc' | 'desc' | undefined,
        q: q.q as string | undefined,
        page: q.page as number | undefined,
        pageSize: q.pageSize as number | undefined,
      })

      res.json(result)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.get(
  '/:id/claims',
  validate(userClaimsSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      requireOwnProfile(req)

      logger.info({ userId: id }, 'Fetching user church claims')

      const claims = await getUserChurchClaims(id)

      res.json(claims)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.get(
  '/:id/reviews',
  validate(userReviewsSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      requireOwnProfile(req)

      logger.info({ userId: id }, 'Fetching user reviews')

      const reviews = await getUserReviewHistory(id)

      res.json(reviews)
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// --- Profile update ---

router.patch(
  '/:id/profile',
  validate(updateProfileSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      requireOwnProfile(req)

      const input = req.body as UpdateProfileBody

      logger.info({ userId: id }, 'Profile update request')

      const result = await updateProfile(id, input)

      res.json({
        data: result,
        message: result.emailChanged
          ? 'Profile updated. Please verify your new email address.'
          : 'Profile updated successfully.',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// --- Avatar upload ---

router.post(
  '/:id/avatar',
  validate(uploadAvatarSchema),
  requireAuth,
  (req: Request, res: Response, next: NextFunction) => {
    requireOwnProfile(req)

    avatarUpload.single('avatar')(req, res, async (uploadError) => {
      if (uploadError) {
        if (uploadError instanceof multer.MulterError) {
          if (uploadError.code === 'LIMIT_FILE_SIZE') {
            next(new AppError(400, 'FILE_TOO_LARGE', 'Avatar must be 5 MB or smaller'))
            return
          }

          next(new AppError(400, 'UPLOAD_ERROR', uploadError.message))
          return
        }

        next(uploadError)
        return
      }

      try {
        const { id } = req.params

        if (!req.file) {
          throw new AppError(400, 'NO_FILE', 'An avatar image file is required')
        }

        const user = await uploadAvatar(id, req.file.path, req.file.filename)

        res.json({
          data: user,
          message: 'Avatar uploaded successfully.',
        })
        return
      } catch (error) {
        next(error)
        return
      }
    })
  },
)

// --- Avatar removal ---

router.delete(
  '/:id/avatar',
  validate(removeAvatarSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      requireOwnProfile(req)

      logger.info({ userId: id }, 'Avatar removal request')

      const user = await removeAvatar(id)

      res.json({
        data: user,
        message: 'Avatar removed.',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

// --- Account deactivation ---

router.post(
  '/:id/deactivate',
  validate(deactivateAccountSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params

      requireOwnProfile(req)

      const input = req.body as DeactivateAccountBody

      logger.info({ userId: id }, 'Account deactivation request')

      await deactivateAccount(id, input)
      await destroySession(req)
      res.clearCookie(SESSION_COOKIE_NAME)

      res.json({
        data: null,
        message: 'Your account has been deactivated.',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

export default router
