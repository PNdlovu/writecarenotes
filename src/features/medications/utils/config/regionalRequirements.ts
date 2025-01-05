/**
 * Regional Requirements Configuration for Medication Management
 * Covers all care home types across UK and Ireland regions
 */

import { Region } from '@/types/region';
import { CareHomeType } from '../types/compliance';
import { MedicationUnit } from '../types/medication';

export interface RegionalRequirement {
  // Consent & Documentation
  allowedConsentTypes: string[];
  maximumDuration: number; // in days
  requiresWitness: boolean;
  requiresHealthcarePlan: boolean;
  additionalDocumentation: string[];
  renewalPeriod: number; // in days
  
  // Medication Administration
  requiresDoubleSignature: boolean;
  requiresControlledDrugWitness: boolean;
  allowedRoutes: string[];
  allowedUnits: MedicationUnit[];
  maxDosagePerUnit: Record<MedicationUnit, number>;
  
  // Stock Control
  stockControlEnabled: boolean;
  minimumStockLevel: number;
  criticalStockLevel: number;
  
  // PRN Medications
  prnEnabled: boolean;
  prnMaxDuration: number; // in hours
  prnRequiresReason: boolean;
  
  // Notifications
  stockAlertThreshold: number;
  expiryNotificationDays: number;
  
  // Compliance
  requiresMonthlyAudit: boolean;
  requiresQuarterlyReview: boolean;
  requiresAnnualAssessment: boolean;
}

export const REGIONAL_REQUIREMENTS: Record<Region, Record<CareHomeType, RegionalRequirement>> = {
  'GB-ENG': {
    'NURSING_HOME': {
      allowedConsentTypes: ['WRITTEN', 'VERBAL_WITH_WITNESS'],
      maximumDuration: 365,
      requiresWitness: true,
      requiresHealthcarePlan: true,
      additionalDocumentation: [
        'MEDICAL_ASSESSMENT',
        'PHARMACY_REVIEW',
        'RISK_ASSESSMENT'
      ],
      renewalPeriod: 30,
      requiresDoubleSignature: true,
      requiresControlledDrugWitness: true,
      allowedRoutes: [
        'ORAL',
        'TOPICAL',
        'SUBCUTANEOUS',
        'INTRAMUSCULAR',
        'INTRAVENOUS',
        'RECTAL',
        'TRANSDERMAL'
      ],
      allowedUnits: [
        MedicationUnit.MG,
        MedicationUnit.ML,
        MedicationUnit.G,
        MedicationUnit.TABLETS
      ],
      maxDosagePerUnit: {
        [MedicationUnit.MG]: 1000,
        [MedicationUnit.ML]: 100,
        [MedicationUnit.G]: 10,
        [MedicationUnit.TABLETS]: 10
      },
      stockControlEnabled: true,
      minimumStockLevel: 7,
      criticalStockLevel: 3,
      prnEnabled: true,
      prnMaxDuration: 72,
      prnRequiresReason: true,
      stockAlertThreshold: 5,
      expiryNotificationDays: 90,
      requiresMonthlyAudit: true,
      requiresQuarterlyReview: true,
      requiresAnnualAssessment: true
    },
    'RESIDENTIAL_HOME': {
      allowedConsentTypes: ['WRITTEN', 'VERBAL_WITH_WITNESS'],
      maximumDuration: 365,
      requiresWitness: true,
      requiresHealthcarePlan: true,
      additionalDocumentation: [
        'MEDICAL_ASSESSMENT',
        'PHARMACY_REVIEW'
      ],
      renewalPeriod: 30,
      requiresDoubleSignature: true,
      requiresControlledDrugWitness: true,
      allowedRoutes: [
        'ORAL',
        'TOPICAL',
        'SUBCUTANEOUS'
      ],
      allowedUnits: [
        MedicationUnit.MG,
        MedicationUnit.ML,
        MedicationUnit.TABLETS
      ],
      maxDosagePerUnit: {
        [MedicationUnit.MG]: 1000,
        [MedicationUnit.ML]: 50,
        [MedicationUnit.G]: 5,
        [MedicationUnit.TABLETS]: 8
      },
      stockControlEnabled: true,
      minimumStockLevel: 7,
      criticalStockLevel: 3,
      prnEnabled: true,
      prnMaxDuration: 48,
      prnRequiresReason: true,
      stockAlertThreshold: 5,
      expiryNotificationDays: 90,
      requiresMonthlyAudit: true,
      requiresQuarterlyReview: true,
      requiresAnnualAssessment: true
    },
    'SUPPORTED_LIVING': {
      allowedConsentTypes: ['WRITTEN', 'VERBAL_WITH_WITNESS', 'SELF_CONSENT'],
      maximumDuration: 365,
      requiresWitness: false,
      requiresHealthcarePlan: true,
      additionalDocumentation: [
        'CAPACITY_ASSESSMENT',
        'SUPPORT_PLAN'
      ],
      renewalPeriod: 60,
      requiresDoubleSignature: false,
      requiresControlledDrugWitness: true,
      allowedRoutes: [
        'ORAL',
        'TOPICAL'
      ],
      allowedUnits: [
        MedicationUnit.MG,
        MedicationUnit.ML,
        MedicationUnit.TABLETS
      ],
      maxDosagePerUnit: {
        [MedicationUnit.MG]: 1000,
        [MedicationUnit.ML]: 30,
        [MedicationUnit.G]: 5,
        [MedicationUnit.TABLETS]: 6
      },
      stockControlEnabled: true,
      minimumStockLevel: 7,
      criticalStockLevel: 3,
      prnEnabled: true,
      prnMaxDuration: 24,
      prnRequiresReason: true,
      stockAlertThreshold: 5,
      expiryNotificationDays: 60,
      requiresMonthlyAudit: false,
      requiresQuarterlyReview: true,
      requiresAnnualAssessment: true
    }
  },
  'GB-SCT': {
    // Scotland-specific requirements
    'NURSING_HOME': {
      // Similar to England but with additional requirements
      allowedConsentTypes: ['WRITTEN', 'VERBAL_WITH_WITNESS'],
      maximumDuration: 365,
      requiresWitness: true,
      requiresHealthcarePlan: true,
      additionalDocumentation: [
        'MEDICAL_ASSESSMENT',
        'PHARMACY_REVIEW',
        'RISK_ASSESSMENT',
        'CARE_INSPECTORATE_FORM'
      ],
      renewalPeriod: 30,
      requiresDoubleSignature: true,
      requiresControlledDrugWitness: true,
      allowedRoutes: [
        'ORAL',
        'TOPICAL',
        'SUBCUTANEOUS',
        'INTRAMUSCULAR',
        'INTRAVENOUS',
        'RECTAL',
        'TRANSDERMAL'
      ],
      allowedUnits: [
        MedicationUnit.MG,
        MedicationUnit.ML,
        MedicationUnit.G,
        MedicationUnit.TABLETS
      ],
      maxDosagePerUnit: {
        [MedicationUnit.MG]: 1000,
        [MedicationUnit.ML]: 100,
        [MedicationUnit.G]: 10,
        [MedicationUnit.TABLETS]: 10
      },
      stockControlEnabled: true,
      minimumStockLevel: 7,
      criticalStockLevel: 3,
      prnEnabled: true,
      prnMaxDuration: 72,
      prnRequiresReason: true,
      stockAlertThreshold: 5,
      expiryNotificationDays: 90,
      requiresMonthlyAudit: true,
      requiresQuarterlyReview: true,
      requiresAnnualAssessment: true
    },
    // Add other Scottish care home types...
  },
  'GB-WLS': {
    // Wales-specific requirements...
  },
  'GB-NIR': {
    // Northern Ireland-specific requirements...
  },
  'IE': {
    // Ireland-specific requirements...
  }
};


