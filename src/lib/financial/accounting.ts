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

  async performReconciliation(params: {
    accountId: string;
    startDate: Date;
    endDate: Date;
    bankStatement: {
      date: Date;
      description: string;
      amount: number;
    }[];
  }): Promise<{
    matched: Transaction[];
    unmatched: Transaction[];
    unmatchedStatements: typeof params.bankStatement;
  }> {
    const { accountId, startDate, endDate, bankStatement } = params;

    // Get account transactions for the period
    const { transactions } = await this.getAccountTransactions(accountId, {
      startDate,
      endDate,
      limit: 1000 // Increased limit for reconciliation
    });

    const matched: Transaction[] = [];
    const unmatched: Transaction[] = [];
    const unmatchedStatements = [...bankStatement];

    // Simple matching algorithm based on amount and date proximity
    for (const transaction of transactions) {
      const entry = transaction.entries.find(e => e.accountId === accountId);
      if (!entry) continue;

      const amount = entry.debit - entry.credit;
      const statementIndex = unmatchedStatements.findIndex(stmt => {
        const dateDiff = Math.abs(stmt.date.getTime() - transaction.date.getTime());
        const isWithinTimeframe = dateDiff <= 24 * 60 * 60 * 1000; // 24 hours
        return Math.abs(stmt.amount - amount) < 0.01 && isWithinTimeframe;
      });

      if (statementIndex >= 0) {
        matched.push(transaction);
        unmatchedStatements.splice(statementIndex, 1);
      } else {
        unmatched.push(transaction);
      }
    }

    return {
      matched,
      unmatched,
      unmatchedStatements
    };
  }

  async createReconciliationEntry(data: {
    accountId: string;
    date: Date;
    description: string;
    matchedTransactions: string[];
    adjustmentAmount?: number;
    notes?: string;
  }): Promise<{
    reconciliation: any;
    adjustmentTransaction?: Transaction;
  }> {
    const { accountId, date, description, matchedTransactions, adjustmentAmount, notes } = data;

    return prisma.$transaction(async (tx) => {
      // Create reconciliation record
      const reconciliation = await tx.reconciliation.create({
        data: {
          tenantId: this.tenantContext.id,
          accountId,
          date,
          description,
          notes,
          transactions: {
            connect: matchedTransactions.map(id => ({ id }))
          }
        }
      });

      // Create adjustment transaction if needed
      let adjustmentTransaction: Transaction | undefined;
      if (adjustmentAmount && Math.abs(adjustmentAmount) > 0.01) {
        const adjustmentEntry = {
          accountId,
          debit: adjustmentAmount > 0 ? adjustmentAmount : 0,
          credit: adjustmentAmount < 0 ? -adjustmentAmount : 0
        };

        const suspenseAccountId = await this.getOrCreateSuspenseAccount();
        const suspenseEntry = {
          accountId: suspenseAccountId,
          debit: adjustmentAmount < 0 ? -adjustmentAmount : 0,
          credit: adjustmentAmount > 0 ? adjustmentAmount : 0
        };

        adjustmentTransaction = await this.createTransaction({
          date,
          description: `Reconciliation adjustment - ${description}`,
          entries: [adjustmentEntry, suspenseEntry],
          reference: `RECON-ADJ-${reconciliation.id}`
        });

        await this.postTransaction(adjustmentTransaction.id);
      }

      return {
        reconciliation,
        adjustmentTransaction
      };
    });
  }

  private async getOrCreateSuspenseAccount(): Promise<string> {
    const suspenseAccount = await prisma.account.findFirst({
      where: {
        tenantId: this.tenantContext.id,
        code: 'SUSP',
        type: AccountType.LIABILITY
      }
    });

    if (suspenseAccount) {
      return suspenseAccount.id;
    }

    const newAccount = await this.createAccount({
      code: 'SUSP',
      name: 'Suspense Account',
      type: AccountType.LIABILITY,
      description: 'Temporary account for reconciliation adjustments'
    });

    return newAccount.id;
  }

  async createBatchTransactions(transactions: Array<{
    date: Date;
    description: string;
    entries: Array<{
      accountId: string;
      debit: number;
      credit: number;
      description?: string;
      costCenterId?: string;
    }>;
    reference?: string;
  }>): Promise<Transaction[]> {
    return prisma.$transaction(async (tx) => {
      const results: Transaction[] = [];

      for (const transaction of transactions) {
        // Validate each transaction's double-entry
        const totalDebits = transaction.entries.reduce((sum, entry) => sum + entry.debit, 0);
        const totalCredits = transaction.entries.reduce((sum, entry) => sum + entry.credit, 0);

        if (Math.abs(totalDebits - totalCredits) > 0.01) {
          throw new Error(`Transaction debits and credits must be equal. Difference: ${totalDebits - totalCredits}`);
        }

        // Create the transaction
        const result = await tx.journalEntry.create({
          data: {
            organizationId: this.tenantContext.id,
            date: transaction.date,
            description: transaction.description,
            reference: transaction.reference || `BATCH-${new Date().getTime()}`,
            status: 'DRAFT',
            amount: totalDebits, // Total transaction amount
            type: 'DEBIT', // Default type
            lines: {
              create: transaction.entries.map(entry => ({
                accountId: entry.accountId,
                costCenterId: entry.costCenterId,
                description: entry.description || transaction.description,
                debit: entry.debit,
                credit: entry.credit
              }))
            }
          },
          include: {
            lines: true
          }
        });

        results.push(result);
      }

      return results;
    });
  }

  async postBatchTransactions(transactionIds: string[]): Promise<Transaction[]> {
    return prisma.$transaction(async (tx) => {
      const results: Transaction[] = [];

      for (const id of transactionIds) {
        // Get transaction with entries
        const transaction = await tx.journalEntry.findFirst({
          where: {
            id,
            organizationId: this.tenantContext.id
          },
          include: {
            lines: true
          }
        });

        if (!transaction) {
          throw new Error(`Transaction ${id} not found`);
        }

        if (transaction.status !== 'DRAFT') {
          throw new Error(`Transaction ${id} is not in draft status`);
        }

        // Update account balances
        for (const line of transaction.lines) {
          await tx.account.update({
            where: { id: line.accountId },
            data: {
              balance: {
                increment: line.debit - line.credit
              }
            }
          });
        }

        // Update transaction status
        const posted = await tx.journalEntry.update({
          where: { id },
          data: { status: 'POSTED' },
          include: { lines: true }
        });

        results.push(posted);
      }

      return results;
    });
  }

  async generateBatchReport(batchId: string): Promise<{
    totalTransactions: number;
    totalAmount: number;
    accountSummary: Array<{
      accountId: string;
      accountCode: string;
      accountName: string;
      totalDebits: number;
      totalCredits: number;
      netChange: number;
    }>;
    costCenterSummary: Array<{
      costCenterId: string;
      costCenterCode: string;
      costCenterName: string;
      totalAmount: number;
    }>;
  }> {
    const transactions = await prisma.journalEntry.findMany({
      where: {
        organizationId: this.tenantContext.id,
        reference: {
          startsWith: `BATCH-${batchId}`
        }
      },
      include: {
        lines: {
          include: {
            account: true,
            costCenter: true
          }
        }
      }
    });

    const accountSummary = new Map<string, {
      accountId: string;
      accountCode: string;
      accountName: string;
      totalDebits: number;
      totalCredits: number;
      netChange: number;
    }>();

    const costCenterSummary = new Map<string, {
      costCenterId: string;
      costCenterCode: string;
      costCenterName: string;
      totalAmount: number;
    }>();

    let totalAmount = 0;

    // Process transactions
    for (const transaction of transactions) {
      totalAmount += transaction.amount;

      // Process lines
      for (const line of transaction.lines) {
        // Update account summary
        const accountKey = line.accountId;
        const accountSummaryItem = accountSummary.get(accountKey) || {
          accountId: line.accountId,
          accountCode: line.account.code,
          accountName: line.account.name,
          totalDebits: 0,
          totalCredits: 0,
          netChange: 0
        };

        accountSummaryItem.totalDebits += line.debit;
        accountSummaryItem.totalCredits += line.credit;
        accountSummaryItem.netChange = accountSummaryItem.totalDebits - accountSummaryItem.totalCredits;
        accountSummary.set(accountKey, accountSummaryItem);

        // Update cost center summary if available
        if (line.costCenterId && line.costCenter) {
          const costCenterKey = line.costCenterId;
          const costCenterSummaryItem = costCenterSummary.get(costCenterKey) || {
            costCenterId: line.costCenterId,
            costCenterCode: line.costCenter.code,
            costCenterName: line.costCenter.name,
            totalAmount: 0
          };

          costCenterSummaryItem.totalAmount += line.debit - line.credit;
          costCenterSummary.set(costCenterKey, costCenterSummaryItem);
        }
      }
    }

    return {
      totalTransactions: transactions.length,
      totalAmount,
      accountSummary: Array.from(accountSummary.values()),
      costCenterSummary: Array.from(costCenterSummary.values())
    };
  }
}


