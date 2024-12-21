/**
 * @fileoverview Medication Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  form: MedicationForm;
  manufacturer?: string;
  description?: string;
  instructions?: string;
  sideEffects?: string[];
  interactions?: string[];
  contraindications?: string[];
  isControlled: boolean;
  controlledDrugClass?: string;
  requiresDoubleCheck: boolean;
  stockLevel: number;
  minimumStockLevel: number;
  reorderLevel: number;
  unit: string;
  barcode: string;
  barcodeFormat: BarcodeFormat;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationStock {
  id: string;
  medicationId: string;
  batchNumber: string;
  lotNumber?: string;
  quantity: number;
  expiryDate: Date;
  receivedDate: Date;
  supplierName: string;
  supplierReference?: string;
  location?: string;
  cost?: number;
  barcode: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationSchedule {
  id: string;
  residentId: string;
  medicationId: string;
  prescriberId: string;
  startDate: Date;
  endDate?: Date;
  frequency: string;
  times: string[];
  dosage: string;
  route: MedicationRoute;
  instructions?: string;
  reason?: string;
  isPRN: boolean;
  maxDailyDoses?: number;
  minimumGapHours?: number;
  status: MedicationScheduleStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationAdministration {
  id: string;
  scheduleId: string;
  medicationId: string;
  residentId: string;
  administeredById: string;
  witnessId?: string;
  scheduledTime: Date;
  administeredTime: Date;
  status: AdministrationStatus;
  dosage: string;
  batchNumber?: string;
  reason?: string;
  notes?: string;
  signature?: string;
  photoVerification?: string;
  barcodeScanned: boolean;
  scannedBarcode?: string;
  verificationStatus: VerificationStatus;
  verificationMethod: VerificationMethod[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicationAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  medicationId?: string;
  residentId?: string;
  message: string;
  status: AlertStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum MedicationForm {
  TABLET = 'TABLET',
  CAPSULE = 'CAPSULE',
  LIQUID = 'LIQUID',
  INJECTION = 'INJECTION',
  INHALER = 'INHALER',
  CREAM = 'CREAM',
  PATCH = 'PATCH',
  DROPS = 'DROPS',
  SUPPOSITORY = 'SUPPOSITORY',
  OTHER = 'OTHER'
}

export enum MedicationRoute {
  ORAL = 'ORAL',
  SUBLINGUAL = 'SUBLINGUAL',
  TOPICAL = 'TOPICAL',
  SUBCUTANEOUS = 'SUBCUTANEOUS',
  INTRAMUSCULAR = 'INTRAMUSCULAR',
  INTRAVENOUS = 'INTRAVENOUS',
  INHALED = 'INHALED',
  NASAL = 'NASAL',
  RECTAL = 'RECTAL',
  OTHER = 'OTHER'
}

export enum MedicationScheduleStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DISCONTINUED = 'DISCONTINUED',
  ON_HOLD = 'ON_HOLD',
  PENDING = 'PENDING'
}

export enum AdministrationStatus {
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
  REFUSED = 'REFUSED',
  UNAVAILABLE = 'UNAVAILABLE',
  WITHHELD = 'WITHHELD'
}

export enum AlertType {
  STOCK_LOW = 'STOCK_LOW',
  EXPIRING_SOON = 'EXPIRING_SOON',
  MISSED_DOSE = 'MISSED_DOSE',
  INTERACTION = 'INTERACTION',
  ALLERGY = 'ALLERGY',
  OVERDUE = 'OVERDUE',
  OTHER = 'OTHER'
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
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED'
}

export interface MedicationStatistics {
  scheduledToday: number;
  pendingCount: number;
  completedToday: number;
  stockAlerts: number;
  missedDoses: number;
  refusals: number;
  prnAdministrations: number;
  controlledDrugChecks: number;
}

export interface RecentActivity {
  id: string;
  type: ActivityType;
  description: string;
  user: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export enum ActivityType {
  ADMINISTRATION = 'ADMINISTRATION',
  STOCK_UPDATE = 'STOCK_UPDATE',
  PRESCRIPTION_UPDATE = 'PRESCRIPTION_UPDATE',
  ALERT_GENERATED = 'ALERT_GENERATED',
  ALERT_RESOLVED = 'ALERT_RESOLVED'
}

export enum BarcodeFormat {
  EAN13 = 'EAN13',
  CODE128 = 'CODE128',
  QR = 'QR',
  DATAMATRIX = 'DATAMATRIX'
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  OVERRIDE = 'OVERRIDE'
}

export enum VerificationMethod {
  BARCODE = 'BARCODE',
  PHOTO = 'PHOTO',
  WITNESS = 'WITNESS',
  MANUAL = 'MANUAL'
}

export interface BarcodeVerification {
  id: string;
  administrationId: string;
  scannedBarcode: string;
  expectedBarcode: string;
  verified: boolean;
  verifiedAt: Date;
  verifiedBy: string;
  overridden: boolean;
  overrideReason?: string;
  overriddenBy?: string;
  createdAt: Date;
}

export interface VerificationError {
  code: string;
  message: string;
  type: VerificationErrorType;
  details?: Record<string, any>;
}

export enum VerificationErrorType {
  BARCODE_MISMATCH = 'BARCODE_MISMATCH',
  INVALID_BARCODE = 'INVALID_BARCODE',
  EXPIRED_MEDICATION = 'EXPIRED_MEDICATION',
  WRONG_RESIDENT = 'WRONG_RESIDENT',
  WRONG_TIME = 'WRONG_TIME',
  SYSTEM_ERROR = 'SYSTEM_ERROR'
}

export * from './medication-consent';
export * from './medication-verification';


