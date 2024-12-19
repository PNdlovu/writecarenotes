import { prisma } from '@/lib/prisma';
import { Invoice, InvoiceItem, InvoiceStatus } from './types';
import { generateInvoiceNumber } from './utils';
import { TenantContext } from '@/lib/tenant/TenantContext';

export class InvoicingService {
  private tenantContext: TenantContext;

  constructor(tenantContext: TenantContext) {
    this.tenantContext = tenantContext;
  }

  async createInvoice(data: {
    residentId: string;
    items: Omit<InvoiceItem, 'id'>[];
    dueDate: Date;
    notes?: string;
  }): Promise<Invoice> {
    const { residentId, items, dueDate, notes } = data;

    // Calculate totals
    const subtotal = items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice), 0);
    const tax = items.reduce((sum, item) => 
      sum + (item.quantity * item.unitPrice * item.taxRate), 0);
    const total = subtotal + tax;

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber(this.tenantContext.id);

    // Create invoice and items in transaction
    const invoice = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          tenantId: this.tenantContext.id,
          residentId,
          number: invoiceNumber,
          date: new Date(),
          dueDate,
          subtotal,
          tax,
          total,
          status: InvoiceStatus.DRAFT,
          notes,
          items: {
            create: items.map(item => ({
              ...item,
              total: item.quantity * item.unitPrice * (1 + item.taxRate)
            }))
          }
        },
        include: {
          items: true
        }
      });

      return invoice;
    });

    return invoice;
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    return prisma.invoice.findFirst({
      where: {
        id,
        tenantId: this.tenantContext.id
      },
      include: {
        items: true
      }
    });
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const { items, ...updateData } = data;

    return prisma.$transaction(async (tx) => {
      // Update invoice
      const invoice = await tx.invoice.update({
        where: {
          id,
          tenantId: this.tenantContext.id
        },
        data: updateData,
        include: {
          items: true
        }
      });

      // Update items if provided
      if (items) {
        // Delete existing items
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: id }
        });

        // Create new items
        await tx.invoiceItem.createMany({
          data: items.map(item => ({
            ...item,
            invoiceId: id
          }))
        });
      }

      return invoice;
    });
  }

  async deleteInvoice(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Delete items first
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });

      // Delete invoice
      await tx.invoice.delete({
        where: {
          id,
          tenantId: this.tenantContext.id
        }
      });
    });
  }

  async listInvoices(params: {
    status?: InvoiceStatus;
    residentId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ invoices: Invoice[]; total: number }> {
    const { status, residentId, startDate, endDate, page = 1, limit = 10 } = params;

    const where = {
      tenantId: this.tenantContext.id,
      ...(status && { status }),
      ...(residentId && { residentId }),
      ...(startDate && endDate && {
        date: {
          gte: startDate,
          lte: endDate
        }
      })
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          items: true
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: {
          date: 'desc'
        }
      }),
      prisma.invoice.count({ where })
    ]);

    return { invoices, total };
  }

  async sendInvoice(id: string): Promise<Invoice> {
    // Update status and trigger email
    const invoice = await this.updateInvoice(id, {
      status: InvoiceStatus.SENT
    });

    // TODO: Implement email sending logic

    return invoice;
  }

  async markAsPaid(id: string): Promise<Invoice> {
    return this.updateInvoice(id, {
      status: InvoiceStatus.PAID
    });
  }

  async markAsOverdue(id: string): Promise<Invoice> {
    return this.updateInvoice(id, {
      status: InvoiceStatus.OVERDUE
    });
  }
}


