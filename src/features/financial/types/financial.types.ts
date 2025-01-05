import { Prisma, PaymentMethod, PaymentStatus } from '@prisma/client';
import { Currency } from '../core/types';

export interface CreatePaymentTransactionInput {
  amount: number;
  currency: string;
  status?: PaymentStatus;
  paymentMethod: PaymentMethod;
  description: string;
  metadata?: Record<string, any>;
  organizationId: string;
  careHomeId: string;
  residentId?: string;
  externalReference?: string;
  dueDate?: Date;
  processingFee?: number;
  refundable?: boolean;
  createdBy: string;
}

export interface UpdatePaymentTransactionInput {
  status?: PaymentStatus;
  metadata?: Record<string, any>;
  processingFee?: number;
  refundedAmount?: number;
  refundReason?: string;
  completedAt?: Date;
  updatedBy: string;
}

export interface PaymentTransactionFilters {
  organizationId?: string;
  careHomeId?: string;
  residentId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  orderBy?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface FinancialSettings {
  id: string;
  organizationId: string;
  currency: string;
  taxRate: number;
  billingCycle: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'QUARTERLY' | 'ANNUALLY';
  paymentTerms: number;
  autoInvoicing: boolean;
  createdAt: Date;
  updatedAt: Date;
  gdprSettings: {
    retentionPeriod: number;
    dataEncryption: boolean;
    auditLogging: boolean;
  };
  regionalSettings: RegionalFormat;
}

export interface ResidentFinancial {
  id: string;
  residentId: string;
  organizationId: string;
  careHomeId: string;
  fundingType: 'SELF_FUNDED' | 'LOCAL_AUTHORITY' | 'NHS' | 'MIXED';
  weeklyFee: number;
  localAuthorityContribution?: number;
  nhsContribution?: number;
  personalContribution?: number;
  paymentMethod: PaymentMethod;
  billingContact?: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface RegionalFormat {
  currency: Currency;
  dateFormat: string;
  numberFormat: string;
  timezone: string;
}

export interface FinancialTransaction {
  id: string;
  amount: number;
  currency: string;
  type: 'DEBIT' | 'CREDIT';
  status: PaymentStatus;
  description: string;
  metadata?: Record<string, any>;
  organizationId: string;
  careHomeId: string;
  residentId?: string;
  reference?: string;
  audit: {
    createdAt: Date;
    createdBy: string;
    lastModified: Date;
    modifiedBy: string;
  };
}

export interface FinancialSummary {
  totalRevenue: number;
  outstandingPayments: number;
  paidInvoices: number;
  averagePaymentTime: number;
  fundingBreakdown: {
    selfFunded: number;
    localAuthority: number;
    nhs: number;
    mixed: number;
  };
  occupancyRate: number;
  revenuePerBed: number;
  paymentMethodStats: {
    method: PaymentMethod;
    count: number;
    totalAmount: number;
  }[];
}


