import { Prisma } from '@prisma/client';

export type FundingSourceType =
  | 'SELF_FUNDED'
  | 'LOCAL_AUTHORITY'
  | 'NHS_CHC'
  | 'NHS_FNC'
  | 'FAIR_DEAL'
  | 'HSE'
  | 'PRIVATE_INSURANCE'
  | 'OTHER';

export type PaymentMethod =
  | 'DIRECT_DEBIT'
  | 'STANDING_ORDER'
  | 'BANK_TRANSFER'
  | 'CARD_PAYMENT'
  | 'CASH'
  | 'CHEQUE'
  | 'SEPA_DIRECT_DEBIT'
  | 'OTHER';

export type ChargeType = 'ONE_TIME' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PER_USE';

export type BillingScheduleType = 'ROOM_RATE' | 'CARE_PACKAGE' | 'ADDITIONAL_SERVICES';

export type BillingFrequency = 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

export interface FundingSource {
  id: string;
  tenantId: string;
  name: string;
  type: FundingSourceType;
  details?: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResidentFinancial {
  id: string;
  tenantId: string;
  residentId: string;
  primaryContact?: string;
  billingAddress?: Prisma.JsonValue;
  roomRate: Prisma.Decimal;
  carePackageRate: Prisma.Decimal;
  additionalServices: Prisma.JsonValue[];
  paymentMethod: PaymentMethod;
  paymentDetails?: Prisma.JsonValue;
  billingDay: number;
  lastBillingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResidentFunding {
  id: string;
  tenantId: string;
  residentId: string;
  fundingSourceId: string;
  startDate: Date;
  endDate?: Date;
  weeklyAmount: Prisma.Decimal;
  contribution: Prisma.Decimal;
  reference?: string;
  details?: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarePackageRate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  baseRate: Prisma.Decimal;
  inclusions: Prisma.JsonValue[];
  supplements: Prisma.JsonValue[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoomRate {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  roomType: string;
  baseRate: Prisma.Decimal;
  features: Prisma.JsonValue[];
  supplements: Prisma.JsonValue[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdditionalService {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  rate: Prisma.Decimal;
  chargeType: ChargeType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingSchedule {
  id: string;
  tenantId: string;
  residentId: string;
  scheduleType: BillingScheduleType;
  frequency: BillingFrequency;
  dayOfMonth?: number;
  dayOfWeek?: number;
  lastRun?: Date;
  nextRun: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Funding Source Details Types
export interface LocalAuthorityDetails {
  authorityName: string;
  contractNumber: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  billingReference?: string;
  paymentTerms?: number;
}

export interface NHSDetails {
  type: 'CHC' | 'FNC';
  nhsNumber: string;
  assessmentDate?: Date;
  reviewDate?: Date;
  fundingReference?: string;
  contactPerson?: string;
  contactEmail?: string;
}

export interface FairDealDetails {
  applicationNumber: string;
  assessmentDate?: Date;
  reviewDate?: Date;
  contributionAmount?: number;
  nursingHome?: {
    registrationNumber: string;
    approvalDate: Date;
  };
}

export interface HSEDetails {
  referenceNumber: string;
  careType: string;
  approvalDate?: Date;
  reviewDate?: Date;
  contactPerson?: string;
  contactDetails?: {
    email?: string;
    phone?: string;
  };
}

// Payment Details Types
export interface DirectDebitDetails {
  accountName: string;
  accountNumber: string;
  sortCode: string;
  mandateReference?: string;
  collectionDay?: number;
}

export interface SEPADirectDebitDetails {
  accountName: string;
  iban: string;
  bic: string;
  mandateReference?: string;
  collectionDay?: number;
}

export interface CardPaymentDetails {
  cardType: string;
  lastFourDigits: string;
  expiryMonth: number;
  expiryYear: number;
  tokenReference?: string;
}

// Additional Service Types
export interface ServiceInclusion {
  name: string;
  description?: string;
  standardRate?: number;
}

export interface ServiceSupplement {
  name: string;
  description?: string;
  rate: number;
  chargeType: ChargeType;
}
