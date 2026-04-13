import { Request, Response, NextFunction } from 'express'

import { requireAuth } from './require-auth.js'
import { AuthError } from './error-handler.js'

const createMockReqResNext = (sessionUserId?: string): { req: Request; res: Response; next: jest.MockedFunction<NextFunction> } => {
  const req = {
    session: {
      userId: sessionUserId,
    },
  } as unknown as Request
  const res = {} as Response
  const next = jest.fn() as jest.MockedFunction<NextFunction>
  return { req, res, next }
}

describe('requireAuth middleware', () => {
  it('calls next() when session has a userId', () => {
    const { req, res, next } = createMockReqResNext('user-123')

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('calls next with AuthError when userId is missing', () => {
    const { req, res, next } = createMockReqResNext(undefined)

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(AuthError))
    const error = next.mock.calls[0][0] as unknown as AuthError
    expect(error.message).toBe('Not authenticated')
    expect(error.statusCode).toBe(401)
  })

  it('calls next with AuthError when session has no userId property', () => {
    const req = { session: {} } as unknown as Request
    const res = {} as Response
    const next = jest.fn() as jest.MockedFunction<NextFunction>

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(AuthError))
  })
})
