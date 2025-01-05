/**
 * @writecarenotes.com
 * @fileoverview Comprehensive medication type definitions for the Write Care Notes platform
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core type definitions for the medication module, including prescriptions,
 * administration records, and compliance requirements. Supports regional
 * variations and regulatory requirements across UK and Ireland.
 *
 * Features:
 * - Complete medication entity types
 * - Prescription management
 * - Administration records
 * - Stock control
 * - Compliance tracking
 * - Audit logging
 *
 * Mobile-First Considerations:
 * - Optimized type structures for offline sync
 * - Minimal data footprint for mobile
 * - Efficient state management
 *
 * Enterprise Features:
 * - Multi-tenant support
 * - Regional compliance types
 * - Audit trail support
 * - Security role integration
 */

import type { ComplianceRequirement } from './compliance';
import type { Organization, Resident } from '@prisma/client';

export type MedicationStatus = 
  | 'ACTIVE'
  | 'DISCONTINUED'
  | 'COMPLETED'
  | 'ON_HOLD'
  | 'PENDING';

export type MedicationRoute = 
  | 'ORAL'
  | 'TOPICAL'
  | 'INJECTION'
  | 'INHALED'
  | 'OTHER';

export interface Medication {
  id: string;
  organizationId: string;
  residentId: string;
  name: string;
  genericName: string;
  form: string;
  strength: string;
  route: MedicationRoute;
  controlled: boolean;
  status: MedicationStatus;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  prescription?: Prescription;
  instructions?: MedicationInstructions;
  history?: MedicationHistoryEntry[];
  interactions?: MedicationInteraction[];
  compliance?: ComplianceRequirement;
  resident?: Resident;
  organization?: Organization;
}

export interface Prescription {
  id: string;
  medicationId: string;
  dose: string;
  frequency: string;
  duration: string;
  startDate: string;
  endDate: string;
  prescribedBy: string;
  prescribedDate: string;
  notes?: string;
  requiresWitness: boolean;
  maxPRNDose?: string;
  prn: boolean;
}

export interface MedicationInstructions {
  administration: string;
  special?: string;
  storage?: string;
  warnings?: string[];
  contraindications?: string[];
  sideEffects?: string[];
  timing?: {
    beforeFood?: boolean;
    withFood?: boolean;
    afterFood?: boolean;
    timeOfDay?: string[];
  };
}

export interface MedicationHistoryEntry {
  id: string;
  medicationId: string;
  date: string;
  type: 'PRESCRIBED' | 'MODIFIED' | 'DISCONTINUED' | 'RESUMED';
  details: string;
  staffId: string;
  notes?: string;
  witness?: string;
}

export interface MedicationInteraction {
  id: string;
  medicationId: string;
  interactingMedicationId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  recommendation: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationStock {
  id: string;
  medicationId: string;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  supplier: string;
  receivedDate: string;
  receivedBy: string;
  location?: string;
}

export interface MedicationAdministrationRecord {
  id: string;
  medicationId: string;
  residentId: string;
  administeredBy: string;
  witnessedBy?: string;
  dateTime: string;
  dose: string;
  status: 'GIVEN' | 'REFUSED' | 'UNAVAILABLE' | 'OTHER';
  notes?: string;
  reason?: string;
  offline: boolean;
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
}

export type MedicationFormData = Omit<Medication, 
  'id' | 'createdAt' | 'updatedAt' | 'history' | 'interactions' | 'compliance'
>;

// ... existing code ... 