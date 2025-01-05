import { prisma } from '@/lib/db';
import { Payroll, PayrollStatus } from '../types';
import { Prisma } from '@prisma/client';

export class PayrollRepository {
  async create(data: Omit<Payroll, 'id' | 'createdAt' | 'updatedAt'>) {
    return prisma.payroll.create({
      data: {
        ...data,
        status: PayrollStatus.DRAFT
      }
    });
  }

  async update(id: string, data: Partial<Payroll>) {
    return prisma.payroll.update({
      where: { id },
      data
    });
  }

  async getById(id: string) {
    return prisma.payroll.findUnique({
      where: { id }
    });
  }

  async getByEmployeeId(employeeId: string, period?: { startDate: Date; endDate: Date }) {
    const where: Prisma.PayrollWhereInput = { employeeId };
    if (period) {
      where.startDate = { gte: period.startDate };
      where.endDate = { lte: period.endDate };
    }
    return prisma.payroll.findMany({ where });
  }

  async getByOrganizationId(organizationId: string, period?: { startDate: Date; endDate: Date }) {
    const where: Prisma.PayrollWhereInput = { organizationId };
    if (period) {
      where.startDate = { gte: period.startDate };
      where.endDate = { lte: period.endDate };
    }
    return prisma.payroll.findMany({ where });
  }

  async updateStatus(id: string, status: PayrollStatus, processedBy?: string) {
    return prisma.payroll.update({
      where: { id },
      data: {
        status,
        ...(status === PayrollStatus.PROCESSED ? {
          processedAt: new Date(),
          processedBy
        } : {})
      }
    });
  }
}


