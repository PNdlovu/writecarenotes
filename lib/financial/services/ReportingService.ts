import { Account, AccountType, Invoice, InvoiceStatus, Payment, PaymentStatus } from '../types';
import { FinancialDB } from '../db';

export class ReportingService {
  constructor(private db: FinancialDB) {}

  async generateBalanceSheet(date: Date): Promise<{
    assets: number;
    liabilities: number;
    equity: number;
    date: Date;
  }> {
    const assets = await this.db.getTotalsByAccountType(AccountType.ASSET);
    const liabilities = await this.db.getTotalsByAccountType(AccountType.LIABILITY);
    const equity = await this.db.getTotalsByAccountType(AccountType.EQUITY);

    return {
      assets,
      liabilities,
      equity,
      date
    };
  }

  async generateProfitAndLoss(startDate: Date, endDate: Date): Promise<{
    revenue: number;
    expenses: number;
    netIncome: number;
    startDate: Date;
    endDate: Date;
  }> {
    const revenue = await this.db.getTotalsByAccountType(AccountType.REVENUE);
    const expenses = await this.db.getTotalsByAccountType(AccountType.EXPENSE);
    const netIncome = revenue - expenses;

    return {
      revenue,
      expenses,
      netIncome,
      startDate,
      endDate
    };
  }

  async generateCashFlow(startDate: Date, endDate: Date): Promise<{
    operatingCashFlow: number;
    investingCashFlow: number;
    financingCashFlow: number;
    netCashFlow: number;
    startDate: Date;
    endDate: Date;
  }> {
    // This is a simplified version. In a real implementation,
    // we would need to analyze transactions and categorize them properly
    const operatingCashFlow = await this.calculateOperatingCashFlow(startDate, endDate);
    const investingCashFlow = 0; // Implement based on actual investment transactions
    const financingCashFlow = 0; // Implement based on actual financing transactions
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow;

    return {
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow,
      startDate,
      endDate
    };
  }

  async generateAgedReceivables(): Promise<{
    current: number;
    thirtyDays: number;
    sixtyDays: number;
    ninetyDays: number;
    overNinetyDays: number;
    total: number;
  }> {
    const now = new Date();
    const overdueInvoices = await this.db.getOverdueInvoices();
    
    const categories = {
      current: 0,
      thirtyDays: 0,
      sixtyDays: 0,
      ninetyDays: 0,
      overNinetyDays: 0
    };

    for (const invoice of overdueInvoices) {
      const daysDue = Math.floor((now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDue <= 0) {
        categories.current += invoice.total;
      } else if (daysDue <= 30) {
        categories.thirtyDays += invoice.total;
      } else if (daysDue <= 60) {
        categories.sixtyDays += invoice.total;
      } else if (daysDue <= 90) {
        categories.ninetyDays += invoice.total;
      } else {
        categories.overNinetyDays += invoice.total;
      }
    }

    return {
      ...categories,
      total: Object.values(categories).reduce((sum, value) => sum + value, 0)
    };
  }

  async generateTaxReport(startDate: Date, endDate: Date): Promise<{
    taxableRevenue: number;
    taxableExpenses: number;
    taxLiability: number;
    startDate: Date;
    endDate: Date;
  }> {
    const revenue = await this.db.getTotalsByAccountType(AccountType.REVENUE);
    const expenses = await this.db.getTotalsByAccountType(AccountType.EXPENSE);
    const taxableIncome = revenue - expenses;
    const taxLiability = taxableIncome * 0.2; // Simplified tax calculation

    return {
      taxableRevenue: revenue,
      taxableExpenses: expenses,
      taxLiability,
      startDate,
      endDate
    };
  }

  private async calculateOperatingCashFlow(startDate: Date, endDate: Date): Promise<number> {
    // Get all transactions in the date range
    const transactions = await this.db.getTransactionsByDateRange(startDate, endDate);
    const invoices = await this.db.getInvoicesByDateRange(startDate, endDate);

    // Calculate cash inflows from completed payments
    const cashInflow = invoices.reduce((sum, invoice) => {
      const completedPayments = invoice.payments?.filter(p => p.status === PaymentStatus.COMPLETED) || [];
      return sum + completedPayments.reduce((pSum, payment) => pSum + payment.amount, 0);
    }, 0);

    // In a real implementation, we would also consider cash outflows from expenses
    return cashInflow;
  }
}
