/**
 * @fileoverview Service worker for offline caching
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'writecarenotes-v1';
const API_CACHE_NAME = 'writecarenotes-api-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/static/css/main.css',
  '/static/js/main.js',
];

const API_ROUTES = [
  '/api/calendar/events',
  '/api/users/profile',
  '/api/organizations',
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(API_CACHE_NAME),
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Helper function to determine if a request is for an API route
const isApiRequest = (request: Request): boolean => {
  return API_ROUTES.some((route) => request.url.includes(route));
};

// Helper function to determine if a request should be cached
const shouldCache = (request: Request): boolean => {
  // Only cache GET requests
  if (request.method !== 'GET') return false;

  // Don't cache auth requests
  if (request.url.includes('/api/auth')) return false;

  // Cache API requests and static assets
  return isApiRequest(request) || STATIC_ASSETS.includes(new URL(request.url).pathname);
};

// Fetch event - handle offline requests
self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;

  // Handle API requests
  if (isApiRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();

          if (shouldCache(request)) {
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return response;
        })
        .catch(() => {
          // Return cached response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets and other requests
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        if (shouldCache(request)) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      });
    })
  );
});

// Handle background sync
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-calendar-events') {
    event.waitUntil(syncCalendarEvents());
  }
});

// Helper function to sync calendar events
async function syncCalendarEvents(): Promise<void> {
  try {
    const db = await openIndexedDB();
    const pendingActions = await db.getAll('syncActions');

    for (const action of pendingActions) {
      try {
        const response = await fetch(`/api/calendar/events${action.id ? `/${action.id}` : ''}`, {
          method: action.type === 'delete' ? 'DELETE' : action.type === 'update' ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action.data),
        });

        if (response.ok) {
          await db.delete('syncActions', action.id);
        }
      } catch (error) {
        console.error('Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('Failed to sync calendar events:', error);
  }
}

// Helper function to open IndexedDB
async function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('writecarenotes_offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('syncActions')) {
        db.createObjectStore('syncActions', { keyPath: 'id' });
      }
    };
  });
} 