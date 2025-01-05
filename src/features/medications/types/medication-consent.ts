import { Verification } from './verification';

export type ConsentStatus = 
  | 'PENDING'      // Awaiting parent/guardian response
  | 'APPROVED'     // Consent given
  | 'DENIED'       // Consent denied
  | 'EXPIRED'      // Consent has expired
  | 'WITHDRAWN';   // Consent was withdrawn

export type ConsentType =
  | 'REGULAR_MEDICATION'      // Regular prescribed medications
  | 'PRN_MEDICATION'         // As needed medications
  | 'EMERGENCY_MEDICATION'   // Emergency medications (e.g., EpiPen)
  | 'CONTROLLED_DRUG'       // Controlled substances
  | 'OVER_THE_COUNTER';     // OTC medications

export interface ParentalConsent {
  id: string;
  residentId: string;
  medicationId: string;
  consentType: ConsentType;
  status: ConsentStatus;
  // Family Portal Integration
  familyPortalRequestId: string;
  familyPortalStatus: 'PENDING_REVIEW' | 'REVIEWED' | 'SIGNED' | 'REJECTED';
  // Parent/Guardian who provided consent
  consentGivenBy: {
    id: string;
    name: string;
    relationship: string;
    contactNumber: string;
    email?: string;
    familyPortalUserId: string;
  };
  // Dates
  requestedAt: string;
  respondedAt?: string;
  expiresAt?: string;
  // Verification
  verification?: Verification;
  // Additional details
  conditions?: string[];
  notes?: string;
  // Emergency contact if different from consenting guardian
  emergencyContact?: {
    name: string;
    relationship: string;
    contactNumber: string;
  };
  // Audit trail
  history: Array<{
    timestamp: string;
    action: 'REQUESTED' | 'APPROVED' | 'DENIED' | 'EXPIRED' | 'WITHDRAWN' | 'UPDATED' | 'VIEWED_IN_PORTAL';
    by: {
      id: string;
      name: string;
      role: string;
      portalUserId?: string;
    };
    notes?: string;
    portalSessionId?: string;
  }>;
  // Offline sync
  offlineSync?: {
    status: 'PENDING' | 'SYNCED' | 'FAILED';
    lastSyncAttempt?: string;
    syncError?: string;
  };
}

export interface ConsentRequest {
  residentId: string;
  medicationId: string;
  consentType: ConsentType;
  requestedBy: {
    id: string;
    name: string;
    role: string;
  };
  urgency: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  expiryDate?: string;
  additionalInformation?: string;
  notificationPreference?: 'EMAIL' | 'SMS' | 'BOTH';
  // Family Portal specific fields
  familyPortalNotification: {
    sendEmail: boolean;
    sendPushNotification: boolean;
    reminderFrequency?: 'DAILY' | 'WEEKLY' | 'NONE';
    customMessage?: string;
  };
}

export interface ConsentValidationError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}


