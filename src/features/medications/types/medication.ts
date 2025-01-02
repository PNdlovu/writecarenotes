/**
 * @writecarenotes.com
 * @fileoverview Medication Type Definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Core type definitions for medications, prescriptions, and related entities.
 */

import type { ComplianceRequirement } from './compliance';

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  form: string;
  strength: string;
  route: string;
  controlled: boolean;
  createdAt: string;
  updatedAt: string;
  prescription?: Prescription;
  instructions?: MedicationInstructions;
  history?: MedicationHistoryEntry[];
  interactions?: MedicationInteraction[];
  compliance?: ComplianceRequirement;
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
}

export interface MedicationInstructions {
  administration: string;
  special?: string;
  storage?: string;
  warnings?: string[];
  contraindications?: string[];
  sideEffects?: string[];
}

export interface MedicationHistoryEntry {
  id: string;
  medicationId: string;
  date: string;
  type: 'PRESCRIBED' | 'MODIFIED' | 'DISCONTINUED' | 'RESUMED';
  details: string;
  staffId: string;
  notes?: string;
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