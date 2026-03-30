import { getEmailDeliveryStatus, isEmailDeliveryConfigured } from './email.js'

const originalSmtpEnv = {
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_USER: process.env.SMTP_USER,
}

function restoreEnvValue(key: keyof typeof originalSmtpEnv, value: string | undefined): void {
  if (value === undefined) {
    delete process.env[key]
    return
  }

  process.env[key] = value
}

describe('email delivery config', () => {
  afterEach(() => {
    restoreEnvValue('SMTP_FROM', originalSmtpEnv.SMTP_FROM)
    restoreEnvValue('SMTP_HOST', originalSmtpEnv.SMTP_HOST)
    restoreEnvValue('SMTP_PASS', originalSmtpEnv.SMTP_PASS)
    restoreEnvValue('SMTP_PORT', originalSmtpEnv.SMTP_PORT)
    restoreEnvValue('SMTP_SECURE', originalSmtpEnv.SMTP_SECURE)
    restoreEnvValue('SMTP_USER', originalSmtpEnv.SMTP_USER)
  })

  it('treats host and from without auth credentials as configured', () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_FROM = 'noreply@example.com'
    delete process.env.SMTP_USER
    delete process.env.SMTP_PASS

    expect(getEmailDeliveryStatus()).toEqual({
      configured: true,
      missingFields: [],
      status: 'configured',
    })
    expect(isEmailDeliveryConfigured()).toBe(true)
  })

  it('treats one-sided SMTP auth credentials as partially configured', () => {
    process.env.SMTP_HOST = 'smtp.example.com'
    process.env.SMTP_FROM = 'noreply@example.com'
    process.env.SMTP_USER = 'smtp-user'
    delete process.env.SMTP_PASS

    expect(getEmailDeliveryStatus()).toEqual({
      configured: false,
      missingFields: ['SMTP_PASS'],
      status: 'partial',
    })
    expect(isEmailDeliveryConfigured()).toBe(false)
  })

  it('treats an empty SMTP setup as disabled', () => {
    delete process.env.SMTP_HOST
    delete process.env.SMTP_FROM
    delete process.env.SMTP_USER
    delete process.env.SMTP_PASS

    expect(getEmailDeliveryStatus()).toEqual({
      configured: false,
      missingFields: [],
      status: 'disabled',
    })
    expect(isEmailDeliveryConfigured()).toBe(false)
  })
})
