/**
 * @fileoverview Service worker registration helper
 * @version 1.0.0
 * @created 2024-03-21
 */

import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';
import { ServiceWorkerError } from '../types/errors';
import { ServiceWorkerConfig } from '../types';

export class ServiceWorkerRegistration {
  private logger: Logger;
  private metrics: Metrics;
  private registration: ServiceWorkerRegistration | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(
    private config: ServiceWorkerConfig = {
      scope: '/',
      version: '1.0.0',
      cachePrefix: 'wcn-cache',
      cacheExclusions: [],
      apiEndpoint: '/api',
      syncEndpoint: '/api/sync'
    }
  ) {
    this.logger = new Logger('ServiceWorkerRegistration');
    this.metrics = new Metrics('sw_registration');
  }

  /**
   * Register service worker
   */
  async register(): Promise<ServiceWorkerRegistration> {
    try {
      if (!('serviceWorker' in navigator)) {
        throw new ServiceWorkerError('Service workers are not supported');
      }

      const startTime = performance.now();

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: this.config.scope
      });

      // Record metrics
      const duration = performance.now() - startTime;
      this.metrics.recordTiming('registration_duration', duration);
      this.metrics.increment('registrations', 1);

      this.logger.info('Service worker registered', {
        scope: this.registration.scope,
        version: this.config.version
      });

      // Setup update checking
      this.setupUpdateChecking();

      // Setup message handlers
      this.setupMessageHandlers();

      return this.registration;
    } catch (error) {
      this.metrics.increment('registration_errors', 1);
      this.logger.error('Service worker registration failed', { error });
      throw new ServiceWorkerError('Failed to register service worker', {
        cause: error as Error
      });
    }
  }

  /**
   * Unregister service worker
   */
  async unregister(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false;
      }

      const startTime = performance.now();
      const result = await this.registration.unregister();

      // Record metrics
      const duration = performance.now() - startTime;
      this.metrics.recordTiming('unregister_duration', duration);
      this.metrics.increment('unregistrations', 1);

      this.logger.info('Service worker unregistered', {
        success: result
      });

      // Clear update checking
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }

      return result;
    } catch (error) {
      this.metrics.increment('unregister_errors', 1);
      this.logger.error('Service worker unregistration failed', { error });
      throw new ServiceWorkerError('Failed to unregister service worker', {
        cause: error as Error
      });
    }
  }

  /**
   * Update service worker
   */
  async update(): Promise<void> {
    try {
      if (!this.registration) {
        throw new ServiceWorkerError('Service worker not registered');
      }

      const startTime = performance.now();
      await this.registration.update();

      // Record metrics
      const duration = performance.now() - startTime;
      this.metrics.recordTiming('update_duration', duration);
      this.metrics.increment('updates', 1);

      this.logger.info('Service worker updated');
    } catch (error) {
      this.metrics.increment('update_errors', 1);
      this.logger.error('Service worker update failed', { error });
      throw new ServiceWorkerError('Failed to update service worker', {
        cause: error as Error
      });
    }
  }

  /**
   * Send message to service worker
   */
  async sendMessage(message: { type: string; payload?: any }): Promise<void> {
    try {
      if (!this.registration?.active) {
        throw new ServiceWorkerError('No active service worker');
      }

      await this.registration.active.postMessage(message);
      
      this.metrics.increment('messages_sent', 1, {
        type: message.type
      });

      this.logger.info('Message sent to service worker', { type: message.type });
    } catch (error) {
      this.metrics.increment('message_errors', 1);
      this.logger.error('Failed to send message to service worker', { error });
      throw new ServiceWorkerError('Failed to send message to service worker', {
        cause: error as Error
      });
    }
  }

  /**
   * Get registration status
   */
  getStatus(): {
    registered: boolean;
    active: boolean;
    waiting: boolean;
    installing: boolean;
  } {
    return {
      registered: !!this.registration,
      active: !!this.registration?.active,
      waiting: !!this.registration?.waiting,
      installing: !!this.registration?.installing
    };
  }

  private setupUpdateChecking(): void {
    // Check for updates every hour
    this.updateInterval = setInterval(() => {
      this.update().catch(error => {
        this.logger.error('Automatic update check failed', { error });
      });
    }, 60 * 60 * 1000);

    // Handle updates
    this.registration?.addEventListener('updatefound', () => {
      const newWorker = this.registration?.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          this.metrics.increment('updates_available', 1);
          this.logger.info('New service worker version available');
          
          // Notify application
          window.dispatchEvent(
            new CustomEvent('serviceWorkerUpdate', {
              detail: {
                registration: this.registration
              }
            })
          );
        }
      });
    });
  }

  private setupMessageHandlers(): void {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, payload } = event.data;

      this.metrics.increment('messages_received', 1, { type });
      this.logger.info('Message received from service worker', { type });

      // Handle specific message types
      switch (type) {
        case 'SYNC_REQUIRED':
          window.dispatchEvent(
            new CustomEvent('syncRequired', {
              detail: payload
            })
          );
          break;

        case 'CACHE_UPDATED':
          window.dispatchEvent(
            new CustomEvent('cacheUpdated', {
              detail: payload
            })
          );
          break;

        case 'ERROR':
          this.metrics.increment('worker_errors', 1);
          this.logger.error('Service worker error', payload);
          break;

        default:
          // Forward unhandled messages
          window.dispatchEvent(
            new CustomEvent('serviceWorkerMessage', {
              detail: { type, payload }
            })
          );
      }
    });
  }
} 