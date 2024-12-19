import { PrismaClient } from '@prisma/client';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { 
  Account, 
  Transaction,
  Invoice,
  Payment,
  FinancialSettings
} from '../types';

/**
 * Schema for IndexedDB to support offline functionality
 */
interface FinancialDBSchema extends DBSchema {
  accounts: {
    key: string;
    value: Account & { _syncStatus: SyncStatus };
    indexes: { 'by-tenant': string };
  };
  transactions: {
    key: string;
    value: Transaction & { _syncStatus: SyncStatus };
    indexes: { 'by-tenant': string; 'by-account': string };
  };
  invoices: {
    key: string;
    value: Invoice & { _syncStatus: SyncStatus };
    indexes: { 'by-tenant': string; 'by-status': string };
  };
  payments: {
    key: string;
    value: Payment & { _syncStatus: SyncStatus };
    indexes: { 'by-tenant': string; 'by-invoice': string };
  };
  settings: {
    key: string;
    value: FinancialSettings & { _syncStatus: SyncStatus };
    indexes: { 'by-tenant': string };
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem;
    indexes: { 'by-type': string; 'by-status': string };
  };
}

/**
 * Status of data synchronization
 */
export enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING_UPLOAD = 'PENDING_UPLOAD',
  PENDING_UPDATE = 'PENDING_UPDATE',
  PENDING_DELETE = 'PENDING_DELETE',
  CONFLICT = 'CONFLICT'
}

/**
 * Types of operations that can be queued for sync
 */
export enum SyncOperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

/**
 * Interface for items in the sync queue
 */
interface SyncQueueItem {
  id: string;
  type: SyncOperationType;
  entity: string;
  data: any;
  timestamp: number;
  retryCount: number;
  error?: string;
  status: 'pending' | 'processing' | 'failed';
}

/**
 * Class responsible for managing offline data synchronization
 */
export class FinancialSync {
  private db: IDBPDatabase<FinancialDBSchema>;
  private syncInProgress: boolean = false;
  private networkStatus: boolean = true;

  constructor(
    private prisma: PrismaClient,
    private tenantId: string,
    private options: {
      syncInterval?: number;
      maxRetries?: number;
      conflictResolution?: 'server' | 'client' | 'manual';
    } = {}
  ) {
    // Set default options
    this.options = {
      syncInterval: 30000, // 30 seconds
      maxRetries: 3,
      conflictResolution: 'server',
      ...options
    };

    // Initialize IndexedDB
    this.initializeDB();

    // Start sync loop
    this.startSyncLoop();

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  /**
   * Initialize the IndexedDB database
   */
  private async initializeDB(): Promise<void> {
    this.db = await openDB<FinancialDBSchema>('financial-offline', 1, {
      upgrade(db) {
        // Create object stores with indexes
        const accountStore = db.createObjectStore('accounts', { keyPath: 'id' });
        accountStore.createIndex('by-tenant', 'tenantId');

        const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' });
        transactionStore.createIndex('by-tenant', 'tenantId');
        transactionStore.createIndex('by-account', 'accountId');

        const invoiceStore = db.createObjectStore('invoices', { keyPath: 'id' });
        invoiceStore.createIndex('by-tenant', 'tenantId');
        invoiceStore.createIndex('by-status', 'status');

        const paymentStore = db.createObjectStore('payments', { keyPath: 'id' });
        paymentStore.createIndex('by-tenant', 'tenantId');
        paymentStore.createIndex('by-invoice', 'invoiceId');

        const settingsStore = db.createObjectStore('settings', { keyPath: 'tenantId' });
        settingsStore.createIndex('by-tenant', 'tenantId');

        const syncQueueStore = db.createObjectStore('syncQueue', { keyPath: 'id' });
        syncQueueStore.createIndex('by-type', 'type');
        syncQueueStore.createIndex('by-status', 'status');
      }
    });
  }

  /**
   * Start the synchronization loop
   */
  private async startSyncLoop(): Promise<void> {
    while (true) {
      if (this.networkStatus && !this.syncInProgress) {
        await this.sync();
      }
      await new Promise(resolve => setTimeout(resolve, this.options.syncInterval));
    }
  }

  /**
   * Handle network status changes
   */
  private handleNetworkChange(status: boolean): void {
    this.networkStatus = status;
    if (status) {
      this.sync(); // Attempt to sync when coming back online
    }
  }

  /**
   * Synchronize offline data with the server
   */
  private async sync(): Promise<void> {
    this.syncInProgress = true;

    try {
      // Process sync queue
      const pendingItems = await this.db.getAllFromIndex('syncQueue', 'by-status', 'pending');
      
      for (const item of pendingItems) {
        try {
          await this.processSyncItem(item);
        } catch (error) {
          console.error(`Sync failed for item ${item.id}:`, error);
          
          // Update retry count and status
          item.retryCount++;
          item.error = error.message;
          item.status = item.retryCount >= this.options.maxRetries ? 'failed' : 'pending';
          
          await this.db.put('syncQueue', item);
        }
      }

      // Pull updates from server
      await this.pullServerChanges();
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Process a single sync queue item
   */
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case SyncOperationType.CREATE:
        await this.syncCreate(item);
        break;
      case SyncOperationType.UPDATE:
        await this.syncUpdate(item);
        break;
      case SyncOperationType.DELETE:
        await this.syncDelete(item);
        break;
    }

    // Remove from sync queue after successful processing
    await this.db.delete('syncQueue', item.id);
  }

  /**
   * Sync a create operation
   */
  private async syncCreate(item: SyncQueueItem): Promise<void> {
    const result = await this.prisma[item.entity].create({
      data: item.data
    });

    // Update local data with server response
    await this.db.put(item.entity, {
      ...result,
      _syncStatus: SyncStatus.SYNCED
    });
  }

  /**
   * Sync an update operation
   */
  private async syncUpdate(item: SyncQueueItem): Promise<void> {
    const { id, ...data } = item.data;
    
    // Handle conflicts based on configuration
    if (this.options.conflictResolution === 'manual') {
      const serverData = await this.prisma[item.entity].findUnique({ where: { id } });
      if (this.hasConflict(serverData, data)) {
        await this.handleConflict(item.entity, id, serverData, data);
        return;
      }
    }

    const result = await this.prisma[item.entity].update({
      where: { id },
      data
    });

    await this.db.put(item.entity, {
      ...result,
      _syncStatus: SyncStatus.SYNCED
    });
  }

  /**
   * Sync a delete operation
   */
  private async syncDelete(item: SyncQueueItem): Promise<void> {
    await this.prisma[item.entity].delete({
      where: { id: item.data.id }
    });

    await this.db.delete(item.entity, item.data.id);
  }

  /**
   * Pull changes from the server
   */
  private async pullServerChanges(): Promise<void> {
    // Get last sync timestamp
    const lastSync = await this.getLastSyncTimestamp();

    // Fetch updated records for each entity type
    await Promise.all([
      this.pullEntityChanges('accounts', lastSync),
      this.pullEntityChanges('transactions', lastSync),
      this.pullEntityChanges('invoices', lastSync),
      this.pullEntityChanges('payments', lastSync),
      this.pullEntityChanges('settings', lastSync)
    ]);

    // Update last sync timestamp
    await this.updateLastSyncTimestamp();
  }

  /**
   * Pull changes for a specific entity type
   */
  private async pullEntityChanges(entity: string, lastSync: Date): Promise<void> {
    const changes = await this.prisma[entity].findMany({
      where: {
        tenantId: this.tenantId,
        updatedAt: {
          gt: lastSync
        }
      }
    });

    for (const change of changes) {
      const localData = await this.db.get(entity, change.id);
      
      if (!localData || localData._syncStatus === SyncStatus.SYNCED) {
        await this.db.put(entity, {
          ...change,
          _syncStatus: SyncStatus.SYNCED
        });
      } else if (this.options.conflictResolution === 'server') {
        await this.db.put(entity, {
          ...change,
          _syncStatus: SyncStatus.SYNCED
        });
      }
    }
  }

  /**
   * Check if there's a conflict between server and client data
   */
  private hasConflict(serverData: any, clientData: any): boolean {
    return serverData.updatedAt > clientData.updatedAt;
  }

  /**
   * Handle data conflicts
   */
  private async handleConflict(entity: string, id: string, serverData: any, clientData: any): Promise<void> {
    await this.db.put(entity, {
      ...serverData,
      _syncStatus: SyncStatus.CONFLICT,
      _clientData: clientData
    });

    // Emit conflict event for UI handling
    this.emitConflictEvent(entity, id, serverData, clientData);
  }

  /**
   * Emit a conflict event for UI handling
   */
  private emitConflictEvent(entity: string, id: string, serverData: any, clientData: any): void {
    const event = new CustomEvent('financial-sync-conflict', {
      detail: {
        entity,
        id,
        serverData,
        clientData
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * Get the timestamp of the last successful sync
   */
  private async getLastSyncTimestamp(): Promise<Date> {
    const timestamp = localStorage.getItem(`financial-last-sync-${this.tenantId}`);
    return timestamp ? new Date(timestamp) : new Date(0);
  }

  /**
   * Update the last successful sync timestamp
   */
  private async updateLastSyncTimestamp(): Promise<void> {
    localStorage.setItem(`financial-last-sync-${this.tenantId}`, new Date().toISOString());
  }

  /**
   * Add an item to the sync queue
   */
  public async queueSync(type: SyncOperationType, entity: string, data: any): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: crypto.randomUUID(),
      type,
      entity,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending'
    };

    await this.db.add('syncQueue', queueItem);

    // Attempt immediate sync if online
    if (this.networkStatus && !this.syncInProgress) {
      this.sync();
    }
  }

  /**
   * Get the sync status of an entity
   */
  public async getSyncStatus(entity: string, id: string): Promise<SyncStatus> {
    const item = await this.db.get(entity, id);
    return item?._syncStatus || SyncStatus.SYNCED;
  }

  /**
   * Resolve a conflict manually
   */
  public async resolveConflict(entity: string, id: string, resolution: 'server' | 'client'): Promise<void> {
    const item = await this.db.get(entity, id);
    if (!item || item._syncStatus !== SyncStatus.CONFLICT) {
      return;
    }

    if (resolution === 'client') {
      await this.queueSync(SyncOperationType.UPDATE, entity, item._clientData);
    } else {
      await this.db.put(entity, {
        ...item,
        _syncStatus: SyncStatus.SYNCED,
        _clientData: undefined
      });
    }
  }
}
