import request from 'supertest'

import { createApp } from './app.js'

jest.mock('./lib/prisma.js', () => ({
  __esModule: true,
  default: {},
}))

const originalHealthEnv = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT,
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_USER: process.env.SMTP_USER,
}

function restoreHealthEnvValue(
  key: keyof typeof originalHealthEnv,
  value: string | undefined,
): void {
  if (value === undefined) {
    delete process.env[key]
    return
  }

  process.env[key] = value
}

describe('app health endpoint', () => {
  afterEach(() => {
    restoreHealthEnvValue('GOOGLE_CLIENT_ID', originalHealthEnv.GOOGLE_CLIENT_ID)
    restoreHealthEnvValue('GOOGLE_CLIENT_SECRET', originalHealthEnv.GOOGLE_CLIENT_SECRET)
    restoreHealthEnvValue('SENTRY_DSN', originalHealthEnv.SENTRY_DSN)
    restoreHealthEnvValue('SENTRY_ENVIRONMENT', originalHealthEnv.SENTRY_ENVIRONMENT)
    restoreHealthEnvValue('SMTP_FROM', originalHealthEnv.SMTP_FROM)
    restoreHealthEnvValue('SMTP_HOST', originalHealthEnv.SMTP_HOST)
    restoreHealthEnvValue('SMTP_PASS', originalHealthEnv.SMTP_PASS)
    restoreHealthEnvValue('SMTP_USER', originalHealthEnv.SMTP_USER)
  })

  it('includes safe integration readiness metadata', async () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_FROM = 'noreply@example.com'
    process.env.GOOGLE_CLIENT_ID = 'google-client-id'
    delete process.env.GOOGLE_CLIENT_SECRET
    delete process.env.SMTP_PASS
    process.env.SMTP_USER = 'smtp-user'
    process.env.SENTRY_ENVIRONMENT = 'production'
    delete process.env.SENTRY_DSN

    const response = await request(createApp()).get('/api/v1/health')

    expect(response.status).toBe(200)
    expect(response.body.status).toBe('ok')
    expect(response.body.integrations).toEqual({
      emailDelivery: {
        configured: false,
        status: 'partial',
      },
      errorMonitoring: {
        configured: false,
        status: 'partial',
      },
      googleOAuth: {
        configured: false,
        status: 'partial',
      },
    })
  })
})
