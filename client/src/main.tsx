import * as Sentry from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false, retry: 1 },
  },
});

// Error monitoring loads off the critical path.
void import('./instrument');

// Earlier releases installed a caching service worker; /sw.js now removes itself.
if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => void registration.update());
  });
}

const crashFallback = (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
    <h1 className="text-2xl font-semibold">Something went wrong</h1>
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white"
    >
      Reload
    </button>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Sentry.ErrorBoundary fallback={crashFallback}>
          <App />
        </Sentry.ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
