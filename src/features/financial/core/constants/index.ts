// Supported currencies
export const SUPPORTED_CURRENCIES = {
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound Sterling'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro'
  }
} as const;

// Default currency for the platform
export const DEFAULT_CURRENCY = SUPPORTED_CURRENCIES.GBP;

// Tax rates by region
export const TAX_RATES = {
  UK: 20, // 20% VAT
  IE: 23  // 23% VAT
} as const;

// Payment terms in days
export const DEFAULT_PAYMENT_TERMS = 30;

// Transaction reference prefixes
export const REFERENCE_PREFIXES = {
  INVOICE: 'INV',
  PAYMENT: 'PMT',
  REFUND: 'REF',
  JOURNAL: 'JNL',
  ADJUSTMENT: 'ADJ'
} as const;

// Financial periods
export const FINANCIAL_PERIODS = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  ANNUAL: 'ANNUAL'
} as const;

// Account types
export const ACCOUNT_TYPES = {
  ASSET: 'ASSET',
  LIABILITY: 'LIABILITY',
  EQUITY: 'EQUITY',
  REVENUE: 'REVENUE',
  EXPENSE: 'EXPENSE'
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  DEBIT: 'DEBIT',
  CREDIT: 'CREDIT'
} as const;

// Transaction statuses
export const TRANSACTION_STATUSES = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  VOIDED: 'VOIDED',
  FAILED: 'FAILED'
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  DIRECT_DEBIT: 'DIRECT_DEBIT',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CHEQUE: 'CHEQUE',
  CASH: 'CASH'
} as const;

// Funding types
export const FUNDING_TYPES = {
  SELF_FUNDED: 'SELF_FUNDED',
  LOCAL_AUTHORITY: 'LOCAL_AUTHORITY',
  NHS: 'NHS',
  MIXED: 'MIXED'
} as const;

// Default chart of accounts structure
export const DEFAULT_CHART_OF_ACCOUNTS = {
  ASSETS: {
    code: '1000',
    name: 'Assets',
    type: ACCOUNT_TYPES.ASSET,
    children: {
      CURRENT_ASSETS: {
        code: '1100',
        name: 'Current Assets'
      },
      FIXED_ASSETS: {
        code: '1200',
        name: 'Fixed Assets'
      }
    }
  },
  LIABILITIES: {
    code: '2000',
    name: 'Liabilities',
    type: ACCOUNT_TYPES.LIABILITY,
    children: {
      CURRENT_LIABILITIES: {
        code: '2100',
        name: 'Current Liabilities'
      },
      LONG_TERM_LIABILITIES: {
        code: '2200',
        name: 'Long Term Liabilities'
      }
    }
  },
  EQUITY: {
    code: '3000',
    name: 'Equity',
    type: ACCOUNT_TYPES.EQUITY
  },
  REVENUE: {
    code: '4000',
    name: 'Revenue',
    type: ACCOUNT_TYPES.REVENUE,
    children: {
      CARE_FEES: {
        code: '4100',
        name: 'Care Fees'
      },
      OTHER_INCOME: {
        code: '4200',
        name: 'Other Income'
      }
    }
  },
  EXPENSES: {
    code: '5000',
    name: 'Expenses',
    type: ACCOUNT_TYPES.EXPENSE,
    children: {
      STAFF_COSTS: {
        code: '5100',
        name: 'Staff Costs'
      },
      OPERATING_COSTS: {
        code: '5200',
        name: 'Operating Costs'
      },
      ADMINISTRATIVE: {
        code: '5300',
        name: 'Administrative'
      }
    }
  }
} as const; 


