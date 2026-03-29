import 'dotenv/config'
import cors from 'cors'
import express, { Express, Request, Response } from 'express'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'

import logger from './lib/logger.js'
import { createSessionMiddleware, resolveClientUrls } from './lib/session.js'
import { errorHandler } from './middleware/error-handler.js'
import authRoutes from './routes/auth.routes.js'
import churchRoutes from './routes/church.routes.js'
import reviewRoutes from './routes/review.routes.js'
import userRoutes from './routes/users.routes.js'

export const createApp = (): Express => {
  const app = express()
  const clientUrls = resolveClientUrls()

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

  app.use(helmet())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ limit: '10mb', extended: true }))
  app.use(
    cors({
      origin: clientUrls === '*' ? true : clientUrls,
      credentials: true,
    }),
  )
  app.use(createSessionMiddleware())
  app.use(pinoHttp({ logger }))

  app.get('/api/v1/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      version: process.env.APP_VERSION || 'dev',
      commit: process.env.GIT_COMMIT || 'unknown',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    })
  })

  app.use('/api/v1/churches', churchRoutes)
  app.use('/api/v1/auth', authRoutes)
  app.use('/api/v1/users', userRoutes)
  app.use('/api/v1', reviewRoutes)

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${req.method} ${req.path} not found`,
      },
    })
  })

  app.use(errorHandler)

  return app
}

const app = createApp()

export default app
