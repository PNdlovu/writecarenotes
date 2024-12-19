import { Invoice, InvoiceItem, InvoiceStatus, Payment, PaymentStatus } from '../types';
import { getRegionalConfig } from '../config/regions';
import { FinancialDB } from '../db';

export class InvoiceService {
  constructor(
    private db: FinancialDB,
    private region: string
  ) {}

  async createInvoice(data: Omit<Invoice, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    return this.db.createInvoice(data);
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    return this.db.getInvoice(id);
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return this.db.updateInvoice(id, data);
  }

  async deleteInvoice(id: string): Promise<void> {
    const invoice = await this.getInvoice(id);
    if (!invoice) {
      throw new Error(`Invoice not found: ${id}`);
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error(`Can only delete draft invoices: ${id}`);
    }

    await this.db.deleteInvoice(id);
  }

  async sendInvoice(id: string): Promise<Invoice> {
    const invoice = await this.getInvoice(id);
    if (!invoice) {
      throw new Error(`Invoice not found: ${id}`);
    }

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new Error(`Can only send draft invoices: ${id}`);
    }

    return this.updateInvoice(id, { status: InvoiceStatus.SENT });
  }

  async recordPayment(payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const invoice = await this.getInvoice(payment.invoiceId);
    if (!invoice) {
      throw new Error(`Invoice not found: ${payment.invoiceId}`);
    }

    // Create the payment record
    const newPayment = await this.db.createPayment(payment);

    // Update invoice status if fully paid
    const payments = await this.getInvoicePayments(invoice.id);
    const totalPaid = payments.reduce((sum, p) => 
      sum + (p.status === PaymentStatus.COMPLETED ? p.amount : 0), 0);
    
    if (totalPaid >= invoice.total) {
      await this.updateInvoice(invoice.id, { status: InvoiceStatus.PAID });
    }

    return newPayment;
  }

  async getInvoicePayments(invoiceId: string): Promise<Payment[]> {
    const invoice = await this.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error(`Invoice not found: ${invoiceId}`);
    }

    return invoice.payments || [];
  }

  async calculateTotals(items: InvoiceItem[]): Promise<{ subtotal: number; tax: number; total: number }> {
    const config = getRegionalConfig(this.region);
    
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = items.reduce((sum, item) => sum + item.tax, 0);
    
    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  }

  async checkOverdueInvoices(): Promise<Invoice[]> {
    return this.db.getOverdueInvoices();
  }
}
