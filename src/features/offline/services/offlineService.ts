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
  ConflictResolution,
  ConflictResolutionDetails,
  ConflictStrategy,
  ConflictDetails,
  OperationalTransform,
  MergeStrategy,
  DiffResult
} from '../types';
import { StorageError, SyncError } from '../types/errors';

export class OfflineService {
  private static instance: OfflineService;
  private db: IndexedDB;
  private networkMonitor: NetworkMonitor;
  private syncQueue: SyncQueue;
  private conflictResolver: ConflictResolver;
  private logger: Logger;
  private metrics: Metrics;
  private config: OfflineConfig;
  private isInitialized = false;
  private syncInProgress = false;
  private lastSyncTimestamp = 0;

  private constructor() {
    this.logger = new Logger('OfflineService');
    this.metrics = new Metrics('offline');
    this.db = new IndexedDB();
    this.networkMonitor = new NetworkMonitor();
    this.syncQueue = new SyncQueue();
    this.conflictResolver = new ConflictResolver();
  }

  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async initialize(config: OfflineConfig): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.config = config;
      
      // Only initialize IndexedDB if we're in a browser environment
      if (typeof window !== 'undefined') {
        try {
          await this.db.initialize(config.storage);
        } catch (error) {
          this.logger.warn('Failed to initialize IndexedDB, offline storage will not be available', { error });
        }
      }
      
      this.networkMonitor.initialize({
        pingEndpoint: config.network.pingEndpoint,
        pingInterval: config.network.pingInterval,
        onStatusChange: this.handleNetworkStatusChange.bind(this)
      });

      await this.syncQueue.initialize({
        maxRetries: config.sync.maxRetries,
        retryDelay: config.sync.retryDelay,
        batchSize: config.sync.batchSize
      });

      // Setup periodic cleanup
      if (typeof window !== 'undefined') {
        setInterval(() => this.cleanupStorage(), config.storage.cleanupInterval);
      }

      this.isInitialized = true;
      this.logger.info('Offline service initialized');
      
      // Initial sync if online
      if (this.networkMonitor.isOnline()) {
        await this.sync();
      }
    } catch (error) {
      this.logger.error('Failed to initialize offline service', { error });
      throw new Error('Failed to initialize offline service');
    }
  }

  private async handleNetworkStatusChange(status: NetworkStatus): Promise<void> {
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
    this.checkInitialization();

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
    this.checkInitialization();

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
    this.checkInitialization();

    if (this.syncInProgress || !this.networkMonitor.isOnline()) {
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
          const conflicts = await this.conflictResolver.checkConflicts(operation);
          
          if (conflicts.length > 0) {
            const resolution = await this.conflictResolver.resolveConflicts(conflicts);
            if (resolution === ConflictResolution.ABORT) {
              continue;
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
          
          if (operation.retryCount >= this.config.sync.maxRetries) {
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
      throw new Error(`API request failed: ${response.statusText}`);
    }
  }

  private async cleanupStorage(): Promise<void> {
    try {
      // Delete expired items
      const expired = await this.db.getExpiredItems();
      for (const item of expired) {
        await this.db.delete(item.id);
      }
    } catch (error) {
      this.logger.error('Failed to cleanup storage', { error });
    }
  }

  async getStorageQuota(): Promise<StorageQuota> {
    this.checkInitialization();
    return await this.db.getQuota();
  }

  async getPendingChangesCount(module: string): Promise<number> {
    this.checkInitialization();
    try {
      const operations = await this.syncQueue.getPendingOperations();
      return operations.filter(op => op.resourceType === module).length;
    } catch (error) {
      this.logger.error('Failed to get pending changes count', { module, error });
      return 0;
    }
  }

  private checkInitialization(): void {
    if (!this.isInitialized) {
      throw new Error('Offline service not initialized');
    }
  }
}

export const offlineService = OfflineService.getInstance(); 