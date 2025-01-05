import { prisma } from '@/lib/prisma';
import { CacheService } from './cache-service';
import { StaffMetricsService } from './monitoring-service';

interface SchedulingAnalytics {
  totalShifts: number;
  unassignedShifts: number;
  conflictCount: number;
  staffUtilization: Record<string, number>;
  shiftDistribution: Record<string, number>;
  overtimeHours: number;
}

interface StaffAnalytics {
  totalStaff: number;
  activeStaff: number;
  certificationDistribution: Record<string, number>;
  averageHoursPerWeek: number;
  trainingCompletion: number;
}

export class AnalyticsService {
  static async getSchedulingAnalytics(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<SchedulingAnalytics> {
    const cacheKey = `analytics:scheduling:${organizationId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    
    try {
      // Try to get from cache
      const cachedData = await CacheService.get<SchedulingAnalytics>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const [schedules, staffUtilization] = await Promise.all([
        prisma.staffSchedule.findMany({
          where: {
            organizationId,
            startTime: { gte: startDate },
            endTime: { lte: endDate },
          },
          include: {
            staff: true,
          },
        }),
        this.calculateStaffUtilization(organizationId, startDate, endDate),
      ]);

      const analytics: SchedulingAnalytics = {
        totalShifts: schedules.length,
        unassignedShifts: schedules.filter(s => !s.staffId).length,
        conflictCount: await this.calculateScheduleConflicts(schedules),
        staffUtilization,
        shiftDistribution: this.calculateShiftDistribution(schedules),
        overtimeHours: await this.calculateOvertimeHours(organizationId, startDate, endDate),
      };

      // Cache the results
      await CacheService.set(cacheKey, analytics, 3600); // Cache for 1 hour

      // Track metrics
      StaffMetricsService.trackSchedulingMetrics({
        totalShifts: analytics.totalShifts,
        unassignedShifts: analytics.unassignedShifts,
        conflictCount: analytics.conflictCount,
        organizationId,
      });

      return analytics;
    } catch (error) {
      StaffMetricsService.trackError(error as Error, {
        metadata: { organizationId, startDate, endDate },
      });
      throw error;
    }
  }

  static async getStaffAnalytics(
    organizationId: string
  ): Promise<StaffAnalytics> {
    const cacheKey = `analytics:staff:${organizationId}`;

    try {
      // Try to get from cache
      const cachedData = await CacheService.get<StaffAnalytics>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const [staffMembers, trainingRecords] = await Promise.all([
        prisma.staff.findMany({
          where: { organizationId },
          include: {
            certifications: true,
            trainingRecords: true,
          },
        }),
        prisma.trainingRecord.groupBy({
          by: ['status'],
          where: { staff: { organizationId } },
          _count: true,
        }),
      ]);

      const analytics: StaffAnalytics = {
        totalStaff: staffMembers.length,
        activeStaff: staffMembers.filter(s => s.status === 'ACTIVE').length,
        certificationDistribution: this.calculateCertificationDistribution(staffMembers),
        averageHoursPerWeek: await this.calculateAverageHours(organizationId),
        trainingCompletion: this.calculateTrainingCompletion(trainingRecords),
      };

      // Cache the results
      await CacheService.set(cacheKey, analytics, 3600); // Cache for 1 hour

      return analytics;
    } catch (error) {
      StaffMetricsService.trackError(error as Error, {
        metadata: { organizationId },
      });
      throw error;
    }
  }

  private static async calculateStaffUtilization(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, number>> {
    const schedules = await prisma.staffSchedule.groupBy({
      by: ['staffId'],
      where: {
        organizationId,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      _count: true,
    });

    return schedules.reduce((acc, curr) => {
      if (curr.staffId) {
        acc[curr.staffId] = curr._count;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  private static calculateShiftDistribution(
    schedules: any[]
  ): Record<string, number> {
    return schedules.reduce((acc, schedule) => {
      const shift = schedule.shiftType;
      acc[shift] = (acc[shift] || 0) + 1;
      return acc;
    }, {});
  }

  private static async calculateScheduleConflicts(
    schedules: any[]
  ): Promise<number> {
    let conflicts = 0;
    for (const schedule of schedules) {
      if (!schedule.staffId) continue;

      const overlapping = schedules.filter(s =>
        s.staffId === schedule.staffId &&
        s.id !== schedule.id &&
        new Date(s.startTime) < new Date(schedule.endTime) &&
        new Date(s.endTime) > new Date(schedule.startTime)
      );

      conflicts += overlapping.length;
    }
    return conflicts / 2; // Divide by 2 as each conflict is counted twice
  }

  private static async calculateOvertimeHours(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const schedules = await prisma.staffSchedule.groupBy({
      by: ['staffId'],
      where: {
        organizationId,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
      _sum: {
        duration: true,
      },
    });

    return schedules.reduce((total, curr) => {
      const hours = (curr._sum.duration || 0) / 60; // Convert minutes to hours
      return total + Math.max(0, hours - 40); // Assuming 40-hour work week
    }, 0);
  }

  private static calculateCertificationDistribution(
    staffMembers: any[]
  ): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    staffMembers.forEach(staff => {
      staff.certifications.forEach((cert: any) => {
        distribution[cert.type] = (distribution[cert.type] || 0) + 1;
      });
    });

    return distribution;
  }

  private static calculateTrainingCompletion(
    trainingRecords: any[]
  ): number {
    const completed = trainingRecords.find(r => r.status === 'COMPLETED')?._count || 0;
    const total = trainingRecords.reduce((sum, r) => sum + r._count, 0);
    return total > 0 ? (completed / total) * 100 : 0;
  }

  private static async calculateAverageHours(
    organizationId: string
  ): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const schedules = await prisma.staffSchedule.groupBy({
      by: ['staffId'],
      where: {
        organizationId,
        startTime: { gte: oneWeekAgo },
      },
      _sum: {
        duration: true,
      },
    });

    const totalHours = schedules.reduce((sum, curr) => {
      return sum + ((curr._sum.duration || 0) / 60); // Convert minutes to hours
    }, 0);

    return schedules.length > 0 ? totalHours / schedules.length : 0;
  }
}


