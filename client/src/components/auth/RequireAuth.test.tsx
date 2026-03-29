import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuthSession } from '@/hooks/useAuth'

import { RequireAuth } from './RequireAuth'

vi.mock('@/hooks/useAuth', () => ({
  useAuthSession: vi.fn(),
}))

const mockedUseAuthSession = vi.mocked(useAuthSession)

describe('RequireAuth', () => {
  beforeEach(() => {
    mockedUseAuthSession.mockReset()
  })

  it('renders protected content when a session exists', () => {
    mockedUseAuthSession.mockReturnValue({
      user: {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Test User',
        avatarUrl: null,
        role: 'user',
        emailVerified: false,
        createdAt: '2026-03-28T00:00:00.000Z',
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAuthSession>)

    render(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route
            path='/account'
            element={
              <RequireAuth>
                <div>Protected account</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Protected account')).toBeInTheDocument()
  })

  it('redirects unauthenticated users to the login route', () => {
    mockedUseAuthSession.mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useAuthSession>)

    render(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path='/login' element={<div>Login screen</div>} />
          <Route
            path='/account'
            element={
              <RequireAuth>
                <div>Protected account</div>
              </RequireAuth>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Login screen')).toBeInTheDocument()
  })
})
