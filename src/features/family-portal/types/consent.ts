export interface ParentalConsent {
  id: string;
  residentId: string;
  medicationId: string;
  status: ConsentStatus;
  type: ConsentType;
  requestedBy: string;
  requestedAt: Date;
  respondedBy?: string;
  respondedAt?: Date;
  signature?: string;
  conditions?: string[];
}

export type ConsentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
export type ConsentType = 'MEDICATION' | 'TREATMENT' | 'ACTIVITY';

export interface ConsentRequest {
  id: string;
  residentId: string;
  medicationId: string;
  type: ConsentType;
  details: string;
  requestedBy: string;
  requestedAt: Date;
  expiresAt?: Date;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}


