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

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: string;
  data: any;
  timestamp: number;
  priority?: SyncPriority;
  retryCount?: number;
  lastAttempt?: number;
  error?: Error;
}

export enum ConflictResolution {
  CLIENT_WINS = 'CLIENT_WINS',
  SERVER_WINS = 'SERVER_WINS',
  MANUAL = 'MANUAL',
  MERGE = 'MERGE',
  ABORT = 'ABORT'
}

export interface ConflictResolutionDetails {
  strategy: 'client' | 'server' | 'manual';
  data?: any;
  resolution?: any;
  timestamp?: number;
  resolvedBy?: string;
}

export interface ConflictDetails {
  clientVersion: any;
  serverVersion: any;
  timestamp: number;
  entity: string;
  id: string;
}

export enum SyncPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export enum NetworkStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting'
}

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  ERROR = 'error'
}

export interface NetworkConfig {
  websocketUrl: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  timeout?: number;
}

export interface StorageQuota {
  used: number;
  total: number;
  percentage: number;
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

export interface OfflineConfig {
  storage?: {
    quota?: {
      max: number;
      warning: number;
    };
    compression?: boolean;
    encryption?: boolean;
  };
  sync?: {
    interval?: number;
    batchSize?: number;
    retryAttempts?: number;
    retryDelay?: number;
  };
  network?: NetworkConfig;
}

export interface ConflictStrategy {
  name: string;
  priority: number;
  canResolve: (details: ConflictDetails) => boolean;
  resolve: (details: ConflictDetails) => Promise<ConflictResolution>;
}

export interface OperationalTransform {
  name: string;
  priority: number;
  canTransform: (op1: SyncOperation, op2: SyncOperation) => boolean;
  transform: (op1: SyncOperation, op2: SyncOperation) => SyncOperation[];
}

export interface MergeStrategy {
  name: string;
  priority: number;
  canMerge: (op1: SyncOperation, op2: SyncOperation) => boolean;
  merge: (op1: SyncOperation, op2: SyncOperation) => SyncOperation;
}

export interface DiffResult {
  added: string[];
  removed: string[];
  modified: string[];
  unchanged: string[];
  conflicts: {
    field: string;
    client: any;
    server: any;
  }[];
}
