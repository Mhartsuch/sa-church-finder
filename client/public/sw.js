// Bump to purge caches that may hold stale interactive data or error responses.
const CACHE_NAME = 'sa-churches-v2';
const STATIC_ASSETS = ['/'];

// How long to wait on the network for API GETs before falling back to a cached
// response. Guards against the API's cold-start hang (Render free tier) masking
// itself behind an endlessly pending fetch.
const API_NETWORK_TIMEOUT_MS = 4000;

// Interactive resources where a user writes and immediately reads back
// (forum posts, visits, collections, account data, admin queues). Serving
// these from cache makes fresh writes invisible, so they bypass SW caching
// entirely — browse-oriented data (churches, events, categories) still gets
// the cold-start cache fallback.
const UNCACHED_API_SEGMENTS = [
  '/forum',
  '/visits',
  '/collections',
  '/users',
  '/admin',
  '/claims',
  '/analytics',
];

function isUncachedApiPath(pathname) {
  return UNCACHED_API_SEGMENTS.some((segment) => pathname.includes(segment));
}

// Store only successful responses — caching a transient 5xx would replay the
// failure long after the server recovered.
function cacheIfOk(request, response) {
  if (response.ok) {
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
  }
  return response;
}

// Network-first with a timeout. Resolves with the network response when it
// arrives in time; if the network hangs past the timeout or errors, serves the
// cached response instead — but only when one exists. With no cached copy we
// keep waiting on the network (an eventual slow response beats an error page).
async function networkFirstWithTimeout(event, request) {
  const networkPromise = fetch(request).then((response) => cacheIfOk(request, response));

  const cached = await caches.match(request);
  if (!cached) {
    return networkPromise;
  }

  // Keep the service worker alive so the late network response still lands in
  // the cache even after we've responded from cache.
  event.waitUntil(networkPromise.catch(() => undefined));

  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(cached), API_NETWORK_TIMEOUT_MS);
    networkPromise
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(cached);
      });
  });
}

// Install: pre-cache essential static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for static assets, network-first for API/HTML
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Interactive API resources: straight to the network, no SW caching.
  if (url.pathname.startsWith('/api') && isUncachedApiPath(url.pathname)) {
    return;
  }

  // Network-first (with cold-start timeout) for browse-oriented API requests
  if (url.pathname.startsWith('/api')) {
    event.respondWith(networkFirstWithTimeout(event, request));
    return;
  }

  // Network-first for HTML navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => cacheIfOk(request, response))
        .catch(() => caches.match('/'))
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, images, fonts)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached || fetch(request).then((response) => cacheIfOk(request, response))
      )
    );
    return;
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => cacheIfOk(request, response))
      .catch(() => caches.match(request))
  );
});
