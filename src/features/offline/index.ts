// src/features/offline/index.ts

// Components
export { OfflineIndicator } from './components/OfflineIndicator';
export { OfflineErrorBoundary, OfflineErrorHandler } from './components/OfflineErrorBoundary';

// Hooks
export { useOffline } from './hooks/useOffline';

// Utils
export { getOfflineStorage, closeOfflineStorage } from './utils/storage';

// Types
export type { PendingChange, OfflineState, StorageUsage } from './types';
export { OfflineError, SyncError, StorageError, ValidationError } from './types/errors';

// Config
export { OFFLINE_CONFIG } from './config/constants';
