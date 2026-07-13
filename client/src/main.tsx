import React from 'react';
import * as Sentry from '@sentry/react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppErrorFallback } from '@/components/layout/AppErrorFallback';
import { registerServiceWorker } from '@/lib/register-sw';
import App from './App';
import './index.css';

registerServiceWorker();

// Sensible defaults so we don't refetch the same church/search payload every
// time a user tabs back to the window. Individual hooks can still override.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // keep unused data in cache for 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Load Sentry instrumentation off the critical path so it doesn't block first
// render. Fire-and-forget: errors thrown before it finishes loading are lost —
// an accepted tradeoff for faster startup.
void import('./instrument');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Sentry.ErrorBoundary fallback={<AppErrorFallback />}>
          <App />
        </Sentry.ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
