import { prisma } from '@/lib/prisma';
import type { 
  MedicationWithResident,
  MedicationFormData 
} from '@/types/medication';
import { MedicationStatus } from '@prisma/client';
import { format } from 'date-fns';
import { z } from 'zod';

const medicationSchema = z.object({
  residentId: z.string(),
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  startDate: z.string(),
  endDate: z.string().optional(),
  route: z.string().min(1, 'Route is required'),
  instructions: z.string().optional(),
  prescribedBy: z.string().min(1, 'Prescriber is required'),
  reorderLevel: z.number().int().min(0),
  currentStock: z.number().int().min(0),
  notes: z.string().optional(),
  batchNumber: z.string().min(1, 'Batch number is required'),
  expiryDate: z.string(),
  supplierName: z.string().min(1, 'Supplier name is required'),
  isControlledDrug: z.boolean(),
  controlledDrugCategory: z.enum(['CD2', 'CD3', 'CD4', 'CD5']).optional(),
  requiresWitness: z.boolean(),
  requiresSecondCheck: z.boolean(),
  requiresLiquidMeasurement: z.boolean(),
});

export class MedicationService {
  async getMedications(organizationId: string): Promise<MedicationWithResident[]> {
    return prisma.medication.findMany({
      where: { organizationId },
      include: {
        resident: {
          select: {
            firstName: true,
            lastName: true,
            roomNumber: true,
          },
        },
      },
    });
  }

  async getMedicationsByResident(residentId: string): Promise<MedicationWithResident[]> {
    return prisma.medication.findMany({
      where: { residentId },
      include: {
        resident: {
          select: {
            firstName: true,
            lastName: true,
            roomNumber: true,
          },
        },
      },
    });
  }

  async createMedication(data: MedicationFormData & { organizationId: string }) {
    const validation = medicationSchema.safeParse(data);
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }

    return prisma.medication.create({
      data: {
        ...data,
        status: MedicationStatus.ACTIVE,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async updateMedication(
    id: string,
    data: Partial<MedicationFormData>
  ) {
    const validation = medicationSchema.partial().safeParse(data);
    if (!validation.success) {
      throw new Error(validation.error.errors[0].message);
    }

    return prisma.medication.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        updatedAt: new Date(),
      },
    });
  }

  async discontinueMedication(id: string, reason: string) {
    return prisma.medication.update({
      where: { id },
      data: {
        status: MedicationStatus.DISCONTINUED,
        endDate: new Date(),
        notes: reason,
        updatedAt: new Date(),
      },
    });
  }

  async getMedicationStats(organizationId: string) {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const [totalActive, dueToday, administered, stockAlerts] = await Promise.all([
      // Total active medications
      prisma.medication.count({
        where: {
          organizationId,
          status: MedicationStatus.ACTIVE,
        },
      }),

      // Medications due today
      prisma.medication.count({
        where: {
          organizationId,
          status: MedicationStatus.ACTIVE,
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      }),

      // Medications administered today
      prisma.medicationAdministration.count({
        where: {
          medication: { organizationId },
          administeredAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),

      // Stock alerts
      prisma.medication.count({
        where: {
          organizationId,
          status: MedicationStatus.ACTIVE,
          currentStock: {
            lte: prisma.medication.fields.reorderLevel,
          },
        },
      }),
    ]);

    return {
      totalActive,
      dueToday,
      administered,
      stockAlerts,
    };
  }

  async getStockLevels(organizationId: string) {
    return prisma.medication.findMany({
      where: {
        organizationId,
        status: MedicationStatus.ACTIVE,
      },
      select: {
        id: true,
        name: true,
        currentStock: true,
        reorderLevel: true,
        batchNumber: true,
        expiryDate: true,
        supplierName: true,
      },
      orderBy: [
        {
          currentStock: 'asc',
        },
      ],
    });
  }

  async updateStock(
    id: string,
    quantity: number,
    type: 'RECEIVED' | 'DISPOSED' | 'RETURNED' | 'ADJUSTMENT',
    reason: string,
    staffId: string,
    witnessId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      // Update medication stock
      const medication = await tx.medication.update({
        where: { id },
        data: {
          currentStock: {
            increment: quantity,
          },
          updatedAt: new Date(),
        },
      });

      // Record stock adjustment
      await tx.stockAdjustment.create({
        data: {
          medicationId: id,
          quantity,
          type,
          reason,
          staffId,
          witnessId,
          date: new Date(),
        },
      });

      return medication;
    });
  }
}

// Create a singleton instance
export const medicationService = new MedicationService();


