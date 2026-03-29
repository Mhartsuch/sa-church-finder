import { NextFunction, Request, Response, Router } from 'express'

import { SESSION_COOKIE_NAME } from '../lib/session.js'
import logger from '../lib/logger.js'
import { AuthError } from '../middleware/error-handler.js'
import { validate } from '../middleware/validate.js'
import {
  AuthLoginBody,
  AuthRegisterBody,
  authLoginSchema,
  authRegisterSchema,
} from '../schemas/auth.schema.js'
import {
  authenticateUser,
  getCurrentUser,
  registerUser,
} from '../services/auth.service.js'

const router = Router()

async function establishSession(req: Request, userId: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error)
        return
      }

      req.session.userId = userId
      req.session.save((saveError) => {
        if (saveError) {
          reject(saveError)
          return
        }

        resolve()
      })
    })
  })
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

router.post(
  '/register',
  validate(authRegisterSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as AuthRegisterBody
      logger.info({ email: input.email }, 'User registration attempt')

      const user = await registerUser(input)
      await establishSession(req, user.id)

      res.status(201).json({
        data: user,
        message: 'Registration successful',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/login',
  validate(authLoginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as AuthLoginBody
      logger.info({ email: input.email }, 'User login attempt')

      const user = await authenticateUser(input)
      await establishSession(req, user.id)

      res.json({
        data: user,
        message: 'Login successful',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info({ userId: req.session.userId ?? null }, 'User logout')

    await destroySession(req)
    res.clearCookie(SESSION_COOKIE_NAME)
    res.json({
      data: null,
      message: 'Logout successful',
    })
    return
  } catch (error) {
    next(error)
    return
  }
})

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.userId) {
      throw new AuthError('Not authenticated')
    }

    logger.info({ userId: req.session.userId }, 'Fetching current user')

    const user = await getCurrentUser(req.session.userId)

    if (!user) {
      await destroySession(req)
      res.clearCookie(SESSION_COOKIE_NAME)
      throw new AuthError('Not authenticated')
    }

    res.json({
      data: user,
    })
    return
  } catch (error) {
    next(error)
    return
  }
})

export default router
