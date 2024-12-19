export interface AccountingProvider {
  id: string;
  name: string;
  type: AccountingProviderType;
  isActive: boolean;
  config: Record<string, any>;
  lastSyncedAt?: Date;
}

export enum AccountingProviderType {
  XERO = 'XERO',
  QUICKBOOKS = 'QUICKBOOKS',
  SAGE = 'SAGE',
  HMRC = 'HMRC',
  MYOB = 'MYOB',
  KASHFLOW = 'KASHFLOW',
  FREEAGENT = 'FREEAGENT',
  CUSTOM = 'CUSTOM'
}

export interface AccountingTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  reference: string;
  status: TransactionStatus;
  providerId?: string;
  providerReference?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
  TAX = 'TAX'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  VOIDED = 'VOIDED'
}

export interface TaxReport {
  id: string;
  period: string;
  startDate: Date;
  endDate: Date;
  totalIncome: number;
  totalExpenses: number;
  vatAmount?: number;
  taxableAmount: number;
  status: TaxReportStatus;
  submittedAt?: Date;
  hmrcReference?: string;
  metadata?: Record<string, any>;
}

export enum TaxReportStatus {
  DRAFT = 'DRAFT',
  READY = 'READY',
  SUBMITTED = 'SUBMITTED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface AccountingSync {
  id: string;
  providerId: string;
  startDate: Date;
  endDate: Date;
  status: SyncStatus;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  errors?: string[];
  metadata?: Record<string, any>;
}

export enum SyncStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface HMRCConfig {
  clientId: string;
  clientSecret: string;
  vatNumber?: string;
  employerReference?: string;
  environment: 'sandbox' | 'production';
  scopes: string[];
  callbackUrl: string;
}
