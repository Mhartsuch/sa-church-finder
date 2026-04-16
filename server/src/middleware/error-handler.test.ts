import { Request, Response, NextFunction } from 'express'

import {
  AppError,
  NotFoundError,
  ValidationError,
  AuthError,
  ConflictError,
  errorHandler,
} from './error-handler.js'

jest.mock('../lib/logger.js', () => ({
  __esModule: true,
  default: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}))

jest.mock('../lib/sentry.js', () => ({
  __esModule: true,
  captureServerException: jest.fn(),
}))

function createMockReq(): Partial<Request> {
  return { method: 'GET', url: '/test' }
}

function createMockRes(): Partial<Response> & { _status: number; _json: unknown } {
  const res: Partial<Response> & { _status: number; _json: unknown } = {
    _status: 0,
    _json: null,
    status: jest.fn().mockReturnThis() as unknown as Response['status'],
    json: jest.fn().mockReturnThis() as unknown as Response['json'],
  }
  ;(res.status as jest.Mock).mockImplementation((code: number) => {
    res._status = code
    return res
  })
  ;(res.json as jest.Mock).mockImplementation((body: unknown) => {
    res._json = body
    return res
  })
  return res
}

const mockNext: NextFunction = jest.fn()

describe('Error classes', () => {
  describe('AppError', () => {
    it('sets the correct statusCode, code, and message', () => {
      const err = new AppError(422, 'UNPROCESSABLE', 'Bad input')
      expect(err.statusCode).toBe(422)
      expect(err.code).toBe('UNPROCESSABLE')
      expect(err.message).toBe('Bad input')
      expect(err.isOperational).toBe(true)
      expect(err.details).toBeUndefined()
      expect(err).toBeInstanceOf(Error)
      expect(err).toBeInstanceOf(AppError)
    })

    it('accepts optional details', () => {
      const details = { field: 'email', reason: 'invalid' }
      const err = new AppError(400, 'BAD_REQUEST', 'Invalid', details)
      expect(err.details).toEqual(details)
    })

    it('accepts optional isOperational flag', () => {
      const err = new AppError(500, 'FATAL', 'Something broke', undefined, false)
      expect(err.isOperational).toBe(false)
    })
  })

  describe('NotFoundError', () => {
    it('uses default message when none provided', () => {
      const err = new NotFoundError()
      expect(err.statusCode).toBe(404)
      expect(err.code).toBe('NOT_FOUND')
      expect(err.message).toBe('Resource not found')
      expect(err).toBeInstanceOf(AppError)
      expect(err).toBeInstanceOf(NotFoundError)
    })

    it('accepts a custom message', () => {
      const err = new NotFoundError('Church not found')
      expect(err.statusCode).toBe(404)
      expect(err.code).toBe('NOT_FOUND')
      expect(err.message).toBe('Church not found')
    })
  })

  describe('ValidationError', () => {
    it('uses default message when none provided', () => {
      const err = new ValidationError()
      expect(err.statusCode).toBe(400)
      expect(err.code).toBe('VALIDATION_ERROR')
      expect(err.message).toBe('Validation failed')
      expect(err.details).toBeUndefined()
      expect(err).toBeInstanceOf(AppError)
      expect(err).toBeInstanceOf(ValidationError)
    })

    it('accepts a custom message and details', () => {
      const details = [{ field: 'name', error: 'required' }]
      const err = new ValidationError('Invalid fields', details)
      expect(err.statusCode).toBe(400)
      expect(err.code).toBe('VALIDATION_ERROR')
      expect(err.message).toBe('Invalid fields')
      expect(err.details).toEqual(details)
    })
  })

  describe('AuthError', () => {
    it('uses default message when none provided', () => {
      const err = new AuthError()
      expect(err.statusCode).toBe(401)
      expect(err.code).toBe('AUTH_ERROR')
      expect(err.message).toBe('Unauthorized')
      expect(err).toBeInstanceOf(AppError)
      expect(err).toBeInstanceOf(AuthError)
    })

    it('accepts a custom message', () => {
      const err = new AuthError('Token expired')
      expect(err.statusCode).toBe(401)
      expect(err.code).toBe('AUTH_ERROR')
      expect(err.message).toBe('Token expired')
    })
  })

  describe('ConflictError', () => {
    it('uses default message when none provided', () => {
      const err = new ConflictError()
      expect(err.statusCode).toBe(409)
      expect(err.code).toBe('CONFLICT')
      expect(err.message).toBe('Conflict')
      expect(err).toBeInstanceOf(AppError)
      expect(err).toBeInstanceOf(ConflictError)
    })

    it('accepts a custom message', () => {
      const err = new ConflictError('Email already in use')
      expect(err.statusCode).toBe(409)
      expect(err.code).toBe('CONFLICT')
      expect(err.message).toBe('Email already in use')
    })
  })
})

describe('errorHandler middleware', () => {
  const originalNodeEnv = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('responds with correct status, code, and message for an AppError', () => {
    const err = new AppError(403, 'FORBIDDEN', 'Access denied')
    const req = createMockReq() as Request
    const res = createMockRes()

    errorHandler(err, req, res as unknown as Response, mockNext)

    expect(res._status).toBe(403)
    expect(res._json).toEqual({
      error: { code: 'FORBIDDEN', message: 'Access denied' },
    })
  })

  it('includes details in the response when present on AppError', () => {
    const details = { field: 'email', reason: 'taken' }
    const err = new AppError(400, 'BAD_REQUEST', 'Invalid', details)
    const req = createMockReq() as Request
    const res = createMockRes()

    errorHandler(err, req, res as unknown as Response, mockNext)

    expect(res._status).toBe(400)
    expect(res._json).toEqual({
      error: { code: 'BAD_REQUEST', message: 'Invalid', details },
    })
  })

  it('does not include details key when details is undefined', () => {
    const err = new NotFoundError('Gone')
    const req = createMockReq() as Request
    const res = createMockRes()

    errorHandler(err, req, res as unknown as Response, mockNext)

    expect(res._status).toBe(404)
    const payload = res._json as { error: Record<string, unknown> }
    expect(payload.error).not.toHaveProperty('details')
  })

  it('handles NotFoundError as an AppError subclass', () => {
    const err = new NotFoundError()
    const req = createMockReq() as Request
    const res = createMockRes()

    errorHandler(err, req, res as unknown as Response, mockNext)

    expect(res._status).toBe(404)
    expect(res._json).toEqual({
      error: { code: 'NOT_FOUND', message: 'Resource not found' },
    })
  })

  it('handles ValidationError with details', () => {
    const details = [{ field: 'name', issue: 'required' }]
    const err = new ValidationError('Bad data', details)
    const req = createMockReq() as Request
    const res = createMockRes()

    errorHandler(err, req, res as unknown as Response, mockNext)

    expect(res._status).toBe(400)
    expect(res._json).toEqual({
      error: { code: 'VALIDATION_ERROR', message: 'Bad data', details },
    })
  })

  it('responds with 500 and INTERNAL_SERVER_ERROR for generic Error instances', () => {
    const err = new Error('Something broke')
    const req = createMockReq() as Request
    const res = createMockRes()

    errorHandler(err, req, res as unknown as Response, mockNext)

    expect(res._status).toBe(500)
    expect(res._json).toEqual({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'Something broke' },
    })
  })

  it('uses sanitized message for generic errors in production', () => {
    process.env.NODE_ENV = 'production'
    const err = new Error('SQL connection pool exhausted at row 42')
    const req = createMockReq() as Request
    const res = createMockRes()

    errorHandler(err, req, res as unknown as Response, mockNext)

    expect(res._status).toBe(500)
    expect(res._json).toEqual({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' },
    })
  })

  it('reports non-operational AppErrors to Sentry', () => {
    const { captureServerException } = jest.requireMock('../lib/sentry.js') as {
      captureServerException: jest.Mock
    }
    captureServerException.mockClear()

    const err = new AppError(500, 'DB_FAILURE', 'Pool crashed', undefined, false)
    const req = createMockReq() as Request
    const res = createMockRes()

    errorHandler(err, req, res as unknown as Response, mockNext)

    expect(captureServerException).toHaveBeenCalledWith(err, req, { mechanism: 'app_error' })
  })

  it('reports generic errors to Sentry', () => {
    const { captureServerException } = jest.requireMock('../lib/sentry.js') as {
      captureServerException: jest.Mock
    }
    captureServerException.mockClear()

    const err = new Error('Unexpected')
    const req = createMockReq() as Request
    const res = createMockRes()

    errorHandler(err, req, res as unknown as Response, mockNext)

    expect(captureServerException).toHaveBeenCalledWith(err, req, {
      mechanism: 'unhandled_error',
    })
  })
})
