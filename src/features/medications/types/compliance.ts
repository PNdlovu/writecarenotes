/**
 * @writecarenotes.com
 * @fileoverview Compliance Type Definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for medication compliance and regulatory requirements.
 */

export interface ComplianceRequirement {
  id: string;
  medicationId: string;
  requiresWitness: boolean;
  requiresDoubleSignature: boolean;
  requiresStockCheck: boolean;
  requiresParentalConsent?: boolean;
  maxAdministrationWindow?: number; // minutes
  stockThresholdDays?: number;
  retentionPeriod?: number; // days
  createdAt: string;
  updatedAt: string;
}

export enum CareHomeType {
  RESIDENTIAL = 'RESIDENTIAL',
  NURSING = 'NURSING',
  DEMENTIA = 'DEMENTIA',
  LEARNING_DISABILITIES = 'LEARNING_DISABILITIES',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  CHILDRENS = 'CHILDRENS',
  SUPPORTED_LIVING = 'SUPPORTED_LIVING'
}

export interface ComplianceAlert {
  id: string;
  medicationId: string;
  type: ComplianceAlertType;
  severity: AlertSeverity;
  message: string;
  status: AlertStatus;
  createdAt: string;
  updatedAt: string;
}

export enum ComplianceAlertType {
  WITNESS_REQUIRED = 'WITNESS_REQUIRED',
  DOUBLE_SIGNATURE_REQUIRED = 'DOUBLE_SIGNATURE_REQUIRED',
  STOCK_CHECK_REQUIRED = 'STOCK_CHECK_REQUIRED',
  PARENTAL_CONSENT_REQUIRED = 'PARENTAL_CONSENT_REQUIRED',
  ADMINISTRATION_WINDOW_EXCEEDED = 'ADMINISTRATION_WINDOW_EXCEEDED',
  STOCK_THRESHOLD_BREACH = 'STOCK_THRESHOLD_BREACH'
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED'
}


