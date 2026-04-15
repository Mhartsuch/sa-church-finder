import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

import { validate } from './validate.js'
import { ValidationError } from './error-handler.js'

const createMockReqResNext = (overrides: Partial<Request> = {}): { req: Request; res: Response; next: jest.MockedFunction<NextFunction> } => {
  const req = {
    body: {},
    query: {},
    params: {},
    ...overrides,
  } as unknown as Request
  const res = {} as Response
  const next = jest.fn() as jest.MockedFunction<NextFunction>
  return { req, res, next }
}

const testSchema = z.object({
  body: z.object({
    name: z.string().min(1),
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough(),
})

describe('validate middleware', () => {
  it('calls next() with no arguments when validation passes', () => {
    const { req, res, next } = createMockReqResNext({ body: { name: 'Test' } })

    validate(testSchema)(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('assigns validated body back to req.body', () => {
    const { req, res, next } = createMockReqResNext({ body: { name: '  Trimmed  ' } })

    const schema = z.object({
      body: z.object({ name: z.string().trim() }),
      query: z.object({}).passthrough(),
      params: z.object({}).passthrough(),
    })

    validate(schema)(req, res, next)

    expect(req.body).toEqual({ name: 'Trimmed' })
    expect(next).toHaveBeenCalledWith()
  })

  it('calls next with ValidationError when validation fails', () => {
    const { req, res, next } = createMockReqResNext({ body: {} })

    validate(testSchema)(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError))
  })

  it('includes the Zod error in the ValidationError details', () => {
    const { req, res, next } = createMockReqResNext({ body: {} })

    validate(testSchema)(req, res, next)

    const error = next.mock.calls[0][0] as unknown as ValidationError
    expect(error.details).toBeDefined()
  })

  it('validates params alongside body', () => {
    const schemaWithParams = z.object({
      body: z.object({}).passthrough(),
      query: z.object({}).passthrough(),
      params: z.object({ id: z.string().min(1) }).passthrough(),
    })

    const { req, res, next } = createMockReqResNext({ params: { id: 'abc' } as Record<string, string> })

    validate(schemaWithParams)(req, res, next)

    expect(next).toHaveBeenCalledWith()
  })

  it('fails when required params are missing', () => {
    const schemaWithParams = z.object({
      body: z.object({}).passthrough(),
      query: z.object({}).passthrough(),
      params: z.object({ id: z.string().min(1) }),
    })

    const { req, res, next } = createMockReqResNext({ params: {} as Record<string, string> })

    validate(schemaWithParams)(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError))
  })
})
