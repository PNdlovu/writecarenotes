/**
 * @fileoverview Service worker for offline support
 * @version 1.0.0
 * @created 2024-03-21
 */

import { ServiceWorkerConfig, CacheConfig, BackgroundSyncConfig } from '../types';
import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';

declare const self: ServiceWorkerGlobalScope;

class OfflineServiceWorker {
  private config: ServiceWorkerConfig;
  private cacheConfig: CacheConfig;
  private syncConfig: BackgroundSyncConfig;
  private logger: Logger;
  private metrics: Metrics;

  constructor() {
    this.logger = new Logger('ServiceWorker');
    this.metrics = new Metrics('sw');
    
    // Default configurations
    this.config = {
      scope: '/',
      version: '1.0.0',
      cachePrefix: 'wcn-cache',
      cacheExclusions: [
        '/api/health',
        '/api/metrics'
      ],
      apiEndpoint: '/api',
      syncEndpoint: '/api/sync'
    };

    this.cacheConfig = {
      name: `${this.config.cachePrefix}-v${this.config.version}`,
      version: this.config.version,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxItems: 1000,
      patterns: [
        '/static/',
        '/assets/',
        '/api/'
      ]
    };

    this.syncConfig = {
      tag: 'wcn-sync',
      maxRetries: 5,
      minBackoff: 1000,
      maxBackoff: 300000 // 5 minutes
    };

    this.initialize();
  }

  private initialize(): void {
    // Install event handler
    self.addEventListener('install', (event) => {
      event.waitUntil(this.handleInstall());
    });

    // Activate event handler
    self.addEventListener('activate', (event) => {
      event.waitUntil(this.handleActivate());
    });

    // Fetch event handler
    self.addEventListener('fetch', (event) => {
      event.respondWith(this.handleFetch(event));
    });

    // Sync event handler
    self.addEventListener('sync', (event) => {
      if (event.tag === this.syncConfig.tag) {
        event.waitUntil(this.handleSync());
      }
    });

    // Push event handler
    self.addEventListener('push', (event) => {
      event.waitUntil(this.handlePush(event));
    });

    // Message event handler
    self.addEventListener('message', (event) => {
      event.waitUntil(this.handleMessage(event));
    });

    this.logger.info('Service worker initialized');
  }

  private async handleInstall(): Promise<void> {
    try {
      const startTime = performance.now();

      // Pre-cache essential resources
      const cache = await caches.open(this.cacheConfig.name);
      const urlsToCache = [
        '/',
        '/index.html',
        '/offline.html',
        '/manifest.json',
        '/static/css/main.css',
        '/static/js/main.js'
      ];

      await cache.addAll(urlsToCache);

      // Record metrics
      const duration = performance.now() - startTime;
      this.metrics.recordTiming('install_duration', duration);
      this.metrics.increment('installations', 1);

      this.logger.info('Service worker installed', {
        version: this.config.version,
        duration
      });

      // Activate immediately
      await self.skipWaiting();
    } catch (error) {
      this.logger.error('Installation failed', { error });
      throw error;
    }
  }

  private async handleActivate(): Promise<void> {
    try {
      const startTime = performance.now();

      // Clean up old caches
      const cacheKeys = await caches.keys();
      const oldCaches = cacheKeys.filter(key => 
        key.startsWith(this.config.cachePrefix) && 
        key !== this.cacheConfig.name
      );

      await Promise.all(oldCaches.map(key => caches.delete(key)));

      // Record metrics
      const duration = performance.now() - startTime;
      this.metrics.recordTiming('activate_duration', duration);
      this.metrics.gauge('old_caches_cleaned', oldCaches.length);

      this.logger.info('Service worker activated', {
        version: this.config.version,
        cleanedCaches: oldCaches.length,
        duration
      });

      // Take control of all clients
      await self.clients.claim();
    } catch (error) {
      this.logger.error('Activation failed', { error });
      throw error;
    }
  }

  private async handleFetch(event: FetchEvent): Promise<Response> {
    try {
      const startTime = performance.now();
      const request = event.request;
      let response: Response | undefined;

      // Skip excluded URLs
      if (this.isExcluded(request.url)) {
        return fetch(request);
      }

      // Try to get from cache first
      response = await caches.match(request);
      if (response) {
        // Record cache hit
        this.metrics.increment('cache_hits', 1);
        return response;
      }

      // If not in cache, try network
      try {
        response = await fetch(request);
        
        // Cache successful responses
        if (response.ok && this.shouldCache(request)) {
          const cache = await caches.open(this.cacheConfig.name);
          await cache.put(request, response.clone());
        }

        // Record metrics
        const duration = performance.now() - startTime;
        this.metrics.recordTiming('fetch_duration', duration);
        this.metrics.increment('network_fetches', 1);

        return response;
      } catch (error) {
        // Network error, return offline fallback
        this.metrics.increment('network_errors', 1);
        return this.handleOfflineFallback(request);
      }
    } catch (error) {
      this.logger.error('Fetch failed', { error, url: event.request.url });
      throw error;
    }
  }

  private async handleSync(): Promise<void> {
    try {
      const startTime = performance.now();

      // Get all clients
      const clients = await self.clients.matchAll();
      
      // Notify clients to perform sync
      await Promise.all(
        clients.map(client =>
          client.postMessage({
            type: 'SYNC_REQUIRED',
            timestamp: Date.now()
          })
        )
      );

      // Record metrics
      const duration = performance.now() - startTime;
      this.metrics.recordTiming('sync_duration', duration);
      this.metrics.increment('sync_attempts', 1);

      this.logger.info('Sync completed', {
        duration,
        clientCount: clients.length
      });
    } catch (error) {
      this.logger.error('Sync failed', { error });
      throw error;
    }
  }

  private async handlePush(event: PushEvent): Promise<void> {
    try {
      if (!event.data) return;

      const data = event.data.json();
      
      // Show notification
      await self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        data: data.data
      });

      // Record metrics
      this.metrics.increment('push_notifications', 1);

      this.logger.info('Push notification shown', { data });
    } catch (error) {
      this.logger.error('Push handling failed', { error });
      throw error;
    }
  }

  private async handleMessage(event: ExtendableMessageEvent): Promise<void> {
    try {
      const { type, payload } = event.data;

      switch (type) {
        case 'SKIP_WAITING':
          await self.skipWaiting();
          break;

        case 'UPDATE_CONFIG':
          this.updateConfig(payload);
          break;

        case 'CLEAR_CACHE':
          await this.clearCache();
          break;

        default:
          this.logger.warn('Unknown message type', { type });
      }

      // Record metrics
      this.metrics.increment('messages_handled', 1, { type });
    } catch (error) {
      this.logger.error('Message handling failed', { error });
      throw error;
    }
  }

  private async handleOfflineFallback(request: Request): Promise<Response> {
    // Check if HTML request
    if (request.headers.get('Accept')?.includes('text/html')) {
      const cache = await caches.open(this.cacheConfig.name);
      const response = await cache.match('/offline.html');
      if (response) return response;
    }

    // Return empty response for other resources
    return new Response(null, {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }

  private isExcluded(url: string): boolean {
    return this.config.cacheExclusions.some(pattern => 
      url.includes(pattern)
    );
  }

  private shouldCache(request: Request): boolean {
    // Only cache GET requests
    if (request.method !== 'GET') return false;

    // Check against cache patterns
    return this.cacheConfig.patterns.some(pattern =>
      request.url.includes(pattern)
    );
  }

  private updateConfig(newConfig: Partial<ServiceWorkerConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };

    this.logger.info('Configuration updated', { config: this.config });
  }

  private async clearCache(): Promise<void> {
    try {
      const cache = await caches.open(this.cacheConfig.name);
      await cache.keys().then(keys => 
        Promise.all(keys.map(key => cache.delete(key)))
      );

      this.metrics.increment('cache_clears', 1);
      this.logger.info('Cache cleared');
    } catch (error) {
      this.logger.error('Cache clear failed', { error });
      throw error;
    }
  }
}

// Initialize service worker
new OfflineServiceWorker(); 