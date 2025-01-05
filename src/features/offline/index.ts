/**
 * @fileoverview Main entry point for offline module
 * @version 1.0.0
 * @created 2024-03-21
 */

import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';
import { OfflineService } from './services/offlineService';
import { ServiceWorkerRegistration } from './sw/register';
import { 
  OfflineConfig,
  NetworkStatus,
  SyncStatus,
  StorageQuota,
  OfflineEvent,
  OfflineEventHandler
} from './types';
import { OfflineError, InitializationError } from './types/errors';

export class OfflineModule {
  private static instance: OfflineModule;
  private logger: Logger;
  private metrics: Metrics;
  private service: OfflineService;
  private swRegistration: ServiceWorkerRegistration;
  private eventHandlers: Map<string, Set<OfflineEventHandler>>;
  private isInitialized = false;

  private constructor() {
    this.logger = new Logger('OfflineModule');
    this.metrics = new Metrics('offline');
    this.service = OfflineService.getInstance();
    this.swRegistration = new ServiceWorkerRegistration();
    this.eventHandlers = new Map();
  }

  public static getInstance(): OfflineModule {
    if (!OfflineModule.instance) {
      OfflineModule.instance = new OfflineModule();
    }
    return OfflineModule.instance;
  }

  /**
   * Initialize offline module
   */
  async initialize(config: OfflineConfig): Promise<void> {
    try {
      if (this.isInitialized) return;

      const startTime = performance.now();

      // Initialize service worker
      await this.swRegistration.register();

      // Initialize offline service
      await this.service.initialize(config);

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;

      // Record metrics
      const duration = performance.now() - startTime;
      this.metrics.recordTiming('initialization_duration', duration);
      this.metrics.increment('initializations', 1);

      this.logger.info('Offline module initialized', {
        version: config.version,
        duration
      });
    } catch (error) {
      this.metrics.increment('initialization_errors', 1);
      this.logger.error('Failed to initialize offline module', { error });
      throw new InitializationError('Failed to initialize offline module', {
        cause: error as Error,
        details: {
          component: 'OfflineModule',
          state: 'initialization'
        }
      });
    }
  }

  /**
   * Store data for offline use
   */
  async store<T>(
    key: string,
    data: T,
    options?: {
      expiresIn?: number;
      priority?: 'high' | 'normal' | 'low';
    }
  ): Promise<void> {
    this.checkInitialization();
    return this.service.store(key, data, options);
  }

  /**
   * Retrieve offline data
   */
  async retrieve<T>(key: string): Promise<T | null> {
    this.checkInitialization();
    return this.service.retrieve(key);
  }

  /**
   * Queue operation for sync
   */
  async queueSync<T>(operation: {
    type: 'create' | 'update' | 'delete';
    resourceId: string;
    resourceType: string;
    data: T;
    baseVersion?: number;
  }): Promise<void> {
    this.checkInitialization();
    return this.service.queueSync(operation);
  }

  /**
   * Force sync
   */
  async sync(): Promise<SyncStatus> {
    this.checkInitialization();
    return this.service.sync();
  }

  /**
   * Get network status
   */
  getNetworkStatus(): NetworkStatus {
    this.checkInitialization();
    return this.service.getNetworkStatus();
  }

  /**
   * Get storage quota
   */
  async getStorageQuota(): Promise<StorageQuota> {
    this.checkInitialization();
    return this.service.getStorageQuota();
  }

  /**
   * Clear offline data
   */
  async clearData(): Promise<void> {
    this.checkInitialization();
    await this.service.clearData();
    await this.swRegistration.sendMessage({ type: 'CLEAR_CACHE' });
  }

  /**
   * Subscribe to offline events
   */
  subscribe(
    eventType: 'sync' | 'network' | 'storage' | 'conflict' | '*',
    handler: OfflineEventHandler
  ): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }

    this.eventHandlers.get(eventType)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.eventHandlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Get service worker status
   */
  getServiceWorkerStatus(): {
    registered: boolean;
    active: boolean;
    waiting: boolean;
    installing: boolean;
  } {
    return this.swRegistration.getStatus();
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    return this.swRegistration.update();
  }

  private checkInitialization(): void {
    if (!this.isInitialized) {
      throw new InitializationError('Offline module not initialized', {
        details: {
          component: 'OfflineModule',
          state: 'not_initialized'
        }
      });
    }
  }

  private setupEventListeners(): void {
    // Listen for service worker events
    window.addEventListener('serviceWorkerUpdate', (event: CustomEvent) => {
      this.handleEvent({
        type: 'sync',
        timestamp: Date.now(),
        details: {
          type: 'update_available',
          registration: event.detail.registration
        }
      });
    });

    window.addEventListener('syncRequired', (event: CustomEvent) => {
      this.handleEvent({
        type: 'sync',
        timestamp: Date.now(),
        details: event.detail
      });
    });

    window.addEventListener('cacheUpdated', (event: CustomEvent) => {
      this.handleEvent({
        type: 'storage',
        timestamp: Date.now(),
        details: event.detail
      });
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.handleEvent({
        type: 'network',
        timestamp: Date.now(),
        details: { status: 'online' }
      });
    });

    window.addEventListener('offline', () => {
      this.handleEvent({
        type: 'network',
        timestamp: Date.now(),
        details: { status: 'offline' }
      });
    });
  }

  private handleEvent(event: OfflineEvent): void {
    // Notify specific event handlers
    this.eventHandlers.get(event.type)?.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        this.logger.error('Event handler error', { error, event });
      }
    });

    // Notify wildcard handlers
    this.eventHandlers.get('*')?.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        this.logger.error('Event handler error', { error, event });
      }
    });

    // Record metrics
    this.metrics.increment('events', 1, {
      type: event.type
    });
  }
}

// Export types
export * from './types';
export * from './types/errors';
