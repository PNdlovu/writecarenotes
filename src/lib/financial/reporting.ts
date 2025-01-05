import { prisma } from '@/lib/prisma';
import { 
  FinancialReport, 
  ReportType, 
  AccountType,
  Transaction 
} from './types';
import { TenantContext } from '@/lib/tenant/TenantContext';
import { AccountingService } from './accounting';

export class ReportingService {
  private tenantContext: TenantContext;
  private accountingService: AccountingService;

  constructor(tenantContext: TenantContext) {
    this.tenantContext = tenantContext;
    this.accountingService = new AccountingService(tenantContext);
  }

  async generateReport(params: {
    type: ReportType;
    startDate: Date;
    endDate: Date;
  }): Promise<FinancialReport> {
    const { type, startDate, endDate } = params;

    let data;
    switch (type) {
      case ReportType.PROFIT_LOSS:
        data = await this.generateProfitLossReport(startDate, endDate);
        break;
      case ReportType.BALANCE_SHEET:
        data = await this.generateBalanceSheetReport(endDate);
        break;
      case ReportType.CASH_FLOW:
        data = await this.generateCashFlowReport(startDate, endDate);
        break;
      case ReportType.AGED_RECEIVABLES:
        data = await this.generateAgedReceivablesReport(endDate);
        break;
      case ReportType.AGED_PAYABLES:
        data = await this.generateAgedPayablesReport(endDate);
        break;
      default:
        throw new Error('Unsupported report type');
    }

    const report = await prisma.financialReport.create({
      data: {
        tenantId: this.tenantContext.id,
        type,
        dateRange: {
          startDate,
          endDate
        },
        data,
        generatedAt: new Date()
      }
    });

    return report;
  }

  private async generateProfitLossReport(startDate: Date, endDate: Date) {
    // Get all revenue and expense accounts
    const accounts = await prisma.account.findMany({
      where: {
        tenantId: this.tenantContext.id,
        type: {
          in: [AccountType.REVENUE, AccountType.EXPENSE]
        }
      }
    });

    // Get transactions for the period
    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId: this.tenantContext.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        entries: true
      }
    });

    // Calculate totals
    const revenue = this.calculateAccountTypeTotals(
      accounts.filter(a => a.type === AccountType.REVENUE),
      transactions
    );

    const expenses = this.calculateAccountTypeTotals(
      accounts.filter(a => a.type === AccountType.EXPENSE),
      transactions
    );

    return {
      revenue,
      expenses,
      netIncome: revenue.total - expenses.total
    };
  }

  private async generateBalanceSheetReport(asOfDate: Date) {
    // Get all balance sheet accounts
    const accounts = await prisma.account.findMany({
      where: {
        tenantId: this.tenantContext.id,
        type: {
          in: [AccountType.ASSET, AccountType.LIABILITY, AccountType.EQUITY]
        }
      }
    });

    // Get transactions up to date
    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId: this.tenantContext.id,
        date: {
          lte: asOfDate
        }
      },
      include: {
        entries: true
      }
    });

    // Calculate totals
    const assets = this.calculateAccountTypeTotals(
      accounts.filter(a => a.type === AccountType.ASSET),
      transactions
    );

    const liabilities = this.calculateAccountTypeTotals(
      accounts.filter(a => a.type === AccountType.LIABILITY),
      transactions
    );

    const equity = this.calculateAccountTypeTotals(
      accounts.filter(a => a.type === AccountType.EQUITY),
      transactions
    );

    return {
      assets,
      liabilities,
      equity,
      totalLiabilitiesAndEquity: liabilities.total + equity.total
    };
  }

  private async generateCashFlowReport(startDate: Date, endDate: Date) {
    // Get cash accounts
    const cashAccounts = await prisma.account.findMany({
      where: {
        tenantId: this.tenantContext.id,
        type: AccountType.ASSET,
        code: { startsWith: '1000' } // Assuming cash accounts start with 1000
      }
    });

    // Get all cash transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId: this.tenantContext.id,
        date: {
          gte: startDate,
          lte: endDate
        },
        entries: {
          some: {
            accountId: {
              in: cashAccounts.map(a => a.id)
            }
          }
        }
      },
      include: {
        entries: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Calculate cash flows
    const operatingActivities = this.categorizeCashFlows(transactions, 'operating');
    const investingActivities = this.categorizeCashFlows(transactions, 'investing');
    const financingActivities = this.categorizeCashFlows(transactions, 'financing');

    return {
      operatingActivities,
      investingActivities,
      financingActivities,
      netCashFlow: 
        operatingActivities.total + 
        investingActivities.total + 
        financingActivities.total
    };
  }

  private async generateAgedReceivablesReport(asOfDate: Date) {
    const receivables = await prisma.invoice.findMany({
      where: {
        tenantId: this.tenantContext.id,
        dueDate: {
          lte: asOfDate
        },
        status: {
          in: ['SENT', 'OVERDUE']
        }
      },
      include: {
        resident: true
      }
    });

    // Age buckets: current, 1-30, 31-60, 61-90, 90+
    const aged = receivables.reduce((acc, invoice) => {
      const daysOverdue = Math.floor(
        (asOfDate.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysOverdue <= 0) acc.current.push(invoice);
      else if (daysOverdue <= 30) acc.thirty.push(invoice);
      else if (daysOverdue <= 60) acc.sixty.push(invoice);
      else if (daysOverdue <= 90) acc.ninety.push(invoice);
      else acc.older.push(invoice);

      return acc;
    }, {
      current: [],
      thirty: [],
      sixty: [],
      ninety: [],
      older: []
    });

    return aged;
  }

  private async generateAgedPayablesReport(asOfDate: Date) {
    // Similar to receivables but for payables
    // Implementation depends on payables tracking system
    return {};
  }

  private calculateAccountTypeTotals(accounts: any[], transactions: Transaction[]) {
    const totals = accounts.reduce((acc, account) => {
      const accountTotal = transactions.reduce((sum, transaction) => {
        const entry = transaction.entries.find(e => e.accountId === account.id);
        if (entry) {
          return sum + (entry.debit - entry.credit);
        }
        return sum;
      }, 0);

      acc.accounts.push({
        ...account,
        total: accountTotal
      });

      acc.total += accountTotal;
      return acc;
    }, {
      accounts: [],
      total: 0
    });

    return totals;
  }

  private categorizeCashFlows(transactions: Transaction[], category: 'operating' | 'investing' | 'financing') {
    // Implement cash flow categorization logic
    return {
      transactions: [],
      total: 0
    };
  }
}


