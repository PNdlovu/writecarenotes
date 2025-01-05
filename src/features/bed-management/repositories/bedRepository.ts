/**
 * @fileoverview Bed Management Repository
 * @version 1.0.0
 */

import { prisma } from '@/lib/prisma';
import type { 
  Bed, 
  BedStatus, 
  BedFilters,
  BedTransfer,
  BedAssignment 
} from '@/features/bed-management/types/bed.types';

export class BedRepository {
  async createBed(data: Omit<Bed, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bed> {
    return await prisma.bed.create({
      data: {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }

  async getBed(id: string): Promise<Bed | null> {
    return await prisma.bed.findUnique({
      where: { id },
      include: {
        currentAssignment: true,
        transfers: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  }

  async updateBed(id: string, data: Partial<Bed>): Promise<Bed> {
    return await prisma.bed.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date().toISOString()
      },
      include: {
        currentAssignment: true,
        transfers: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });
  }

  async deleteBed(id: string): Promise<void> {
    await prisma.bed.delete({ where: { id } });
  }

  async getBedsByUnit(unitId: string, filters?: BedFilters): Promise<Bed[]> {
    const where: any = { unitId };

    if (filters) {
      if (filters.status) where.status = filters.status;
      if (filters.type) where.type = filters.type;
      if (filters.floor) where.floor = filters.floor;
      if (filters.isAvailable !== undefined) where.isAvailable = filters.isAvailable;
      if (filters.searchTerm) {
        where.OR = [
          { name: { contains: filters.searchTerm, mode: 'insensitive' } },
          { notes: { contains: filters.searchTerm, mode: 'insensitive' } }
        ];
      }
    }

    return await prisma.bed.findMany({
      where,
      include: {
        currentAssignment: true,
        transfers: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async updateBedStatus(id: string, status: BedStatus): Promise<Bed> {
    return await prisma.bed.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date().toISOString()
      }
    });
  }

  async assignBed(assignment: Omit<BedAssignment, 'id' | 'createdAt'>): Promise<BedAssignment> {
    return await prisma.bedAssignment.create({
      data: {
        ...assignment,
        createdAt: new Date().toISOString()
      }
    });
  }

  async transferBed(transfer: Omit<BedTransfer, 'id' | 'createdAt'>): Promise<BedTransfer> {
    return await prisma.bedTransfer.create({
      data: {
        ...transfer,
        createdAt: new Date().toISOString()
      }
    });
  }
}
