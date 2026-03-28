import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { pinoHttp } from 'pino-http'

import logger from './lib/logger.js'
import prisma from './lib/prisma.js'
import { errorHandler } from './middleware/error-handler.js'
import churchRoutes from './routes/church.routes.js'
import authRoutes from './routes/auth.routes.js'

const app = express()
const port = process.env.PORT || 3001
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

// Middleware
app.use(helmet())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
app.use(
  cors({
    origin: clientUrl === '*' ? true : clientUrl,
    credentials: true,
  }),
)
app.use(pinoHttp({ logger }))

// Health check endpoint (used by CI/CD health checks and rollback verification)
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

// Routes
app.use('/api/v1/churches', churchRoutes)
app.use('/api/v1/auth', authRoutes)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Start server
const server = app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`)
  logger.info(`Client URL: ${clientUrl}`)
})

// Graceful shutdown
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing gracefully...')
  server.close(async () => {
    await prisma.$disconnect()
    logger.info('Server closed')
    process.exit(0)
  })

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error(error, 'Uncaught Exception')
  process.exit(1)
})

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(reason, 'Unhandled Rejection')
  process.exit(1)
})

export default app
