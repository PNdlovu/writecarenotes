/**
 * @fileoverview Emergency Access Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AccessManagementService } from '@/features/access-management/services/AccessManagementService';
import { SecurityConfig } from '@/features/access-management/types';

interface EmergencyAccess {
  id: string;
  userId: string;
  resourceId: string;
  resourceType: string;
  reason: string;
  grantedAt: Date;
  expiresAt: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  revokedAt?: Date;
  revokedBy?: string;
  revokeReason?: string;
}

export class EmergencyService {
  private static instance: EmergencyService;
  private accessService: AccessManagementService;

  private constructor() {
    const config: SecurityConfig = {
      algorithm: 'aes-256-gcm',
      ivLength: 16,
      encryptionKey: Buffer.from(process.env.ENCRYPTION_KEY || '', 'base64'),
      tokenSecret: process.env.JWT_SECRET || '',
      tokenExpiry: 24 * 60 * 60,
      mfaEnabled: true,
      passwordPolicy: {
        minLength: 12,
        requireNumbers: true,
        requireSpecialChars: true,
        requireUppercase: true,
        requireLowercase: true,
        expiryDays: 90,
        preventReuse: 5
      }
    };

    this.accessService = new AccessManagementService(config);
  }

  public static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  async initialize() {
    await this.accessService.initialize();
  }

  async requestEmergencyAccess(
    userId: string,
    resourceType: string,
    resourceId: string,
    reason: string
  ): Promise<EmergencyAccess> {
    try {
      // Check if user has permission to request emergency access
      const accessDecision = await this.accessService.checkAccess({
        userId,
        resourceType: 'emergency_access',
        resourceId: 'global',
        action: 'request'
      });

      if (!accessDecision.allowed) {
        throw new Error('User does not have permission to request emergency access');
      }

      // Create emergency access record
      const emergencyAccess: EmergencyAccess = {
        id: crypto.randomUUID(),
        userId,
        resourceType,
        resourceId,
        reason,
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        status: 'ACTIVE'
      };

      // Store emergency access in database
      await fetch('/api/emergency-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emergencyAccess)
      });

      // Log the emergency access request
      await this.accessService.auditLog({
        action: 'EMERGENCY_ACCESS_GRANTED',
        description: `Emergency access granted for ${resourceType} ${resourceId}`,
        userId,
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        timestamp: new Date(),
        metadata: {
          resourceType,
          resourceId,
          reason,
          expiresAt: emergencyAccess.expiresAt
        }
      });

      return emergencyAccess;
    } catch (error) {
      console.error('Failed to request emergency access:', error);
      throw error;
    }
  }

  async revokeEmergencyAccess(
    accessId: string,
    userId: string,
    revokeReason: string
  ): Promise<EmergencyAccess> {
    try {
      // Check if user has permission to revoke emergency access
      const accessDecision = await this.accessService.checkAccess({
        userId,
        resourceType: 'emergency_access',
        resourceId: 'global',
        action: 'revoke'
      });

      if (!accessDecision.allowed) {
        throw new Error('User does not have permission to revoke emergency access');
      }

      // Get emergency access record
      const response = await fetch(`/api/emergency-access/${accessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch emergency access record');
      }
      const emergencyAccess: EmergencyAccess = await response.json();

      // Update emergency access record
      const updatedAccess: EmergencyAccess = {
        ...emergencyAccess,
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedBy: userId,
        revokeReason
      };

      // Store updated emergency access in database
      await fetch(`/api/emergency-access/${accessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAccess)
      });

      // Log the emergency access revocation
      await this.accessService.auditLog({
        action: 'EMERGENCY_ACCESS_REVOKED',
        description: `Emergency access revoked for ${emergencyAccess.resourceType} ${emergencyAccess.resourceId}`,
        userId,
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        timestamp: new Date(),
        metadata: {
          resourceType: emergencyAccess.resourceType,
          resourceId: emergencyAccess.resourceId,
          revokeReason,
          originalGrantedAt: emergencyAccess.grantedAt
        }
      });

      return updatedAccess;
    } catch (error) {
      console.error('Failed to revoke emergency access:', error);
      throw error;
    }
  }

  async getEmergencyAccessHistory(userId: string): Promise<EmergencyAccess[]> {
    try {
      // Check if user has permission to view emergency access history
      const accessDecision = await this.accessService.checkAccess({
        userId,
        resourceType: 'emergency_access',
        resourceId: 'global',
        action: 'view'
      });

      if (!accessDecision.allowed) {
        throw new Error('User does not have permission to view emergency access history');
      }

      // Get emergency access history from database
      const response = await fetch(`/api/emergency-access?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch emergency access history');
      }

      // Log the access
      await this.accessService.auditLog({
        action: 'EMERGENCY_ACCESS_HISTORY_VIEWED',
        description: `Emergency access history viewed`,
        userId,
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        timestamp: new Date()
      });

      return response.json();
    } catch (error) {
      console.error('Failed to get emergency access history:', error);
      throw error;
    }
  }
}
