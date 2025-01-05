/**
 * @writecarenotes.com
 * @fileoverview Service worker for offline capabilities
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service worker implementation providing offline capabilities,
 * background sync, and push notifications. Handles caching of
 * static assets and API responses, manages sync queue for offline
 * operations, and processes push notifications.
 */

/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'writecarenotes-v1';
const API_CACHE_NAME = 'writecarenotes-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/logo.png',
  '/favicon.ico',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/dashboard.png',
  '/icons/residents.png',
  '/icons/staff.png',
  '/icons/medications.png',
];

// API routes to cache
const API_ROUTES = [
  '/api/config',
  '/api/regions',
  '/api/organizations',
  '/api/user/preferences',
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => 
        cache.addAll(STATIC_ASSETS)
      ),
      // Cache API responses
      caches.open(API_CACHE_NAME).then((cache) => 
        Promise.all(
          API_ROUTES.map(route => 
            fetch(route)
              .then(response => cache.put(route, response))
              .catch(() => console.warn(`Failed to cache ${route}`))
          )
        )
      )
    ]).then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    Promise.all([
      // Remove old caches
      caches.keys().then(keys => 
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME && key !== API_CACHE_NAME)
            .map(key => caches.delete(key))
        )
      ),
      // Claim clients
      self.clients.claim()
    ])
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle other requests
  event.respondWith(handleOtherRequest(request));
});

// Handle API requests
async function handleApiRequest(request: Request): Promise<Response> {
  // Try network first
  try {
    const response = await fetch(request);
    const cache = await caches.open(API_CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    // If offline, try cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // If not in cache, queue for sync
    await queueForSync(request);
    
    // Return offline response
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'This request has been queued for sync'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle navigation requests
async function handleNavigationRequest(request: Request): Promise<Response> {
  try {
    // Try network first
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    // If offline, try cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // If not in cache, return offline page
    return caches.match('/offline.html') as Promise<Response>;
  }
}

// Handle other requests
async function handleOtherRequest(request: Request): Promise<Response> {
  // Try cache first
  const cached = await caches.match(request);
  if (cached) return cached;

  // If not in cache, try network
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    // If offline and not in cache, return error
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Queue request for sync
async function queueForSync(request: Request): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  const store = tx.objectStore('syncQueue');
  
  await store.add({
    url: request.url,
    method: request.method,
    headers: Array.from(request.headers.entries()),
    body: await request.clone().text(),
    timestamp: Date.now()
  });
}

// Process sync queue
async function processSyncQueue(): Promise<void> {
  const db = await openDB();
  const tx = db.transaction('syncQueue', 'readwrite');
  const store = tx.objectStore('syncQueue');
  
  const requests = await store.getAll();
  
  for (const request of requests) {
    try {
      await fetch(request.url, {
        method: request.method,
        headers: new Headers(request.headers),
        body: request.method !== 'GET' ? request.body : undefined
      });
      
      await store.delete(request.timestamp);
    } catch (error) {
      console.error('Failed to sync request:', error);
    }
  }
}

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('writecarenotes-offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'timestamp' });
      }
      
      // Create offline store
      if (!db.objectStoreNames.contains('offlineStore')) {
        db.createObjectStore('offlineStore', { keyPath: 'id' });
      }
    };
  });
}

// Sync event - process sync queue
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'sync-pending-changes') {
    event.waitUntil(processSyncQueue());
  }
});

// Push event - handle notifications
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return;

  const data = event.data.json();
  
  const options: NotificationOptions = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    renotify: data.renotify || false,
    silent: data.silent || false,
    timestamp: data.timestamp || Date.now()
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  const data = event.notification.data;
  const action = event.action;

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // If a window is already open, focus it
      for (const client of clients) {
        if (client.url === data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(data.url);
      }
    })
  );
}); 