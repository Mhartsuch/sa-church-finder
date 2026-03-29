import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchCurrentUser, loginUser } from './auth'

const fetchMock = vi.fn()

describe('auth api', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockReset()
    vi.unstubAllGlobals()
  })

  it('returns null when the current session is unauthenticated', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () =>
        JSON.stringify({
          error: {
            code: 'AUTH_ERROR',
            message: 'Not authenticated',
          },
        }),
    } as Response)

    await expect(fetchCurrentUser()).resolves.toBeNull()

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/v1/auth/me',
      expect.objectContaining({
        credentials: 'include',
      }),
    )
  })

  it('posts login credentials with cookies enabled and returns the user payload', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          data: {
            id: 'user-1',
            email: 'user@example.com',
            name: 'Test User',
            avatarUrl: null,
            role: 'user',
            emailVerified: false,
            createdAt: '2026-03-28T00:00:00.000Z',
          },
        }),
    } as Response)

    const user = await loginUser({
      email: 'user@example.com',
      password: 'password123',
    })

    expect(user.email).toBe('user@example.com')

    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(options.headers)

    expect(url).toBe('/api/v1/auth/login')
    expect(options.method).toBe('POST')
    expect(options.credentials).toBe('include')
    expect(options.body).toBe(
      JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
      }),
    )
    expect(headers.get('Content-Type')).toBe('application/json')
    expect(headers.get('Accept')).toBe('application/json')
  })
})
