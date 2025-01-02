/**
 * @fileoverview Security Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AccessManagementService } from '@/features/access-management/services/AccessManagementService';
import { SecurityConfig } from '@/features/access-management/types';

export class SecurityService {
  private static instance: SecurityService;
  private accessService: AccessManagementService;

  private constructor() {
    const config: SecurityConfig = {
      algorithm: 'aes-256-gcm',
      ivLength: 16,
      encryptionKey: Buffer.from(process.env.ENCRYPTION_KEY || '', 'base64'),
      tokenSecret: process.env.JWT_SECRET || '',
      tokenExpiry: 24 * 60 * 60, // 24 hours
      mfaEnabled: process.env.MFA_ENABLED === 'true',
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

  public static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  async initialize() {
    await this.accessService.initialize();
  }

  async authenticate(token: string) {
    return this.accessService.authenticate(token);
  }

  async checkAccess(userId: string, resourceType: string, resourceId: string, action: string) {
    return this.accessService.checkAccess({
      userId,
      resourceType,
      resourceId,
      action
    });
  }

  async encryptData(data: Buffer) {
    return this.accessService.encryptData(data);
  }

  async decryptData(encrypted: Buffer, iv: Buffer) {
    return this.accessService.decryptData(encrypted, iv);
  }

  async auditLog(action: string, description: string, userId: string, metadata: Record<string, any>) {
    return this.accessService.auditLog({
      action,
      description,
      userId,
      tenantId: 'current-tenant-id', // Replace with actual tenant ID
      timestamp: new Date(),
      metadata
    });
  }
}


