export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE'
}

export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT'
}

export enum PaymentMethod {
  DIRECT_DEBIT = 'DIRECT_DEBIT',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHECK = 'CHECK'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  VOID = 'VOID'
}

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  balance: number;
  parentId?: string;
  children?: Account[];
  level: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  description: string;
  reference?: string;
  date: Date;
  status: 'pending' | 'posted' | 'voided';
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  number: string;
  residentId: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  date: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialSettings {
  organization: {
    name: string;
    fiscalYearStart: string; // MM format
    defaultCurrency: string; // ISO currency code
    taxNumber?: string;
    registrationNumber?: string;
  };
  invoicing: {
    prefix: string;
    defaultDueDays: number;
    defaultTerms?: string;
    defaultNotes?: string;
  };
  payments: {
    methods: PaymentMethod[];
    gateway?: {
      provider: string;
      apiKey: string;
      webhookSecret?: string;
    };
  };
  notifications: {
    invoiceGenerated: boolean;
    paymentReceived: boolean;
    paymentOverdue: boolean;
  };
  compliance: {
    dataRetentionYears: number;
    vatEnabled: boolean;
    vatNumber?: string;
  };
}

export interface RegionalConfig {
  currency: {
    code: string;
    symbol: string;
    position: 'prefix' | 'suffix';
  };
  regulatoryBody: {
    name: string;
    website: string;
    requirements: string[];
  };
  tax: {
    name: string;
    defaultRate: number;
    codes: Record<string, number>;
  };
  dateFormat: string;
  fiscalYear: {
    defaultStart: string; // MM-DD format
    defaultEnd: string; // MM-DD format
  };
}
