const CACHE_NAME = 'writecare-v2';
const OFFLINE_URL = '/offline';
const API_CACHE = 'api-cache-v1';
const STATIC_CACHE = 'static-cache-v1';

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/styles/theme.css',
  '/styles/accessibility.css',
  '/images/offline.png',
  '/fonts/inter-var.woff2',
];

const API_ROUTES = [
  '/api/residents',
  '/api/medications',
  '/api/staff',
];

// Cache duration in milliseconds
const CACHE_DURATION = {
  static: 7 * 24 * 60 * 60 * 1000, // 7 days
  api: 60 * 60 * 1000, // 1 hour
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(API_CACHE),
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            ![STATIC_CACHE, API_CACHE].includes(cacheName)
          )
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Helper function to determine if a request is an API request
const isApiRequest = (request) => {
  return API_ROUTES.some(route => request.url.includes(route));
};

// Helper function to determine if a cached response is stale
const isStale = (response, maxAge) => {
  if (!response) return true;
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return true;
  const age = Date.now() - new Date(dateHeader).getTime();
  return age > maxAge;
};

// Network-first strategy with timeout for API requests
const networkFirstWithTimeout = async (request, timeout = 3000) => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), timeout);
    });
    const networkPromise = fetch(request).then(response => {
      const clone = response.clone();
      caches.open(API_CACHE).then(cache => cache.put(request, clone));
      return response;
    });
    return await Promise.race([networkPromise, timeoutPromise]);
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if cached response is stale
      if (!isStale(cachedResponse, CACHE_DURATION.api)) {
        return cachedResponse;
      }
    }
    // If we're offline or cache is stale, return offline data
    return new Response(
      JSON.stringify({ error: 'Currently offline', offline: true }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 503 
      }
    );
  }
};

// Cache-first strategy for static assets
const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached && !isStale(cached, CACHE_DURATION.static)) {
    return cached;
  }
  try {
    const response = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    return cached || await caches.match(OFFLINE_URL);
  }
};

self.addEventListener('fetch', (event) => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // Handle API requests
  if (isApiRequest(event.request)) {
    event.respondWith(networkFirstWithTimeout(event.request));
    return;
  }

  // Handle static assets
  event.respondWith(cacheFirst(event.request));
});

// Handle background sync for offline mutations
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    event.waitUntil(syncMutations());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
    data: data.data,
    actions: data.actions,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});