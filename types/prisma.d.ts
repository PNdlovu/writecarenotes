import { Prisma } from '@prisma/client';

declare global {
  namespace PrismaJson {
    type AuditLogDetails = {
      entry?: any;
      before?: any;
      after?: any;
      count?: number;
      accountId?: string;
    };
  }
}

// Extend Prisma namespace
declare module '@prisma/client' {
  export enum JournalEntryStatus {
    DRAFT = 'DRAFT',
    POSTED = 'POSTED',
  }

  export enum EntityType {
    ACCOUNT = 'ACCOUNT',
    COST_CENTER = 'COST_CENTER',
    JOURNAL_ENTRY = 'JOURNAL_ENTRY',
    VAT_RETURN = 'VAT_RETURN',
    RECONCILIATION = 'RECONCILIATION',
    BANK_TRANSACTION = 'BANK_TRANSACTION',
  }

  export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    ARCHIVE = 'ARCHIVE',
    RESTORE = 'RESTORE',
    SUBMIT = 'SUBMIT',
    APPROVE = 'APPROVE',
    REJECT = 'REJECT',
  }

  export type JournalEntryWhereInput = Prisma.JournalEntryWhereInput;
} 