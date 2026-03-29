import { resolveApiBaseUrl } from '@/lib/api-url'

type AuthRedirectState = {
  from?: {
    pathname?: string
    search?: string
  }
}

export const DEFAULT_AUTH_RETURN_TO = '/account'

const AUTH_RETURN_TO_BLOCKLIST = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
])

export const sanitizeAuthReturnTo = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return DEFAULT_AUTH_RETURN_TO
  }

  const trimmedValue = value.trim()

  if (!trimmedValue.startsWith('/') || trimmedValue.startsWith('//')) {
    return DEFAULT_AUTH_RETURN_TO
  }

  try {
    const parsedUrl = new URL(trimmedValue, 'http://localhost')
    const normalizedPath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`

    if (AUTH_RETURN_TO_BLOCKLIST.has(parsedUrl.pathname)) {
      return DEFAULT_AUTH_RETURN_TO
    }

    return normalizedPath || DEFAULT_AUTH_RETURN_TO
  } catch {
    return DEFAULT_AUTH_RETURN_TO
  }
}

export const resolveAuthRedirectPath = (
  state: unknown,
  search: string = '',
): string => {
  if (state && typeof state === 'object') {
    const from = (state as AuthRedirectState).from

    if (from?.pathname) {
      return sanitizeAuthReturnTo(`${from.pathname}${from.search ?? ''}`)
    }
  }

  const params = new URLSearchParams(search)

  return sanitizeAuthReturnTo(params.get('returnTo'))
}

export const buildAuthPageHref = (
  pathname: '/login' | '/register',
  returnTo: string,
): string => {
  const safeReturnTo = sanitizeAuthReturnTo(returnTo)

  if (safeReturnTo === DEFAULT_AUTH_RETURN_TO) {
    return pathname
  }

  const params = new URLSearchParams({
    returnTo: safeReturnTo,
  })

  return `${pathname}?${params.toString()}`
}

export const buildGoogleAuthUrl = (returnTo: string): string => {
  const safeReturnTo = sanitizeAuthReturnTo(returnTo)
  const params = new URLSearchParams({
    returnTo: safeReturnTo,
  })
  const apiBaseUrl = resolveApiBaseUrl()

  if (!apiBaseUrl) {
    return `/api/v1/auth/google?${params.toString()}`
  }

  return `${apiBaseUrl}/api/v1/auth/google?${params.toString()}`
}

export const resolveOAuthErrorMessage = (search: string = ''): string | null => {
  const authError = new URLSearchParams(search).get('authError')

  switch (authError) {
    case 'google_unavailable':
      return 'Google sign-in is not configured yet. Use email and password for now.'
    case 'google_denied':
      return 'Google sign-in was canceled before it finished.'
    case 'google_session_expired':
      return 'Google sign-in expired before it completed. Please try again.'
    case 'google_failed':
      return 'Google sign-in could not be completed. Please try again.'
    default:
      return null
  }
}
