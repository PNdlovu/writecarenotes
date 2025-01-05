/**
 * @writecarenotes.com
 * @fileoverview MAR Type Definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for Medication Administration Records (MAR).
 */

export interface MedicationAdministration {
  id: string;
  medicationId: string;
  residentId: string;
  scheduleId: string;
  administeredBy: string;
  witnessId?: string;
  status: AdministrationStatus;
  scheduledTime: string;
  administeredTime?: string;
  dose: string;
  notes?: string;
  batchNumber: string;
  isPRN: boolean;
  requiresDoubleCheck: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum AdministrationStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
  REFUSED = 'REFUSED',
  WITHHELD = 'WITHHELD'
}

export interface MARSignature {
  id: string;
  administrationId: string;
  staffId: string;
  type: 'ADMINISTRATOR' | 'WITNESS';
  signedAt: string;
  pinHash: string;
}

export interface MARHistory {
  id: string;
  administrationId: string;
  type: 'CREATED' | 'UPDATED' | 'SIGNED' | 'WITNESSED';
  staffId: string;
  timestamp: string;
  details: string;
}


