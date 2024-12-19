import { CareHomeType } from './compliance';
import { Verification } from './verification';

export type MedicationStatus = 
  | 'GIVEN' 
  | 'MISSED' 
  | 'PENDING' 
  | 'REFUSED' 
  | 'SCHEDULED'
  | 'PENDING_SYNC' // For offline mode
  | 'SYNC_FAILED';  // For offline mode

export type MedicationUnit = 'mg' | 'ml' | 'tablet' | 'capsule' | 'patch' | 'injection';

export type MedicationRoute = 
  | 'ORAL' 
  | 'TOPICAL' 
  | 'INJECTION' 
  | 'INHALED' 
  | 'SUBLINGUAL'
  | 'RECTAL'
  | 'OTHER';

export interface MedicationSchedule {
  id: string;
  times: string[];
  frequency: string;
  startDate: string;
  endDate?: string;
  asNeeded: boolean;
  instructions?: string;
}

export interface MAREntry {
  id: string;
  medicationId: string;
  residentId: string;
  scheduledTime: string;
  status: MedicationStatus;
  administeredBy?: {
    id: string;
    name: string;
    role: string;
  };
  administeredAt?: string;
  notes?: string;
  verifications: Verification[];
  offlineSync?: {
    status: 'PENDING' | 'SYNCED' | 'FAILED';
    lastSyncAttempt?: string;
    syncError?: string;
    localChanges?: {
      timestamp: string;
      changes: Partial<MAREntry>;
    }[];
  };
  compliance: {
    requiresWitness: boolean;
    requiresHealthcarePlan: boolean;
    requiresParentalConsent: boolean;
    verificationStatus: {
      witness?: boolean;
      healthcarePlan?: boolean;
      parentalConsent?: boolean;
    };
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: number;
  unit: MedicationUnit;
  route: MedicationRoute;
  schedule: MedicationSchedule;
  isControlledDrug: boolean;
  requiresWitness: boolean;
  barcode?: string;
  stockLevel?: number;
  reorderLevel?: number;
  compliance: {
    requiresWitness: boolean;
    requiresHealthcarePlan: boolean;
    requiresParentalConsent: boolean;
    careHomeTypes: CareHomeType[];
  };
}

export interface MARChart {
  residentId: string;
  medications: Medication[];
  entries: MAREntry[];
  offlineEnabled: boolean;
  lastSyncTime?: string;
}

export interface MARValidationError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}


