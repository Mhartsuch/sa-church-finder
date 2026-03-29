import { pino } from 'pino'

const isDev = process.env.NODE_ENV === 'development'
const isTest = process.env.NODE_ENV === 'test'

const logger = pino(
  isTest
    ? {
        level: 'silent',
      }
    : isDev
    ? {
        level: process.env.LOG_LEVEL || 'debug',
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        level: process.env.LOG_LEVEL || 'info',
      },
)

export default logger
