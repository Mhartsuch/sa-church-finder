import app from './app.js'
import logger from './lib/logger.js'
import prisma from './lib/prisma.js'
import { resolveClientUrls } from './lib/session.js'

const port = process.env.PORT || 3001
const clientUrls = resolveClientUrls()

const server = app.listen(port, () => {
  logger.info(`Server running on http://localhost:${port}`)
  logger.info(`Client URL: ${clientUrls === '*' ? '*' : clientUrls.join(', ')}`)
})

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

process.on('uncaughtException', (error: Error) => {
  logger.error(error, 'Uncaught Exception')
  process.exit(1)
})

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(reason, 'Unhandled Rejection')
  process.exit(1)
})
