import { privacyRepository } from '../repositories/privacyRepository';
import { AuditEntry, Permission } from '../types/privacy';
import { APIError } from '@/lib/api';

/**
 * Service for handling privacy-related business logic
 */
export const privacyService = {
  /**
   * Get audit log with validation and business rules
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
  }) {
    // Validate date range
    if (params.startDate && params.endDate && params.startDate > params.endDate) {
      throw new APIError('Invalid date range', 400);
    }

    // Apply business rules for pagination
    const limit = Math.min(params.limit || 20, 100); // Max 100 items per page
    
    return privacyRepository.getAuditLog({
      ...params,
      limit,
    });
  },

  /**
   * Get permissions with access control validation
   */
  async getPermissions(params: {
    residentId: string;
    organizationId: string;
    userId: string;
    userRole: string;
  }) {
    // Validate access rights
    if (!await this.canAccessPermissions(params)) {
      throw new APIError('Unauthorized access to permissions', 403);
    }

    return privacyRepository.getPermissions({
      residentId: params.residentId,
      organizationId: params.organizationId,
    });
  },

  /**
   * Update permission with validation and audit logging
   */
  async updatePermission(params: {
    permission: Permission;
    userId: string;
    userRole: string;
  }) {
    const { permission, userId, userRole } = params;

    // Validate access rights
    if (!await this.canModifyPermissions({ userId, userRole })) {
      throw new APIError('Unauthorized to modify permissions', 403);
    }

    // Create audit entry for permission change
    await privacyRepository.createAuditEntry({
      timestamp: new Date(),
      action: 'update',
      category: 'personal',
      resource: {
        id: permission.id,
        type: 'permission',
        name: permission.name,
      },
      user: {
        id: userId,
        name: 'System User', // TODO: Get from user service
        role: userRole,
        email: 'user@example.com', // TODO: Get from user service
      },
      details: {
        reason: 'Permission update',
      },
      organizationId: permission.organizationId,
    });

    return privacyRepository.updatePermission(permission);
  },

  /**
   * Check if user can access permissions
   */
  private async canAccessPermissions(params: {
    userId: string;
    userRole: string;
  }): Promise<boolean> {
    // TODO: Implement proper role-based access control
    return ['admin', 'manager'].includes(params.userRole);
  },

  /**
   * Check if user can modify permissions
   */
  private async canModifyPermissions(params: {
    userId: string;
    userRole: string;
  }): Promise<boolean> {
    // TODO: Implement proper role-based access control
    return ['admin'].includes(params.userRole);
  },
};


