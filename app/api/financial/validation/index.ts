/**
 * @fileoverview Financial API Validation Schemas
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Validation schemas for financial management API
 */

import { z } from 'zod';

export const financialSettingsSchema = z.object({
  currency: z.string(),
  taxRate: z.number().min(0).max(100),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']),
  paymentTerms: z.number().min(0),
  autoInvoicing: z.boolean(),
  gdprSettings: z.object({
    retentionPeriod: z.number().min(1),
    dataEncryption: z.boolean(),
    auditLogging: z.boolean()
  }),
  regionalSettings: z.object({
    currency: z.object({
      code: z.string(),
      symbol: z.string(),
      name: z.string()
    }),
    dateFormat: z.string(),
    numberFormat: z.string(),
    timezone: z.string()
  })
});

export const residentFinancialSchema = z.object({
  fundingType: z.enum(['SELF_FUNDED', 'LOCAL_AUTHORITY', 'NHS', 'MIXED']),
  weeklyFee: z.number().min(0),
  localAuthorityContribution: z.number().min(0).optional(),
  nhsContribution: z.number().min(0).optional(),
  personalContribution: z.number().min(0).optional(),
  paymentMethod: z.enum(['DIRECT_DEBIT', 'BANK_TRANSFER', 'CHEQUE', 'CASH']),
  billingContact: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional()
  }).optional()
});

export const transactionSchema = z.object({
  amount: z.number(),
  currency: z.string(),
  type: z.enum(['DEBIT', 'CREDIT']),
  description: z.string(),
  metadata: z.object({
    residentId: z.string().optional(),
    careHomeId: z.string().optional(),
    reference: z.string().optional()
  }).optional()
});

export const exportReportSchema = z.object({
  reportType: z.enum([
    'REVENUE',
    'EXPENSES',
    'CASH_FLOW',
    'BALANCE_SHEET',
    'RESIDENT_STATEMENTS'
  ]),
  period: z.object({
    start: z.string(),
    end: z.string()
  }),
  format: z.enum(['PDF', 'CSV', 'XLSX'])
}); 
