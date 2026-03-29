import { describe, expect, it } from 'vitest'

import {
  buildAuthPageHref,
  buildGoogleAuthUrl,
  resolveAuthRedirectPath,
  resolveOAuthErrorMessage,
  sanitizeAuthReturnTo,
} from './auth-redirect'

describe('auth redirect helpers', () => {
  it('falls back to the default account page when returnTo is unsafe', () => {
    expect(sanitizeAuthReturnTo('https://evil.example.com')).toBe('/account')
    expect(sanitizeAuthReturnTo('//evil.example.com')).toBe('/account')
    expect(sanitizeAuthReturnTo('/login')).toBe('/account')
  })

  it('preserves safe in-app paths from route state', () => {
    expect(
      resolveAuthRedirectPath(
        {
          from: {
            pathname: '/churches/grace-community',
            search: '?tab=reviews',
          },
        },
        '',
      ),
    ).toBe('/churches/grace-community?tab=reviews')
  })

  it('falls back to the returnTo query param when route state is missing', () => {
    expect(
      resolveAuthRedirectPath(
        null,
        '?returnTo=%2Fsearch%3Fday%3Dsunday%26language%3Denglish',
      ),
    ).toBe('/search?day=sunday&language=english')
  })

  it('builds auth page links that preserve a non-default returnTo', () => {
    expect(buildAuthPageHref('/register', '/churches/cornerstone')).toBe(
      '/register?returnTo=%2Fchurches%2Fcornerstone',
    )
  })

  it('builds the backend Google auth URL with the sanitized returnTo value', () => {
    expect(buildGoogleAuthUrl('/churches/cornerstone')).toBe(
      '/api/v1/auth/google?returnTo=%2Fchurches%2Fcornerstone',
    )
  })

  it('maps OAuth query codes to user-facing messages', () => {
    expect(resolveOAuthErrorMessage('?authError=google_denied')).toBe(
      'Google sign-in was canceled before it finished.',
    )
    expect(resolveOAuthErrorMessage('?authError=unknown')).toBeNull()
  })
})
