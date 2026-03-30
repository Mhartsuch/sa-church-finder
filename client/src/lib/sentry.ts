import type { BrowserOptions } from '@sentry/react';

const normalizeEnvValue = (value?: string): string | undefined => {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
};

export const getClientSentryOptions = (
  env: ImportMetaEnv,
): Pick<BrowserOptions, 'dsn' | 'environment' | 'release' | 'sendDefaultPii'> | null => {
  const dsn = normalizeEnvValue(env.VITE_SENTRY_DSN);

  if (!dsn) {
    return null;
  }

  return {
    dsn,
    environment: normalizeEnvValue(env.VITE_SENTRY_ENVIRONMENT) ?? env.MODE,
    release: normalizeEnvValue(env.VITE_SENTRY_RELEASE),
    sendDefaultPii: false,
  };
};
