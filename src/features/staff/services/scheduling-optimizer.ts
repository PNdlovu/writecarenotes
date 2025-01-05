import { prisma } from '@/lib/prisma';
import { StaffMetricsService } from './monitoring-service';
import { CacheService } from './cache-service';
import { Staff, StaffSchedule } from '@prisma/client';

interface OptimizationConstraints {
  maxHoursPerWeek: number;
  minRestBetweenShifts: number;
  preferredShifts?: Record<string, string[]>;
  certificationRequirements?: Record<string, string[]>;
  timeOffRequests?: Array<{
    staffId: string;
    startTime: Date;
    endTime: Date;
  }>;
}

interface OptimizationResult {
  schedule: StaffSchedule[];
  score: number;
  conflicts: Array<{
    type: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
  }>;
  metrics: {
    utilizationRate: number;
    overtimeHours: number;
    unassignedShifts: number;
    certificationCompliance: number;
  };
}

export class SchedulingOptimizer {
  static async optimizeSchedule(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    constraints: OptimizationConstraints
  ): Promise<OptimizationResult> {
    const startTime = performance.now();
    
    try {
      // Get all required data
      const [staff, existingSchedules, timeOffRequests] = await Promise.all([
        this.getEligibleStaff(organizationId),
        this.getExistingSchedules(organizationId, startDate, endDate),
        this.getTimeOffRequests(organizationId, startDate, endDate),
      ]);

      // Initialize optimization parameters
      const schedule = [...existingSchedules];
      const unassignedShifts = schedule.filter(s => !s.staffId);
      
      // Sort unassigned shifts by priority and constraints
      unassignedShifts.sort((a, b) => {
        const aRequirements = constraints.certificationRequirements?.[a.shiftType] || [];
        const bRequirements = constraints.certificationRequirements?.[b.shiftType] || [];
        return bRequirements.length - aRequirements.length;
      });

      // Optimize each unassigned shift
      for (const shift of unassignedShifts) {
        const eligibleStaff = this.filterEligibleStaff(
          staff,
          shift,
          schedule,
          constraints,
          timeOffRequests
        );

        if (eligibleStaff.length > 0) {
          const bestStaff = this.selectBestStaff(
            eligibleStaff,
            shift,
            schedule,
            constraints
          );

          if (bestStaff) {
            shift.staffId = bestStaff.id;
            await this.updateSchedule(shift);
          }
        }
      }

      // Calculate optimization metrics
      const metrics = await this.calculateMetrics(
        organizationId,
        schedule,
        staff.length,
        constraints
      );

      // Identify any remaining conflicts
      const conflicts = await this.identifyConflicts(
        schedule,
        constraints,
        timeOffRequests
      );

      const result: OptimizationResult = {
        schedule,
        score: this.calculateOptimizationScore(metrics, conflicts),
        conflicts,
        metrics,
      };

      // Cache the optimization result
      await CacheService.set(
        `schedule:optimization:${organizationId}:${startDate.toISOString()}`,
        result,
        3600
      );

      // Track performance
      const duration = performance.now() - startTime;
      StaffMetricsService.trackPerformance('schedule_optimization', duration, {
        organizationId,
        shiftsCount: schedule.length,
        conflictsCount: conflicts.length,
      });

      return result;
    } catch (error) {
      StaffMetricsService.trackError(error as Error, {
        metadata: {
          organizationId,
          startDate,
          endDate,
          operation: 'schedule_optimization',
        },
      });
      throw error;
    }
  }

  private static async getEligibleStaff(
    organizationId: string
  ): Promise<Staff[]> {
    return prisma.staff.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
      include: {
        certifications: true,
        trainingRecords: true,
      },
    });
  }

  private static async getExistingSchedules(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StaffSchedule[]> {
    return prisma.staffSchedule.findMany({
      where: {
        organizationId,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
      },
    });
  }

  private static async getTimeOffRequests(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    return prisma.timeOffRequest.findMany({
      where: {
        organizationId,
        startTime: { gte: startDate },
        endTime: { lte: endDate },
        status: 'APPROVED',
      },
    });
  }

  private static filterEligibleStaff(
    staff: Staff[],
    shift: StaffSchedule,
    existingSchedules: StaffSchedule[],
    constraints: OptimizationConstraints,
    timeOffRequests: any[]
  ): Staff[] {
    return staff.filter(s => {
      // Check certifications
      const requiredCerts = constraints.certificationRequirements?.[shift.shiftType] || [];
      const hasCerts = requiredCerts.every(cert =>
        s.certifications.some(c => c.type === cert && c.isValid)
      );
      if (!hasCerts) return false;

      // Check time off requests
      const hasTimeOff = timeOffRequests.some(request =>
        request.staffId === s.id &&
        new Date(request.startTime) <= new Date(shift.endTime) &&
        new Date(request.endTime) >= new Date(shift.startTime)
      );
      if (hasTimeOff) return false;

      // Check rest between shifts
      const hasAdequateRest = this.checkRestBetweenShifts(
        s.id,
        shift,
        existingSchedules,
        constraints.minRestBetweenShifts
      );
      if (!hasAdequateRest) return false;

      // Check weekly hours
      const weeklyHours = this.calculateWeeklyHours(
        s.id,
        shift,
        existingSchedules
      );
      if (weeklyHours > constraints.maxHoursPerWeek) return false;

      return true;
    });
  }

  private static selectBestStaff(
    eligibleStaff: Staff[],
    shift: StaffSchedule,
    existingSchedules: StaffSchedule[],
    constraints: OptimizationConstraints
  ): Staff | null {
    return eligibleStaff.reduce((best, current) => {
      if (!best) return current;

      const currentScore = this.calculateStaffScore(
        current,
        shift,
        existingSchedules,
        constraints
      );
      const bestScore = this.calculateStaffScore(
        best,
        shift,
        existingSchedules,
        constraints
      );

      return currentScore > bestScore ? current : best;
    }, null as Staff | null);
  }

  private static calculateStaffScore(
    staff: Staff,
    shift: StaffSchedule,
    existingSchedules: StaffSchedule[],
    constraints: OptimizationConstraints
  ): number {
    let score = 0;

    // Preferred shift bonus
    if (constraints.preferredShifts?.[staff.id]?.includes(shift.shiftType)) {
      score += 10;
    }

    // Work distribution score
    const weeklyHours = this.calculateWeeklyHours(
      staff.id,
      shift,
      existingSchedules
    );
    score += (constraints.maxHoursPerWeek - weeklyHours) / 2;

    // Certification match score
    const requiredCerts = constraints.certificationRequirements?.[shift.shiftType] || [];
    const certScore = requiredCerts.reduce((sum, cert) => {
      return sum + (staff.certifications.some(c => c.type === cert) ? 5 : 0);
    }, 0);
    score += certScore;

    return score;
  }

  private static async updateSchedule(
    shift: StaffSchedule
  ): Promise<void> {
    await prisma.staffSchedule.update({
      where: { id: shift.id },
      data: { staffId: shift.staffId },
    });
  }

  private static checkRestBetweenShifts(
    staffId: string,
    newShift: StaffSchedule,
    existingSchedules: StaffSchedule[],
    minRest: number
  ): boolean {
    const staffSchedules = existingSchedules.filter(s => s.staffId === staffId);
    
    return !staffSchedules.some(schedule => {
      const gap = Math.abs(
        new Date(newShift.startTime).getTime() -
        new Date(schedule.endTime).getTime()
      ) / (60 * 60 * 1000); // Convert to hours
      
      return gap < minRest;
    });
  }

  private static calculateWeeklyHours(
    staffId: string,
    newShift: StaffSchedule,
    existingSchedules: StaffSchedule[]
  ): number {
    const weekStart = new Date(newShift.startTime);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weeklySchedules = existingSchedules.filter(s =>
      s.staffId === staffId &&
      new Date(s.startTime) >= weekStart &&
      new Date(s.endTime) <= weekEnd
    );

    const existingHours = weeklySchedules.reduce((sum, schedule) => {
      const duration = (new Date(schedule.endTime).getTime() -
        new Date(schedule.startTime).getTime()) / (60 * 60 * 1000);
      return sum + duration;
    }, 0);

    const newShiftHours = (new Date(newShift.endTime).getTime() -
      new Date(newShift.startTime).getTime()) / (60 * 60 * 1000);

    return existingHours + newShiftHours;
  }

  private static async calculateMetrics(
    organizationId: string,
    schedule: StaffSchedule[],
    totalStaff: number,
    constraints: OptimizationConstraints
  ) {
    const unassignedShifts = schedule.filter(s => !s.staffId).length;
    const totalShifts = schedule.length;

    const utilizationRate = ((totalShifts - unassignedShifts) / totalShifts) * 100;
    const overtimeHours = await this.calculateTotalOvertimeHours(
      organizationId,
      schedule,
      constraints.maxHoursPerWeek
    );

    return {
      utilizationRate,
      overtimeHours,
      unassignedShifts,
      certificationCompliance: await this.calculateCertificationCompliance(
        schedule,
        constraints.certificationRequirements || {}
      ),
    };
  }

  private static async calculateTotalOvertimeHours(
    organizationId: string,
    schedule: StaffSchedule[],
    maxHoursPerWeek: number
  ): Promise<number> {
    const staffHours: Record<string, number> = {};
    
    schedule.forEach(shift => {
      if (!shift.staffId) return;
      
      const hours = (new Date(shift.endTime).getTime() -
        new Date(shift.startTime).getTime()) / (60 * 60 * 1000);
      
      staffHours[shift.staffId] = (staffHours[shift.staffId] || 0) + hours;
    });

    return Object.values(staffHours).reduce((total, hours) => {
      return total + Math.max(0, hours - maxHoursPerWeek);
    }, 0);
  }

  private static async calculateCertificationCompliance(
    schedule: StaffSchedule[],
    requirements: Record<string, string[]>
  ): Promise<number> {
    const staffCertifications = await prisma.staffCertification.findMany({
      where: {
        staffId: { in: schedule.map(s => s.staffId).filter(Boolean) },
      },
    });

    let compliantShifts = 0;
    let totalShiftsWithRequirements = 0;

    schedule.forEach(shift => {
      const requiredCerts = requirements[shift.shiftType];
      if (!requiredCerts || !shift.staffId) return;

      totalShiftsWithRequirements++;
      const staffCerts = staffCertifications.filter(c => c.staffId === shift.staffId);
      
      if (requiredCerts.every(cert =>
        staffCerts.some(c => c.type === cert && c.isValid)
      )) {
        compliantShifts++;
      }
    });

    return totalShiftsWithRequirements > 0
      ? (compliantShifts / totalShiftsWithRequirements) * 100
      : 100;
  }

  private static identifyConflicts(
    schedule: StaffSchedule[],
    constraints: OptimizationConstraints,
    timeOffRequests: any[]
  ) {
    const conflicts: Array<{
      type: string;
      description: string;
      severity: 'high' | 'medium' | 'low';
    }> = [];

    // Check for overlapping shifts
    schedule.forEach(shift => {
      if (!shift.staffId) return;

      const overlapping = schedule.filter(s =>
        s.staffId === shift.staffId &&
        s.id !== shift.id &&
        new Date(s.startTime) < new Date(shift.endTime) &&
        new Date(s.endTime) > new Date(shift.startTime)
      );

      if (overlapping.length > 0) {
        conflicts.push({
          type: 'OVERLAP',
          description: `Staff ${shift.staffId} has overlapping shifts`,
          severity: 'high',
        });
      }
    });

    // Check for insufficient rest
    schedule.forEach(shift => {
      if (!shift.staffId) return;

      const insufficientRest = !this.checkRestBetweenShifts(
        shift.staffId,
        shift,
        schedule,
        constraints.minRestBetweenShifts
      );

      if (insufficientRest) {
        conflicts.push({
          type: 'INSUFFICIENT_REST',
          description: `Staff ${shift.staffId} has insufficient rest between shifts`,
          severity: 'medium',
        });
      }
    });

    // Check for time off conflicts
    schedule.forEach(shift => {
      if (!shift.staffId) return;

      const timeOffConflict = timeOffRequests.some(request =>
        request.staffId === shift.staffId &&
        new Date(request.startTime) <= new Date(shift.endTime) &&
        new Date(request.endTime) >= new Date(shift.startTime)
      );

      if (timeOffConflict) {
        conflicts.push({
          type: 'TIME_OFF_CONFLICT',
          description: `Staff ${shift.staffId} is scheduled during approved time off`,
          severity: 'high',
        });
      }
    });

    return conflicts;
  }

  private static calculateOptimizationScore(
    metrics: OptimizationResult['metrics'],
    conflicts: OptimizationResult['conflicts']
  ): number {
    let score = 100;

    // Deduct points for unassigned shifts
    score -= (metrics.unassignedShifts * 5);

    // Deduct points for overtime hours
    score -= (metrics.overtimeHours * 2);

    // Add points for high utilization
    score += (metrics.utilizationRate - 80) / 2;

    // Add points for certification compliance
    score += (metrics.certificationCompliance - 90) / 2;

    // Deduct points for conflicts
    conflicts.forEach(conflict => {
      switch (conflict.severity) {
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });

    return Math.max(0, Math.min(100, score));
  }
}


