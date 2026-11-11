import { Request, Response, NextFunction } from 'express'
import { ZodError, ZodSchema } from 'zod'
import { ValidationError } from './error-handler.js'

export interface ValidationIssue {
  /** Field name without the body/query/params prefix, e.g. "password". */
  field: string
  message: string
}

/**
 * Turn a ZodError into a sentence a person can read plus per-field issues a
 * form can attach to its inputs. The raw Zod issue list is never sent to
 * clients.
 */
export function describeZodError(error: ZodError): { message: string; issues: ValidationIssue[] } {
  const issues = error.issues.map((issue) => {
    const [source, ...rest] = issue.path.map(String)
    const field = rest.join('.') || source || 'request'
    return { field, message: issue.message }
  })
  // Schemas with their own wording ("Password must be at least 8 characters")
  // read well alone; Zod defaults ("Required") need the field name.
  const sentences = issues.map(({ field, message }) =>
    message.toLowerCase().includes(field.toLowerCase()) ||
    /^(please|password|name|email)/i.test(message)
      ? message
      : `${field}: ${message}`,
  )
  return { message: [...new Set(sentences)].join('. '), issues }
}

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
      if (error instanceof ZodError) {
        const { message, issues } = describeZodError(error)
        next(new ValidationError(message, { issues }))
      } else if (error instanceof Error) {
        next(new ValidationError(error.message))
      } else {
        next(new ValidationError('Validation failed'))
      }
    }
  }
}
