import { NextFunction, Request, Response } from 'express'

import { AuthError } from './error-handler.js'

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.session.userId) {
    next(new AuthError('Not authenticated'))
    return
  }

  next()
}
