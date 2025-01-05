/**
 * @writecarenotes.com
 * @fileoverview Constants for offline module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Constants used throughout the offline module including database configuration,
 * sync settings, and error messages. Centralizes configuration values and
 * provides documentation for key constants.
 */

/**
 * Database configuration
 */
export const DB_CONFIG = {
  NAME: 'writecarenotes-offline-db',
  VERSION: 1,
  STORES: {
    DATA: 'data',
    SYNC_QUEUE: 'syncQueue',
    META: 'meta',
  },
} as const;

/**
 * Sync configuration
 */
export const SYNC_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
  MAX_QUEUE_SIZE: 1000,
  BATCH_SIZE: 50,
  SYNC_INTERVAL: 300000, // 5 minutes
  CLEANUP_INTERVAL: 86400000, // 24 hours
} as const;

/**
 * Storage limits
 */
export const STORAGE_LIMITS = {
  MAX_ITEM_SIZE: 5242880, // 5MB
  WARNING_THRESHOLD: 0.8, // 80%
  CRITICAL_THRESHOLD: 0.9, // 90%
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NOT_INITIALIZED: 'Offline service not initialized',
  STORE_NOT_FOUND: 'Store not found in database',
  QUOTA_EXCEEDED: 'Storage quota exceeded',
  NETWORK_ERROR: 'Network connection error',
  SYNC_CONFLICT: 'Data sync conflict detected',
  INVALID_DATA: 'Invalid data format',
  PERMISSION_DENIED: 'Permission denied for operation',
} as const;

/**
 * Event names
 */
export const EVENTS = {
  SYNC_STARTED: 'offline:sync:started',
  SYNC_COMPLETED: 'offline:sync:completed',
  SYNC_ERROR: 'offline:sync:error',
  STORAGE_WARNING: 'offline:storage:warning',
  STORAGE_CRITICAL: 'offline:storage:critical',
  NETWORK_STATUS_CHANGED: 'offline:network:changed',
} as const;

/**
 * Audit configuration
 */
export const AUDIT_CONFIG = {
  ENABLED: true,
  LOG_LEVEL: 'info',
  RETENTION_DAYS: 90,
} as const;

/**
 * Security configuration
 */
export const SECURITY_CONFIG = {
  ENCRYPTION_ENABLED: true,
  COMPRESSION_ENABLED: true,
  KEY_ROTATION_DAYS: 30,
} as const;

/**
 * Regional settings
 */
export const REGIONAL_CONFIG = {
  DEFAULT_TIMEZONE: 'Europe/London',
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm:ss',
  SUPPORTED_REGIONS: ['GB-ENG', 'GB-WLS', 'GB-SCT', 'GB-NIR', 'IRL'],
} as const;

/**
 * Compliance settings
 */
export const COMPLIANCE_CONFIG = {
  DATA_RETENTION_DAYS: 2555, // 7 years
  AUDIT_RETENTION_DAYS: 3650, // 10 years
  ENCRYPTION_STANDARD: 'AES-256-GCM',
  REQUIRES_CONSENT: true,
} as const;

/**
 * Performance settings
 */
export const PERFORMANCE_CONFIG = {
  CACHE_TTL: 3600, // 1 hour
  MAX_CONCURRENT_SYNCS: 3,
  DEBOUNCE_DELAY: 1000, // 1 second
  THROTTLE_DELAY: 500, // 500ms
} as const;


