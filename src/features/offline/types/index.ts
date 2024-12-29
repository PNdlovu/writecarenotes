/**
 * @fileoverview Type definitions for offline functionality
 * @version 1.0.0
 * @created 2024-03-21
 */

export type Region = 'UK_ENGLAND' | 'UK_WALES' | 'UK_SCOTLAND' | 'UK_NORTHERN_IRELAND' | 'IRELAND';

export type RegionalConfig = {
  [key in Region]: {
    apiEndpoint: string;
    complianceRules: string[];
    dataRetentionDays: number;
    encryptionKey: string;
    languageCodes: string[];
  }
};

export interface OfflineConfig {
  storage: {
    name: string;
    version: number;
    maxSize: number; // in bytes
    cleanupInterval: number; // in milliseconds
    encryptionEnabled: boolean;
    compressionEnabled: boolean;
  };
  network: {
    pingEndpoint: string;
    pingInterval: number;
    timeoutMs: number;
    retryAttempts: number;
  };
  sync: {
    maxRetries: number;
    retryDelay: number;
    batchSize: number;
    priorityLevels: ['high', 'normal', 'low'];
    conflictResolution: 'server-wins' | 'client-wins' | 'manual';
  };
  regional: RegionalConfig;
}

export interface StorageQuota {
  usage: number;
  quota: number;
  percentage: number;
}

export type NetworkStatus = 'online' | 'offline' | 'limited';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  resourceType: string;
  resourceId: string;
  data: any;
  baseVersion?: number;
  region: Region;
  tenantId: string;
  priority: 'high' | 'normal' | 'low';
  retryCount: number;
  lastAttempt?: number;
  error?: string;
  metadata: {
    deviceId: string;
    userId: string;
    timestamp: number;
    offlineCreated: boolean;
  };
}

export interface SyncStatus {
  status: 'completed' | 'failed' | 'skipped';
  timestamp: number;
  operationsProcessed?: number;
  errors?: Array<{
    operationId: string;
    error: string;
    retryable: boolean;
  }>;
  regionalStatus?: {
    [key in Region]?: {
      synced: boolean;
      lastSync: number;
      pendingOperations: number;
    }
  };
}

export interface ConflictResolution {
  action: 'client-wins' | 'server-wins' | 'manual' | 'abort';
  resolvedData?: any;
  metadata?: {
    resolvedBy: string;
    timestamp: number;
    reason: string;
  };
}

export interface StorageEntry<T> {
  id: string;
  data: T;
  timestamp: number;
  expiresAt?: number;
  region: Region;
  tenantId: string;
  priority: 'high' | 'normal' | 'low';
  version: number;
  checksum: string;
  encrypted: boolean;
  compressed: boolean;
}

export interface EncryptionConfig {
  algorithm: 'AES-GCM';
  keySize: 256;
  ivLength: 12;
}

export interface CompressionConfig {
  algorithm: 'gzip' | 'deflate';
  level: number; // 1-9
}

export interface RegionalCompliance {
  region: Region;
  dataRetentionDays: number;
  encryptionRequired: boolean;
  auditLoggingRequired: boolean;
  dataResidency: string[];
  regulatoryBodies: string[];
}

// Error types
export class OfflineError extends Error {
  constructor(message: string, public options?: any) {
    super(message);
    this.name = 'OfflineError';
  }
}

export class StorageError extends OfflineError {
  constructor(message: string, options?: any) {
    super(message, options);
    this.name = 'StorageError';
  }
}

export class SyncError extends OfflineError {
  constructor(message: string, options?: any) {
    super(message, options);
    this.name = 'SyncError';
  }
}

export class ValidationError extends OfflineError {
  constructor(message: string, options?: any) {
    super(message, options);
    this.name = 'ValidationError';
  }
}

export class RegionalComplianceError extends OfflineError {
  constructor(message: string, options?: any) {
    super(message, options);
    this.name = 'RegionalComplianceError';
  }
}

export class EncryptionError extends OfflineError {
  constructor(message: string, options?: any) {
    super(message, options);
    this.name = 'EncryptionError';
  }
}

export class QuotaExceededError extends StorageError {
  constructor(message: string, options?: any) {
    super(message, options);
    this.name = 'QuotaExceededError';
  }
} 