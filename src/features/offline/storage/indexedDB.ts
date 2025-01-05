/**
 * @writecarenotes.com
 * @fileoverview IndexedDB storage implementation for offline data
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Enterprise-grade IndexedDB storage service with storage management,
 * cleanup capabilities, and data versioning support.
 */

import { Logger } from '@/lib/logger';
import { Metrics } from '@/lib/metrics';
import { StorageError } from '../types/errors';
import { StorageConfig, StorageQuota, StorageEntry } from '../types';

interface DBSchema {
  offlineData: {
    key: string;
    value: StorageEntry;
    indexes: {
      'by-timestamp': number;
      'by-type': string;
      'by-status': string;
    };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      operation: 'create' | 'update' | 'delete';
      data: any;
      timestamp: number;
      status: 'pending' | 'processing' | 'completed' | 'failed';
      retryCount: number;
      error?: string;
    };
    indexes: {
      'by-status': string;
      'by-timestamp': number;
    };
  };
}

export class IndexedDBStorage {
  private readonly DB_NAME = 'writecarenotes_offline';
  private readonly DB_VERSION = 1;
  private db: IDBDatabase | null = null;
  private logger: Logger;
  private metrics: Metrics;

  constructor(private config: StorageConfig = {}) {
    this.logger = new Logger('IndexedDBStorage');
    this.metrics = new Metrics('storage');
  }

  async initialize(): Promise<void> {
    try {
      this.db = await this.openDatabase();
      await this.performMaintenance();
      this.logger.info('IndexedDB initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize IndexedDB', { error });
      throw new StorageError('Failed to initialize storage', { cause: error });
    }
  }

  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        this.logger.error('Failed to open database', { error: request.error });
        reject(new StorageError('Failed to open database'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createSchema(db);
      };
    });
  }

  private createSchema(db: IDBDatabase): void {
    // Offline data store
    if (!db.objectStoreNames.contains('offlineData')) {
      const store = db.createObjectStore('offlineData', { keyPath: 'id' });
      store.createIndex('by-timestamp', 'timestamp');
      store.createIndex('by-type', 'type');
      store.createIndex('by-status', 'status');
    }

    // Sync queue store
    if (!db.objectStoreNames.contains('syncQueue')) {
      const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
      store.createIndex('by-status', 'status');
      store.createIndex('by-timestamp', 'timestamp');
    }
  }

  async store(key: string, data: any, type: string): Promise<void> {
    try {
      const tx = this.db!.transaction('offlineData', 'readwrite');
      const store = tx.objectStore('offlineData');

      const entry: StorageEntry = {
        id: key,
        data,
        type,
        timestamp: Date.now(),
        status: 'active',
        version: 1
      };

      await this.promisifyRequest(store.put(entry));
      this.metrics.increment('storage_writes');
      this.logger.debug('Data stored successfully', { key, type });
    } catch (error) {
      this.logger.error('Failed to store data', { error, key });
      throw new StorageError('Failed to store data', { cause: error });
    }
  }

  async retrieve(key: string): Promise<any> {
    try {
      const tx = this.db!.transaction('offlineData', 'readonly');
      const store = tx.objectStore('offlineData');
      const entry = await this.promisifyRequest(store.get(key));
      
      if (!entry) {
        throw new StorageError('Data not found');
      }

      this.metrics.increment('storage_reads');
      return entry.data;
    } catch (error) {
      this.logger.error('Failed to retrieve data', { error, key });
      throw new StorageError('Failed to retrieve data', { cause: error });
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const tx = this.db!.transaction('offlineData', 'readwrite');
      const store = tx.objectStore('offlineData');
      await this.promisifyRequest(store.delete(key));
      this.metrics.increment('storage_deletes');
    } catch (error) {
      this.logger.error('Failed to delete data', { error, key });
      throw new StorageError('Failed to delete data', { cause: error });
    }
  }

  async clear(): Promise<void> {
    try {
      const tx = this.db!.transaction('offlineData', 'readwrite');
      const store = tx.objectStore('offlineData');
      await this.promisifyRequest(store.clear());
      this.metrics.increment('storage_clears');
    } catch (error) {
      this.logger.error('Failed to clear storage', { error });
      throw new StorageError('Failed to clear storage', { cause: error });
    }
  }

  private async performMaintenance(): Promise<void> {
    try {
      await this.cleanupExpiredData();
      await this.optimizeStorage();
      this.logger.info('Storage maintenance completed');
    } catch (error) {
      this.logger.error('Storage maintenance failed', { error });
      // Don't throw - maintenance failure shouldn't block initialization
    }
  }

  private async cleanupExpiredData(): Promise<void> {
    try {
      const tx = this.db!.transaction('offlineData', 'readwrite');
      const store = tx.objectStore('offlineData');
      const index = store.index('by-timestamp');

      // Delete data older than 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const range = IDBKeyRange.upperBound(thirtyDaysAgo);
      
      let cursor = await this.promisifyRequest(index.openCursor(range));
      while (cursor) {
        await this.promisifyRequest(cursor.delete());
        cursor = await this.promisifyRequest(cursor.continue());
      }

      this.metrics.increment('storage_cleanups');
    } catch (error) {
      this.logger.error('Failed to cleanup expired data', { error });
      throw new StorageError('Failed to cleanup expired data', { cause: error });
    }
  }

  private async optimizeStorage(): Promise<void> {
    try {
      const quota = await this.getStorageQuota();
      const usagePercentage = (quota.usage / quota.quota) * 100;

      if (usagePercentage > 80) {
        this.logger.warn('Storage usage high, initiating cleanup', { 
          usagePercentage 
        });
        await this.cleanupExpiredData();
      }
    } catch (error) {
      this.logger.error('Failed to optimize storage', { error });
      throw new StorageError('Failed to optimize storage', { cause: error });
    }
  }

  async getStorageQuota(): Promise<StorageQuota> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0)
        };
      }
      throw new Error('Storage estimation not supported');
    } catch (error) {
      this.logger.error('Failed to get storage quota', { error });
      throw new StorageError('Failed to get storage quota', { cause: error });
    }
  }

  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export const indexedDBStorage = new IndexedDBStorage(); 