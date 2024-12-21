/**
 * @fileoverview Waitlist Repository for Bed Management
 * @version 1.0.0
 */

import { prisma } from '@/lib/prisma';
import type { 
  WaitlistEntry, 
  WaitlistStatus,
  WaitlistFilters 
} from '@/features/bed-management/types/waitlist.types';

export class WaitlistRepository {
  async createEntry(data: Omit<WaitlistEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<WaitlistEntry> {
    return await prisma.waitlistEntry.create({
      data: {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }

  async getEntry(id: string): Promise<WaitlistEntry | null> {
    return await prisma.waitlistEntry.findUnique({
      where: { id },
      include: {
        resident: true,
        requestedUnit: true
      }
    });
  }

  async updateEntry(id: string, data: Partial<WaitlistEntry>): Promise<WaitlistEntry> {
    return await prisma.waitlistEntry.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date().toISOString()
      },
      include: {
        resident: true,
        requestedUnit: true
      }
    });
  }

  async deleteEntry(id: string): Promise<void> {
    await prisma.waitlistEntry.delete({ where: { id } });
  }

  async getWaitlist(filters?: WaitlistFilters): Promise<WaitlistEntry[]> {
    const where: any = {};

    if (filters) {
      if (filters.status) where.status = filters.status;
      if (filters.priority) where.priority = filters.priority;
      if (filters.unitId) where.requestedUnitId = filters.unitId;
      if (filters.searchTerm) {
        where.OR = [
          { resident: { 
            OR: [
              { firstName: { contains: filters.searchTerm, mode: 'insensitive' } },
              { lastName: { contains: filters.searchTerm, mode: 'insensitive' } }
            ]
          }},
          { notes: { contains: filters.searchTerm, mode: 'insensitive' } }
        ];
      }
    }

    return await prisma.waitlistEntry.findMany({
      where,
      include: {
        resident: true,
        requestedUnit: true
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ]
    });
  }

  async updateStatus(id: string, status: WaitlistStatus): Promise<WaitlistEntry> {
    return await prisma.waitlistEntry.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date().toISOString()
      }
    });
  }

  async getWaitlistStats(unitId?: string): Promise<{ [key in WaitlistStatus]: number }> {
    const where = unitId ? { requestedUnitId: unitId } : {};
    const entries = await prisma.waitlistEntry.groupBy({
      by: ['status'],
      where,
      _count: true
    });

    return entries.reduce((acc, curr) => ({
      ...acc,
      [curr.status]: curr._count
    }), {} as { [key in WaitlistStatus]: number });
  }
}
