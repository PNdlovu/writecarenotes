// src/features/offline/types.ts

export interface StorageUsage {
  used: number;
  total: number;
  percentage: number;
}

export interface PendingChange {
  id: string;
  timestamp: number;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
}

export interface OfflineState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingChanges: number;
  storageUsage: StorageUsage;
  lastSyncTime: number | null;
  syncError: Error | null;
  forceSync: () => Promise<void>;
}

export interface OfflineStorage {
  getPendingChanges: () => Promise<PendingChange[]>;
  addPendingChange: (change: Omit<PendingChange, 'id' | 'timestamp'>) => Promise<void>;
  removePendingChange: (id: string) => Promise<void>;
  sync: () => Promise<void>;
}
