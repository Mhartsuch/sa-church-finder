import { describe, expect, it } from 'vitest'

import { inferRenderApiUrl, normalizeApiError, resolveApiBaseUrl } from './api-url'

describe('api-url helpers', () => {
  it('uses the configured API URL when present', () => {
    expect(
      resolveApiBaseUrl({
        configuredUrl: 'https://sa-church-finder-api.onrender.com/',
        isDev: false,
      }),
    ).toBe('https://sa-church-finder-api.onrender.com')
  })

  it('keeps local development on the Vite proxy', () => {
    expect(resolveApiBaseUrl({ configuredUrl: '', isDev: true })).toBe('')
  })

  it('infers the sibling Render API host when the env var is missing', () => {
    expect(
      resolveApiBaseUrl({
        configuredUrl: '',
        isDev: false,
        location: {
          hostname: 'sa-church-finder.onrender.com',
          protocol: 'https:',
        },
      }),
    ).toBe('https://sa-church-finder-api.onrender.com')
  })

  it('does not invent a URL for non-Render hosts', () => {
    expect(
      inferRenderApiUrl({
        hostname: 'churchfinder.example.com',
        protocol: 'https:',
      }),
    ).toBeNull()
  })

  it('turns browser network failures into a deployment hint', () => {
    expect(normalizeApiError(new TypeError('Failed to fetch')).message).toContain(
      'VITE_API_URL',
    )
  })

  it('turns HTML responses into an API URL hint', () => {
    expect(normalizeApiError(new SyntaxError('Unexpected token <')).message).toContain(
      'backend service',
    )
  })
})
