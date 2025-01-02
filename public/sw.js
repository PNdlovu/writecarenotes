// Cache version management
const VERSION = '1.0.0';
const CACHE_NAMES = {
  static: `static-${VERSION}`,
  dynamic: `dynamic-${VERSION}`,
  painManagement: `pain-management-${VERSION}`
};

// Configuration
const CONFIG = {
  debug: false,
  maxCacheSize: 50 * 1024 * 1024, // 50MB
  maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  syncEndpoint: '/api/sync',
  offlineDataKey: 'offline-changes'
};

// Assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico'
];

// Security patterns
const SENSITIVE_PATTERNS = [
  '/api/auth',
  '/api/payment'
];

// Utility functions
const log = (message, type = 'info') => {
  if (CONFIG.debug || type === 'error') {
    console[type](`[ServiceWorker ${VERSION}] ${message}`);
  }
};

const isSecurePage = (url) => {
  return SENSITIVE_PATTERNS.some(pattern => url.includes(pattern));
};

const measureCacheSize = async (cacheName) => {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  let size = 0;
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const blob = await response.blob();
      size += blob.size;
    }
  }
  return size;
};

const cleanOldCache = async () => {
  const cache = await caches.open(CACHE_NAMES.dynamic);
  const keys = await cache.keys();
  const now = Date.now();
  
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const cacheTime = new Date(dateHeader).getTime();
        if (now - cacheTime > CONFIG.maxCacheAge) {
          await cache.delete(request);
          log(`Cleaned old cache for: ${request.url}`);
        }
      }
    }
  }
};

// Queue for offline changes
class OfflineQueue {
  static async add(change) {
    const db = await this.getDb();
    const tx = db.transaction('changes', 'readwrite');
    await tx.store.add({
      ...change,
      timestamp: Date.now()
    });
    log('Added change to offline queue');
  }

  static async sync() {
    const db = await this.getDb();
    const tx = db.transaction('changes', 'readwrite');
    const changes = await tx.store.getAll();
    
    if (changes.length === 0) return;
    
    try {
      const response = await fetch(CONFIG.syncEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes)
      });
      
      if (response.ok) {
        await tx.store.clear();
        log(`Synced ${changes.length} changes`);
      }
    } catch (error) {
      log(`Sync failed: ${error.message}`, 'error');
    }
  }

  static async getDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('offlineDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('changes', { keyPath: 'id', autoIncrement: true });
      };
    });
  }
}

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => {
        log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => log(`Cache installation failed: ${error.message}`, 'error'))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => !Object.values(CACHE_NAMES).includes(name))
            .map(name => {
              log(`Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      }),
      cleanOldCache()
    ])
  );
});

// Fetch event - handle offline requests
self.addEventListener('fetch', (event) => {
  // Security check
  if (isSecurePage(event.request.url)) {
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => caches.match('/offline'))
      );
    }
    return;
  }

  // Pain Management specific handling
  if (event.request.url.includes('/api/pain-management')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAMES.painManagement)
            .then(cache => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            log('Serving pain management data from cache');
            return cachedResponse;
          }
          throw new Error('No cached data available');
        })
    );
    return;
  }

  // POST request handling
  if (event.request.method === 'POST') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        await OfflineQueue.add({
          url: event.request.url,
          method: event.request.method,
          body: await event.request.clone().text()
        });
        return new Response(JSON.stringify({ 
          status: 'queued',
          message: 'Your changes will be synchronized when online'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // General fetch handling
  event.respondWith(
    caches.match(event.request)
      .then(async (response) => {
        if (response) {
          log(`Serving from cache: ${event.request.url}`);
          return response;
        }

        try {
          const networkResponse = await fetch(event.request);
          
          // Check cache size before caching
          const cacheSize = await measureCacheSize(CACHE_NAMES.dynamic);
          if (cacheSize < CONFIG.maxCacheSize) {
            const cache = await caches.open(CACHE_NAMES.dynamic);
            cache.put(event.request, networkResponse.clone());
            log(`Cached new response: ${event.request.url}`);
          } else {
            log('Cache size limit reached, skipping cache', 'warn');
          }
          
          return networkResponse;
        } catch (error) {
          log(`Fetch failed: ${error.message}`, 'error');
          
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
          
          throw error;
        }
      })
  );
});

// Sync event - handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-changes') {
    event.waitUntil(OfflineQueue.sync());
  }
});

// Message event - handle client messages
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});