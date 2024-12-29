/**
 * @fileoverview Medication Verification Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AccessManagementService } from '@/features/access-management/services/AccessManagementService';
import { SecurityConfig } from '@/features/access-management/types';

interface MedicationVerification {
  id: string;
  medicationId: string;
  verifiedBy: string;
  verifiedAt: Date;
  verificationMethod: 'BARCODE' | 'MANUAL' | 'OVERRIDE';
  overrideReason?: string;
  overrideApprovedBy?: string;
}

export class MedicationVerificationService {
  private static instance: MedicationVerificationService;
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

  public static getInstance(): MedicationVerificationService {
    if (!MedicationVerificationService.instance) {
      MedicationVerificationService.instance = new MedicationVerificationService();
    }
    return MedicationVerificationService.instance;
  }

  async initialize() {
    await this.accessService.initialize();
  }

  async verifyMedication(
    medicationId: string,
    userId: string,
    method: MedicationVerification['verificationMethod'],
    overrideReason?: string
  ): Promise<MedicationVerification> {
    try {
      // Check if user has permission to verify medications
      const accessDecision = await this.accessService.checkAccess({
        userId,
        resourceType: 'medication',
        resourceId: medicationId,
        action: 'verify'
      });

      if (!accessDecision.allowed) {
        throw new Error('User does not have permission to verify medications');
      }

      // If using override, check for override permission
      if (method === 'OVERRIDE') {
        const overrideAccess = await this.accessService.checkAccess({
          userId,
          resourceType: 'medication_override',
          resourceId: medicationId,
          action: 'create'
        });

        if (!overrideAccess.allowed) {
          throw new Error('User does not have permission to override medication verification');
        }
      }

      // Create verification record
      const verification: MedicationVerification = {
        id: crypto.randomUUID(),
        medicationId,
        verifiedBy: userId,
        verifiedAt: new Date(),
        verificationMethod: method,
        overrideReason: method === 'OVERRIDE' ? overrideReason : undefined,
        overrideApprovedBy: method === 'OVERRIDE' ? userId : undefined
      };

      // Store verification in database
      await fetch('/api/medication-verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verification)
      });

      // Log the verification
      await this.accessService.auditLog({
        action: 'MEDICATION_VERIFIED',
        description: `Medication ${medicationId} verified using ${method}`,
        userId,
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        timestamp: new Date(),
        metadata: {
          medicationId,
          method,
          overrideReason
        }
      });

      return verification;
    } catch (error) {
      console.error('Failed to verify medication:', error);
      throw error;
    }
  }

  async getVerificationHistory(medicationId: string, userId: string): Promise<MedicationVerification[]> {
    try {
      // Check if user has permission to view verification history
      const accessDecision = await this.accessService.checkAccess({
        userId,
        resourceType: 'medication_verification',
        resourceId: medicationId,
        action: 'view'
      });

      if (!accessDecision.allowed) {
        throw new Error('User does not have permission to view verification history');
      }

      // Get verification history from database
      const response = await fetch(`/api/medication-verifications?medicationId=${medicationId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch verification history');
      }

      // Log the access
      await this.accessService.auditLog({
        action: 'VERIFICATION_HISTORY_VIEWED',
        description: `Verification history viewed for medication ${medicationId}`,
        userId,
        tenantId: 'current-tenant-id', // Replace with actual tenant ID
        timestamp: new Date(),
        metadata: { medicationId }
      });

      return response.json();
    } catch (error) {
      console.error('Failed to get verification history:', error);
      throw error;
    }
  }
} 