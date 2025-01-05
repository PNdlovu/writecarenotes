/**
 * @writecarenotes.com
 * @fileoverview Type definitions for offline module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core type definitions for the offline module including sync operations,
 * error handling, and data structures. Provides type safety and documentation
 * for offline functionality across the application.
 */

/**
 * Sync operation types for offline data
 */
export enum SyncType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

/**
 * Sync strategies for conflict resolution
 */
export enum SyncStrategy {
  LAST_WRITE_WINS = 'LAST_WRITE_WINS',
  SERVER_WINS = 'SERVER_WINS',
  CLIENT_WINS = 'CLIENT_WINS',
  MANUAL = 'MANUAL',
}

/**
 * Error codes for offline operations
 */
export enum ErrorCode {
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  STORE_NOT_FOUND = 'STORE_NOT_FOUND',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SYNC_CONFLICT = 'SYNC_CONFLICT',
  INVALID_DATA = 'INVALID_DATA',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom error class for offline operations
 */
export class OfflineError extends Error {
  constructor(
    public code: ErrorCode,
    message?: string,
    public details?: unknown
  ) {
    super(message || code);
    this.name = 'OfflineError';
  }
}

/**
 * Configuration options for offline service
 */
export interface OfflineConfig {
  syncStrategy?: SyncStrategy;
  maxRetries?: number;
  retryDelay?: number;
  maxQueueSize?: number;
  encryptData?: boolean;
  compressionEnabled?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

/**
 * Audit information for tracking changes
 */
export interface AuditInfo {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  version: number;
  deviceId: string;
  organizationId: string;
}

/**
 * Queue item for sync operations
 */
export interface SyncQueueItem<T> {
  id: string;
  type: SyncType;
  data: T;
  timestamp: string;
  retryCount: number;
  error?: {
    code: ErrorCode;
    message: string;
    timestamp: string;
  };
  audit?: AuditInfo;
}

/**
 * Schema for offline database
 */
export interface OfflineDBSchema {
  data: {
    key: string;
    value: unknown;
    timestamp: string;
    version: number;
  };
  syncQueue: {
    key: string;
    value: SyncQueueItem<unknown>;
  };
  meta: {
    key: string;
    value: {
      lastSync: string;
      version: string;
      deviceId: string;
    };
  };
}

/**
 * Response from sync operation
 */
export interface SyncResponse<T> {
  success: boolean;
  data?: T;
  conflict?: boolean;
  serverTimestamp?: string;
  error?: {
    code: ErrorCode;
    message: string;
  };
}

/**
 * Status of offline service
 */
export interface OfflineStatus {
  isInitialized: boolean;
  isOnline: boolean;
  lastSync: string | null;
  pendingSyncCount: number;
  storageUsage: {
    used: number;
    quota: number;
    percentage: number;
  };
}

/**
 * Options for data operations
 */
export interface DataOptions {
  skipSync?: boolean;
  priority?: 'high' | 'normal' | 'low';
  expiresAt?: string;
  encrypt?: boolean;
  compress?: boolean;
}

/**
 * Sync progress event
 */
export interface SyncProgressEvent {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  timestamp: string;
}

/**
 * Conflict resolution handler
 */
export type ConflictResolver<T> = (local: T, server: T) => Promise<T>;

/**
 * Sync error handler
 */
export type SyncErrorHandler = (error: OfflineError) => Promise<void>;

/**
 * Progress callback
 */
export type ProgressCallback = (event: SyncProgressEvent) => void;


