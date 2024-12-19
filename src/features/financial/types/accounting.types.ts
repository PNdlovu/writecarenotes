export type AccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
export type TransactionType = 'DEBIT' | 'CREDIT';

export interface Account {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  balance: number;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  tenantId: string;
  date: Date;
  reference: string;
  description: string;
  entries: TransactionEntry[];
  status: 'PENDING' | 'POSTED' | 'VOIDED';
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionEntry {
  id: string;
  transactionId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description?: string;
}

export interface JournalEntry {
  id: string;
  tenantId: string;
  date: Date;
  reference: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  status: 'PENDING' | 'POSTED' | 'VOIDED';
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountBalance {
  accountId: string;
  balance: number;
  asOf: Date;
}

export interface TrialBalance {
  accounts: {
    id: string;
    code: string;
    name: string;
    type: AccountType;
    debit: number;
    credit: number;
    balance: number;
  }[];
  totals: {
    debit: number;
    credit: number;
    balance: number;
  };
  asOf: Date;
}

export interface BalanceSheet {
  assets: {
    current: Account[];
    fixed: Account[];
    other: Account[];
    total: number;
  };
  liabilities: {
    current: Account[];
    longTerm: Account[];
    total: number;
  };
  equity: {
    accounts: Account[];
    total: number;
  };
  asOf: Date;
}

export interface IncomeStatement {
  revenue: {
    accounts: Account[];
    total: number;
  };
  expenses: {
    accounts: Account[];
    total: number;
  };
  netIncome: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface CashFlow {
  operating: {
    inflows: Transaction[];
    outflows: Transaction[];
    net: number;
  };
  investing: {
    inflows: Transaction[];
    outflows: Transaction[];
    net: number;
  };
  financing: {
    inflows: Transaction[];
    outflows: Transaction[];
    net: number;
  };
  netChange: number;
  period: {
    start: Date;
    end: Date;
  };
} 


