import { describe, expect, it } from 'vitest';

import { getClientSentryOptions } from './sentry';

const createEnv = (overrides: Partial<ImportMetaEnv> = {}): ImportMetaEnv => ({
  BASE_URL: '/',
  DEV: false,
  MODE: 'production',
  PROD: true,
  SSR: false,
  ...overrides,
});

describe('getClientSentryOptions', () => {
  it('returns null when no browser DSN is configured', () => {
    expect(getClientSentryOptions(createEnv())).toBeNull();
  });

  it('uses the explicit Sentry environment and release when provided', () => {
    expect(
      getClientSentryOptions(
        createEnv({
          VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
          VITE_SENTRY_ENVIRONMENT: 'staging',
          VITE_SENTRY_RELEASE: 'web-2026-03-30',
        }),
      ),
    ).toEqual({
      dsn: 'https://public@example.ingest.sentry.io/123',
      environment: 'staging',
      release: 'web-2026-03-30',
      sendDefaultPii: false,
    });
  });

  it('falls back to the current Vite mode when no explicit environment is set', () => {
    expect(
      getClientSentryOptions(
        createEnv({
          MODE: 'development',
          PROD: false,
          DEV: true,
          VITE_SENTRY_DSN: 'https://public@example.ingest.sentry.io/123',
        }),
      ),
    ).toEqual({
      dsn: 'https://public@example.ingest.sentry.io/123',
      environment: 'development',
      release: undefined,
      sendDefaultPii: false,
    });
  });
});
