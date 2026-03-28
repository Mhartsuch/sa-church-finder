import { Request, Response, NextFunction } from 'express'
import logger from '../lib/logger.js'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public message: string,
    public details?: unknown,
    public isOperational: boolean = true,
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, 'NOT_FOUND', message)
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(400, 'VALIDATION_ERROR', message, details)
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, 'AUTH_ERROR', message)
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    const statusCode = err.statusCode
    const code = err.code
    const message = err.message
    const details = err.details
    const errorPayload: {
      code: string
      message: string
      details?: unknown
    } = {
      code,
      message,
    }

    if (details !== undefined) {
      errorPayload.details = details
    }

    logger.error({ statusCode, code, message }, 'AppError occurred')

    res.status(statusCode).json({
      error: errorPayload,
    })
    return
  }

  logger.error(err, 'Unhandled error')

  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
    },
  })
}
