import { Region } from '@/types/region';

export type CareHomeType = 'CHILDRENS' | 'RESIDENTIAL' | 'NURSING';

export type ComplianceAction = 
  | 'INDIVIDUAL_HEALTHCARE_PLAN_APPROVED'
  | 'GP_APPROVAL_RECEIVED'
  | 'RISK_ASSESSMENT_COMPLETED'
  | 'CAPACITY_ASSESSMENT_COMPLETED'
  | 'NURSING_ASSESSMENT_COMPLETED'
  | 'PHARMACIST_REVIEW_COMPLETED'
  | 'WITNESS_VERIFICATION_COMPLETED';

export interface ComplianceRecord {
  id: string;
  careHomeType: CareHomeType;
  action: ComplianceAction;
  completedAt: string;
  completedBy: string;
  documentReference?: string;
  notes?: string;
  expiresAt?: string;
}

export interface ComplianceRequirement {
  id: string;
  careHomeType: CareHomeType;
  requiredActions: ComplianceAction[];
  frequency?: number; // in days, if periodic checks are needed
  description: string;
  isActive: boolean;
}

export interface MedicationCompliance {
  region: Region;
  careHomeType: CareHomeType;
  requirements: {
    // CQC (England)
    requiresDoubleSignature: boolean;
    requiresControlledDrugRegister: boolean;
    // Ofsted (England - Children's Homes)
    requiresParentalConsent?: boolean;
    requiresOfstedNotification?: boolean;
    requiresIndividualHealthcarePlan?: boolean;
    // CIW (Wales)
    requiresWelshTranslation?: boolean;
    // Care Inspectorate (Scotland)
    requiresNHSScotlandApproval?: boolean;
    // RQIA (Northern Ireland)
    requiresControlledDrugWitness?: boolean;
    // HIQA (Ireland)
    requiresMedicationAuditTrail?: boolean;
    // Offline Support
    offlineEnabled: boolean;
    lastSyncTimestamp: string;
  };
  auditTrail: {
    lastVerifiedBy: string;
    lastVerifiedAt: string;
    verificationMethod: 'PIN' | 'BARCODE';
    parentalConsentDate?: string;
    parentalConsentBy?: string;
    ofstedNotificationDate?: string;
    healthcarePlanReviewDate?: string;
    offlineSyncStatus: 'SYNCED' | 'PENDING' | 'FAILED';
  };
}

export interface RegionalMedicationSettings {
  region: Region;
  careHomeType: CareHomeType;
  maxDosageUnits: Record<string, number>;
  restrictedMedications: string[];
  requiresPharmacistApproval: boolean;
  stockControlEnabled: boolean;
  // Offline settings
  offlineEnabled: boolean;
  offlineSyncInterval: number; // in minutes
  maxOfflinePeriod: number; // in hours
  // Regional specific settings
  requiresParentalConsent: boolean;
  requiresOfstedNotification: boolean;
  requiresIndividualHealthcarePlan: boolean;
  requiresControlledDrugRegister: boolean;
  requiresDoubleSignature: boolean;
  requiresWelshTranslation: boolean;
  requiresNHSScotlandApproval: boolean;
  requiresControlledDrugWitness: boolean;
  requiresMedicationAuditTrail: boolean;
}


