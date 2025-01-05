import { CareHomeType } from './compliance';

export type VerificationType = 
  | 'ADMINISTRATION' 
  | 'WITNESS' 
  | 'DISPOSAL' 
  | 'PARENTAL_CONSENT' 
  | 'HEALTHCARE_PLAN';

export type VerificationMethod = 'PIN' | 'BARCODE' | 'SIGNATURE';

export interface BaseVerification {
  id: string;
  type: VerificationType;
  method: VerificationMethod;
  verifiedAt: string;
  verifiedBy: {
    id: string;
    name: string;
    role: string;
  };
  offlineSync?: {
    status: 'PENDING' | 'SYNCED' | 'FAILED';
    lastSyncAttempt?: string;
    syncError?: string;
  };
}

export interface PINVerification extends BaseVerification {
  method: 'PIN';
  pin: string;
  staffId: string;
}

export interface BarcodeVerification extends BaseVerification {
  method: 'BARCODE';
  medicationId: string;
  barcode: string;
}

export interface SignatureVerification extends BaseVerification {
  method: 'SIGNATURE';
  signatureData: string;
  relationship?: string; // For parental consent
}

export interface VerificationRequirement {
  type: VerificationType;
  requiredMethods: VerificationMethod[];
  requiresWitness: boolean;
  requiresHealthcarePlan: boolean;
  requiresParentalConsent: boolean;
  offlineEnabled: boolean;
  careHomeTypes: CareHomeType[];
}

export type Verification = PINVerification | BarcodeVerification | SignatureVerification;

export interface VerificationResponse {
  success: boolean;
  verification?: Verification;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  offlineStatus?: {
    pending: boolean;
    lastSyncAttempt?: string;
  };
}


