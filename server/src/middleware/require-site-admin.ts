import { Role } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'

import prisma from '../lib/prisma.js'
import { AppError, AuthError } from './error-handler.js'

export const requireSiteAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.session.userId

    if (!userId) {
      next(new AuthError('Not authenticated'))
      return
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        role: true,
      },
    })

    if (!user) {
      next(new AuthError('Not authenticated'))
      return
    }

    if (user.role !== Role.SITE_ADMIN) {
      next(new AppError(403, 'FORBIDDEN', 'Site admin access is required'))
      return
    }

    next()
  } catch (error) {
    next(error)
  }
}
