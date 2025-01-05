/**
 * @writecarenotes.com
 * @fileoverview Medication Compliance Types
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for medication-specific compliance checks and audits.
 */

import type { ComplianceAudit, ComplianceFindings } from '@/features/compliance/types/compliance.types';

export interface MedicationComplianceCheck {
  controlledDrugs: ControlledDrugsCompliance;
  storage: StorageCompliance;
  administration: AdministrationCompliance;
  documentation: DocumentationCompliance;
}

export interface MedicationComplianceAudit extends ComplianceAudit {
  medicationChecks: MedicationComplianceCheck;
  stockAudit: {
    completed: boolean;
    date: Date;
    discrepancies: number;
  };
  controlledDrugsAudit: {
    completed: boolean;
    date: Date;
    discrepancies: number;
  };
}

export interface ControlledDrugsCompliance {
  registerAccuracy: boolean;
  witnessRequirements: boolean;
  storageRequirements: boolean;
  balanceChecks: boolean;
  disposalRecords: boolean;
  findings: ComplianceFindings[];
}

export interface StorageCompliance {
  temperature: boolean;
  security: boolean;
  segregation: boolean;
  stockRotation: boolean;
  expiryChecks: boolean;
  findings: ComplianceFindings[];
}

export interface AdministrationCompliance {
  marAccuracy: boolean;
  timingAdherence: boolean;
  signatureCompleteness: boolean;
  prnProtocols: boolean;
  covertAdministration: boolean;
  findings: ComplianceFindings[];
}

export interface DocumentationCompliance {
  prescriptionValidity: boolean;
  carePlanIntegration: boolean;
  allergiesDocumented: boolean;
  interactionsChecked: boolean;
  findings: ComplianceFindings[];
}


