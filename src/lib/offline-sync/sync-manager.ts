import { openDB, IDBPDatabase } from 'idb';
import { 
  OfflineDB,
  MedicationAction,
  CachedMedication,
  SyncStatus,
  ConflictResolutionStrategy,
} from './types';
import { ConflictResolver } from './conflict-resolver';
import {
  hashObject,
  isDataStale,
  calculateBackoff,
  getNetworkInfo,
  generateDeviceId,
  compressData,
  decompressData,
} from './utils';

export class SyncManager {
  private static instance: SyncManager;
  private db: IDBPDatabase<OfflineDB> | null = null;
  private syncInProgress = false;
  private deviceId: string;
  private syncWorker: Worker | null = null;

  private constructor() {
    this.deviceId = generateDeviceId();
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  async initialize() {
    if (this.db) return;

    try {
      this.db = await openDB<OfflineDB>('medication-offline-db', 2, {
        upgrade(db, oldVersion) {
          if (oldVersion < 1) {
            // Actions store
            const actionStore = db.createObjectStore('actions', {
              keyPath: 'id',
            });
            actionStore.createIndex('by-timestamp', 'timestamp');
            actionStore.createIndex('by-status', 'syncStatus');
            actionStore.createIndex('by-type', 'type');
            actionStore.createIndex('by-tenant', 'tenantId');

            // Medications store
            const medicationStore = db.createObjectStore('medications', {
              keyPath: 'id',
            });
            medicationStore.createIndex('by-resident', 'residentId');
            medicationStore.createIndex('by-last-updated', 'lastUpdated');
            medicationStore.createIndex('by-expiry', 'expiresAt');
          }

          if (oldVersion < 2) {
            // Sync metadata store
            db.createObjectStore('sync_metadata', {
              keyPath: 'id',
            });
          }
        },
      });

      // Initialize sync worker if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        this.initializeSyncWorker();
      }

      // Start periodic sync
      this.startPeriodicSync();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  private async initializeSyncWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/workers/sync-worker.js');
      await registration.sync.register('medication-sync');
      this.syncWorker = registration.active as Worker;
    } catch (error) {
      console.error('Error initializing sync worker:', error);
    }
  }

  private startPeriodicSync() {
    setInterval(() => {
      if (navigator.onLine && !this.syncInProgress) {
        this.syncPendingActions();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  async recordAction(action: Omit<MedicationAction, 'id' | 'timestamp' | 'syncStatus'>): Promise<string> {
    if (!this.db) throw new Error('Database not initialized');

    const actionId = crypto.randomUUID();
    const fullAction: MedicationAction = {
      ...action,
      id: actionId,
      timestamp: new Date(),
      syncStatus: 'pending',
      retryCount: 0,
    };

    const tx = this.db.transaction('actions', 'readwrite');
    await tx.store.add(fullAction);

    // Try to sync immediately if online
    if (navigator.onLine && !this.syncInProgress) {
      this.syncPendingActions();
    }

    return actionId;
  }

  async cacheMedication(medicationData: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const cached: CachedMedication = {
      id: medicationData.id,
      data: await compressData(medicationData),
      residentId: medicationData.residentId,
      lastUpdated: new Date(),
      version: medicationData.version || 1,
      hash: hashObject(medicationData),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isStale: false,
    };

    const tx = this.db.transaction('medications', 'readwrite');
    await tx.store.put(cached);
  }

  async getCachedMedication(id: string): Promise<any | null> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('medications', 'readonly');
    const cached = await tx.store.get(id);

    if (!cached || isDataStale(cached)) {
      return null;
    }

    return await decompressData(cached.data);
  }

  async getCachedMedicationsByResident(residentId: string): Promise<any[]> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('medications', 'readonly');
    const index = tx.store.index('by-resident');
    const medications = await index.getAll(residentId);

    const validMedications = medications.filter(med => !isDataStale(med));
    return await Promise.all(
      validMedications.map(med => decompressData(med.data))
    );
  }

  private async syncPendingActions(): Promise<void> {
    if (this.syncInProgress || !this.db) return;

    try {
      this.syncInProgress = true;
      await this.updateSyncMetadata('start');

      const tx = this.db.transaction('actions', 'readonly');
      const index = tx.store.index('by-status');
      const pendingActions = await index.getAll('pending');

      for (const action of pendingActions) {
        try {
          await this.syncAction(action);
        } catch (error) {
          console.error(`Error syncing action ${action.id}:`, error);
          await this.handleSyncError(action, error);
        }
      }

      await this.updateSyncMetadata('success');
    } catch (error) {
      console.error('Error in sync process:', error);
      await this.updateSyncMetadata('error', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncAction(action: MedicationAction): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          deviceId: this.deviceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();

      if (result.conflict) {
        await this.handleConflict(action, result.serverData);
      } else {
        // Mark action as completed
        const tx = this.db.transaction('actions', 'readwrite');
        await tx.store.put({
          ...action,
          syncStatus: 'completed',
          lastSyncAttempt: new Date(),
        });
      }
    } catch (error) {
      throw error;
    }
  }

  private async handleConflict(
    action: MedicationAction,
    serverData: any
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const strategy: ConflictResolutionStrategy = 'merge'; // Could be configurable
    const resolvedData = await ConflictResolver.resolveConflict(
      action,
      serverData,
      strategy
    );

    if (resolvedData._conflict) {
      // Needs manual resolution
      const tx = this.db.transaction('actions', 'readwrite');
      await tx.store.put({
        ...action,
        syncStatus: 'conflict',
        conflictDetails: {
          serverData,
          clientData: action.data,
          resolution: 'manual',
        },
      });
    } else {
      // Automatic resolution succeeded
      const tx = this.db.transaction('actions', 'readwrite');
      await tx.store.put({
        ...action,
        data: resolvedData,
        syncStatus: 'completed',
        lastSyncAttempt: new Date(),
        conflictDetails: {
          serverData,
          clientData: action.data,
          resolution: strategy,
          resolvedData,
        },
      });
    }
  }

  private async handleSyncError(
    action: MedicationAction,
    error: Error
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction('actions', 'readwrite');
    const retryCount = (action.retryCount || 0) + 1;
    const maxRetries = 5;

    if (retryCount <= maxRetries) {
      // Schedule retry with exponential backoff
      const backoff = calculateBackoff(retryCount);
      setTimeout(() => this.syncAction(action), backoff);

      await tx.store.put({
        ...action,
        retryCount,
        lastSyncAttempt: new Date(),
      });
    } else {
      // Mark as failed after max retries
      await tx.store.put({
        ...action,
        syncStatus: 'failed',
        lastSyncAttempt: new Date(),
      });
    }
  }

  private async updateSyncMetadata(
    status: 'start' | 'success' | 'error',
    error?: Error
  ): Promise<void> {
    if (!this.db) return;

    const tx = this.db.transaction('sync_metadata', 'readwrite');
    const metadata = await tx.store.get(this.deviceId) || {
      id: this.deviceId,
      lastSuccessfulSync: null,
      lastAttemptedSync: null,
      syncErrors: [],
    };

    const now = new Date();
    const networkInfo = getNetworkInfo();

    switch (status) {
      case 'start':
        metadata.lastAttemptedSync = now;
        break;
      case 'success':
        metadata.lastSuccessfulSync = now;
        metadata.lastAttemptedSync = now;
        break;
      case 'error':
        metadata.lastAttemptedSync = now;
        metadata.syncErrors.push({
          timestamp: now,
          error: error?.message || 'Unknown error',
        });
        // Keep only last 10 errors
        metadata.syncErrors = metadata.syncErrors.slice(-10);
        break;
    }

    metadata.networkInfo = networkInfo;
    await tx.store.put(metadata);
  }
}


