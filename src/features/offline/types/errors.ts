/**
 * @fileoverview Error types for offline module
 * @version 1.0.0
 * @created 2024-03-21
 */

import { ConflictDetails } from './index';

/**
 * Base error class for offline module
 */
export class OfflineError extends Error {
  constructor(
    message: string,
    public readonly options: {
      cause?: Error;
      code?: string;
      details?: Record<string, any>;
    } = {}
  ) {
    super(message);
    this.name = 'OfflineError';
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OfflineError);
    }

    // Copy properties from cause
    if (options.cause) {
      if (!this.stack) {
        this.stack = options.cause.stack;
      }
    }
  }
}

/**
 * Error for storage operations
 */
export class StorageError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        operation?: string;
        key?: string;
        quota?: {
          used: number;
          total: number;
          percentage: number;
        };
      };
    } = {}
  ) {
    super(message, options);
    this.name = 'StorageError';
  }
}

/**
 * Error for network operations
 */
export class NetworkError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        url?: string;
        status?: number;
        statusText?: string;
        latency?: number;
        connectionType?: string;
      };
    } = {}
  ) {
    super(message, options);
    this.name = 'NetworkError';
  }
}

/**
 * Error for sync operations
 */
export class SyncError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        operationType?: string;
        resourceId?: string;
        retryCount?: number;
        lastAttempt?: number;
        queueSize?: number;
      };
    } = {}
  ) {
    super(message, options);
    this.name = 'SyncError';
  }
}

/**
 * Error for conflict resolution
 */
export class ConflictError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: ConflictDetails;
    } = {}
  ) {
    super(message, options);
    this.name = 'ConflictError';
  }
}

/**
 * Error for service worker operations
 */
export class ServiceWorkerError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        registration?: boolean;
        scope?: string;
        version?: string;
        state?: string;
      };
    } = {}
  ) {
    super(message, options);
    this.name = 'ServiceWorkerError';
  }
}

/**
 * Error for cache operations
 */
export class CacheError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        cacheName?: string;
        key?: string;
        size?: number;
        maxAge?: number;
        maxItems?: number;
      };
    } = {}
  ) {
    super(message, options);
    this.name = 'CacheError';
  }
}

/**
 * Error for background sync operations
 */
export class BackgroundSyncError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        tag?: string;
        retryCount?: number;
        lastAttempt?: number;
        nextRetry?: number;
      };
    } = {}
  ) {
    super(message, options);
    this.name = 'BackgroundSyncError';
  }
}

/**
 * Error for version migration
 */
export class VersionError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        fromVersion?: string;
        toVersion?: string;
        schemaVersion?: string;
        migrationStep?: string;
      };
    } = {}
  ) {
    super(message, options);
    this.name = 'VersionError';
  }
}

/**
 * Error for quota exceeded
 */
export class QuotaExceededError extends StorageError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        quota: {
          used: number;
          total: number;
          percentage: number;
        };
        required: number;
      };
    }
  ) {
    super(message, options);
    this.name = 'QuotaExceededError';
  }
}

/**
 * Error for invalid operations
 */
export class InvalidOperationError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        operation: string;
        reason: string;
        context?: Record<string, any>;
      };
    }
  ) {
    super(message, options);
    this.name = 'InvalidOperationError';
  }
}

/**
 * Error for timeout
 */
export class TimeoutError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        operation: string;
        timeout: number;
        elapsed: number;
      };
    }
  ) {
    super(message, options);
    this.name = 'TimeoutError';
  }
}

/**
 * Error for initialization
 */
export class InitializationError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        component: string;
        state: string;
        requirements?: string[];
      };
    }
  ) {
    super(message, options);
    this.name = 'InitializationError';
  }
}

/**
 * Error for compression operations
 */
export class CompressionError extends OfflineError {
  constructor(
    message: string,
    options: {
      cause?: Error;
      code?: string;
      details?: {
        originalSize?: number;
        compressedSize?: number;
        algorithm?: string;
        format?: string;
      };
    } = {}
  ) {
    super(message, options);
    this.name = 'CompressionError';
  }
}
