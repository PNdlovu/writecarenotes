// src/features/medications/database/marRepository.ts

import { prisma } from '@/lib/prisma';
import { 
  MAR,
  MAREntry,
  MedicationSchedule,
  Prisma
} from '@prisma/client';

export class MARRepository {
  async createMAR(data: Prisma.MARCreateInput): Promise<MAR> {
    return prisma.mAR.create({
      data,
      include: {
        resident: true,
        medication: true,
        schedule: true,
        entries: true,
      },
    });
  }

  async getMARById(id: string): Promise<MAR | null> {
    return prisma.mAR.findUnique({
      where: { id },
      include: {
        resident: true,
        medication: true,
        schedule: true,
        entries: true,
      },
    });
  }

  async getMARsByResidentId(residentId: string): Promise<MAR[]> {
    return prisma.mAR.findMany({
      where: { residentId },
      include: {
        medication: true,
        schedule: true,
        entries: {
          orderBy: { scheduledTime: 'desc' },
        },
      },
    });
  }

  async createMAREntry(data: Prisma.MAREntryCreateInput): Promise<MAREntry> {
    return prisma.mAREntry.create({
      data,
    });
  }

  async updateMAREntry(
    id: string,
    data: Prisma.MAREntryUpdateInput
  ): Promise<MAREntry> {
    return prisma.mAREntry.update({
      where: { id },
      data,
    });
  }

  async createSchedule(
    data: Prisma.MedicationScheduleCreateInput
  ): Promise<MedicationSchedule> {
    return prisma.medicationSchedule.create({
      data,
    });
  }

  async getEntriesByDateRange(
    marId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MAREntry[]> {
    return prisma.mAREntry.findMany({
      where: {
        marId,
        scheduledTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        scheduledTime: 'asc',
      },
    });
  }

  async updateMARStatus(
    id: string,
    status: string,
    endDate?: Date
  ): Promise<MAR> {
    return prisma.mAR.update({
      where: { id },
      data: {
        status,
        endDate,
      },
    });
  }
}


