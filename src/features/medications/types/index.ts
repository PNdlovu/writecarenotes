/**
 * @fileoverview Medication Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

export interface Medication {
  id: string;
  careHomeId: string;
  name: string;
  type: 'REGULAR' | 'PRN' | 'CONTROLLED' | 'END_OF_LIFE';
  dosage: string;
  route: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  instructions?: string;
  sideEffects?: string[];
  contraindications?: string[];
  reviews?: MedicationReview[];
  administrations?: Administration[];
  status: 'ACTIVE' | 'DISCONTINUED' | 'ON_HOLD';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Administration {
  id: string;
  medicationId: string;
  careHomeId: string;
  residentId: string;
  scheduledTime: string;
  administeredTime?: string;
  status: 'SCHEDULED' | 'GIVEN' | 'MISSED' | 'REFUSED' | 'WITHHELD';
  dose: string;
  route: string;
  administeredBy?: string;
  witnessedBy?: string;
  reason?: string;
  notes?: string;
  effectiveness?: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'NOT_EFFECTIVE';
  painScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationReview {
  id: string;
  medicationId: string;
  careHomeId: string;
  reviewType: 'REGULAR' | 'EMERGENCY' | 'ADMISSION';
  reviewDate: string;
  effectiveness: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'NOT_EFFECTIVE';
  sideEffects?: string;
  recommendations: string;
  nextReviewDate: string;
  notes?: string;
  reviewedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationSchedule {
  id: string;
  medicationId: string;
  careHomeId: string;
  residentId: string;
  type: 'REGULAR' | 'PRN' | 'CONTROLLED';
  time: string;
  status: 'SCHEDULED' | 'GIVEN' | 'MISSED' | 'REFUSED';
  givenBy?: string;
  givenAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationStock {
  id: string;
  medicationId: string;
  careHomeId: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  supplier: string;
  receivedBy: string;
  receivedAt: string;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
}

export interface MedicationDemand {
  id: string;
  medicationId: string;
  careHomeId: string;
  quantity: number;
  unit: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  requestedBy: string;
  requestedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationInteraction {
  id: string;
  medicationId: string;
  interactingMedicationId: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  recommendation: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationAllergy {
  id: string;
  residentId: string;
  medicationId: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  symptoms: string[];
  notes?: string;
  reportedBy: string;
  reportedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationError {
  id: string;
  medicationId: string;
  careHomeId: string;
  residentId: string;
  type: 'WRONG_MEDICATION' | 'WRONG_DOSE' | 'WRONG_TIME' | 'WRONG_RESIDENT' | 'MISSED_DOSE' | 'OTHER';
  description: string;
  impact: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE';
  actionTaken: string;
  reportedBy: string;
  reportedAt: string;
  witnessedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: string;
  data: any;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
  retryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  details: any;
  performedBy: string;
  performedAt: string;
  careHomeId: string;
  metadata?: Record<string, any>;
}

export * from './medication-consent';
export * from './medication-verification';


