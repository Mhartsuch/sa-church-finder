import type { NodeOptions } from '@sentry/node'
import * as Sentry from '@sentry/node'
import type { Request } from 'express'

const normalizeEnvValue = (value?: string): string | undefined => {
  const trimmedValue = value?.trim()

  return trimmedValue ? trimmedValue : undefined
}

export const getServerSentryOptions = (
  env: NodeJS.ProcessEnv = process.env,
): Pick<NodeOptions, 'dsn' | 'environment' | 'release' | 'sendDefaultPii'> | null => {
  const dsn = normalizeEnvValue(env.SENTRY_DSN)

  if (!dsn) {
    return null
  }

  return {
    dsn,
    environment:
      normalizeEnvValue(env.SENTRY_ENVIRONMENT) ?? normalizeEnvValue(env.NODE_ENV) ?? 'development',
    release:
      normalizeEnvValue(env.SENTRY_RELEASE) ??
      normalizeEnvValue(env.APP_VERSION) ??
      normalizeEnvValue(env.GIT_COMMIT),
    sendDefaultPii: false,
  }
}

let serverSentryInitialized = false

export const initializeServerSentry = (env: NodeJS.ProcessEnv = process.env): boolean => {
  const sentryOptions = getServerSentryOptions(env)

  if (!sentryOptions) {
    return false
  }

  if (serverSentryInitialized) {
    return true
  }

  Sentry.init(sentryOptions)
  serverSentryInitialized = true

  return true
}

type CaptureServerExceptionOptions = {
  mechanism?: string
  extras?: Record<string, unknown>
}

export const captureServerException = (
  error: unknown,
  req?: Request,
  options: CaptureServerExceptionOptions = {},
): void => {
  if (!serverSentryInitialized) {
    return
  }

  Sentry.withScope((scope) => {
    if (req) {
      scope.setContext('request', {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        query: req.query,
      })

      if (req.session.userId) {
        scope.setUser({ id: req.session.userId })
      }
    }

    if (options.mechanism) {
      scope.setTag('mechanism', options.mechanism)
    }

    if (options.extras) {
      Object.entries(options.extras).forEach(([key, value]) => {
        scope.setExtra(key, value)
      })
    }

    Sentry.captureException(error)
  })
}

export const flushServerSentry = async (timeoutMs: number = 2000): Promise<boolean> => {
  if (!serverSentryInitialized) {
    return true
  }

  return Sentry.flush(timeoutMs)
}
