import { Region } from '@/lib/types';

export interface Invoice {
  id: string;
  residentId: string;
  number: string;
  date: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  paymentTerms: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  date: Date;
  method: PaymentMethod;
  reference?: string;
  status: PaymentStatus;
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  DIRECT_DEBIT = 'DIRECT_DEBIT',
  CREDIT_CARD = 'CREDIT_CARD',
  CASH = 'CASH',
  CHEQUE = 'CHEQUE'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export enum TransactionType {
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
  JOURNAL = 'JOURNAL',
  ADJUSTMENT = 'ADJUSTMENT'
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  POSTED = 'POSTED',
  VOIDED = 'VOIDED'
}

export enum ReportType {
  PROFIT_LOSS = 'PROFIT_LOSS',
  BALANCE_SHEET = 'BALANCE_SHEET',
  CASH_FLOW = 'CASH_FLOW',
  AGED_RECEIVABLES = 'AGED_RECEIVABLES',
  AGED_PAYABLES = 'AGED_PAYABLES',
  TAX = 'TAX',
  COMPLIANCE = 'COMPLIANCE'
}

export interface Account {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  parentId?: string;
  balance: number;
  region: Region;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  tenantId: string;
  date: Date;
  type: TransactionType;
  status: TransactionStatus;
  reference?: string;
  description: string;
  amount: number;
  currency: string;
  exchangeRate?: number;
  entries: TransactionEntry[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionEntry {
  id: string;
  transactionId: string;
  accountId: string;
  description?: string;
  debit: number;
  credit: number;
  metadata?: Record<string, any>;
}

export interface FinancialReport {
  id: string;
  tenantId: string;
  type: ReportType;
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  data: any;
  metadata?: Record<string, any>;
  generatedAt: Date;
}

export interface TaxRegistration {
  id: string;
  tenantId: string;
  region: Region;
  registrationNumber: string;
  taxAuthority: string;
  validFrom: Date;
  validTo?: Date;
  metadata?: Record<string, any>;
}

export interface TaxRate {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  rate: number;
  validFrom: Date;
  validTo?: Date;
  metadata?: Record<string, any>;
}

export interface Budget {
  id: string;
  tenantId: string;
  accountId: string;
  fiscalYear: number;
  amount: number;
  metadata?: Record<string, any>;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  changes: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: Date;
}


