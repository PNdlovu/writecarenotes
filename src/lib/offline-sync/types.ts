import { DBSchema } from 'idb';

export type ActionType = 
  | 'administration'
  | 'monitoring'
  | 'order'
  | 'titration'
  | 'tapering'
  | 'iv_compatibility'
  | 'specialized_admin';

export type SyncStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'conflict';

export type ConflictResolutionStrategy = 
  | 'client_wins'
  | 'server_wins'
  | 'manual'
  | 'merge';

export interface MedicationAction {
  id: string;
  type: ActionType;
  data: any;
  timestamp: Date;
  userId: string;
  tenantId: string;
  deviceId: string;
  syncStatus: SyncStatus;
  retryCount: number;
  lastSyncAttempt?: Date;
  conflictDetails?: {
    serverData: any;
    clientData: any;
    resolution?: ConflictResolutionStrategy;
    resolvedData?: any;
  };
}

export interface CachedMedication {
  id: string;
  data: any;
  residentId: string;
  lastUpdated: Date;
  version: number;
  hash: string;
  expiresAt: Date;
  isStale: boolean;
}

export interface SyncMetadata {
  id: string;
  lastSuccessfulSync: Date;
  lastAttemptedSync: Date;
  syncErrors: Array<{
    timestamp: Date;
    error: string;
    actionId?: string;
  }>;
  deviceId: string;
  networkInfo: {
    type: string;
    effectiveType: string;
    downlink: number;
  };
}

export interface OfflineDB extends DBSchema {
  actions: {
    key: string;
    value: MedicationAction;
    indexes: {
      'by-timestamp': Date;
      'by-status': SyncStatus;
      'by-type': ActionType;
      'by-tenant': string;
    };
  };
  medications: {
    key: string;
    value: CachedMedication;
    indexes: {
      'by-resident': string;
      'by-last-updated': Date;
      'by-expiry': Date;
    };
  };
  sync_metadata: {
    key: string;
    value: SyncMetadata;
  };
}


