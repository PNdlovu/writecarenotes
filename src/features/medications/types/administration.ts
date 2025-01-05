/**
 * @writecarenotes.com
 * @fileoverview Medication Administration Types
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for medication administration, including rounds,
 * records, and related entities.
 */

export type MedicationRoundType = 
  | 'MORNING'
  | 'NOON'
  | 'AFTERNOON'
  | 'EVENING'
  | 'NIGHT'
  | 'PRN';

export type AdministrationStatus =
  | 'ADMINISTERED'
  | 'REFUSED'
  | 'WITHHELD'
  | 'UNAVAILABLE'
  | 'ERROR'
  | 'NOT_REQUIRED';

export type RoundStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'ERROR';

export interface MedicationRound {
  id: string;
  careHomeId: string;
  roundType: MedicationRoundType;
  staffId: string;
  status: RoundStatus;
  startTime: Date;
  endTime?: Date;
  requirements: {
    controlledDrugs: any;
    covertMeds: any;
    documentation: any;
    guidelines: any;
    standards: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AdministrationRecord {
  id: string;
  roundId: string;
  residentId: string;
  medicationId: string;
  status: AdministrationStatus;
  notes?: string;
  administeredAt: Date;
  witness?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PRNRecord extends AdministrationRecord {
  reason: string;
  effectiveness?: {
    checked: boolean;
    effective: boolean;
    notes: string;
    checkedAt: Date;
    checkedBy: string;
  };
}

export interface StockCheck {
  medicationId: string;
  currentQuantity: number;
  reorderLevel: number;
  expiryDate: Date;
  needsReorder: boolean;
  nearingExpiry: boolean;
}

export interface MedicationError {
  id: string;
  roundId: string;
  residentId: string;
  medicationId: string;
  errorType: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionTaken: string;
  reportedBy: string;
  reportedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  status: 'REPORTED' | 'UNDER_REVIEW' | 'RESOLVED';
}

export interface ResidentMedication {
  id: string;
  residentId: string;
  medicationId: string;
  prescription: {
    dose: string;
    frequency: string;
    route: string;
    startDate: Date;
    endDate?: Date;
    instructions?: string;
  };
  requirements: {
    controlledDrug: boolean;
    covertAdmin: boolean;
    crushable: boolean;
    witness: boolean;
  };
  schedule: {
    morning?: boolean;
    noon?: boolean;
    afternoon?: boolean;
    evening?: boolean;
    night?: boolean;
    prn?: boolean;
    specific?: string[];
  };
}

export interface AdministrationRequirements {
  controlledDrugs: {
    witness: boolean;
    register: boolean;
    storage: string;
  };
  covertMeds: {
    assessment: boolean;
    documentation: string[];
  };
  documentation: {
    mar: string[];
    controlledDrugs: string[];
    carePlans: string[];
  };
  guidelines: {
    medicationManagement: string;
    controlledDrugs: string;
    covertAdmin: string;
    selfAdmin: string;
  };
  standards: {
    fundamental: string[];
    medication: string[];
  };
} 