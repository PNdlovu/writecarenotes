/**
 * @fileoverview Offline Service for managing offline data and synchronization
 * @version 1.0.0
 * @created 2024-03-21
 */

import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';
import { IndexedDB } from '../storage/indexedDB';
import { NetworkMonitor } from '../network/networkMonitor';
import { SyncQueue } from '../sync/syncQueue';
import { ConflictResolver } from '../sync/conflictResolver';
import { 
  OfflineConfig,
  SyncOperation,
  StorageQuota,
  NetworkStatus,
  SyncStatus,
  ConflictResolution
} from '../types';
import { StorageError, SyncError } from '../types/errors';

export class OfflineService {
  private static instance: OfflineService;
  private db: IndexedDB | null = null;
  private networkMonitor: NetworkMonitor | null = null;
  private syncQueue: SyncQueue | null = null;
  private conflictResolver: ConflictResolver | null = null;
  private logger: Logger;
  private metrics: Metrics;
  private config: OfflineConfig | null = null;
  private isInitialized = false;
  private syncInProgress = false;
  private lastSyncTimestamp = 0;
  private isServerSide = typeof window === 'undefined';

  private constructor() {
    this.logger = new Logger('OfflineService');
    this.metrics = new Metrics('offline');
  }

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async initialize(config: OfflineConfig): Promise<void> {
    // Skip initialization on server side
    if (this.isServerSide) {
      this.logger.info('Skipping offline service initialization on server side');
      return;
    }

    if (this.isInitialized) return;

    try {
      this.config = config;
      
      // Initialize services
      this.db = new IndexedDB();
      this.networkMonitor = new NetworkMonitor();
      this.syncQueue = new SyncQueue();
      this.conflictResolver = new ConflictResolver();
      
      try {
        await this.db.initialize(config.storage);
      } catch (error) {
        this.logger.warn('Failed to initialize IndexedDB, offline storage will not be available', { error });
        this.db = null;
      }
      
      if (this.networkMonitor) {
        this.networkMonitor.initialize({
          pingEndpoint: config.network.pingEndpoint,
          pingInterval: config.network.pingInterval,
          onStatusChange: this.handleNetworkStatusChange.bind(this)
        });
      }

      if (this.syncQueue) {
        await this.syncQueue.initialize({
          maxRetries: config.sync.maxRetries,
          retryDelay: config.sync.retryDelay,
          batchSize: config.sync.batchSize
        });
      }

      // Setup periodic cleanup
      setInterval(() => this.cleanupStorage(), config.storage.cleanupInterval);

      this.isInitialized = true;
      this.logger.info('Offline service initialized');
      
      // Initial sync if online
      if (this.networkMonitor?.isOnline()) {
        await this.sync();
      }
    } catch (error) {
      this.logger.error('Failed to initialize offline service', { error });
      // Don't throw error, just log it
      this.logger.warn('Offline service will run in limited mode');
    }
  }

  private async handleNetworkStatusChange(status: NetworkStatus): Promise<void> {
    if (!this.isInitialized || this.isServerSide) return;

    if (status === 'online') {
      this.logger.info('Network connection restored');
      await this.sync();
    } else {
      this.logger.info('Network connection lost');
    }
  }

  async store<T>(
    key: string,
    data: T,
    options: {
      expiresIn?: number;
      priority?: 'high' | 'normal' | 'low';
    } = {}
  ): Promise<void> {
    if (!this.isInitialized || !this.db || this.isServerSide) {
      this.logger.warn('Offline storage not available');
      return;
    }

    try {
      // Check storage quota
      const quota = await this.getStorageQuota();
      if (quota.percentage > 90) {
        await this.cleanupStorage();
        
        // Check again after cleanup
        const newQuota = await this.getStorageQuota();
        if (newQuota.percentage > 90) {
          throw new StorageError('Storage quota exceeded');
        }
      }

      await this.db.set(key, {
        data,
        timestamp: Date.now(),
        expiresAt: options.expiresIn ? Date.now() + options.expiresIn : undefined,
        priority: options.priority || 'normal'
      });

      this.metrics.increment('store_operations', 1, { 
        status: 'success',
        priority: options.priority 
      });
    } catch (error) {
      this.metrics.increment('store_operations', 1, { status: 'error' });
      throw new StorageError('Failed to store offline data', { cause: error });
    }
  }

  async retrieve<T>(key: string): Promise<T | null> {
    if (!this.isInitialized || !this.db || this.isServerSide) {
      this.logger.warn('Offline storage not available');
      return null;
    }

    try {
      const entry = await this.db.get<T>(key);
      
      if (!entry) return null;

      // Check expiration
      if (entry.expiresAt && entry.expiresAt < Date.now()) {
        await this.db.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      throw new StorageError('Failed to retrieve offline data', { cause: error });
    }
  }

  async sync(): Promise<SyncStatus> {
    if (!this.isInitialized || !this.syncQueue || this.isServerSide) {
      return { status: 'skipped', timestamp: this.lastSyncTimestamp };
    }

    if (this.syncInProgress || !this.networkMonitor?.isOnline()) {
      return { status: 'skipped', timestamp: this.lastSyncTimestamp };
    }

    this.syncInProgress = true;
    const startTime = Date.now();

    try {
      // Process pending operations
      const operations = await this.syncQueue.getPendingOperations();
      
      for (const operation of operations) {
        try {
          // Check for conflicts
          if (this.conflictResolver) {
            const conflicts = await this.conflictResolver.checkConflicts(operation);
            
            if (conflicts.length > 0) {
              const resolution = await this.conflictResolver.resolveConflicts(conflicts);
              if (resolution === ConflictResolution.ABORT) {
                continue;
              }
            }
          }

          // Execute sync operation
          await this.executeSyncOperation(operation);
          
          // Mark as completed
          await this.syncQueue.markCompleted(operation.id);
        } catch (error) {
          this.logger.error('Failed to sync operation', { 
            operationId: operation.id,
            error 
          });
          
          if (operation.retryCount >= (this.config?.sync.maxRetries ?? 3)) {
            await this.syncQueue.markFailed(operation.id);
          } else {
            await this.syncQueue.incrementRetry(operation.id);
          }
        }
      }

      this.lastSyncTimestamp = Date.now();
      
      // Record metrics
      const duration = Date.now() - startTime;
      this.metrics.recordTiming('sync_duration', duration);
      this.metrics.increment('sync_operations', operations.length);

      return { 
        status: 'completed',
        timestamp: this.lastSyncTimestamp,
        operationsProcessed: operations.length
      };
    } catch (error) {
      throw new SyncError('Sync failed', { cause: error });
    } finally {
      this.syncInProgress = false;
    }
  }

  private async executeSyncOperation(operation: SyncOperation): Promise<void> {
    if (!this.config || this.isServerSide) return;

    const { type, resourceType, resourceId, data, baseVersion } = operation;
    const endpoint = `${this.config.apiEndpoint}/${resourceType}/${resourceId}`;
    
    const response = await fetch(endpoint, {
      method: type === 'delete' ? 'DELETE' : type === 'create' ? 'POST' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Base-Version': baseVersion?.toString() || '',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to execute sync operation: ${response.statusText}`);
    }
  }

  private async cleanupStorage(): Promise<void> {
    if (!this.isInitialized || !this.db || this.isServerSide) return;

    try {
      const entries = await this.db.getAll();
      const now = Date.now();

      for (const [key, entry] of entries) {
        if (entry.expiresAt && entry.expiresAt < now) {
          await this.db.delete(key);
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup storage', { error });
    }
  }

  async getStorageQuota(): Promise<StorageQuota> {
    if (!this.isInitialized || !this.db || this.isServerSide) {
      return { used: 0, total: 0, percentage: 0 };
    }

    return this.db.getQuota();
  }

  private checkInitialization(): void {
    if (!this.isInitialized) {
      throw new Error('Offline service not initialized');
    }
  }
}

export const offlineService = OfflineService.getInstance(); 