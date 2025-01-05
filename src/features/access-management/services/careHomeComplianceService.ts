import { PrismaClient } from '@prisma/client';
import { logger } from '../../../utils/logger';
import { NotificationService } from '../../../services/notificationService';
import { 
  CareHomeCompliance, 
  CareHomeInspectionArea,
  SafeguardingRequirement,
  CareHomeRegulation
} from '../types';

export class CareHomeComplianceService {
  private prisma: PrismaClient;
  private notificationService: NotificationService;

  constructor(
    prisma: PrismaClient,
    notificationService: NotificationService
  ) {
    this.prisma = prisma;
    this.notificationService = notificationService;
  }

  async validateCareQuality(homeId: string): Promise<boolean> {
    try {
      // Check all key areas of care quality
      const validations = await Promise.all([
        this.validateCarePlans(homeId),
        this.validateMedicationManagement(homeId),
        this.validateStaffingLevels(homeId),
        this.validateSafeguarding(homeId),
        this.validateInfectionControl(homeId)
      ]);

      const isCompliant = validations.every(v => v);

      await this.logComplianceCheck({
        homeId,
        area: CareHomeInspectionArea.CARE_QUALITY,
        isCompliant,
        timestamp: new Date()
      });

      return isCompliant;
    } catch (error) {
      logger.error('Error validating care quality:', error);
      throw new Error('Failed to validate care quality');
    }
  }

  async monitorStaffCompliance(homeId: string): Promise<void> {
    try {
      const staff = await this.prisma.staff.findMany({
        where: { homeId }
      });

      for (const member of staff) {
        // Check DBS status with enhanced check and barred list
        const dbsValid = await this.validateEnhancedDBS(member.id);
        if (!dbsValid) {
          await this.notificationService.sendNotification({
            userId: member.id,
            type: 'DBS_EXPIRING',
            message: 'Your enhanced DBS check needs renewal',
            priority: 'HIGH'
          });
        }

        // Check mandatory training
        const trainingValid = await this.validateMandatoryTraining(member.id);
        if (!trainingValid) {
          await this.notificationService.sendNotification({
            userId: member.id,
            type: 'TRAINING_REQUIRED',
            message: 'Mandatory care home training needs completion',
            priority: 'HIGH'
          });
        }

        // Check shift coverage
        await this.validateShiftCoverage(homeId, member.id);
      }
    } catch (error) {
      logger.error('Error monitoring staff compliance:', error);
      throw new Error('Failed to monitor staff compliance');
    }
  }

  async generateCQCReport(homeId: string): Promise<any> {
    try {
      const home = await this.prisma.careHome.findUnique({
        where: { id: homeId },
        include: {
          inspectionAreas: true,
          safeguarding: true,
          staff: true,
          residents: true,
          medications: true,
          policies: true
        }
      });

      const report = {
        setting: {
          type: home.type,
          registrationNumber: home.registrationNumber,
          registrationDate: home.registrationDate,
          capacity: home.capacity,
          currentOccupancy: home.currentOccupancy
        },
        regulations: await this.generateRegulationsReport(homeId),
        safeguarding: await this.generateSafeguardingReport(homeId),
        staffing: await this.generateStaffingReport(homeId),
        careQuality: await this.generateCareQualityReport(homeId),
        medications: await this.generateMedicationsReport(homeId),
        incidents: await this.generateIncidentsReport(homeId)
      };

      await this.logReportGeneration(homeId);

      return report;
    } catch (error) {
      logger.error('Error generating CQC report:', error);
      throw new Error('Failed to generate CQC report');
    }
  }

  private async validateCarePlans(homeId: string): Promise<boolean> {
    const carePlans = await this.prisma.carePlan.findMany({
      where: { homeId }
    });

    return carePlans.every(plan => {
      const lastReviewDate = new Date(plan.lastReview);
      const monthsSinceReview = this.getMonthsDifference(lastReviewDate, new Date());
      return monthsSinceReview <= 1 && plan.personCentered;
    });
  }

  private async validateMedicationManagement(homeId: string): Promise<boolean> {
    const medications = await this.prisma.medicationManagement.findFirst({
      where: { homeId }
    });

    return (
      medications.storage === 'COMPLIANT' &&
      medications.administration === 'COMPLIANT' &&
      this.isWithinLastMonth(medications.lastAudit)
    );
  }

  private async validateStaffingLevels(homeId: string): Promise<boolean> {
    const shifts = await this.prisma.staffingLevel.findMany({
      where: { homeId }
    });

    return shifts.every(shift => shift.currentStaff >= shift.minimumStaff);
  }

  private async validateSafeguarding(homeId: string): Promise<boolean> {
    const safeguarding = await this.prisma.safeguarding.findMany({
      where: { homeId }
    });

    return safeguarding.every(s => s.status === 'COMPLIANT');
  }

  private async validateInfectionControl(homeId: string): Promise<boolean> {
    const infectionControl = await this.prisma.infectionControl.findFirst({
      where: { homeId }
    });

    return infectionControl.status === 'COMPLIANT';
  }

  private async validateEnhancedDBS(staffId: string): Promise<boolean> {
    const dbs = await this.prisma.dbs.findFirst({
      where: { staffId },
      orderBy: { checkDate: 'desc' }
    });

    if (!dbs || !dbs.enhanced || !dbs.barredListCheck) return false;

    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    return dbs.expiryDate > threeMonthsFromNow;
  }

  private async validateMandatoryTraining(staffId: string): Promise<boolean> {
    const training = await this.prisma.training.findMany({
      where: { 
        staffId,
        mandatory: true
      }
    });

    const requiredTraining = [
      'SAFEGUARDING',
      'MEDICATION_MANAGEMENT',
      'INFECTION_CONTROL',
      'MOVING_AND_HANDLING',
      'FIRST_AID',
      'FIRE_SAFETY',
      'HEALTH_AND_SAFETY',
      'FOOD_HYGIENE'
    ];

    return requiredTraining.every(required =>
      training.some(t => 
        t.type === required && 
        t.status === 'VALID' &&
        (!t.expiryDate || t.expiryDate > new Date())
      )
    );
  }

  private async validateShiftCoverage(homeId: string, staffId: string): Promise<void> {
    const shifts = await this.prisma.staffingLevel.findMany({
      where: { homeId }
    });

    for (const shift of shifts) {
      if (shift.currentStaff < shift.minimumStaff) {
        await this.notificationService.sendNotification({
          userId: staffId,
          type: 'STAFFING_SHORTAGE',
          message: `Staffing shortage for ${shift.type} shift`,
          priority: 'HIGH'
        });
      }
    }
  }

  private getMonthsDifference(date1: Date, date2: Date): number {
    return (date2.getFullYear() - date1.getFullYear()) * 12 +
      (date2.getMonth() - date1.getMonth());
  }

  private isWithinLastMonth(date: Date): boolean {
    return this.getMonthsDifference(date, new Date()) <= 1;
  }

  private async logComplianceCheck(check: {
    homeId: string;
    area: CareHomeInspectionArea;
    isCompliant: boolean;
    timestamp: Date;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'CARE_HOME_COMPLIANCE',
        entityId: check.homeId,
        action: 'COMPLIANCE_CHECK',
        description: `Compliance check for ${check.area}: ${check.isCompliant ? 'Compliant' : 'Non-compliant'}`,
        timestamp: check.timestamp
      }
    });
  }

  private async logReportGeneration(homeId: string): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: 'CQC_REPORT',
        entityId: homeId,
        action: 'REPORT_GENERATED',
        description: 'Generated CQC compliance report',
        timestamp: new Date()
      }
    });
  }

  // Report generation methods
  private async generateRegulationsReport(homeId: string): Promise<any> {
    // Implementation for generating regulations report
    return []; // Placeholder
  }

  private async generateSafeguardingReport(homeId: string): Promise<any> {
    // Implementation for generating safeguarding report
    return []; // Placeholder
  }

  private async generateStaffingReport(homeId: string): Promise<any> {
    // Implementation for generating staffing report
    return []; // Placeholder
  }

  private async generateCareQualityReport(homeId: string): Promise<any> {
    // Implementation for generating care quality report
    return []; // Placeholder
  }

  private async generateMedicationsReport(homeId: string): Promise<any> {
    // Implementation for generating medications report
    return []; // Placeholder
  }

  private async generateIncidentsReport(homeId: string): Promise<any> {
    // Implementation for generating incidents report
    return []; // Placeholder
  }
}
