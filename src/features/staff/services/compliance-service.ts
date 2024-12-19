import { prisma } from '@/lib/prisma';
import { MonitoringService } from './monitoring-service';
import { CacheService } from './cache-service';

interface StaffingRatio {
  careLevel: 'HIGH_DEPENDENCY' | 'MEDIUM_DEPENDENCY' | 'LOW_DEPENDENCY';
  minimumRatio: number; // staff per resident
  nightRatio: number;
}

interface ComplianceRequirement {
  certificationName: string;
  requiredCount: number;
  shiftType: string;
}

interface ComplianceCheck {
  isCompliant: boolean;
  violations: Array<{
    type: string;
    description: string;
    severity: 'critical' | 'major' | 'minor';
    regulation?: string;
  }>;
  recommendations: string[];
}

export class ComplianceService {
  private static readonly STAFFING_RATIOS: Record<string, StaffingRatio> = {
    NURSING_HOME: {
      HIGH_DEPENDENCY: { minimumRatio: 0.33, nightRatio: 0.2 },    // 1:3 day, 1:5 night
      MEDIUM_DEPENDENCY: { minimumRatio: 0.25, nightRatio: 0.167 }, // 1:4 day, 1:6 night
      LOW_DEPENDENCY: { minimumRatio: 0.2, nightRatio: 0.143 },    // 1:5 day, 1:7 night
    },
    RESIDENTIAL_CARE: {
      HIGH_DEPENDENCY: { minimumRatio: 0.25, nightRatio: 0.167 },  // 1:4 day, 1:6 night
      MEDIUM_DEPENDENCY: { minimumRatio: 0.2, nightRatio: 0.143 }, // 1:5 day, 1:7 night
      LOW_DEPENDENCY: { minimumRatio: 0.167, nightRatio: 0.125 },  // 1:6 day, 1:8 night
    },
    SPECIALIZED_CARE: {
      HIGH_DEPENDENCY: { minimumRatio: 0.5, nightRatio: 0.33 },    // 1:2 day, 1:3 night
      MEDIUM_DEPENDENCY: { minimumRatio: 0.33, nightRatio: 0.25 }, // 1:3 day, 1:4 night
      LOW_DEPENDENCY: { minimumRatio: 0.25, nightRatio: 0.2 },     // 1:4 day, 1:5 night
    },
  };

  private static readonly CERTIFICATION_REQUIREMENTS: Record<string, ComplianceRequirement[]> = {
    NURSING_HOME: [
      { certificationName: 'RN', requiredCount: 1, shiftType: 'ANY' },
      { certificationName: 'FIRST_AID', requiredCount: 2, shiftType: 'ANY' },
      { certificationName: 'MEDICATION_MANAGEMENT', requiredCount: 2, shiftType: 'DAY' },
      { certificationName: 'DEMENTIA_CARE', requiredCount: 1, shiftType: 'ANY' },
    ],
    RESIDENTIAL_CARE: [
      { certificationName: 'FIRST_AID', requiredCount: 1, shiftType: 'ANY' },
      { certificationName: 'MEDICATION_MANAGEMENT', requiredCount: 1, shiftType: 'ANY' },
      { certificationName: 'CARE_CERTIFICATE', requiredCount: 2, shiftType: 'DAY' },
    ],
    SPECIALIZED_CARE: [
      { certificationName: 'RN', requiredCount: 2, shiftType: 'DAY' },
      { certificationName: 'RN', requiredCount: 1, shiftType: 'NIGHT' },
      { certificationName: 'SPECIALIST_CARE', requiredCount: 1, shiftType: 'ANY' },
      { certificationName: 'MENTAL_HEALTH', requiredCount: 1, shiftType: 'ANY' },
    ],
  };

  static async checkStaffingCompliance(
    organizationId: string,
    date: Date,
    shift: 'DAY' | 'NIGHT'
  ): Promise<ComplianceCheck> {
    try {
      const cacheKey = `compliance:staffing:${organizationId}:${date.toISOString()}:${shift}`;
      const cachedResult = await CacheService.get<ComplianceCheck>(cacheKey);
      if (cachedResult) return cachedResult;

      const [careHome, schedules, residents] = await Promise.all([
        prisma.careHome.findUnique({
          where: { organizationId },
          include: { residents: true },
        }),
        prisma.staffSchedule.findMany({
          where: {
            organizationId,
            startTime: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
            shiftType: shift,
          },
          include: {
            staff: {
              include: {
                certifications: true,
              },
            },
          },
        }),
        prisma.resident.findMany({
          where: { organizationId },
          select: { careLevel: true },
        }),
      ]);

      if (!careHome) {
        throw new Error('Care home not found');
      }

      const violations: ComplianceCheck['violations'] = [];
      const recommendations: string[] = [];

      // Check staffing ratios
      const ratios = this.STAFFING_RATIOS[careHome.type];
      const residentsByLevel = this.groupResidentsByCareLevel(residents);
      
      Object.entries(residentsByLevel).forEach(([level, count]) => {
        const ratio = shift === 'DAY' ? ratios[level].minimumRatio : ratios[level].nightRatio;
        const requiredStaff = Math.ceil(count * ratio);
        const actualStaff = schedules.filter(s => s.staff?.certifications.some(c => 
          c.type === 'CARE_CERTIFICATE' || c.type === 'RN'
        )).length;

        if (actualStaff < requiredStaff) {
          violations.push({
            type: 'INSUFFICIENT_STAFFING',
            description: `Insufficient staff for ${level} care level. Required: ${requiredStaff}, Actual: ${actualStaff}`,
            severity: 'critical',
            regulation: 'CQC Regulation 18: Staffing',
          });
          recommendations.push(`Schedule ${requiredStaff - actualStaff} additional qualified staff for ${level} care`);
        }
      });

      // Check certification requirements
      const requirements = this.CERTIFICATION_REQUIREMENTS[careHome.type];
      requirements.forEach(req => {
        if (req.shiftType === 'ANY' || req.shiftType === shift) {
          const certifiedStaff = schedules.filter(s => 
            s.staff?.certifications.some(c => c.type === req.certificationName)
          ).length;

          if (certifiedStaff < req.requiredCount) {
            violations.push({
              type: 'INSUFFICIENT_CERTIFICATION',
              description: `Insufficient staff with ${req.certificationName} certification. Required: ${req.requiredCount}, Actual: ${certifiedStaff}`,
              severity: 'major',
              regulation: 'CQC Regulation 12: Safe Care and Treatment',
            });
            recommendations.push(`Schedule ${req.requiredCount - certifiedStaff} additional staff with ${req.certificationName} certification`);
          }
        }
      });

      // Check for specialized care requirements
      if (careHome.type === 'SPECIALIZED_CARE') {
        const specializedCareStaff = schedules.filter(s => 
          s.staff?.certifications.some(c => c.type === 'SPECIALIST_CARE')
        ).length;

        if (specializedCareStaff === 0) {
          violations.push({
            type: 'NO_SPECIALIZED_STAFF',
            description: 'No staff member with specialized care certification on shift',
            severity: 'critical',
            regulation: 'CQC Regulation 12: Safe Care and Treatment',
          });
          recommendations.push('Schedule at least one staff member with specialized care certification');
        }
      }

      // Check for medication management coverage
      const medicationCertifiedStaff = schedules.filter(s => 
        s.staff?.certifications.some(c => c.type === 'MEDICATION_MANAGEMENT')
      ).length;

      if (medicationCertifiedStaff === 0) {
        violations.push({
          type: 'NO_MEDICATION_MANAGER',
          description: 'No staff member with medication management certification on shift',
          severity: 'critical',
          regulation: 'CQC Regulation 12: Safe Care and Treatment',
        });
        recommendations.push('Schedule at least one staff member with medication management certification');
      }

      const result: ComplianceCheck = {
        isCompliant: violations.length === 0,
        violations,
        recommendations,
      };

      // Cache the result
      await CacheService.set(cacheKey, result, 3600); // Cache for 1 hour

      // Track compliance status
      MonitoringService.trackEvent({
        category: 'compliance',
        action: 'staffing_check',
        metadata: {
          isCompliant: result.isCompliant,
          violationCount: violations.length,
          careHomeType: careHome.type,
        },
      });

      return result;
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'check_staffing_compliance' },
      });
      throw error;
    }
  }

  static async checkTrainingCompliance(
    organizationId: string
  ): Promise<ComplianceCheck> {
    try {
      const cacheKey = `compliance:training:${organizationId}`;
      const cachedResult = await CacheService.get<ComplianceCheck>(cacheKey);
      if (cachedResult) return cachedResult;

      const [careHome, staff] = await Promise.all([
        prisma.careHome.findUnique({
          where: { organizationId },
        }),
        prisma.staff.findMany({
          where: { organizationId, status: 'ACTIVE' },
          include: {
            trainingRecords: true,
            certifications: true,
          },
        }),
      ]);

      if (!careHome) {
        throw new Error('Care home not found');
      }

      const violations: ComplianceCheck['violations'] = [];
      const recommendations: string[] = [];

      // Check mandatory training completion
      staff.forEach(member => {
        const mandatoryTraining = [
          'FIRE_SAFETY',
          'INFECTION_CONTROL',
          'MOVING_AND_HANDLING',
          'SAFEGUARDING',
          'HEALTH_AND_SAFETY',
        ];

        mandatoryTraining.forEach(training => {
          const completed = member.trainingRecords.some(record => 
            record.type === training && 
            record.status === 'COMPLETED' &&
            new Date(record.completionDate) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Within last year
          );

          if (!completed) {
            violations.push({
              type: 'INCOMPLETE_MANDATORY_TRAINING',
              description: `Staff member ${member.id} missing or expired ${training} training`,
              severity: 'major',
              regulation: 'CQC Regulation 18: Staffing',
            });
            recommendations.push(`Schedule ${training} training for staff member ${member.id}`);
          }
        });
      });

      // Check certification expiry
      staff.forEach(member => {
        member.certifications.forEach(cert => {
          if (new Date(cert.expiryDate) < new Date()) {
            violations.push({
              type: 'EXPIRED_CERTIFICATION',
              description: `Staff member ${member.id} has expired ${cert.type} certification`,
              severity: 'major',
              regulation: 'CQC Regulation 18: Staffing',
            });
            recommendations.push(`Renew ${cert.type} certification for staff member ${member.id}`);
          } else if (new Date(cert.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
            violations.push({
              type: 'EXPIRING_CERTIFICATION',
              description: `Staff member ${member.id}'s ${cert.type} certification expires within 30 days`,
              severity: 'minor',
              regulation: 'CQC Regulation 18: Staffing',
            });
            recommendations.push(`Plan renewal of ${cert.type} certification for staff member ${member.id}`);
          }
        });
      });

      const result: ComplianceCheck = {
        isCompliant: violations.length === 0,
        violations,
        recommendations,
      };

      // Cache the result
      await CacheService.set(cacheKey, result, 3600); // Cache for 1 hour

      // Track compliance status
      MonitoringService.trackEvent({
        category: 'compliance',
        action: 'training_check',
        metadata: {
          isCompliant: result.isCompliant,
          violationCount: violations.length,
          careHomeType: careHome.type,
        },
      });

      return result;
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'check_training_compliance' },
      });
      throw error;
    }
  }

  private static groupResidentsByCareLevel(residents: Array<{ careLevel: string }>) {
    return residents.reduce((acc, resident) => {
      acc[resident.careLevel] = (acc[resident.careLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}


