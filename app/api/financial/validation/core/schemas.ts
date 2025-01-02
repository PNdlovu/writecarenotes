/**
 * @fileoverview Core Financial Validation Schemas
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Core validation schemas for financial operations
 */

import { z } from 'zod';
import { REGIONS } from '../../constants/regions';
import { REGULATORY_BODIES } from '../../constants/regulatoryBodies';

export const currencySchema = z.object({
  amount: z.number().min(0),
  currency: z.enum(['GBP', 'EUR']),
});

export const financialTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE', 'REFUND', 'ADJUSTMENT']),
  amount: currencySchema,
  date: z.string().datetime(),
  description: z.string().min(1).max(500),
  category: z.string(),
  reference: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const residentFinancialSchema = z.object({
  residentId: z.string().uuid(),
  fundingType: z.enum(['SELF_FUNDED', 'LOCAL_AUTHORITY', 'NHS', 'MIXED']),
  weeklyFee: currencySchema,
  localAuthorityContribution: currencySchema.optional(),
  nhsContribution: currencySchema.optional(),
  personalContribution: currencySchema.optional(),
  paymentMethod: z.enum(['DIRECT_DEBIT', 'BANK_TRANSFER', 'CHEQUE', 'CASH']),
  billingContact: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
});

export const financialSettingsSchema = z.object({
  organizationId: z.string().uuid(),
  region: z.enum(Object.keys(REGIONS) as [string, ...string[]]),
  regulatoryBody: z.enum(Object.values(REGULATORY_BODIES).flatMap(body => Object.keys(body)) as [string, ...string[]]),
  currency: z.enum(['GBP', 'EUR']),
  taxRate: z.number().min(0).max(100),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']),
  paymentTerms: z.number().min(0),
  autoInvoicing: z.boolean(),
  offlineSupport: z.object({
    enabled: z.boolean(),
    syncInterval: z.number().min(5).max(1440), // minutes
    maxOfflinePeriod: z.number().min(1).max(30), // days
  }),
  audit: z.object({
    enabled: z.boolean(),
    retentionPeriod: z.number().min(1),
    detailLevel: z.enum(['BASIC', 'DETAILED']),
  }),
}); 