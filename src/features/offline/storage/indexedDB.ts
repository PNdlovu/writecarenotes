/**
 * @fileoverview IndexedDB storage implementation for offline data
 * @version 1.0.0
 * @created 2024-03-21
 */

import { Logger } from '@/lib/logger';
import { StorageError } from '../types/errors';
import { StorageConfig, StorageQuota, StorageEntry } from '../types';

export class IndexedDB {
  private static readonly DB_NAME = 'writecarenotes_offline';
  private static readonly DB_VERSION = 1;
  private static readonly STORES = {
    DATA: 'offline_data',
    METADATA: 'metadata'
  };

  private db: IDBDatabase | null = null;
  private logger: Logger;
  private config: StorageConfig | null = null;

  constructor() {
    this.logger = new Logger('IndexedDB');
  }

  /**
   * Initialize IndexedDB storage
   */
  async initialize(config: StorageConfig): Promise<void> {
    try {
      this.config = config;
      this.db = await this.openDatabase();
      await this.setupDatabase();
      this.logger.info('IndexedDB initialized');
    } catch (error) {
      this.logger.error('Failed to initialize IndexedDB', { error });
      throw new StorageError('Failed to initialize IndexedDB', { cause: error });
    }
  }

  /**
   * Store data in IndexedDB
   */
  async set<T>(key: string, entry: StorageEntry<T>): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const transaction = this.db.transaction([IndexedDB.STORES.DATA], 'readwrite');
      const store = transaction.objectStore(IndexedDB.STORES.DATA);

      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          key,
          ...entry,
          size: this.calculateSize(entry.data)
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      await this.updateMetadata();
    } catch (error) {
      throw new StorageError('Failed to store data', { cause: error });
    }
  }

  /**
   * Retrieve data from IndexedDB
   */
  async get<T>(key: string): Promise<StorageEntry<T> | null> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const transaction = this.db.transaction([IndexedDB.STORES.DATA], 'readonly');
      const store = transaction.objectStore(IndexedDB.STORES.DATA);

      return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onsuccess = () => {
          const entry = request.result;
          resolve(entry ? entry : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      throw new StorageError('Failed to retrieve data', { cause: error });
    }
  }

  /**
   * Delete data from IndexedDB
   */
  async delete(key: string): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const transaction = this.db.transaction([IndexedDB.STORES.DATA], 'readwrite');
      const store = transaction.objectStore(IndexedDB.STORES.DATA);

      await new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      await this.updateMetadata();
    } catch (error) {
      throw new StorageError('Failed to delete data', { cause: error });
    }
  }

  /**
   * Delete expired entries
   */
  async deleteExpired(): Promise<number> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const transaction = this.db.transaction([IndexedDB.STORES.DATA], 'readwrite');
      const store = transaction.objectStore(IndexedDB.STORES.DATA);
      let freedSpace = 0;

      await new Promise<void>((resolve, reject) => {
        const request = store.openCursor();
        
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            resolve();
            return;
          }

          const entry = cursor.value;
          if (entry.expiresAt && entry.expiresAt < Date.now()) {
            freedSpace += entry.size || 0;
            cursor.delete();
          }
          cursor.continue();
        };
        request.onerror = () => reject(request.error);
      });

      await this.updateMetadata();
      return freedSpace;
    } catch (error) {
      throw new StorageError('Failed to delete expired entries', { cause: error });
    }
  }

  /**
   * Delete entries by priority level
   */
  async deletePriorityLevel(priority: 'low' | 'normal' | 'high'): Promise<number> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const transaction = this.db.transaction([IndexedDB.STORES.DATA], 'readwrite');
      const store = transaction.objectStore(IndexedDB.STORES.DATA);
      let freedSpace = 0;

      await new Promise<void>((resolve, reject) => {
        const request = store.openCursor();
        
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            resolve();
            return;
          }

          const entry = cursor.value;
          if (entry.priority === priority) {
            freedSpace += entry.size || 0;
            cursor.delete();
          }
          cursor.continue();
        };
        request.onerror = () => reject(request.error);
      });

      await this.updateMetadata();
      return freedSpace;
    } catch (error) {
      throw new StorageError('Failed to delete priority level', { cause: error });
    }
  }

  /**
   * Get storage quota usage
   */
  async getQuota(): Promise<StorageQuota> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const transaction = this.db.transaction([IndexedDB.STORES.METADATA], 'readonly');
      const store = transaction.objectStore(IndexedDB.STORES.METADATA);

      return new Promise((resolve, reject) => {
        const request = store.get('quota');
        
        request.onsuccess = () => {
          const quota = request.result || { used: 0, total: this.config?.quota || 0 };
          resolve({
            used: quota.used,
            total: quota.total,
            percentage: (quota.used / quota.total) * 100
          });
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      throw new StorageError('Failed to get quota', { cause: error });
    }
  }

  private async openDatabase(): Promise<IDBDatabase> {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new StorageError('IndexedDB is not available in this environment');
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(IndexedDB.DB_NAME, IndexedDB.DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores if they don't exist
        if (!db.objectStoreNames.contains(IndexedDB.STORES.DATA)) {
          db.createObjectStore(IndexedDB.STORES.DATA, { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains(IndexedDB.STORES.METADATA)) {
          db.createObjectStore(IndexedDB.STORES.METADATA, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async setupDatabase(): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      // Initialize metadata
      const transaction = this.db.transaction([IndexedDB.STORES.METADATA], 'readwrite');
      const store = transaction.objectStore(IndexedDB.STORES.METADATA);

      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          key: 'quota',
          used: 0,
          total: this.config?.quota || 0,
          lastUpdated: Date.now()
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      throw new StorageError('Failed to setup database', { cause: error });
    }
  }

  private async updateMetadata(): Promise<void> {
    if (!this.db) throw new StorageError('Database not initialized');

    try {
      const transaction = this.db.transaction([IndexedDB.STORES.DATA, IndexedDB.STORES.METADATA], 'readwrite');
      const dataStore = transaction.objectStore(IndexedDB.STORES.DATA);
      const metaStore = transaction.objectStore(IndexedDB.STORES.METADATA);

      // Calculate total size
      let totalSize = 0;
      await new Promise<void>((resolve, reject) => {
        const request = dataStore.openCursor();
        
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) {
            resolve();
            return;
          }

          const entry = cursor.value;
          totalSize += entry.size || 0;
          cursor.continue();
        };
        request.onerror = () => reject(request.error);
      });

      // Update metadata
      await new Promise<void>((resolve, reject) => {
        const request = metaStore.put({
          key: 'quota',
          used: totalSize,
          total: this.config?.quota || 0,
          lastUpdated: Date.now()
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      throw new StorageError('Failed to update metadata', { cause: error });
    }
  }

  private calculateSize(data: any): number {
    try {
      const serialized = JSON.stringify(data);
      return new Blob([serialized]).size;
    } catch (error) {
      this.logger.warn('Failed to calculate data size', { error });
      return 0;
    }
  }
} 