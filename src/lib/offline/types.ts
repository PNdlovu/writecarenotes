import { DBSchema } from 'idb';
import { STORE_NAMES } from './constants';

export type ActionType = 'create' | 'update' | 'delete';

export interface AuditInfo {
  ipAddress: string;
  userAgent: string;
  location?: string;
}

export interface OfflineQueueItem {
  id?: number;
  action: ActionType;
  collection: string;
  data: any;
  timestamp: number;
  userId: string;
  tenantId: string;
  deviceId: string;
  auditInfo: AuditInfo;
}

export interface AuditLogItem {
  id?: number;
  action: string;
  timestamp: number;
  userId: string;
  tenantId: string;
  deviceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
}

interface StoreSchema<T> {
  key: string;
  value: T;
  indexes: {
    'by-date'?: Date;
    'by-tenant': string;
    'by-user'?: string;
  };
}

export interface OfflineDBSchema extends DBSchema {
  [STORE_NAMES.MEDICATIONS]: StoreSchema<any>;
  [STORE_NAMES.TEMPLATES]: StoreSchema<any>;
  [STORE_NAMES.SCHEDULED_MEDICATIONS]: StoreSchema<any>;
  [STORE_NAMES.PENDING_SYNC]: {
    key: string;
    value: OfflineQueueItem;
  };
  [STORE_NAMES.AUDIT_LOGS]: {
    key: string;
    value: AuditLogItem;
    indexes: {
      'by-date': Date;
      'by-tenant': string;
      'by-user': string;
    };
  };
  [STORE_NAMES.OFFLINE_QUEUE]: {
    key: string;
    value: OfflineQueueItem;
    indexes: {
      'by-queue': string;
    };
  };
}


