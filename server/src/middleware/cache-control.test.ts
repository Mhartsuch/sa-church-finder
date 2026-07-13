import { NextFunction, Request, Response } from 'express'

import { cacheControl } from './cache-control'

interface MockRes {
  headers: Map<string, string>
  res: Response
}

function mockResponse(): MockRes {
  const headers = new Map<string, string>()
  const res = {
    getHeader: (name: string) => headers.get(name),
    setHeader: (name: string, value: string) => {
      headers.set(name, value)
    },
  } as unknown as Response
  return { headers, res }
}

function run(method: string, path: string): string | undefined {
  const req = { method, path } as Request
  const { headers, res } = mockResponse()
  const next = jest.fn() as NextFunction
  cacheControl(req, res, next)
  expect(next).toHaveBeenCalled()
  return headers.get('Cache-Control')
}

describe('cacheControl middleware', () => {
  it('marks auth reads no-store', () => {
    expect(run('GET', '/api/v1/auth/me')).toBe('no-store')
  })

  it('marks mutations no-store', () => {
    expect(run('POST', '/api/v1/forum/posts')).toBe('no-store')
    expect(run('DELETE', '/api/v1/visits/abc')).toBe('no-store')
  })

  it('gives slow-changing public reads a short cache window', () => {
    expect(run('GET', '/api/v1/ribbon-categories')).toBe(
      'private, max-age=30, stale-while-revalidate=120',
    )
    expect(run('GET', '/api/v1/churches/filter-options')).toBe(
      'private, max-age=30, stale-while-revalidate=120',
    )
  })

  it('forces revalidation on interactive reads so fresh writes are visible', () => {
    // Regression guard: a blanket max-age here once hid new forum posts,
    // reviews, and saves for up to ~150 seconds after writing.
    expect(run('GET', '/api/v1/forum/posts')).toBe('private, no-cache')
    expect(run('GET', '/api/v1/forum/posts/abc')).toBe('private, no-cache')
    expect(run('GET', '/api/v1/churches')).toBe('private, no-cache')
    expect(run('GET', '/api/v1/users/u1/passport')).toBe('private, no-cache')
  })

  it('does not confuse church detail paths with the filter-options allowlist entry', () => {
    expect(run('GET', '/api/v1/churches/first-baptist')).toBe('private, no-cache')
  })

  it('leaves an explicitly set header alone', () => {
    const req = { method: 'GET', path: '/api/v1/churches' } as Request
    const { headers, res } = mockResponse()
    headers.set('Cache-Control', 'public, max-age=3600')
    cacheControl(req, res, jest.fn() as NextFunction)
    expect(headers.get('Cache-Control')).toBe('public, max-age=3600')
  })
})
