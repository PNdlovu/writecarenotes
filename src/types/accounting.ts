/**
 * @fileoverview Accounting Type Definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod';

export type ImportFormat = 'CSV' | 'OFX' | 'QIF';

export interface BankTransaction {
  date: Date;
  description: string;
  amount: number;
  reference: string;
  type: string;
  journalEntryId?: string;
  reconciliationId?: string;
  status?: 'MATCHED' | 'UNMATCHED';
}

export const bankTransactionSchema = z.object({
  date: z.date(),
  description: z.string(),
  amount: z.number(),
  reference: z.string(),
  type: z.string(),
  journalEntryId: z.string().optional(),
  reconciliationId: z.string().optional(),
  status: z.enum(['MATCHED', 'UNMATCHED']).optional()
});

export type JournalEntry = {
  id: string;
  date: Date;
  description: string;
  reference: string;
  amount: number;
  accountId: string;
  organizationId: string;
  status: 'DRAFT' | 'POSTED';
  type: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  reconciliation?: Reconciliation;
};

export type Reconciliation = {
  id: string;
  journalEntryId: string;
  accountId: string;
  organizationId: string;
  isReconciled: boolean;
  reconciliationDate: Date;
  bankBalance: number;
  variance: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}; 