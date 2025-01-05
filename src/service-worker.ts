/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

clientsClaim();
self.skipWaiting();

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses
const apiCacheStrategy = new NetworkFirst({
  cacheName: 'api-cache',
  plugins: [
    new ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 24 * 60 * 60, // 24 hours
    }),
    new CacheableResponsePlugin({
      statuses: [0, 200],
    }),
  ],
});

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  apiCacheStrategy
);

// Cache static assets
const staticAssetStrategy = new CacheFirst({
  cacheName: 'static-assets',
  plugins: [
    new ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
    }),
  ],
});

registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image',
  staticAssetStrategy
);

// Background sync for offline changes
const bgSyncPlugin = new BackgroundSyncPlugin('offline-changes', {
  maxRetentionTime: 24 * 60, // 24 hours (in minutes)
  onSync: async ({ queue }) => {
    try {
      await queue.replayRequests();
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'BACKGROUND_SYNC_COMPLETE',
            timestamp: new Date().toISOString(),
          });
        });
      });
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  },
});

// Register routes for background sync
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/schedule/'),
  new NetworkFirst({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/schedule/'),
  new NetworkFirst({
    plugins: [bgSyncPlugin],
  }),
  'PUT'
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/schedule/'),
  new NetworkFirst({
    plugins: [bgSyncPlugin],
  }),
  'DELETE'
);

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/notification-icon.png',
    badge: '/icons/notification-badge.png',
    tag: data.tag || 'default',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const action = event.action || 'default';
  const notification = event.notification;

  let url = '/';
  if (notification.data && notification.data.url) {
    url = notification.data.url;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Periodic sync for data updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'schedule-sync') {
    event.waitUntil(
      fetch('/api/schedule/sync')
        .then((response) => response.json())
        .then((data) => {
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'PERIODIC_SYNC_COMPLETE',
                data,
                timestamp: new Date().toISOString(),
              });
            });
          });
        })
        .catch((error) => {
          console.error('Periodic sync failed:', error);
        })
    );
  }
});
