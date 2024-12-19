import { prisma } from '@/lib/prisma';
import { 
  Account, 
  AccountType, 
  Transaction, 
  TransactionEntry, 
  TransactionStatus 
} from './types';
import { TenantContext } from '@/lib/tenant/TenantContext';

export class AccountingService {
  private tenantContext: TenantContext;

  constructor(tenantContext: TenantContext) {
    this.tenantContext = tenantContext;
  }

  async createAccount(data: {
    code: string;
    name: string;
    type: AccountType;
    parentId?: string;
    description?: string;
  }): Promise<Account> {
    const { code, name, type, parentId, description } = data;

    // Verify parent account if provided
    if (parentId) {
      const parentAccount = await prisma.account.findFirst({
        where: {
          id: parentId,
          tenantId: this.tenantContext.id
        }
      });

      if (!parentAccount) {
        throw new Error('Parent account not found');
      }
    }

    // Create account
    const account = await prisma.account.create({
      data: {
        tenantId: this.tenantContext.id,
        code,
        name,
        type,
        parentId,
        description,
        balance: 0
      }
    });

    return account;
  }

  async getAccount(id: string): Promise<Account | null> {
    return prisma.account.findFirst({
      where: {
        id,
        tenantId: this.tenantContext.id
      }
    });
  }

  async updateAccount(id: string, data: Partial<Account>): Promise<Account> {
    const { balance, ...updateData } = data;

    // Don't allow direct balance updates
    return prisma.account.update({
      where: {
        id,
        tenantId: this.tenantContext.id
      },
      data: updateData
    });
  }

  async listAccounts(params: {
    type?: AccountType;
    parentId?: string;
    search?: string;
  }): Promise<Account[]> {
    const { type, parentId, search } = params;

    return prisma.account.findMany({
      where: {
        tenantId: this.tenantContext.id,
        ...(type && { type }),
        ...(parentId && { parentId }),
        ...(search && {
          OR: [
            { code: { contains: search } },
            { name: { contains: search } }
          ]
        })
      },
      orderBy: [
        { code: 'asc' }
      ]
    });
  }

  async createTransaction(data: {
    date: Date;
    description: string;
    entries: Omit<TransactionEntry, 'id'>[];
    reference?: string;
  }): Promise<Transaction> {
    const { date, description, entries, reference } = data;

    // Validate double-entry accounting
    const totalDebits = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredits = entries.reduce((sum, entry) => sum + entry.credit, 0);

    if (totalDebits !== totalCredits) {
      throw new Error('Transaction debits and credits must be equal');
    }

    // Create transaction and entries
    const transaction = await prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.transaction.create({
        data: {
          tenantId: this.tenantContext.id,
          date,
          description,
          reference,
          status: TransactionStatus.PENDING,
          entries: {
            create: entries
          }
        },
        include: {
          entries: true
        }
      });

      return transaction;
    });

    return transaction;
  }

  async postTransaction(id: string): Promise<Transaction> {
    return prisma.$transaction(async (tx) => {
      // Get transaction with entries
      const transaction = await tx.transaction.findFirst({
        where: {
          id,
          tenantId: this.tenantContext.id
        },
        include: {
          entries: true
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new Error('Transaction is not in pending status');
      }

      // Update account balances
      for (const entry of transaction.entries) {
        await tx.account.update({
          where: { id: entry.accountId },
          data: {
            balance: {
              increment: entry.debit - entry.credit
            }
          }
        });
      }

      // Update transaction status
      return tx.transaction.update({
        where: { id },
        data: { status: TransactionStatus.POSTED },
        include: { entries: true }
      });
    });
  }

  async voidTransaction(id: string): Promise<Transaction> {
    return prisma.$transaction(async (tx) => {
      // Get transaction with entries
      const transaction = await tx.transaction.findFirst({
        where: {
          id,
          tenantId: this.tenantContext.id
        },
        include: {
          entries: true
        }
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== TransactionStatus.POSTED) {
        throw new Error('Only posted transactions can be voided');
      }

      // Reverse account balances
      for (const entry of transaction.entries) {
        await tx.account.update({
          where: { id: entry.accountId },
          data: {
            balance: {
              decrement: entry.debit - entry.credit
            }
          }
        });
      }

      // Update transaction status
      return tx.transaction.update({
        where: { id },
        data: { status: TransactionStatus.VOIDED },
        include: { entries: true }
      });
    });
  }

  async getTrialBalance(): Promise<{
    accounts: (Account & { balance: number })[];
    totalDebits: number;
    totalCredits: number;
  }> {
    const accounts = await prisma.account.findMany({
      where: {
        tenantId: this.tenantContext.id
      },
      orderBy: [
        { code: 'asc' }
      ]
    });

    const totalDebits = accounts.reduce((sum, account) => {
      return sum + (account.balance > 0 ? account.balance : 0);
    }, 0);

    const totalCredits = accounts.reduce((sum, account) => {
      return sum + (account.balance < 0 ? -account.balance : 0);
    }, 0);

    return {
      accounts,
      totalDebits,
      totalCredits
    };
  }

  async getAccountTransactions(accountId: string, params: {
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{
    transactions: Transaction[];
    total: number;
    openingBalance: number;
    closingBalance: number;
  }> {
    const { startDate, endDate, page = 1, limit = 10 } = params;

    const where = {
      tenantId: this.tenantContext.id,
      entries: {
        some: {
          accountId
        }
      },
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate
        }
      })
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          entries: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          date: 'asc'
        }
      }),
      prisma.transaction.count({ where })
    ]);

    // Calculate opening and closing balances
    const account = await this.getAccount(accountId);
    const openingBalance = account?.balance || 0;
    const closingBalance = transactions.reduce((balance, transaction) => {
      const entry = transaction.entries.find(e => e.accountId === accountId);
      if (entry) {
        return balance + (entry.debit - entry.credit);
      }
      return balance;
    }, openingBalance);

    return {
      transactions,
      total,
      openingBalance,
      closingBalance
    };
  }
}


