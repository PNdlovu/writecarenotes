/**
 * @writecarenotes.com
 * @fileoverview Core offline service implementation
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core implementation of the offline service providing data synchronization,
 * conflict resolution, and offline storage capabilities. Handles all aspects
 * of offline data management including encryption, compression, and compliance
 * with UK and Ireland healthcare regulations.
 */

import { openDB, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { 
  DB_CONFIG,
  SYNC_CONFIG,
  STORAGE_LIMITS,
  ERROR_MESSAGES,
  EVENTS,
  AUDIT_CONFIG,
  SECURITY_CONFIG,
  COMPLIANCE_CONFIG,
  PERFORMANCE_CONFIG
} from './constants';
import {
  OfflineConfig,
  SyncQueueItem,
  OfflineDBSchema,
  SyncResponse,
  OfflineStatus,
  DataOptions,
  SyncProgressEvent,
  ConflictResolver,
  SyncErrorHandler,
  ProgressCallback,
  ErrorCode,
  OfflineError,
  SyncStrategy,
  SyncType,
  AuditInfo
} from './types';
import { encryptData, decryptData, compressData, decompressData } from './utils';

export class OfflineService<T> {
  private db: IDBPDatabase<OfflineDBSchema> | null = null;
  private isInitialized = false;
  private syncInProgress = false;
  private networkStatus = navigator.onLine;
  private eventListeners: { [key: string]: Set<Function> } = {};
  private config: Required<OfflineConfig>;
  private deviceId: string;

  constructor(
    private storeName: string,
    config: OfflineConfig = {}
  ) {
    this.config = {
      syncStrategy: SyncStrategy.LAST_WRITE_WINS,
      maxRetries: SYNC_CONFIG.MAX_RETRIES,
      retryDelay: SYNC_CONFIG.RETRY_DELAY,
      maxQueueSize: SYNC_CONFIG.MAX_QUEUE_SIZE,
      encryptData: SECURITY_CONFIG.ENCRYPTION_ENABLED,
      compressionEnabled: SECURITY_CONFIG.COMPRESSION_ENABLED,
      logLevel: AUDIT_CONFIG.LOG_LEVEL,
      ...config
    };
    this.deviceId = this.getOrCreateDeviceId();
    this.setupNetworkListeners();
  }

  /**
   * Initialize the offline service
   */
  public async init(): Promise<void> {
    try {
      this.db = await openDB<OfflineDBSchema>(DB_CONFIG.NAME, DB_CONFIG.VERSION, {
        upgrade: (db) => {
          // Create stores if they don't exist
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.DATA)) {
            db.createObjectStore(DB_CONFIG.STORES.DATA);
          }
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.SYNC_QUEUE)) {
            db.createObjectStore(DB_CONFIG.STORES.SYNC_QUEUE);
          }
          if (!db.objectStoreNames.contains(DB_CONFIG.STORES.META)) {
            db.createObjectStore(DB_CONFIG.STORES.META);
          }
        }
      });

      this.isInitialized = true;
      await this.cleanupExpiredData();
      this.startPeriodicSync();
      this.log('info', 'Offline service initialized');
    } catch (error) {
      this.log('error', 'Failed to initialize offline service', error);
      throw new OfflineError(ErrorCode.NOT_INITIALIZED, ERROR_MESSAGES.NOT_INITIALIZED, error);
    }
  }

  /**
   * Save data to offline storage
   */
  public async saveData(
    id: string,
    data: T,
    options: DataOptions = {}
  ): Promise<void> {
    this.ensureInitialized();

    try {
      let processedData = data;
      if (this.config.encryptData && options.encrypt !== false) {
        processedData = await encryptData(data);
      }
      if (this.config.compressionEnabled && options.compress !== false) {
        processedData = await compressData(processedData);
      }

      const timestamp = new Date().toISOString();
      const version = await this.getNextVersion(id);

      await this.db!.put(DB_CONFIG.STORES.DATA, {
        key: id,
        value: processedData,
        timestamp,
        version
      });

      if (!options.skipSync) {
        await this.queueSync({
          id,
          type: SyncType.UPDATE,
          data: processedData,
          timestamp,
          retryCount: 0,
          audit: this.createAuditInfo(timestamp)
        });
      }

      this.log('info', `Data saved: ${id}`);
    } catch (error) {
      this.log('error', `Failed to save data: ${id}`, error);
      throw new OfflineError(ErrorCode.INVALID_DATA, ERROR_MESSAGES.INVALID_DATA, error);
    }
  }

  /**
   * Get data from offline storage
   */
  public async getData(id: string): Promise<T | null> {
    this.ensureInitialized();

    try {
      const record = await this.db!.get(DB_CONFIG.STORES.DATA, id);
      if (!record) return null;

      let data = record.value as T;
      if (this.config.compressionEnabled) {
        data = await decompressData(data);
      }
      if (this.config.encryptData) {
        data = await decryptData(data);
      }

      return data;
    } catch (error) {
      this.log('error', `Failed to get data: ${id}`, error);
      throw new OfflineError(ErrorCode.STORE_NOT_FOUND, ERROR_MESSAGES.STORE_NOT_FOUND, error);
    }
  }

  /**
   * Get all data from offline storage
   */
  public async getAll(): Promise<T[]> {
    this.ensureInitialized();

    try {
      const records = await this.db!.getAll(DB_CONFIG.STORES.DATA);
      const results: T[] = [];

      for (const record of records) {
        let data = record.value as T;
        if (this.config.compressionEnabled) {
          data = await decompressData(data);
        }
        if (this.config.encryptData) {
          data = await decryptData(data);
        }
        results.push(data);
      }

      return results;
    } catch (error) {
      this.log('error', 'Failed to get all data', error);
      throw new OfflineError(ErrorCode.STORE_NOT_FOUND, ERROR_MESSAGES.STORE_NOT_FOUND, error);
    }
  }

  /**
   * Queue an item for synchronization
   */
  public async queueSync(item: SyncQueueItem<T>): Promise<void> {
    this.ensureInitialized();

    try {
      const count = await this.getPendingSyncCount();
      if (count >= this.config.maxQueueSize) {
        throw new OfflineError(ErrorCode.QUOTA_EXCEEDED, ERROR_MESSAGES.QUOTA_EXCEEDED);
      }

      await this.db!.put(DB_CONFIG.STORES.SYNC_QUEUE, {
        key: `${item.id}_${Date.now()}`,
        value: item
      });

      this.log('info', `Sync queued: ${item.id}`);
      this.emit(EVENTS.SYNC_STARTED, { item });
    } catch (error) {
      this.log('error', `Failed to queue sync: ${item.id}`, error);
      throw new OfflineError(ErrorCode.SYNC_CONFLICT, ERROR_MESSAGES.SYNC_CONFLICT, error);
    }
  }

  /**
   * Process the sync queue
   */
  public async processSyncQueue(
    progressCallback?: ProgressCallback
  ): Promise<void> {
    if (this.syncInProgress || !this.networkStatus) return;

    this.syncInProgress = true;
    const progress: SyncProgressEvent = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      timestamp: new Date().toISOString()
    };

    try {
      const items = await this.db!.getAll(DB_CONFIG.STORES.SYNC_QUEUE);
      progress.total = items.length;

      for (const item of items) {
        try {
          const response = await this.syncItem(item.value);
          if (response.success) {
            await this.db!.delete(DB_CONFIG.STORES.SYNC_QUEUE, item.key);
            progress.successful++;
          } else if (response.conflict) {
            await this.handleConflict(item.value, response);
          } else {
            await this.handleSyncError(item.value, response);
          }
        } catch (error) {
          progress.failed++;
          this.log('error', `Sync failed for item: ${item.value.id}`, error);
        }

        progress.processed++;
        if (progressCallback) {
          progressCallback(progress);
        }
      }

      this.emit(EVENTS.SYNC_COMPLETED, progress);
    } catch (error) {
      this.emit(EVENTS.SYNC_ERROR, error);
      throw new OfflineError(ErrorCode.NETWORK_ERROR, ERROR_MESSAGES.NETWORK_ERROR, error);
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get the number of pending sync items
   */
  public async getPendingSyncCount(): Promise<number> {
    this.ensureInitialized();
    return (await this.db!.getAll(DB_CONFIG.STORES.SYNC_QUEUE)).length;
  }

  /**
   * Get the current status of the offline service
   */
  public async getStatus(): Promise<OfflineStatus> {
    const [usage, quota] = await this.getStorageUsage();
    return {
      isInitialized: this.isInitialized,
      isOnline: this.networkStatus,
      lastSync: await this.getLastSyncTime(),
      pendingSyncCount: await this.getPendingSyncCount(),
      storageUsage: {
        used: usage,
        quota,
        percentage: quota > 0 ? (usage / quota) : 0
      }
    };
  }

  /**
   * Clean up resources and destroy the service
   */
  public async destroy(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
    this.removeNetworkListeners();
    this.eventListeners = {};
  }

  /**
   * Subscribe to events
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = new Set();
    }
    this.eventListeners[event].add(callback);
  }

  /**
   * Unsubscribe from events
   */
  public off(event: string, callback: Function): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].delete(callback);
    }
  }

  private emit(event: string, data?: any): void {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized || !this.db) {
      throw new OfflineError(ErrorCode.NOT_INITIALIZED, ERROR_MESSAGES.NOT_INITIALIZED);
    }
  }

  private async syncItem(item: SyncQueueItem<T>): Promise<SyncResponse<T>> {
    // Implementation would depend on your API structure
    // This is a placeholder that simulates a network request
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: item.data,
          serverTimestamp: new Date().toISOString()
        });
      }, 1000);
    });
  }

  private async handleConflict(
    item: SyncQueueItem<T>,
    response: SyncResponse<T>
  ): Promise<void> {
    if (!response.data) return;

    let resolvedData: T;
    switch (this.config.syncStrategy) {
      case SyncStrategy.SERVER_WINS:
        resolvedData = response.data;
        break;
      case SyncStrategy.CLIENT_WINS:
        resolvedData = item.data;
        break;
      case SyncStrategy.LAST_WRITE_WINS:
        resolvedData = response.serverTimestamp! > item.timestamp
          ? response.data
          : item.data;
        break;
      default:
        throw new OfflineError(
          ErrorCode.SYNC_CONFLICT,
          ERROR_MESSAGES.SYNC_CONFLICT
        );
    }

    await this.saveData(item.id, resolvedData, { skipSync: true });
  }

  private async handleSyncError(
    item: SyncQueueItem<T>,
    response: SyncResponse<T>
  ): Promise<void> {
    if (item.retryCount >= this.config.maxRetries) {
      this.log('error', `Max retries reached for item: ${item.id}`);
      return;
    }

    await this.queueSync({
      ...item,
      retryCount: item.retryCount + 1,
      error: response.error
    });
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  private removeNetworkListeners(): void {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }

  private handleOnline = (): void => {
    this.networkStatus = true;
    this.emit(EVENTS.NETWORK_STATUS_CHANGED, { online: true });
    this.processSyncQueue();
  };

  private handleOffline = (): void => {
    this.networkStatus = false;
    this.emit(EVENTS.NETWORK_STATUS_CHANGED, { online: false });
  };

  private async getNextVersion(id: string): Promise<number> {
    const record = await this.db!.get(DB_CONFIG.STORES.DATA, id);
    return record ? record.version + 1 : 1;
  }

  private async getLastSyncTime(): Promise<string | null> {
    const meta = await this.db!.get(DB_CONFIG.STORES.META, 'lastSync');
    return meta ? meta.value.lastSync : null;
  }

  private async getStorageUsage(): Promise<[number, number]> {
    if (navigator.storage && navigator.storage.estimate) {
      const { usage, quota } = await navigator.storage.estimate();
      return [usage || 0, quota || 0];
    }
    return [0, 0];
  }

  private startPeriodicSync(): void {
    setInterval(() => {
      if (this.networkStatus) {
        this.processSyncQueue();
      }
    }, SYNC_CONFIG.SYNC_INTERVAL);
  }

  private async cleanupExpiredData(): Promise<void> {
    // Implementation would depend on your data expiration rules
    // This is a placeholder
  }

  private getOrCreateDeviceId(): string {
    const stored = localStorage.getItem('deviceId');
    if (stored) return stored;

    const deviceId = uuidv4();
    localStorage.setItem('deviceId', deviceId);
    return deviceId;
  }

  private createAuditInfo(timestamp: string): AuditInfo {
    return {
      createdAt: timestamp,
      createdBy: 'system',
      updatedAt: timestamp,
      updatedBy: 'system',
      version: 1,
      deviceId: this.deviceId,
      organizationId: 'default' // This should come from your auth context
    };
  }

  private log(level: 'debug' | 'info' | 'warn' | 'error', message: string, error?: any): void {
    if (this.shouldLog(level)) {
      const logMessage = `[OfflineService] ${message}`;
      switch (level) {
        case 'debug':
          console.debug(logMessage, error);
          break;
        case 'info':
          console.info(logMessage, error);
          break;
        case 'warn':
          console.warn(logMessage, error);
          break;
        case 'error':
          console.error(logMessage, error);
          break;
      }
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const configLevel = levels.indexOf(this.config.logLevel);
    const messageLevel = levels.indexOf(level);
    return messageLevel >= configLevel;
  }
} 