import { Router, Request, Response, NextFunction } from 'express'
import logger from '../lib/logger.js'

const router = Router()

// POST /api/v1/auth/register - Register a new user
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name } = req.body
    logger.info({ email }, 'User registration attempt')

    res.status(201).json({
      data: {
        id: '1',
        email,
        name,
        role: 'user',
        createdAt: new Date().toISOString(),
      },
      message: 'Registration successful',
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/v1/auth/login - Login user
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body
    logger.info({ email }, 'User login attempt')

    res.json({
      data: {
        id: '1',
        email,
        name: 'John Doe',
        role: 'user',
      },
      token: 'placeholder-jwt-token',
      message: 'Login successful',
    })
  } catch (error) {
    next(error)
  }
})

// POST /api/v1/auth/logout - Logout user
router.post('/logout', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('User logout')

    res.json({
      message: 'Logout successful',
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/v1/auth/me - Get current user
router.get('/me', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    logger.info('Fetching current user')

    res.json({
      data: {
        id: '1',
        email: 'user@example.com',
        name: 'John Doe',
        role: 'user',
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    next(error)
  }
})

export default router
