/**
 * @fileoverview Audit module type definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AuditLogAction, AuditLogStatus, AuditLogActorType } from '@/types/audit';

export interface AuditLogFilter {
  entityType?: string;
  entityId?: string;
  action?: AuditLogAction;
  actorId?: string;
  status?: AuditLogStatus;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface AuditLogChanges {
  before?: Record<string, any>;
  after?: Record<string, any>;
}

export interface AuditLogEntry {
  id?: string;
  entityType: string;
  entityId: string;
  action: AuditLogAction;
  actorId: string;
  actorType: AuditLogActorType;
  changes?: AuditLogChanges;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: AuditLogStatus;
  errorDetails?: string;
  timestamp?: Date;
  organizationId: string;
  facilityId?: string;
}

export interface AuditLogArchiveEntry extends AuditLogEntry {
  archivedAt: Date;
}

export interface AuditLogStats {
  totalLogs: number;
  successCount: number;
  failureCount: number;
  actionCounts: Record<AuditLogAction, number>;
  entityTypeCounts: Record<string, number>;
}

export interface AuditLogExportOptions {
  format: 'CSV' | 'JSON' | 'PDF';
  filter: AuditLogFilter;
  includeArchived: boolean;
}

export interface EntityHistory {
  current: AuditLogEntry[];
  archived: AuditLogArchiveEntry[];
} 


