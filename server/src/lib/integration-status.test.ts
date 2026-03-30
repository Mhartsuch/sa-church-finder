import {
  getGoogleOAuthStatus,
  getPublicServerIntegrationStatus,
  getServerErrorMonitoringStatus,
} from './integration-status.js'

describe('integration status helpers', () => {
  it('reports partial Google OAuth config when only one credential is present', () => {
    expect(
      getGoogleOAuthStatus({
        GOOGLE_CLIENT_ID: 'google-client-id',
      } as NodeJS.ProcessEnv),
    ).toEqual({
      configured: false,
      missingFields: ['GOOGLE_CLIENT_SECRET'],
      status: 'partial',
    })
  })

  it('reports partial Sentry config when metadata exists without a DSN', () => {
    expect(
      getServerErrorMonitoringStatus({
        NODE_ENV: 'production',
        SENTRY_ENVIRONMENT: 'production',
      } as NodeJS.ProcessEnv),
    ).toEqual({
      configured: false,
      missingFields: ['SENTRY_DSN'],
      status: 'partial',
    })
  })

  it('returns a public integration summary without exposing missing-field details', () => {
    expect(
      getPublicServerIntegrationStatus({
        SMTP_FROM: 'noreply@example.com',
        SMTP_HOST: 'smtp.example.com',
        SMTP_USER: 'smtp-user',
        SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
      } as NodeJS.ProcessEnv),
    ).toEqual({
      emailDelivery: {
        configured: false,
        status: 'partial',
      },
      errorMonitoring: {
        configured: true,
        status: 'configured',
      },
      googleOAuth: {
        configured: false,
        status: 'disabled',
      },
    })
  })
})
