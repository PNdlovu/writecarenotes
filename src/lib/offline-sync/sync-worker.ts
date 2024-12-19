/// <reference lib="webworker" />

import { SyncManager } from './sync-manager';

declare const self: ServiceWorkerGlobalScope;

const syncManager = SyncManager.getInstance();

// Handle sync events
self.addEventListener('sync', (event) => {
  if (event.tag === 'medication-sync') {
    event.waitUntil(syncManager.syncPendingActions());
  }
});

// Handle periodic sync
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'medication-periodic-sync') {
    event.waitUntil(syncManager.syncPendingActions());
  }
});

// Handle offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(async () => {
      // Check if we have a cached response
      const cache = await caches.open('medication-cache');
      const cachedResponse = await cache.match(event.request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Return offline fallback
      if (event.request.mode === 'navigate') {
        return cache.match('/offline.html');
      }
      
      throw new Error('Network error');
    })
  );
});

// Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('medication-cache').then((cache) => {
      return cache.addAll([
        '/offline.html',
        '/static/css/main.css',
        '/static/js/main.js',
        '/static/images/offline.svg',
      ]);
    })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== 'medication-cache')
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});


