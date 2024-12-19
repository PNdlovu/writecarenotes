import { prisma } from '@/lib/prisma';
import { MonitoringService } from './monitoring-service';

interface CareRequirement {
  type: string;
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  specializedStaffRequired: boolean;
  minimumStaffCount: number;
  requiredCertifications: string[];
}

interface ResidentCareProfile {
  residentId: string;
  primaryNeeds: string[];
  mobilityAssistance: boolean;
  medicationSchedule: boolean;
  specializedCare: string[];
  behavioralSupport: boolean;
  communicationNeeds: string[];
}

export class SpecializedCareService {
  private static readonly CARE_REQUIREMENTS: Record<string, CareRequirement> = {
    DEMENTIA_CARE: {
      type: 'DEMENTIA_CARE',
      level: 'HIGH',
      specializedStaffRequired: true,
      minimumStaffCount: 2,
      requiredCertifications: ['DEMENTIA_CARE', 'BEHAVIORAL_MANAGEMENT'],
    },
    PALLIATIVE_CARE: {
      type: 'PALLIATIVE_CARE',
      level: 'HIGH',
      specializedStaffRequired: true,
      minimumStaffCount: 2,
      requiredCertifications: ['PALLIATIVE_CARE', 'PAIN_MANAGEMENT'],
    },
    MENTAL_HEALTH: {
      type: 'MENTAL_HEALTH',
      level: 'HIGH',
      specializedStaffRequired: true,
      minimumStaffCount: 2,
      requiredCertifications: ['MENTAL_HEALTH', 'CRISIS_MANAGEMENT'],
    },
    PHYSICAL_DISABILITY: {
      type: 'PHYSICAL_DISABILITY',
      level: 'MEDIUM',
      specializedStaffRequired: true,
      minimumStaffCount: 1,
      requiredCertifications: ['MOBILITY_ASSISTANCE', 'PHYSICAL_THERAPY'],
    },
    LEARNING_DISABILITY: {
      type: 'LEARNING_DISABILITY',
      level: 'MEDIUM',
      specializedStaffRequired: true,
      minimumStaffCount: 1,
      requiredCertifications: ['LEARNING_DISABILITY', 'COMMUNICATION_SUPPORT'],
    },
  };

  static async getResidentCareProfile(
    residentId: string
  ): Promise<ResidentCareProfile> {
    try {
      const resident = await prisma.resident.findUnique({
        where: { id: residentId },
        include: {
          careNeeds: true,
          medicationSchedule: true,
          specializedCareRequirements: true,
        },
      });

      if (!resident) {
        throw new Error('Resident not found');
      }

      return {
        residentId: resident.id,
        primaryNeeds: resident.careNeeds.map(need => need.type),
        mobilityAssistance: resident.requiresMobilityAssistance,
        medicationSchedule: resident.medicationSchedule.length > 0,
        specializedCare: resident.specializedCareRequirements.map(req => req.type),
        behavioralSupport: resident.requiresBehavioralSupport,
        communicationNeeds: resident.communicationNeeds,
      };
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: { operation: 'get_resident_care_profile', residentId },
      });
      throw error;
    }
  }

  static async assignSpecializedCareStaff(
    scheduleId: string,
    residentId: string
  ): Promise<void> {
    try {
      const [schedule, careProfile] = await Promise.all([
        prisma.staffSchedule.findUnique({
          where: { id: scheduleId },
          include: {
            staff: {
              include: {
                certifications: true,
              },
            },
          },
        }),
        this.getResidentCareProfile(residentId),
      ]);

      if (!schedule) {
        throw new Error('Schedule not found');
      }

      // Check if staff member has required certifications
      careProfile.specializedCare.forEach(careType => {
        const requirements = this.CARE_REQUIREMENTS[careType];
        if (!requirements) return;

        const hasCertifications = requirements.requiredCertifications.every(cert =>
          schedule.staff?.certifications.some(c => c.type === cert && c.isValid)
        );

        if (!hasCertifications) {
          throw new Error(`Staff member does not have required certifications for ${careType}`);
        }
      });

      // Update schedule with specialized care assignment
      await prisma.staffSchedule.update({
        where: { id: scheduleId },
        data: {
          specializedCareAssignments: {
            create: {
              residentId,
              careTypes: careProfile.specializedCare,
            },
          },
        },
      });

      // Track the assignment
      MonitoringService.trackEvent({
        category: 'specialized_care',
        action: 'staff_assignment',
        metadata: {
          scheduleId,
          residentId,
          careTypes: careProfile.specializedCare,
        },
      });
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: {
          operation: 'assign_specialized_care_staff',
          scheduleId,
          residentId,
        },
      });
      throw error;
    }
  }

  static async validateSpecializedCareStaffing(
    organizationId: string,
    date: Date
  ): Promise<{
    isValid: boolean;
    gaps: Array<{
      careType: string;
      shift: string;
      missingCertifications: string[];
    }>;
  }> {
    try {
      const [residents, schedules] = await Promise.all([
        prisma.resident.findMany({
          where: { organizationId },
          include: {
            specializedCareRequirements: true,
          },
        }),
        prisma.staffSchedule.findMany({
          where: {
            organizationId,
            startTime: {
              gte: new Date(date.setHours(0, 0, 0, 0)),
              lt: new Date(date.setHours(23, 59, 59, 999)),
            },
          },
          include: {
            staff: {
              include: {
                certifications: true,
              },
            },
            specializedCareAssignments: true,
          },
        }),
      ]);

      const gaps: Array<{
        careType: string;
        shift: string;
        missingCertifications: string[];
      }> = [];

      // Group schedules by shift
      const shifts = ['MORNING', 'AFTERNOON', 'NIGHT'];
      shifts.forEach(shift => {
        const shiftSchedules = schedules.filter(s => s.shiftType === shift);

        // Check each resident's specialized care requirements
        residents.forEach(resident => {
          resident.specializedCareRequirements.forEach(requirement => {
            const careReq = this.CARE_REQUIREMENTS[requirement.type];
            if (!careReq) return;

            // Count staff with required certifications
            const qualifiedStaff = shiftSchedules.filter(schedule =>
              careReq.requiredCertifications.every(cert =>
                schedule.staff?.certifications.some(c => 
                  c.type === cert && c.isValid
                )
              )
            );

            if (qualifiedStaff.length < careReq.minimumStaffCount) {
              gaps.push({
                careType: requirement.type,
                shift,
                missingCertifications: careReq.requiredCertifications,
              });
            }
          });
        });
      });

      const isValid = gaps.length === 0;

      // Track validation results
      MonitoringService.trackEvent({
        category: 'specialized_care',
        action: 'staffing_validation',
        metadata: {
          isValid,
          gapCount: gaps.length,
          date: date.toISOString(),
        },
      });

      return { isValid, gaps };
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: {
          operation: 'validate_specialized_care_staffing',
          organizationId,
          date: date.toISOString(),
        },
      });
      throw error;
    }
  }

  static async generateCareReport(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalResidents: number;
    careTypeDistribution: Record<string, number>;
    staffingCoverage: Record<string, number>;
    complianceRate: number;
    incidents: number;
  }> {
    try {
      const [
        residents,
        schedules,
        incidents,
      ] = await Promise.all([
        prisma.resident.findMany({
          where: { organizationId },
          include: {
            specializedCareRequirements: true,
          },
        }),
        prisma.staffSchedule.findMany({
          where: {
            organizationId,
            startTime: { gte: startDate },
            endTime: { lte: endDate },
          },
          include: {
            staff: {
              include: {
                certifications: true,
              },
            },
            specializedCareAssignments: true,
          },
        }),
        prisma.careIncident.count({
          where: {
            organizationId,
            timestamp: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
      ]);

      // Calculate care type distribution
      const careTypeDistribution = residents.reduce((acc, resident) => {
        resident.specializedCareRequirements.forEach(req => {
          acc[req.type] = (acc[req.type] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

      // Calculate staffing coverage
      const staffingCoverage: Record<string, number> = {};
      Object.keys(this.CARE_REQUIREMENTS).forEach(careType => {
        const requirements = this.CARE_REQUIREMENTS[careType];
        const qualifiedStaff = schedules.filter(schedule =>
          requirements.requiredCertifications.every(cert =>
            schedule.staff?.certifications.some(c => 
              c.type === cert && c.isValid
            )
          )
        ).length;

        const requiredStaffHours = residents.filter(r =>
          r.specializedCareRequirements.some(req => req.type === careType)
        ).length * requirements.minimumStaffCount * 24;

        staffingCoverage[careType] = (qualifiedStaff * 8) / requiredStaffHours * 100;
      });

      // Calculate compliance rate
      const totalAssignments = schedules.reduce((sum, schedule) =>
        sum + schedule.specializedCareAssignments.length, 0
      );
      const compliantAssignments = schedules.filter(schedule =>
        schedule.specializedCareAssignments.every(assignment => {
          const requirements = assignment.careTypes.map(type =>
            this.CARE_REQUIREMENTS[type]
          );
          return requirements.every(req =>
            req?.requiredCertifications.every(cert =>
              schedule.staff?.certifications.some(c =>
                c.type === cert && c.isValid
              )
            )
          );
        })
      ).length;

      const complianceRate = totalAssignments > 0
        ? (compliantAssignments / totalAssignments) * 100
        : 100;

      return {
        totalResidents: residents.length,
        careTypeDistribution,
        staffingCoverage,
        complianceRate,
        incidents,
      };
    } catch (error) {
      MonitoringService.trackError(error as Error, {
        metadata: {
          operation: 'generate_care_report',
          organizationId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
      throw error;
    }
  }
}


