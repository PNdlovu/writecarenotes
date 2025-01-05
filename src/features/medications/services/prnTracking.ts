/**
 * @fileoverview PRN Medication Tracking Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';
import { addToSyncQueue } from '@/lib/sync';

interface PRNAdministration {
  id: string;
  medicationId: string;
  careHomeId: string;
  residentId: string;
  administeredBy: string;
  administeredTime: string;
  reason: string;
  symptoms: string[];
  dosage: string;
  route: string;
  effectiveness: {
    rating: 1 | 2 | 3 | 4 | 5;
    notes: string;
    assessedAt: string;
    assessedBy: string;
  };
}

interface PRNPattern {
  id: string;
  medicationId: string;
  residentId: string;
  period: '24H' | '7D' | '30D';
  frequency: number;
  commonReasons: { reason: string; count: number }[];
  effectivenessStats: {
    averageRating: number;
    ratingDistribution: Record<number, number>;
  };
  timePatterns: {
    timeOfDay: Record<string, number>;
    dayOfWeek: Record<string, number>;
  };
  lastUpdated: string;
}

export class PRNTrackingService {
  async recordAdministration(
    careHomeId: string,
    data: Partial<PRNAdministration>
  ): Promise<PRNAdministration> {
    try {
      const administration = await db.prnAdministration.create({
        data: {
          ...data,
          id: uuidv4(),
          careHomeId,
          administeredTime: new Date().toISOString(),
        },
      });

      // Add to sync queue
      await addToSyncQueue({
        id: uuidv4(),
        type: 'CREATE',
        entityType: 'prnAdministration',
        data: administration,
        status: 'PENDING',
        retryCount: 0,
        timestamp: new Date().toISOString(),
      });

      // Update patterns
      await this.updatePatternAnalysis(
        careHomeId,
        data.medicationId!,
        data.residentId!
      );

      return administration;
    } catch (error) {
      throw new Error('Failed to record PRN administration: ' + error.message);
    }
  }

  async recordEffectiveness(
    administrationId: string,
    data: PRNAdministration['effectiveness']
  ): Promise<PRNAdministration> {
    try {
      const administration = await db.prnAdministration.update({
        where: { id: administrationId },
        data: {
          effectiveness: {
            ...data,
            assessedAt: new Date().toISOString(),
          },
        },
      });

      // Update patterns after effectiveness recording
      await this.updatePatternAnalysis(
        administration.careHomeId,
        administration.medicationId,
        administration.residentId
      );

      return administration;
    } catch (error) {
      throw new Error('Failed to record effectiveness: ' + error.message);
    }
  }

  private async updatePatternAnalysis(
    careHomeId: string,
    medicationId: string,
    residentId: string
  ): Promise<void> {
    try {
      const periods: Array<{ name: '24H' | '7D' | '30D'; days: number }> = [
        { name: '24H', days: 1 },
        { name: '7D', days: 7 },
        { name: '30D', days: 30 },
      ];

      for (const period of periods) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - period.days);

        // Get administrations for the period
        const administrations = await db.prnAdministration.findMany({
          where: {
            careHomeId,
            medicationId,
            residentId,
            administeredTime: {
              gte: startDate.toISOString(),
            },
          },
          orderBy: {
            administeredTime: 'asc',
          },
        });

        // Calculate patterns
        const pattern = this.calculatePattern(administrations, period.name);

        // Update or create pattern record
        await db.prnPattern.upsert({
          where: {
            medicationId_residentId_period: {
              medicationId,
              residentId,
              period: period.name,
            },
          },
          create: {
            id: uuidv4(),
            medicationId,
            residentId,
            period: period.name,
            ...pattern,
            lastUpdated: new Date().toISOString(),
          },
          update: {
            ...pattern,
            lastUpdated: new Date().toISOString(),
          },
        });
      }
    } catch (error) {
      throw new Error('Failed to update pattern analysis: ' + error.message);
    }
  }

  private calculatePattern(
    administrations: PRNAdministration[],
    period: PRNPattern['period']
  ): Partial<PRNPattern> {
    // Initialize counters
    const reasonCounts: Record<string, number> = {};
    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const timeOfDay: Record<string, number> = {};
    const dayOfWeek: Record<string, number> = {};
    let totalRating = 0;
    let ratedCount = 0;

    // Process each administration
    for (const admin of administrations) {
      // Count reasons
      reasonCounts[admin.reason] = (reasonCounts[admin.reason] || 0) + 1;

      // Process effectiveness
      if (admin.effectiveness?.rating) {
        ratingDistribution[admin.effectiveness.rating]++;
        totalRating += admin.effectiveness.rating;
        ratedCount++;
      }

      // Time patterns
      const date = new Date(admin.administeredTime);
      const hour = date.getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      timeOfDay[timeSlot] = (timeOfDay[timeSlot] || 0) + 1;

      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      dayOfWeek[day] = (dayOfWeek[day] || 0) + 1;
    }

    // Sort and format common reasons
    const commonReasons = Object.entries(reasonCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([reason, count]) => ({ reason, count }));

    return {
      frequency: administrations.length,
      commonReasons,
      effectivenessStats: {
        averageRating: ratedCount > 0 ? totalRating / ratedCount : 0,
        ratingDistribution,
      },
      timePatterns: {
        timeOfDay,
        dayOfWeek,
      },
    };
  }

  async getPatternAnalysis(
    careHomeId: string,
    medicationId: string,
    residentId: string,
    period: PRNPattern['period']
  ): Promise<PRNPattern | null> {
    try {
      return await db.prnPattern.findUnique({
        where: {
          medicationId_residentId_period: {
            medicationId,
            residentId,
            period,
          },
        },
      });
    } catch (error) {
      throw new Error('Failed to get pattern analysis: ' + error.message);
    }
  }

  async getAdministrationHistory(
    careHomeId: string,
    filters: {
      medicationId?: string;
      residentId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<PRNAdministration[]> {
    try {
      const where: any = { careHomeId };

      if (filters.medicationId) where.medicationId = filters.medicationId;
      if (filters.residentId) where.residentId = filters.residentId;
      if (filters.startDate || filters.endDate) {
        where.administeredTime = {};
        if (filters.startDate) where.administeredTime.gte = filters.startDate;
        if (filters.endDate) where.administeredTime.lte = filters.endDate;
      }

      return await db.prnAdministration.findMany({
        where,
        orderBy: {
          administeredTime: 'desc',
        },
        include: {
          medication: {
            select: {
              name: true,
              type: true,
            },
          },
          resident: {
            select: {
              firstName: true,
              lastName: true,
              roomNumber: true,
            },
          },
        },
      });
    } catch (error) {
      throw new Error('Failed to get administration history: ' + error.message);
    }
  }
} 


