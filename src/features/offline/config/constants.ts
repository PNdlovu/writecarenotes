// src/features/offline/config/constants.ts
export const OFFLINE_CONFIG = {
  STORAGE: {
    DB_NAME: 'writecarenotes_offline',
    DB_VERSION: 1,
    STORES: {
      PENDING_CHANGES: 'pendingChanges',
      CACHE: 'cache',
    },
  },
  SYNC: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // ms
    BATCH_SIZE: 50,
    AUTO_SYNC_INTERVAL: 300000, // 5 minutes
  },
  STORAGE_LIMITS: {
    WARNING_THRESHOLD: 80, // percentage
    CRITICAL_THRESHOLD: 90,
    MAX_PENDING_CHANGES: 1000,
  },
  API: {
    ENDPOINTS: {
      SYNC: '/api/sync',
      TIMESTAMP: '/api/sync/timestamp',
      VALIDATE: '/api/sync/validate',
    },
    TIMEOUT: 30000, // 30 seconds
  },
} as const;
