import { randomBytes } from 'crypto'
import { NextFunction, Request, Response, Router } from 'express'

import { resolveClientUrls, SESSION_COOKIE_NAME } from '../lib/session.js'
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
  authenticateGoogleUser,
  getCurrentUser,
  isGoogleOAuthConfigured,
  requestEmailVerification,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} from '../services/auth.service.js'

const router = Router()
const DEFAULT_AUTH_RETURN_TO = '/account'
const GOOGLE_OAUTH_AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_OAUTH_SCOPE = 'openid email profile'
const AUTH_RETURN_TO_BLOCKLIST = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
])

async function saveSession(req: Request): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })
}

async function establishSession(req: Request, userId: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) {
        reject(error)
        return
      }

      req.session.userId = userId
      saveSession(req).then(resolve).catch(reject)
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

function resolveClientBaseUrl(): string {
  const clientUrls = resolveClientUrls()

  if (clientUrls === '*' || clientUrls.length === 0) {
    return 'http://localhost:5173'
  }

  return clientUrls[0]
}

function sanitizeReturnTo(value: unknown): string {
  if (typeof value !== 'string') {
    return DEFAULT_AUTH_RETURN_TO
  }

  const trimmedValue = value.trim()

  if (!trimmedValue.startsWith('/') || trimmedValue.startsWith('//')) {
    return DEFAULT_AUTH_RETURN_TO
  }

  try {
    const parsedUrl = new URL(trimmedValue, 'http://localhost')
    const normalizedPath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`

    if (AUTH_RETURN_TO_BLOCKLIST.has(parsedUrl.pathname)) {
      return DEFAULT_AUTH_RETURN_TO
    }

    return normalizedPath || DEFAULT_AUTH_RETURN_TO
  } catch {
    return DEFAULT_AUTH_RETURN_TO
  }
}

function buildClientRedirectUrl(
  pathname: string,
  query: Record<string, string | undefined> = {},
): string {
  const clientRedirectUrl = new URL(pathname, resolveClientBaseUrl())

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      clientRedirectUrl.searchParams.set(key, value)
    }
  })

  return clientRedirectUrl.toString()
}

function resolveGoogleCallbackUrl(req: Request): string {
  const configuredCallbackUrl = process.env.GOOGLE_CALLBACK_URL?.trim()

  if (configuredCallbackUrl) {
    return configuredCallbackUrl
  }

  return new URL(
    '/api/v1/auth/google/callback',
    `${req.protocol}://${req.get('host')}`,
  ).toString()
}

function buildGoogleAuthorizationUrl(req: Request, state: string): string {
  const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()

  if (!googleClientId) {
    throw new AuthError('Google sign-in is not configured')
  }

  const googleAuthUrl = new URL(GOOGLE_OAUTH_AUTHORIZE_URL)

  googleAuthUrl.searchParams.set('client_id', googleClientId)
  googleAuthUrl.searchParams.set('redirect_uri', resolveGoogleCallbackUrl(req))
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', GOOGLE_OAUTH_SCOPE)
  googleAuthUrl.searchParams.set('state', state)
  googleAuthUrl.searchParams.set('prompt', 'select_account')
  googleAuthUrl.searchParams.set('include_granted_scopes', 'true')

  return googleAuthUrl.toString()
}

async function storeGoogleOAuthRequest(
  req: Request,
  state: string,
  returnTo: string,
): Promise<void> {
  req.session.googleOAuthState = state
  req.session.googleOAuthReturnTo = returnTo

  await saveSession(req)
}

async function consumeGoogleOAuthRequest(req: Request): Promise<{
  state?: string
  returnTo: string
}> {
  const state = req.session.googleOAuthState
  const returnTo = sanitizeReturnTo(req.session.googleOAuthReturnTo)

  delete req.session.googleOAuthState
  delete req.session.googleOAuthReturnTo

  await saveSession(req)

  return {
    state,
    returnTo,
  }
}

function redirectToLoginWithGoogleError(
  res: Response,
  authError: string,
  returnTo: string,
): void {
  res.redirect(
    buildClientRedirectUrl('/login', {
      authError,
      returnTo,
    }),
  )
}

router.get('/google', async (req: Request, res: Response) => {
  const returnTo = sanitizeReturnTo(req.query.returnTo)

  if (!isGoogleOAuthConfigured()) {
    logger.warn('Google OAuth start requested without required configuration')
    redirectToLoginWithGoogleError(res, 'google_unavailable', returnTo)
    return
  }

  try {
    const state = randomBytes(24).toString('base64url')

    await storeGoogleOAuthRequest(req, state, returnTo)
    res.redirect(buildGoogleAuthorizationUrl(req, state))
    return
  } catch (error) {
    logger.error({ err: error }, 'Failed to start Google OAuth flow')
    redirectToLoginWithGoogleError(res, 'google_failed', returnTo)
    return
  }
})

router.get('/google/callback', async (req: Request, res: Response) => {
  let returnTo = DEFAULT_AUTH_RETURN_TO

  try {
    const storedOAuthRequest = await consumeGoogleOAuthRequest(req)
    const googleError =
      typeof req.query.error === 'string' ? req.query.error : null
    const state = typeof req.query.state === 'string' ? req.query.state : null
    const code = typeof req.query.code === 'string' ? req.query.code : null

    returnTo = storedOAuthRequest.returnTo

    if (googleError) {
      logger.warn({ googleError }, 'Google OAuth callback returned an error')
      redirectToLoginWithGoogleError(
        res,
        googleError === 'access_denied' ? 'google_denied' : 'google_failed',
        returnTo,
      )
      return
    }

    if (!state || !storedOAuthRequest.state || state !== storedOAuthRequest.state) {
      logger.warn('Google OAuth callback rejected because the session state was invalid')
      redirectToLoginWithGoogleError(res, 'google_session_expired', returnTo)
      return
    }

    if (!code) {
      logger.warn('Google OAuth callback rejected because the authorization code was missing')
      redirectToLoginWithGoogleError(res, 'google_failed', returnTo)
      return
    }

    const user = await authenticateGoogleUser({
      code,
      redirectUri: resolveGoogleCallbackUrl(req),
    })

    await establishSession(req, user.id)
    res.redirect(buildClientRedirectUrl(returnTo))
    return
  } catch (error) {
    logger.error({ err: error }, 'Failed to complete Google OAuth callback')
    redirectToLoginWithGoogleError(res, 'google_failed', returnTo)
    return
  }
})

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
