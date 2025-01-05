/**
 * @fileoverview Family Portal Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AccessManagementService } from '@/features/access-management/services/AccessManagementService';
import { SecurityConfig } from '@/features/access-management/types';

interface FamilyMember {
  id: string;
  residentId: string;
  userId: string;
  relationship: string;
  accessLevel: 'FULL' | 'LIMITED' | 'NONE';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  invitedBy: string;
  invitedAt: Date;
  lastAccess?: Date;
}

interface FamilyPortalAccess {
  id: string;
  familyMemberId: string;
  resourceType: string;
  resourceId: string;
  accessType: 'VIEW' | 'COMMENT' | 'FULL';
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export class FamilyPortalService {
  private static instance: FamilyPortalService;
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

  public static getInstance(): FamilyPortalService {
    if (!FamilyPortalService.instance) {
      FamilyPortalService.instance = new FamilyPortalService();
    }
    return FamilyPortalService.instance;
  }

  async initialize() {
    await this.accessService.initialize();
  }

  async inviteFamilyMember(
    residentId: string,
    invitedBy: string,
    relationship: string,
    accessLevel: FamilyMember['accessLevel']
  ): Promise<FamilyMember> {
    try {
      // Check if user has permission to invite family members
      const accessDecision = await this.accessService.checkAccess({
        userId: invitedBy,
        resourceType: 'family_portal',
        resourceId: residentId,
        action: 'invite'
      });

      if (!accessDecision.allowed) {
        throw new Error('User does not have permission to invite family members');
      }

      // Create family member record
      const familyMember: FamilyMember = {
        id: crypto.randomUUID(),
        residentId,
        userId: crypto.randomUUID(), // This will be updated when the invitation is accepted
        relationship,
        accessLevel,
        status: 'PENDING',
        invitedBy,
        invitedAt: new Date()
      };

      // Store family member in database
      await fetch('/api/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(familyMember)
      });

      // Log the invitation
      await this.accessService.auditLog({
        action: 'FAMILY_MEMBER_INVITED',
        description: `Family member invited for resident ${residentId}`,
        userId: invitedBy,
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        timestamp: new Date(),
        metadata: {
          residentId,
          relationship,
          accessLevel
        }
      });

      return familyMember;
    } catch (error) {
      console.error('Failed to invite family member:', error);
      throw error;
    }
  }

  async grantAccess(
    familyMemberId: string,
    grantedBy: string,
    resourceType: string,
    resourceId: string,
    accessType: FamilyPortalAccess['accessType']
  ): Promise<FamilyPortalAccess> {
    try {
      // Check if user has permission to grant access
      const accessDecision = await this.accessService.checkAccess({
        userId: grantedBy,
        resourceType: 'family_portal_access',
        resourceId: 'global',
        action: 'grant'
      });

      if (!accessDecision.allowed) {
        throw new Error('User does not have permission to grant family portal access');
      }

      // Create access record
      const access: FamilyPortalAccess = {
        id: crypto.randomUUID(),
        familyMemberId,
        resourceType,
        resourceId,
        accessType,
        grantedBy,
        grantedAt: new Date(),
        status: 'ACTIVE'
      };

      // Store access in database
      await fetch('/api/family-portal-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(access)
      });

      // Log the access grant
      await this.accessService.auditLog({
        action: 'FAMILY_PORTAL_ACCESS_GRANTED',
        description: `Family portal access granted for ${resourceType} ${resourceId}`,
        userId: grantedBy,
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        timestamp: new Date(),
        metadata: {
          familyMemberId,
          resourceType,
          resourceId,
          accessType
        }
      });

      return access;
    } catch (error) {
      console.error('Failed to grant family portal access:', error);
      throw error;
    }
  }

  async revokeAccess(
    accessId: string,
    revokedBy: string,
    reason: string
  ): Promise<FamilyPortalAccess> {
    try {
      // Check if user has permission to revoke access
      const accessDecision = await this.accessService.checkAccess({
        userId: revokedBy,
        resourceType: 'family_portal_access',
        resourceId: 'global',
        action: 'revoke'
      });

      if (!accessDecision.allowed) {
        throw new Error('User does not have permission to revoke family portal access');
      }

      // Get access record
      const response = await fetch(`/api/family-portal-access/${accessId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch access record');
      }
      const access: FamilyPortalAccess = await response.json();

      // Update access record
      const updatedAccess: FamilyPortalAccess = {
        ...access,
        status: 'REVOKED',
        expiresAt: new Date()
      };

      // Store updated access in database
      await fetch(`/api/family-portal-access/${accessId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAccess)
      });

      // Log the access revocation
      await this.accessService.auditLog({
        action: 'FAMILY_PORTAL_ACCESS_REVOKED',
        description: `Family portal access revoked for ${access.resourceType} ${access.resourceId}`,
        userId: revokedBy,
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        timestamp: new Date(),
        metadata: {
          familyMemberId: access.familyMemberId,
          resourceType: access.resourceType,
          resourceId: access.resourceId,
          reason
        }
      });

      return updatedAccess;
    } catch (error) {
      console.error('Failed to revoke family portal access:', error);
      throw error;
    }
  }

  async getFamilyMemberAccess(familyMemberId: string): Promise<FamilyPortalAccess[]> {
    try {
      // Get access records from database
      const response = await fetch(`/api/family-portal-access?familyMemberId=${familyMemberId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch family member access');
      }

      return response.json();
    } catch (error) {
      console.error('Failed to get family member access:', error);
      throw error;
    }
  }
}


