import { prisma } from '@/lib/db';
import { AuditEntry, Permission } from '../types/privacy';
import { offlineStore } from '@/lib/offline/store';

/**
 * Repository for handling privacy-related data access
 */
export const privacyRepository = {
  /**
   * Fetch audit log entries with pagination and filtering
   */
  async getAuditLog(params: {
    residentId: string;
    organizationId: string;
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    category?: string;
    action?: string;
  }): Promise<{ entries: AuditEntry[]; total: number }> {
    const { page = 1, limit = 20 } = params;
    
    // Check offline status
    if (!navigator.onLine) {
      return offlineStore.getAuditLog(params);
    }

    const where = {
      residentId: params.residentId,
      organizationId: params.organizationId,
      ...(params.startDate && params.endDate && {
        timestamp: {
          gte: params.startDate,
          lte: params.endDate,
        },
      }),
      ...(params.category && { category: params.category }),
      ...(params.action && { action: params.action }),
    };

    const [entries, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { entries, total };
  },

  /**
   * Fetch permissions for a resident
   */
  async getPermissions(params: {
    residentId: string;
    organizationId: string;
  }): Promise<Permission[]> {
    if (!navigator.onLine) {
      return offlineStore.getPermissions(params);
    }

    return prisma.permission.findMany({
      where: {
        residentId: params.residentId,
        organizationId: params.organizationId,
      },
    });
  },

  /**
   * Update permission settings
   */
  async updatePermission(permission: Permission): Promise<Permission> {
    if (!navigator.onLine) {
      return offlineStore.queuePermissionUpdate(permission);
    }

    return prisma.permission.update({
      where: { id: permission.id },
      data: permission,
    });
  },

  /**
   * Create audit log entry
   */
  async createAuditEntry(entry: Omit<AuditEntry, 'id'>): Promise<AuditEntry> {
    if (!navigator.onLine) {
      return offlineStore.queueAuditEntry(entry);
    }

    return prisma.auditLog.create({
      data: entry,
    });
  },
};


