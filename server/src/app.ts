import 'dotenv/config'
import cors from 'cors'
import express, { Express, Request, Response } from 'express'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'

import { getPublicServerIntegrationStatus } from './lib/integration-status.js'
import logger from './lib/logger.js'
import prisma from './lib/prisma.js'
import { createSessionMiddleware, resolveClientUrls } from './lib/session.js'
import { initializeServerSentry } from './lib/sentry.js'
import { errorHandler } from './middleware/error-handler.js'
import authRoutes from './routes/auth.routes.js'
import churchRoutes from './routes/church.routes.js'
import churchServiceRoutes from './routes/church-service.routes.js'
import claimRoutes from './routes/claim.routes.js'
import collectionRoutes from './routes/collection.routes.js'
import eventRoutes from './routes/event.routes.js'
import passportRoutes from './routes/passport.routes.js'
import reviewRoutes from './routes/review.routes.js'
import sitemapRoutes from './routes/sitemap.routes.js'
import userRoutes from './routes/users.routes.js'
import visitRoutes from './routes/visit.routes.js'

initializeServerSentry()

export const createApp = (): Express => {
  const app = express()
  const clientUrls = resolveClientUrls()

  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

  app.use(
    helmet({
      hsts: {
        maxAge: 63072000, // 2 years
        includeSubDomains: true,
        preload: true,
      },
      contentSecurityPolicy: false, // CSP handled by frontend host (Render/Vercel)
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      frameguard: { action: 'deny' },
    }),
  )
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ limit: '10mb', extended: true }))
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true)
        if (clientUrls === '*') return callback(null, true)
        if (clientUrls.includes(origin)) return callback(null, true)
        if (/\.vercel\.app$/.test(origin)) return callback(null, true)
        callback(new Error(`CORS: origin ${origin} not allowed`))
      },
      credentials: true,
    }),
  )
  app.use(createSessionMiddleware())
  app.use(pinoHttp({ logger }))

  app.get('/api/v1/health', async (_req: Request, res: Response) => {
    let dbStatus: { connected: boolean; latencyMs?: number; error?: string } = {
      connected: false,
    }

    try {
      const start = Date.now()
      await prisma.$queryRaw`SELECT 1`
      dbStatus = { connected: true, latencyMs: Date.now() - start }
    } catch (err) {
      dbStatus = {
        connected: false,
        error: err instanceof Error ? err.message : 'Unknown database error',
      }
    }

    const status = dbStatus.connected ? 'ok' : 'degraded'

    res.status(dbStatus.connected ? 200 : 503).json({
      status,
      version: process.env.APP_VERSION || 'dev',
      commit: process.env.GIT_COMMIT || 'unknown',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus,
      integrations: getPublicServerIntegrationStatus(),
    })
  })

  app.use('/api/v1/churches', churchRoutes)
  app.use('/api/v1/auth', authRoutes)
  app.use('/api/v1/users', userRoutes)
  app.use('/api/v1/users', passportRoutes)
  app.use('/api/v1', churchServiceRoutes)
  app.use('/api/v1', claimRoutes)
  app.use('/api/v1', collectionRoutes)
  app.use('/api/v1', eventRoutes)
  app.use('/api/v1', reviewRoutes)
  app.use('/api/v1', visitRoutes)
  app.use(sitemapRoutes)

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
