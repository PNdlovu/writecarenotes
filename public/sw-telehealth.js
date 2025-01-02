/**
 * @fileoverview Telehealth Service Worker
 * @version 1.0.0
 * @created 2024-12-30
 */

const CACHE_NAME = 'telehealth-cache-v1';
const API_CACHE_NAME = 'telehealth-api-cache-v1';
const QUEUE_NAME = 'telehealth-offline-queue';

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/logo.png',
  '/images/icons/offline.svg'
];

const API_ROUTES = [
  '/api/telehealth/consultations',
  '/api/telehealth/video-sessions',
  '/api/telehealth/monitoring',
  '/api/telehealth/documents',
  '/api/telehealth/reports'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME && key !== API_CACHE_NAME)
          .map(key => caches.delete(key))
      )),
      self.clients.claim()
    ])
  );
});

// Fetch event - handle requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Handle API requests
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/offline.html'))
  );
});

// Handle API requests
async function handleApiRequest(request) {
  // Only cache GET requests
  if (request.method === 'GET') {
    try {
      const response = await fetch(request);
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
      return response;
    } catch (error) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      throw error;
    }
  }

  // For non-GET requests when offline, queue them
  if (!navigator.onLine) {
    await queueRequest(request);
    return new Response(JSON.stringify({
      status: 'queued',
      message: 'Request queued for sync'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return fetch(request);
}

// Queue offline requests
async function queueRequest(request) {
  const queue = await getQueue();
  const serializedRequest = await serializeRequest(request);
  queue.push(serializedRequest);
  await saveQueue(queue);
}

// Process queued requests when back online
self.addEventListener('sync', event => {
  if (event.tag === 'sync-telehealth') {
    event.waitUntil(processQueue());
  }
});

async function processQueue() {
  const queue = await getQueue();
  if (!queue.length) return;

  const failedRequests = [];

  for (const serializedRequest of queue) {
    try {
      const request = deserializeRequest(serializedRequest);
      await fetch(request);
    } catch (error) {
      failedRequests.push(serializedRequest);
    }
  }

  await saveQueue(failedRequests);
}

// Helper functions
async function getQueue() {
  const data = await idb.get('offlineQueue') || [];
  return data;
}

async function saveQueue(queue) {
  await idb.set('offlineQueue', queue);
}

async function serializeRequest(request) {
  const headers = {};
  for (const [key, value] of request.headers) {
    headers[key] = value;
  }

  return {
    url: request.url,
    method: request.method,
    headers,
    body: await request.text(),
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    referrer: request.referrer
  };
}

function deserializeRequest(data) {
  return new Request(data.url, {
    method: data.method,
    headers: data.headers,
    body: data.body,
    mode: data.mode,
    credentials: data.credentials,
    cache: data.cache,
    redirect: data.redirect,
    referrer: data.referrer
  });
}

// IndexedDB wrapper
const idb = {
  async get(key) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('telehealth-offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('store', 'readonly');
        const store = tx.objectStore('store');
        
        const getRequest = store.get(key);
        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = () => resolve(getRequest.result);
      };
      
      request.onupgradeneeded = event => {
        const db = event.target.result;
        db.createObjectStore('store');
      };
    });
  },
  
  async set(key, value) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('telehealth-offline', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('store', 'readwrite');
        const store = tx.objectStore('store');
        
        const putRequest = store.put(value, key);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      };
      
      request.onupgradeneeded = event => {
        const db = event.target.result;
        db.createObjectStore('store');
      };
    });
  }
}; 