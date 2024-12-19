import { Prisma } from '@prisma/client';

// Shared types used across financial and accounting features
export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface TenantContext {
  tenantId: string;
  region: string;
  timezone: string;
}

export interface AuditMetadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface FinancialPeriod {
  start: Date;
  end: Date;
}

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'VOIDED' | 'FAILED';

export interface MonetaryAmount {
  amount: number;
  currency: string;
}

// Error types
export type FinancialErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'SYSTEM_ERROR'
  | 'SYNC_ERROR';

export class FinancialError extends Error {
  constructor(
    message: string,
    public code: FinancialErrorCode,
    public details?: unknown
  ) {
    super(message);
    this.name = 'FinancialError';
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithTenant<T> = T & { tenantId: string };
export type WithAudit<T> = T & AuditMetadata; 


