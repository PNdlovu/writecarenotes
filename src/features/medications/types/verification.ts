/**
 * @writecarenotes.com
 * @fileoverview Verification Type Definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for medication verification and double-checking.
 */

export interface MedicationVerification {
  id: string;
  medicationId: string;
  administrationId: string;
  verifiedBy: string;
  witnessId?: string;
  type: VerificationType;
  status: VerificationStatus;
  verifiedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum VerificationType {
  ADMINISTRATION = 'ADMINISTRATION',
  STOCK_CHECK = 'STOCK_CHECK',
  CONTROLLED_DRUG = 'CONTROLLED_DRUG',
  DOUBLE_SIGNATURE = 'DOUBLE_SIGNATURE'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export interface DoubleSignature {
  id: string;
  verificationId: string;
  staffId: string;
  type: 'PRIMARY' | 'SECONDARY';
  signedAt: string;
  pinHash: string;
}

export interface VerificationHistory {
  id: string;
  verificationId: string;
  type: 'CREATED' | 'UPDATED' | 'SIGNED' | 'WITNESSED';
  staffId: string;
  timestamp: string;
  details: string;
} 