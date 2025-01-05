/**
 * @fileoverview Accounting Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Type definitions for the accounting module
 */

import { z } from 'zod';

// Account Types
export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export enum AccountCategory {
  // Asset Categories
  CURRENT_ASSET = 'CURRENT_ASSET',
  FIXED_ASSET = 'FIXED_ASSET',
  INTANGIBLE_ASSET = 'INTANGIBLE_ASSET',
  
  // Liability Categories
  CURRENT_LIABILITY = 'CURRENT_LIABILITY',
  LONG_TERM_LIABILITY = 'LONG_TERM_LIABILITY',
  
  // Equity Categories
  CAPITAL = 'CAPITAL',
  RETAINED_EARNINGS = 'RETAINED_EARNINGS',
  
  // Revenue Categories
  OPERATING_REVENUE = 'OPERATING_REVENUE',
  OTHER_REVENUE = 'OTHER_REVENUE',
  
  // Expense Categories
  OPERATING_EXPENSE = 'OPERATING_EXPENSE',
  ADMINISTRATIVE_EXPENSE = 'ADMINISTRATIVE_EXPENSE',
  FINANCIAL_EXPENSE = 'FINANCIAL_EXPENSE'
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  category: AccountCategory;
  description?: string;
  parentId?: string;
  isActive: boolean;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

// Cost Center Types
export interface CostCenter {
  id: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  budget?: number;
  manager?: string;
  createdAt: Date;
  updatedAt: Date;
  organizationId: string;
}

// Journal Entry Types
export enum JournalEntryStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  VOIDED = 'VOIDED'
}

export interface JournalEntryLine {
  id: string;
  accountId: string;
  description?: string;
  debit: number;
  credit: number;
  costCenterId?: string;
}

export interface JournalEntry {
  id: string;
  date: Date;
  reference?: string;
  description: string;
  status: JournalEntryStatus;
  lines: JournalEntryLine[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  postedAt?: Date;
  postedBy?: string;
  voidedAt?: Date;
  voidedBy?: string;
  organizationId: string;
}

// Financial Statement Types
export interface FinancialStatement {
  id: string;
  type: 'BALANCE_SHEET' | 'INCOME_STATEMENT' | 'CASH_FLOW' | 'TRIAL_BALANCE';
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  createdBy: string;
  status: 'DRAFT' | 'FINAL';
  data: any; // Specific to each statement type
  organizationId: string;
}

// Tax Types
export interface VATReturn {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  vatDueSales: number;
  vatDueAcquisitions: number;
  totalVatDue: number;
  vatReclaimedCurrPeriod: number;
  netVatDue: number;
  totalValueSalesExVAT: number;
  totalValuePurchasesExVAT: number;
  totalValueGoodsSuppliedExVAT: number;
  totalAcquisitionsExVAT: number;
  submittedAt?: Date;
  submittedBy?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  organizationId: string;
}

// Audit Types
export interface AuditLog {
  id: string;
  entityType: 'ACCOUNT' | 'COST_CENTER' | 'JOURNAL_ENTRY' | 'VAT_RETURN';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW';
  userId: string;
  timestamp: Date;
  details: any;
  organizationId: string;
}

// Validation Schemas
export const accountSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  type: z.nativeEnum(AccountType),
  category: z.nativeEnum(AccountCategory),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean()
});

export const costCenterSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isActive: z.boolean(),
  budget: z.number().optional(),
  manager: z.string().optional()
});

export const journalEntryLineSchema = z.object({
  accountId: z.string().min(1),
  description: z.string().optional(),
  debit: z.number().min(0),
  credit: z.number().min(0),
  costCenterId: z.string().optional()
});

export const journalEntrySchema = z.object({
  date: z.date(),
  reference: z.string().optional(),
  description: z.string(),
  status: z.nativeEnum(JournalEntryStatus),
  lines: z.array(journalEntryLineSchema)
    .min(2, 'At least two entries required')
    .refine(
      (lines) => {
        const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);
        return Math.abs(totalDebit - totalCredit) < 0.01;
      },
      { message: 'Debits must equal credits' }
    )
});

export const vatReturnSchema = z.object({
  periodStart: z.date(),
  periodEnd: z.date(),
  vatDueSales: z.number().min(0),
  vatDueAcquisitions: z.number().min(0),
  totalVatDue: z.number(),
  vatReclaimedCurrPeriod: z.number().min(0),
  netVatDue: z.number(),
  totalValueSalesExVAT: z.number().min(0),
  totalValuePurchasesExVAT: z.number().min(0),
  totalValueGoodsSuppliedExVAT: z.number().min(0),
  totalAcquisitionsExVAT: z.number().min(0)
}); 