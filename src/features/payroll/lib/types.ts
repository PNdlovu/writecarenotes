import { Employee } from '../hr/types';
import { TimeEntry } from '../timesheet/types';

export interface PayrollPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  status: PayrollStatus;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  employeeCount: number;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  processedAt?: Date;
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  READY_FOR_REVIEW = 'READY_FOR_REVIEW',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  FAILED = 'FAILED'
}

export interface PayrollEntry {
  id: string;
  periodId: string;
  employeeId: string;
  regularHours: number;
  overtimeHours: number;
  holidayHours: number;
  sickHours: number;
  grossPay: number;
  deductions: PayrollDeduction[];
  netPay: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
}

export interface PayrollDeduction {
  type: DeductionType;
  amount: number;
  description: string;
}

export enum DeductionType {
  TAX = 'TAX',
  NATIONAL_INSURANCE = 'NATIONAL_INSURANCE',
  PENSION = 'PENSION',
  STUDENT_LOAN = 'STUDENT_LOAN',
  OTHER = 'OTHER'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  CASH = 'CASH'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface PayrollSettings {
  payPeriodType: PayPeriodType;
  payDay: number; // Day of month or week for payment
  overtimeRate: number;
  holidayRate: number;
  sickPayRate: number;
  taxYear: string;
  hmrcSettings: HMRCPayrollSettings;
  autoApprovalThreshold?: number;
}

export enum PayPeriodType {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY'
}

export interface HMRCPayrollSettings {
  employerReference: string;
  taxOfficeNumber: string;
  taxOfficeReference: string;
  accountingOfficeReference: string;
  sendRealTimeInformation: boolean;
}

export interface PayrollReport {
  id: string;
  periodId: string;
  type: PayrollReportType;
  format: ReportFormat;
  data: any;
  generatedAt: Date;
}

export enum PayrollReportType {
  PAYSLIPS = 'PAYSLIPS',
  SUMMARY = 'SUMMARY',
  TAX = 'TAX',
  NATIONAL_INSURANCE = 'NATIONAL_INSURANCE',
  PENSION = 'PENSION',
  CUSTOM = 'CUSTOM'
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  EXCEL = 'EXCEL',
  RTI = 'RTI'
}

export interface PayrollCalculation {
  calculateGrossPay(timeEntries: TimeEntry[], rates: EmployeeRates): number;
  calculateDeductions(grossPay: number, employee: Employee): Promise<PayrollDeduction[]>;
  calculateNetPay(grossPay: number, deductions: PayrollDeduction[]): number;
}

export interface EmployeeRates {
  hourlyRate: number;
  overtimeRate?: number;
  holidayRate?: number;
  sickPayRate?: number;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalGross: number;
  totalNet: number;
  totalTax: number;
  totalNI: number;
  transactionCount: number;
  categories: {
    salary: number;
    bonus: number;
    tax: number;
    ni: number;
  };
}

export enum NICategory {
  A = 'A', // Standard rate
  B = 'B', // Married women's reduced rate
  C = 'C', // Pension age
  H = 'H', // Apprentice under 25
  J = 'J', // Deferred rate
  M = 'M', // Under 21
  Z = 'Z'  // Deferred rate under 21
}

export enum SyncStatus {
  PENDING = 'PENDING',
  SYNCED = 'SYNCED',
  FAILED = 'FAILED'
}

export enum PayrollChangeType {
  PAYMENT = 'PAYMENT',
  DEDUCTION = 'DEDUCTION',
  ADJUSTMENT = 'ADJUSTMENT',
  COMMENT = 'COMMENT',
  NOTE = 'NOTE'
}

export interface PayrollChange {
  entityId: string;
  type: PayrollChangeType;
  method: 'POST' | 'PUT' | 'DELETE';
  data: any;
  timestamp?: number;
  tenantId?: string;
  retryCount?: number;
  status?: SyncStatus;
  error?: string;
}

export interface PayrollData {
  id: string;
  lastModified: number;
  [key: string]: any;
}

export interface TaxBand {
  min: number;
  max: number;
  rate: number;
}

export enum TaxYear {
  Y2023_2024 = '2023-2024',
  Y2024_2025 = '2024-2025'
}

export enum Region {
  ENGLAND = 'ENGLAND',
  SCOTLAND = 'SCOTLAND',
  WALES = 'WALES',
  NORTHERN_IRELAND = 'NORTHERN_IRELAND',
  IRELAND = 'IRELAND'
}
