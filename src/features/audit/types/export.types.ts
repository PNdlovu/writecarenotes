/**
 * @fileoverview Export types for audit module
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { AuditLogEntry } from './audit.types';

export type ExportFormat = 'CSV' | 'JSON' | 'PDF';

export type CareHomeRegion = 
  | 'ENGLAND'  // CQC
  | 'WALES'    // CIW
  | 'SCOTLAND' // Care Inspectorate
  | 'NORTHERN_IRELAND' // RQIA
  | 'IRELAND'; // HIQA

export type CareHomeType =
  | 'ELDERLY_RESIDENTIAL'
  | 'ELDERLY_NURSING'
  | 'DEMENTIA'
  | 'LEARNING_DISABILITIES'
  | 'PHYSICAL_DISABILITIES'
  | 'MENTAL_HEALTH'
  | 'AUTISM_SPECIFIC'
  | 'CHILDREN_RESIDENTIAL'
  | 'SUPPORTED_LIVING'
  | 'DOMICILIARY'
  | 'RESPITE'
  | 'DAY_CARE'
  | 'PALLIATIVE_CARE'
  | 'SUBSTANCE_MISUSE'
  | 'INTERMEDIATE_CARE';

export type RegulatoryBody = 
  | 'CQC'  // Care Quality Commission
  | 'CIW'  // Care Inspectorate Wales
  | 'CI'   // Care Inspectorate Scotland
  | 'RQIA' // Regulation and Quality Improvement Authority
  | 'HIQA';// Health Information and Quality Authority

export type InspectionRating =
  | 'OUTSTANDING'
  | 'GOOD'
  | 'REQUIRES_IMPROVEMENT'
  | 'INADEQUATE'
  | 'EXCELLENT' // Scotland
  | 'VERY_GOOD'
  | 'ADEQUATE'
  | 'WEAK'
  | 'UNSATISFACTORY'
  | 'COMPLIANT' // HIQA
  | 'SUBSTANTIALLY_COMPLIANT'
  | 'NOT_COMPLIANT';

export type DocumentCategory =
  | 'CARE_PLANS'
  | 'ASSESSMENTS'
  | 'MEDICATION_RECORDS'
  | 'INCIDENT_REPORTS'
  | 'STAFF_RECORDS'
  | 'TRAINING_RECORDS'
  | 'COMPLAINTS'
  | 'SAFEGUARDING'
  | 'HEALTH_SAFETY'
  | 'QUALITY_ASSURANCE'
  | 'POLICIES_PROCEDURES';

export interface ExportField {
  key: keyof AuditLogEntry;
  label: string;
  format?: (value: any) => string;
  include: boolean;
  sensitive?: boolean;
  requiredFor?: RegulatoryBody[];
  documentCategory?: DocumentCategory;
  retentionPeriod?: number; // in months
}

export interface WatermarkPattern {
  type: 'text' | 'logo';
  content: string;
  repeat?: boolean;
}

export interface BrandingOptions {
  logo?: {
    path: string;
    position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  };
  regulatoryBody?: RegulatoryBody;
  region?: CareHomeRegion;
  inspectionRating?: InspectionRating;
}

export interface WatermarkOptions {
  text?: string;
  pattern?: WatermarkPattern;
  branding?: BrandingOptions;
  opacity?: number;
  position?: 'center' | 'diagonal';
  includeRegulatorLogo?: boolean;
  includeInspectionRating?: boolean;
}

export interface SecurityOptions {
  encrypt?: boolean;
  password?: boolean;
  allowPrinting?: boolean;
  allowCopying?: boolean;
  sensitiveFieldMask?: string;
  gdprCompliant?: boolean;
  dataProtectionAct?: boolean;
  nhsDataSecurity?: boolean;
  careStandardsAct?: boolean;
  medicationRecordHandling?: boolean;
  incidentReportHandling?: boolean;
  safeguardingRequirements?: boolean;
  staffRecordsCompliance?: boolean;
}

export interface ComplianceMetadata {
  inspectionRating?: InspectionRating;
  lastInspectionDate?: Date;
  nextInspectionDue?: Date;
  registrationNumber?: string;
  registeredManager?: string;
  registeredProvider?: string;
  regulatedActivities?: string[];
  conditions?: string[];
  variations?: string[];
  notifiedEvents?: string[];
}

export interface ExportCustomization {
  title?: string;
  subtitle?: string;
  logo?: string;
  fields: ExportField[];
  includeTimestamp?: boolean;
  dateFormat?: string;
  watermark?: WatermarkOptions;
  security?: SecurityOptions;
  metadata?: {
    author?: string;
    department?: string;
    careHomeType?: CareHomeType;
    region?: CareHomeRegion;
    regulatoryBody?: RegulatoryBody;
    classification?: 'public' | 'internal' | 'confidential' | 'restricted';
    dataRetentionPeriod?: number; // in months
    documentCategory?: DocumentCategory;
    compliance?: ComplianceMetadata;
  };
  regionalSettings?: {
    language?: 'en' | 'cy' | 'gd' | 'ga'; // English, Welsh, Scottish Gaelic, Irish
    region?: CareHomeRegion;
    regulatoryBody?: RegulatoryBody;
    includeRegionalLogo?: boolean;
    localAuthority?: string;
    healthBoard?: string;
    commissioningBody?: string;
  };
}

export interface PDFOptions {
  pageSize?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  headerOnEveryPage?: boolean;
  footerOnEveryPage?: boolean;
  accessibility?: {
    tagged?: boolean;
    highContrast?: boolean;
    screenReaderOptimized?: boolean;
    textToSpeech?: boolean;
    largeText?: boolean;
  };
}

export interface CSVOptions {
  delimiter?: ',' | ';';
  includeHeaders?: boolean;
  dateFormat?: string;
  encoding?: 'utf8' | 'utf16le';
  regionalFormat?: boolean;
  includeMetadata?: boolean;
  includeComplianceData?: boolean;
}

export interface ExportOptions {
  format: ExportFormat;
  customization: ExportCustomization;
  pdfOptions?: PDFOptions;
  csvOptions?: CSVOptions;
  filename?: string;
  region?: CareHomeRegion;
  careHomeType?: CareHomeType;
  regulatoryBody?: RegulatoryBody;
  documentCategory?: DocumentCategory;
} 


