import * as Sentry from '@sentry/react';

import { getClientSentryOptions } from './lib/sentry';

const sentryOptions = getClientSentryOptions(import.meta.env);

if (sentryOptions) {
  Sentry.init(sentryOptions);
}
