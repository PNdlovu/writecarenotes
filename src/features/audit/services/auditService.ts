/**
 * @fileoverview Audit service implementation
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AuditRepository } from '../database/repositories/auditRepository';
import { ExportService } from './exportService';
import { SecurityService } from './securityService';
import { WatermarkService } from './watermarkService';
import { 
  AuditLogEntry, 
  AuditLogFilter, 
  AuditLogArchiveEntry,
  AuditLogAction,
  AuditLogStatus,
  AuditLogActorType
} from '../types/audit.types';
import { ExportOptions } from '../types/export.types';

export class AuditService {
  private static instance: AuditService;
  private repository: AuditRepository;
  private exportService: ExportService;
  private securityService: SecurityService;
  private watermarkService: WatermarkService;

  private constructor() {
    this.repository = AuditRepository.getInstance();
    this.exportService = ExportService.getInstance();
    this.securityService = SecurityService.getInstance();
    this.watermarkService = WatermarkService.getInstance();
  }

  public static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Create an audit log entry
   */
  async logActivity(
    entityType: string,
    entityId: string,
    action: AuditLogAction,
    actorId: string,
    actorType: AuditLogActorType,
    changes?: Record<string, any>,
    details?: Record<string, any>,
    options?: {
      ipAddress?: string;
      userAgent?: string;
      organizationId?: string;
      facilityId?: string;
    }
  ): Promise<AuditLogEntry> {
    try {
      const logEntry: Omit<AuditLogEntry, 'id'> = {
        entityType,
        entityId,
        action,
        actorId,
        actorType,
        changes,
        details,
        status: 'SUCCESS',
        timestamp: new Date(),
        ipAddress: options?.ipAddress,
        userAgent: options?.userAgent,
        organizationId: options?.organizationId || 'SYSTEM',
        facilityId: options?.facilityId
      };

      return await this.repository.createLog(logEntry);
    } catch (error) {
      // Log the error but create an error audit entry
      console.error('Error creating audit log:', error);
      
      const errorEntry: Omit<AuditLogEntry, 'id'> = {
        ...logEntry,
        status: 'FAILURE',
        errorDetails: error.message
      };

      return await this.repository.createLog(errorEntry);
    }
  }

  /**
   * Search audit logs with filtering
   */
  async searchLogs(
    filter: AuditLogFilter,
    includeArchived = false
  ): Promise<{ logs: AuditLogEntry[]; total: number }> {
    return await this.repository.searchLogs(filter, includeArchived);
  }

  /**
   * Get entity audit history
   */
  async getEntityHistory(
    entityType: string,
    entityId: string
  ): Promise<{ current: AuditLogEntry[]; archived: AuditLogArchiveEntry[] }> {
    return await this.repository.getEntityHistory(entityType, entityId);
  }

  /**
   * Archive old audit logs
   */
  async archiveLogs(
    filter: AuditLogFilter,
    archiveReason: string,
    actorId: string
  ): Promise<number> {
    try {
      const count = await this.repository.archiveLogs(filter, archiveReason);

      // Log the archive action
      await this.logActivity(
        'AUDIT_LOG',
        'BULK_ARCHIVE',
        'ARCHIVE',
        actorId,
        'USER',
        { filter, archiveReason },
        { count }
      );

      return count;
    } catch (error) {
      console.error('Error archiving logs:', error);
      throw new Error('Failed to archive logs');
    }
  }

  /**
   * Export audit logs
   */
  async exportLogs(
    filter: AuditLogFilter,
    options: ExportOptions,
    actorId: string
  ): Promise<Buffer> {
    try {
      // Get logs to export
      const { logs } = await this.repository.searchLogs(filter, options.customization.metadata?.includeArchived);

      // Apply security checks
      await this.securityService.validateExport(logs, options.security);

      // Generate export
      const exportData = await this.exportService.generateExport(logs, options);

      // Add watermark if specified
      if (options.customization.watermark) {
        await this.watermarkService.addWatermark(exportData, options.customization.watermark);
      }

      // Log the export action
      await this.logActivity(
        'AUDIT_LOG',
        'BULK_EXPORT',
        'EXPORT',
        actorId,
        'USER',
        { filter, options },
        { count: logs.length }
      );

      return exportData;
    } catch (error) {
      console.error('Error exporting logs:', error);
      throw new Error('Failed to export logs');
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(organizationId: string): Promise<{
    totalLogs: number;
    activeCount: number;
    archivedCount: number;
    actionCounts: Record<string, number>;
  }> {
    return await this.repository.getAuditStats(organizationId);
  }

  /**
   * Clean up old audit logs based on retention policy
   */
  async cleanupOldLogs(
    organizationId: string,
    retentionPeriod: number,
    actorId: string
  ): Promise<number> {
    try {
      const filter: AuditLogFilter = {
        organizationId
      };

      const count = await this.repository.bulkDeleteLogs(filter, retentionPeriod);

      // Log the cleanup action
      await this.logActivity(
        'AUDIT_LOG',
        'BULK_DELETE',
        'DELETE',
        actorId,
        'USER',
        { retentionPeriod },
        { count }
      );

      return count;
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      throw new Error('Failed to clean up old logs');
    }
  }

  /**
   * Validate and sanitize audit log entry
   */
  private validateLogEntry(entry: Partial<AuditLogEntry>): void {
    if (!entry.entityType || !entry.entityId || !entry.action || !entry.actorId) {
      throw new Error('Missing required audit log fields');
    }

    // Sanitize sensitive fields
    if (entry.details) {
      entry.details = this.securityService.sanitizeSensitiveData(entry.details);
    }

    if (entry.changes) {
      entry.changes = this.securityService.sanitizeSensitiveData(entry.changes);
    }
  }
} 
} 


