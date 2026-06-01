import { afterEach, describe, expect, it, vi } from 'vitest'

import { resolveAvatarSrc } from './avatar'

describe('resolveAvatarSrc', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns null when no avatar is set', () => {
    expect(resolveAvatarSrc(null)).toBeNull()
    expect(resolveAvatarSrc(undefined)).toBeNull()
    expect(resolveAvatarSrc('')).toBeNull()
  })

  it('returns absolute URLs unchanged (e.g. Google OAuth avatars)', () => {
    expect(resolveAvatarSrc('https://lh3.googleusercontent.com/a/abc')).toBe(
      'https://lh3.googleusercontent.com/a/abc',
    )
    expect(resolveAvatarSrc('http://example.com/a.jpg')).toBe('http://example.com/a.jpg')
  })

  it('prefixes relative upload paths with the configured API origin', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com')
    expect(resolveAvatarSrc('/uploads/avatars/user-1.jpg')).toBe(
      'https://api.example.com/uploads/avatars/user-1.jpg',
    )
  })

  it('leaves relative paths origin-relative when no API URL is configured', () => {
    vi.stubEnv('VITE_API_URL', '')
    expect(resolveAvatarSrc('/uploads/avatars/user-1.jpg')).toBe('/uploads/avatars/user-1.jpg')
  })
})
