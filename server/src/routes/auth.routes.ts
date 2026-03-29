import { NextFunction, Request, Response, Router } from 'express'

import { SESSION_COOKIE_NAME } from '../lib/session.js'
import logger from '../lib/logger.js'
import { AuthError } from '../middleware/error-handler.js'
import { requireAuth } from '../middleware/require-auth.js'
import { validate } from '../middleware/validate.js'
import {
  AuthForgotPasswordBody,
  AuthLoginBody,
  AuthRegisterBody,
  AuthResetPasswordBody,
  AuthVerifyEmailBody,
  authForgotPasswordSchema,
  authLoginSchema,
  authRegisterSchema,
  authResendVerificationSchema,
  authResetPasswordSchema,
  authVerifyEmailSchema,
} from '../schemas/auth.schema.js'
import {
  authenticateUser,
  getCurrentUser,
  requestEmailVerification,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
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
  '/verify-email/resend',
  validate(authResendVerificationSchema),
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session.userId!
      logger.info({ userId }, 'Email verification resend request received')

      const result = await requestEmailVerification(userId)

      res.json({
        data: result,
        message:
          result.status === 'already-verified'
            ? 'Email is already verified'
            : 'Verification instructions are on the way.',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/verify-email',
  validate(authVerifyEmailSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as AuthVerifyEmailBody
      logger.info('Email verification submission received')

      const result = await verifyEmail(input)

      res.json({
        data: result,
        message:
          result.status === 'already-verified'
            ? 'Email already verified'
            : 'Email verified successfully',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/forgot-password',
  validate(authForgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as AuthForgotPasswordBody
      logger.info({ email: input.email }, 'Password reset request received')

      const result = await requestPasswordReset(input)

      res.json({
        data: result,
        message: 'If an account exists for that email, password reset instructions are on the way.',
      })
      return
    } catch (error) {
      next(error)
      return
    }
  },
)

router.post(
  '/reset-password',
  validate(authResetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = req.body as AuthResetPasswordBody
      logger.info('Password reset submission received')

      await resetPassword(input)

      res.json({
        data: null,
        message: 'Password reset successful',
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
