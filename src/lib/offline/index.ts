/**
 * @writecarenotes.com
 * @fileoverview Main entry point for offline module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Main entry point for the offline module, exporting all components
 * and types for enterprise-grade offline capabilities.
 */

export * from './offlineService';
export * from './types';
export * from './constants';
export * from './hooks/useOffline';

// Re-export commonly used types
export type {
  SyncQueueItem,
  AuditLogItem,
  ConflictItem,
  MetadataItem,
  OfflineDBSchema
} from './types';

// Re-export enums
export {
  SyncStrategy,
  ConflictResolution,
  ErrorCode
} from './types';

// Re-export error
export { OfflineError } from './types';


