import { prisma } from '@/lib/prisma';
import { 
  BarcodeVerification,
  VerificationStatus,
  VerificationMethod,
  VerificationError,
  VerificationErrorType,
  MedicationAdministration
} from '../types';
import { createAuditLog } from '@/lib/audit';
import { getCurrentTenant } from '@/lib/tenant';
import { ValidationError } from '@/lib/errors';

export class VerificationService {
  private static instance: VerificationService;
  
  private constructor() {}

  public static getInstance(): VerificationService {
    if (!VerificationService.instance) {
      VerificationService.instance = new VerificationService();
    }
    return VerificationService.instance;
  }

  // Verify medication using barcode
  async verifyMedicationBarcode(
    administrationId: string,
    scannedBarcode: string
  ): Promise<BarcodeVerification> {
    const tenant = await getCurrentTenant();
    
    // Get the administration record with medication details
    const administration = await prisma.medicationAdministration.findFirst({
      where: {
        id: administrationId,
        organizationId: tenant.organizationId
      },
      include: {
        medication: true,
        schedule: true,
        resident: true
      }
    });

    if (!administration) {
      throw new ValidationError('Administration record not found');
    }

    // Verify the barcode matches
    if (administration.medication.barcode !== scannedBarcode) {
      await this.recordVerificationError({
        administrationId,
        type: VerificationErrorType.BARCODE_MISMATCH,
        scannedBarcode,
        expectedBarcode: administration.medication.barcode
      });
      throw new ValidationError('Incorrect medication - barcode does not match');
    }

    // Create verification record
    const verification = await prisma.barcodeVerification.create({
      data: {
        administrationId,
        scannedBarcode,
        expectedBarcode: administration.medication.barcode,
        verified: true,
        verifiedAt: new Date(),
        verifiedBy: tenant.userId,
        overridden: false,
        organizationId: tenant.organizationId
      }
    });

    // Update administration record
    await this.updateAdministrationVerification(administrationId, {
      barcodeScanned: true,
      scannedBarcode,
      verificationStatus: VerificationStatus.VERIFIED,
      verificationMethod: [VerificationMethod.BARCODE]
    });

    await createAuditLog({
      action: 'medication.verification.barcode',
      entityType: 'medicationAdministration',
      entityId: administrationId,
      details: {
        scannedBarcode,
        verified: true
      }
    });

    return verification;
  }

  // Override failed verification (requires higher permission)
  async overrideVerification(
    administrationId: string,
    overrideReason: string
  ): Promise<BarcodeVerification> {
    const tenant = await getCurrentTenant();
    
    // Check if user has override permission
    // This should integrate with your RBAC system
    const hasPermission = await this.checkOverridePermission(tenant.userId);
    if (!hasPermission) {
      throw new ValidationError('No permission to override verification');
    }

    const verification = await prisma.barcodeVerification.update({
      where: {
        administrationId,
        organizationId: tenant.organizationId
      },
      data: {
        overridden: true,
        overrideReason,
        overriddenBy: tenant.userId
      }
    });

    await this.updateAdministrationVerification(administrationId, {
      verificationStatus: VerificationStatus.OVERRIDE,
      verificationMethod: [VerificationMethod.MANUAL]
    });

    await createAuditLog({
      action: 'medication.verification.override',
      entityType: 'medicationAdministration',
      entityId: administrationId,
      details: {
        overrideReason,
        overriddenBy: tenant.userId
      }
    });

    return verification;
  }

  // Record verification errors for monitoring and reporting
  private async recordVerificationError({
    administrationId,
    type,
    scannedBarcode,
    expectedBarcode
  }: {
    administrationId: string;
    type: VerificationErrorType;
    scannedBarcode: string;
    expectedBarcode: string;
  }): Promise<void> {
    const tenant = await getCurrentTenant();
    
    await prisma.verificationError.create({
      data: {
        administrationId,
        type,
        code: `ERR_${type}`,
        message: this.getErrorMessage(type),
        details: {
          scannedBarcode,
          expectedBarcode
        },
        organizationId: tenant.organizationId
      }
    });

    await this.updateAdministrationVerification(administrationId, {
      verificationStatus: VerificationStatus.FAILED,
      verificationMethod: [VerificationMethod.BARCODE]
    });
  }

  // Update administration record with verification details
  private async updateAdministrationVerification(
    administrationId: string,
    data: Partial<MedicationAdministration>
  ): Promise<void> {
    await prisma.medicationAdministration.update({
      where: { id: administrationId },
      data
    });
  }

  // Check if user has override permission
  private async checkOverridePermission(userId: string): Promise<boolean> {
    // Implement permission check based on your RBAC system
    return true; // Temporary implementation
  }

  // Get human-readable error message
  private getErrorMessage(type: VerificationErrorType): string {
    const messages = {
      [VerificationErrorType.BARCODE_MISMATCH]: 'Scanned barcode does not match the expected medication',
      [VerificationErrorType.INVALID_BARCODE]: 'Invalid or unrecognized barcode format',
      [VerificationErrorType.EXPIRED_MEDICATION]: 'Medication has expired',
      [VerificationErrorType.WRONG_RESIDENT]: 'Medication is not prescribed for this resident',
      [VerificationErrorType.WRONG_TIME]: 'Medication is not scheduled for this time',
      [VerificationErrorType.SYSTEM_ERROR]: 'System error occurred during verification'
    };
    return messages[type] || 'Unknown verification error';
  }
}

export const verificationService = VerificationService.getInstance(); 