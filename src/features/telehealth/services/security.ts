/**
 * @fileoverview Telehealth Security Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AccessManagementService } from '@/features/access-management/services/AccessManagementService';
import { SecurityConfig } from '@/features/access-management/types';

export class TelehealthSecurityService {
  private static instance: TelehealthSecurityService;
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

  public static getInstance(): TelehealthSecurityService {
    if (!TelehealthSecurityService.instance) {
      TelehealthSecurityService.instance = new TelehealthSecurityService();
    }
    return TelehealthSecurityService.instance;
  }

  async initialize() {
    await this.accessService.initialize();
  }

  async validateAccess(
    userId: string,
    sessionId: string,
    action: string
  ): Promise<{
    status: 'SUCCESS' | 'FAILURE';
    failureReason?: string;
  }> {
    try {
      const decision = await this.accessService.checkAccess({
        userId,
        resourceType: 'telehealth_session',
        resourceId: sessionId,
        action
      });

      await this.accessService.auditLog({
        action: 'TELEHEALTH_ACCESS_CHECK',
        description: `Telehealth access check for session ${sessionId}`,
        userId,
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        timestamp: new Date(),
        metadata: {
          sessionId,
          action,
          allowed: decision.allowed
        }
      });

      return {
        status: decision.allowed ? 'SUCCESS' : 'FAILURE',
        failureReason: decision.allowed ? undefined : decision.reason
      };
    } catch (error) {
      console.error('Error validating telehealth access:', error);
      return {
        status: 'FAILURE',
        failureReason: 'Internal security check failed'
      };
    }
  }

  async encryptSessionData(data: Buffer): Promise<{ encrypted: Buffer; iv: Buffer }> {
    return this.accessService.encryptData(data);
  }

  async decryptSessionData(encrypted: Buffer, iv: Buffer): Promise<Buffer> {
    return this.accessService.decryptData(encrypted, iv);
  }

  async logSessionActivity(
    userId: string,
    sessionId: string,
    action: string,
    metadata: Record<string, any>
  ): Promise<void> {
    await this.accessService.auditLog({
      action: `TELEHEALTH_${action.toUpperCase()}`,
      description: `Telehealth session activity: ${action}`,
      userId,
      tenantId: 'current-tenant-id', // Replace with actual tenant ID
      timestamp: new Date(),
      metadata: {
        sessionId,
        ...metadata
      }
    });
  }
}


