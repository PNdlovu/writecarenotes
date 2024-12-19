import { PrismaClient } from '@prisma/client';
import { 
  Account, 
  AccountType,
  Transaction,
  TransactionType,
  Invoice,
  InvoiceStatus,
  InvoiceItem,
  Payment,
  PaymentMethod,
  PaymentStatus,
  FinancialSettings
} from '../types';

export class FinancialDB {
  constructor(private prisma: PrismaClient, private tenantId: string) {}

  // Account Management
  async createAccount(data: Omit<Account, 'id' | 'balance' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    return this.prisma.account.create({
      data: {
        ...data,
        balance: 0,
        tenant: { connect: { id: this.tenantId } }
      }
    });
  }

  async getAccount(id: string): Promise<Account | null> {
    return this.prisma.account.findUnique({
      where: { id, tenantId: this.tenantId }
    });
  }

  async updateAccount(id: string, data: Partial<Account>): Promise<Account> {
    return this.prisma.account.update({
      where: { id, tenantId: this.tenantId },
      data
    });
  }

  async deleteAccount(id: string): Promise<void> {
    await this.prisma.account.delete({
      where: { id, tenantId: this.tenantId }
    });
  }

  async getAccountsByType(type: AccountType): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: { type, tenantId: this.tenantId }
    });
  }

  async getAccountHierarchy(): Promise<Account[]> {
    return this.prisma.account.findMany({
      where: { 
        tenantId: this.tenantId,
        parentId: null
      },
      include: {
        children: {
          include: {
            children: true
          }
        }
      }
    });
  }

  // Transaction Management
  async createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
    return this.prisma.transaction.create({
      data: {
        ...data,
        tenant: { connect: { id: this.tenantId } }
      }
    });
  }

  // Invoice Management
  async createInvoice(data: Omit<Invoice, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    return this.prisma.invoice.create({
      data: {
        ...data,
        status: InvoiceStatus.DRAFT,
        tenant: { connect: { id: this.tenantId } }
      },
      include: {
        items: true
      }
    });
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    return this.prisma.invoice.findUnique({
      where: { id, tenantId: this.tenantId },
      include: {
        items: true,
        payments: true
      }
    });
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return this.prisma.invoice.update({
      where: { id, tenantId: this.tenantId },
      data,
      include: {
        items: true
      }
    });
  }

  async deleteInvoice(id: string): Promise<void> {
    await this.prisma.invoice.delete({
      where: { id, tenantId: this.tenantId }
    });
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({
      where: {
        tenantId: this.tenantId,
        status: InvoiceStatus.SENT,
        dueDate: {
          lt: new Date()
        }
      },
      include: {
        items: true,
        payments: true
      }
    });
  }

  // Payment Management
  async createPayment(data: Omit<Payment, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    return this.prisma.payment.create({
      data: {
        ...data,
        status: PaymentStatus.PENDING,
        tenant: { connect: { id: this.tenantId } }
      }
    });
  }

  async getPayment(id: string): Promise<Payment | null> {
    return this.prisma.payment.findUnique({
      where: { id, tenantId: this.tenantId }
    });
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    return this.prisma.payment.update({
      where: { id, tenantId: this.tenantId },
      data
    });
  }

  async getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: { status, tenantId: this.tenantId }
    });
  }

  // Settings Management
  async getSettings(): Promise<FinancialSettings | null> {
    return this.prisma.financialSettings.findUnique({
      where: { tenantId: this.tenantId }
    });
  }

  async updateSettings(data: Partial<FinancialSettings>): Promise<FinancialSettings> {
    return this.prisma.financialSettings.upsert({
      where: { tenantId: this.tenantId },
      update: data,
      create: {
        ...data,
        tenant: { connect: { id: this.tenantId } }
      }
    });
  }

  // Reporting Queries
  async getTotalsByAccountType(type: AccountType): Promise<number> {
    const result = await this.prisma.account.aggregate({
      where: { type, tenantId: this.tenantId },
      _sum: {
        balance: true
      }
    });
    return Number(result._sum.balance || 0);
  }

  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: {
        tenantId: this.tenantId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });
  }

  async getInvoicesByDateRange(startDate: Date, endDate: Date): Promise<Invoice[]> {
    return this.prisma.invoice.findMany({
      where: {
        tenantId: this.tenantId,
        issueDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        items: true,
        payments: true
      }
    });
  }
}
