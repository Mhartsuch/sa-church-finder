import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'
import { ValidationError } from './error-handler.js'

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      req.body = validated.body || req.body
      req.query = validated.query || req.query
      req.params = validated.params || req.params
      next()
    } catch (error: unknown) {
      if (error instanceof Error) {
        next(new ValidationError(error.message, error))
      } else {
        next(new ValidationError('Validation failed'))
      }
    }
  }
}
