import http from 'http'

import app from './app.js'
import { getServerIntegrationStatus } from './lib/integration-status.js'
import logger from './lib/logger.js'
import prisma from './lib/prisma.js'
import { resolveClientUrls } from './lib/session.js'
import { captureServerException, flushServerSentry, initializeServerSentry } from './lib/sentry.js'

const port = process.env.PORT || 3001
const clientUrls = resolveClientUrls()
const integrationStatus = getServerIntegrationStatus()

initializeServerSentry()

async function verifyDatabaseConnection(): Promise<void> {
  const start = Date.now()
  await prisma.$queryRaw`SELECT 1`
  logger.info({ latencyMs: Date.now() - start }, 'Database connection verified')
}

const server = http.createServer(app)

async function start(): Promise<void> {
  try {
    await verifyDatabaseConnection()
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to database on startup')
    process.exit(1)
  }

  server.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}`)
    logger.info(`Client URL: ${clientUrls === '*' ? '*' : clientUrls.join(', ')}`)

    if (process.env.NODE_ENV === 'production') {
      if (!integrationStatus.emailDelivery.configured) {
        logger.warn(
          {
            missingFields: integrationStatus.emailDelivery.missingFields,
            status: integrationStatus.emailDelivery.status,
          },
          integrationStatus.emailDelivery.status === 'partial'
            ? 'SMTP email delivery is only partially configured'
            : 'SMTP email delivery is not configured; auth emails will not send',
        )
      }

      if (integrationStatus.googleOAuth.status === 'partial') {
        logger.warn(
          {
            missingFields: integrationStatus.googleOAuth.missingFields,
          },
          'Google OAuth is only partially configured',
        )
      } else if (!integrationStatus.googleOAuth.configured) {
        logger.info('Google OAuth is not configured in this environment')
      }

      if (integrationStatus.errorMonitoring.status === 'partial') {
        logger.warn(
          {
            missingFields: integrationStatus.errorMonitoring.missingFields,
          },
          'Sentry error monitoring is only partially configured',
        )
      } else if (!integrationStatus.errorMonitoring.configured) {
        logger.info('Sentry error monitoring is not configured in this environment')
      }
    }
  })
}

void start()

const gracefulShutdown = (): void => {
  logger.info('Received shutdown signal, closing gracefully...')
  server.close(async () => {
    await prisma.$disconnect()
    logger.info('Server closed')
    process.exit(0)
  })

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

const exitAfterFatalError = async (
  error: Error,
  logMessage: string,
  extras?: Record<string, unknown>,
): Promise<never> => {
  captureServerException(error, undefined, {
    mechanism: logMessage.toLowerCase().replace(/\s+/g, '_'),
    extras,
  })
  await flushServerSentry()

  if (extras) {
    logger.error({ err: error, ...extras }, logMessage)
  } else {
    logger.error(error, logMessage)
  }

  process.exit(1)
}

process.on('uncaughtException', (error: Error) => {
  void exitAfterFatalError(error, 'Uncaught Exception')
})

process.on('unhandledRejection', (reason: unknown) => {
  const error =
    reason instanceof Error
      ? reason
      : new Error('Unhandled Rejection', {
          cause: reason,
        })

  void exitAfterFatalError(error, 'Unhandled Rejection', {
    rejectionReason: reason,
  })
})
