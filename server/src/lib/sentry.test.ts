import { getServerSentryOptions } from './sentry.js'

describe('getServerSentryOptions', () => {
  it('returns null when no server DSN is configured', () => {
    expect(getServerSentryOptions({})).toBeNull()
  })

  it('prefers explicit environment and release values when present', () => {
    expect(
      getServerSentryOptions({
        NODE_ENV: 'production',
        SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
        SENTRY_ENVIRONMENT: 'staging',
        SENTRY_RELEASE: 'api-2026-03-30',
        APP_VERSION: '0.1.0',
        GIT_COMMIT: 'abc123',
      }),
    ).toEqual({
      dsn: 'https://public@example.ingest.sentry.io/123',
      environment: 'staging',
      release: 'api-2026-03-30',
      sendDefaultPii: false,
    })
  })

  it('falls back to node environment and version metadata', () => {
    expect(
      getServerSentryOptions({
        NODE_ENV: 'production',
        SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
        APP_VERSION: '0.1.0',
      }),
    ).toEqual({
      dsn: 'https://public@example.ingest.sentry.io/123',
      environment: 'production',
      release: '0.1.0',
      sendDefaultPii: false,
    })
  })
})
