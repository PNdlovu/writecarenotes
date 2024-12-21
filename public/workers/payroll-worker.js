const CACHE_NAME = 'payroll-cache-v1';
const OFFLINE_URL = '/offline';

const CACHED_APIS = [
  '/api/tax-rates',
  '/api/ni-rates',
  '/api/bank-holidays',
  '/api/minimum-wage',
  '/api/exchange-rates'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll([
          OFFLINE_URL,
          ...CACHED_APIS
        ]);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          // Return cached response
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page if fetch fails
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }
        });
      })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-payroll-data') {
    event.waitUntil(syncPayrollData());
  }
});

async function syncPayrollData() {
  const db = await openDB();
  const tx = db.transaction('offline-changes', 'readonly');
  const store = tx.objectStore('offline-changes');
  const changes = await store.getAll();

  for (const change of changes) {
    try {
      // Attempt to sync each change
      await fetch('/api/payroll/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(change),
      });

      // Remove synced change
      const deleteTx = db.transaction('offline-changes', 'readwrite');
      const deleteStore = deleteTx.objectStore('offline-changes');
      await deleteStore.delete(change.id);
    } catch (error) {
      console.error('Failed to sync change:', error);
      // Leave failed changes in the store for retry
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('payroll-offline', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
