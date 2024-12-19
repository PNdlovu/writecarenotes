/**
 * Subscription Types
 */

export type SubscriptionPlan = 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'

export type SubscriptionStatus = 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'TRIAL'

export type BillingCycle = 'MONTHLY' | 'ANNUAL'

export type FeatureName = 
  | 'RESIDENTS'
  | 'STAFF'
  | 'STORAGE'
  | 'ANALYTICS'
  | 'CUSTOM_BRANDING'
  | 'API_ACCESS'
  | 'AUDIT_LOGS'
  | 'ADVANCED_SECURITY'
  | 'PRIORITY_SUPPORT'

export interface Feature {
  name: FeatureName
  limit: number | null  // null means unlimited
  usage?: number
  metadata?: {
    lastUpdated: Date
    updatedBy: string
  }
}

export interface BillingHistory {
  id: string
  organizationId: string
  tenantId: string
  amount: number
  currency: string
  status: 'SUCCESS' | 'FAILED'
  timestamp: Date
  metadata: {
    createdBy: string
    paymentMethod?: string
    invoiceId?: string
    description?: string
  }
}

export interface Subscription {
  id: string
  organizationId: string
  tenantId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  billingCycle: BillingCycle
  startDate: Date
  endDate: Date
  trialEndsAt?: Date
  cancelledAt?: Date
  features: Feature[]
  billingHistory: BillingHistory[]
  metadata: {
    createdAt: Date
    updatedAt: Date
    createdBy: string
    updatedBy: string
  }
}

// Plan-specific feature limits and pricing
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    price: {
      MONTHLY: 49.99,
      ANNUAL: 499.99,
    },
    features: {
      RESIDENTS: 50,
      STAFF: 10,
      STORAGE: 5, // GB
      ANALYTICS: false,
      CUSTOM_BRANDING: false,
      API_ACCESS: false,
      AUDIT_LOGS: false,
      ADVANCED_SECURITY: false,
      PRIORITY_SUPPORT: false,
    },
  },
  PROFESSIONAL: {
    price: {
      MONTHLY: 199.99,
      ANNUAL: 1999.99,
    },
    features: {
      RESIDENTS: 200,
      STAFF: 50,
      STORAGE: 50,
      ANALYTICS: true,
      CUSTOM_BRANDING: false,
      API_ACCESS: true,
      AUDIT_LOGS: true,
      ADVANCED_SECURITY: false,
      PRIORITY_SUPPORT: false,
    },
  },
  ENTERPRISE: {
    price: {
      MONTHLY: 999.99,
      ANNUAL: 9999.99,
    },
    features: {
      RESIDENTS: null, // unlimited
      STAFF: null,
      STORAGE: null,
      ANALYTICS: true,
      CUSTOM_BRANDING: true,
      API_ACCESS: true,
      AUDIT_LOGS: true,
      ADVANCED_SECURITY: true,
      PRIORITY_SUPPORT: true,
    },
  },
}


