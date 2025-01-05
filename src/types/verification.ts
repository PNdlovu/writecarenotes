export interface BarcodeData {
  type: 'MEDICATION' | 'RESIDENT' | 'STAFF';
  id: string;
  code: string;
  name: string;
}

export interface PINVerification {
  staffId: string;
  pin: string;
  type: 'WITNESS' | 'ADMINISTRATION' | 'CONTROLLED_DRUG';
}

export interface VerificationResult {
  success: boolean;
  message?: string;
  data?: {
    staffId?: string;
    staffName?: string;
    medicationId?: string;
    medicationName?: string;
    residentId?: string;
    residentName?: string;
  };
}


