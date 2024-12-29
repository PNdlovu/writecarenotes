/**
 * @fileoverview Bed management service for managing bed allocations and analytics
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/cache';

export interface Bed {
  id: string;
  number: string;
  wing: string;
  floor: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  residentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BedAllocation {
  id: string;
  bedId: string;
  residentId: string;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const bedManagementService = {
  async getBeds(): Promise<Bed[]> {
    const cachedBeds = cache.get<Bed[]>('beds');
    if (cachedBeds) return cachedBeds;

    const beds = await prisma.bed.findMany({
      orderBy: { number: 'asc' }
    });

    cache.set('beds', beds);
    return beds as Bed[];
  },

  async getBedById(id: string): Promise<Bed | null> {
    const bed = await prisma.bed.findUnique({
      where: { id }
    });

    return bed as Bed | null;
  },

  async allocateBed(bedId: string, residentId: string): Promise<BedAllocation> {
    const allocation = await prisma.bedAllocation.create({
      data: {
        bedId,
        residentId,
        startDate: new Date()
      }
    });

    await prisma.bed.update({
      where: { id: bedId },
      data: { 
        status: 'occupied',
        residentId
      }
    });

    cache.delete('beds');
    return allocation as BedAllocation;
  },

  async deallocateBed(allocationId: string): Promise<void> {
    const allocation = await prisma.bedAllocation.update({
      where: { id: allocationId },
      data: { endDate: new Date() }
    });

    await prisma.bed.update({
      where: { id: allocation.bedId },
      data: { 
        status: 'available',
        residentId: null
      }
    });

    cache.delete('beds');
  },

  async getOccupancyRate(): Promise<number> {
    const cachedRate = cache.get<number>('occupancy-rate');
    if (cachedRate !== null) return cachedRate;

    const [totalBeds, occupiedBeds] = await Promise.all([
      prisma.bed.count(),
      prisma.bed.count({
        where: { status: 'occupied' }
      })
    ]);

    const rate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;
    cache.set('occupancy-rate', rate, 5 * 60 * 1000); // 5 minutes
    return rate;
  }
};


