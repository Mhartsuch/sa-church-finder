import { getEmailDeliveryStatus, type EmailDeliveryStatus } from './email.js'
import { getServerSentryOptions } from './sentry.js'

export type IntegrationStatus = {
  configured: boolean
  missingFields: string[]
  status: 'configured' | 'disabled' | 'partial'
}

export type PublicIntegrationStatus = Pick<IntegrationStatus, 'configured' | 'status'>

export type ServerIntegrationStatus = {
  emailDelivery: EmailDeliveryStatus
  errorMonitoring: IntegrationStatus
  googleOAuth: IntegrationStatus
}

function normalizeEnvValue(value?: string): string | undefined {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : undefined
}

export function getGoogleOAuthStatus(env: NodeJS.ProcessEnv = process.env): IntegrationStatus {
  const clientId = normalizeEnvValue(env.GOOGLE_CLIENT_ID)
  const clientSecret = normalizeEnvValue(env.GOOGLE_CLIENT_SECRET)
  const hasAnyConfig = Boolean(clientId || clientSecret)

  if (!hasAnyConfig) {
    return {
      configured: false,
      missingFields: [],
      status: 'disabled',
    }
  }

  const missingFields: string[] = []

  if (!clientId) {
    missingFields.push('GOOGLE_CLIENT_ID')
  }

  if (!clientSecret) {
    missingFields.push('GOOGLE_CLIENT_SECRET')
  }

  if (missingFields.length > 0) {
    return {
      configured: false,
      missingFields,
      status: 'partial',
    }
  }

  return {
    configured: true,
    missingFields: [],
    status: 'configured',
  }
}

export function getServerErrorMonitoringStatus(
  env: NodeJS.ProcessEnv = process.env,
): IntegrationStatus {
  const sentryOptions = getServerSentryOptions(env)
  const hasAncillaryConfig = Boolean(
    normalizeEnvValue(env.SENTRY_ENVIRONMENT) || normalizeEnvValue(env.SENTRY_RELEASE),
  )

  if (!sentryOptions) {
    return {
      configured: false,
      missingFields: hasAncillaryConfig ? ['SENTRY_DSN'] : [],
      status: hasAncillaryConfig ? 'partial' : 'disabled',
    }
  }

  return {
    configured: true,
    missingFields: [],
    status: 'configured',
  }
}

export function getServerIntegrationStatus(
  env: NodeJS.ProcessEnv = process.env,
): ServerIntegrationStatus {
  return {
    emailDelivery: getEmailDeliveryStatus(env),
    errorMonitoring: getServerErrorMonitoringStatus(env),
    googleOAuth: getGoogleOAuthStatus(env),
  }
}

export function getPublicServerIntegrationStatus(
  env: NodeJS.ProcessEnv = process.env,
): Record<keyof ServerIntegrationStatus, PublicIntegrationStatus> {
  const integrationStatus = getServerIntegrationStatus(env)

  return {
    emailDelivery: {
      configured: integrationStatus.emailDelivery.configured,
      status: integrationStatus.emailDelivery.status,
    },
    errorMonitoring: {
      configured: integrationStatus.errorMonitoring.configured,
      status: integrationStatus.errorMonitoring.status,
    },
    googleOAuth: {
      configured: integrationStatus.googleOAuth.configured,
      status: integrationStatus.googleOAuth.status,
    },
  }
}
