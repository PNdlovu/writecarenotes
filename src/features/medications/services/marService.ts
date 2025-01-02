/**
 * @writecarenotes.com
 * @fileoverview Enterprise medication administration record service
 * @version 1.0.0
 * @created 2024-01-07
 * @updated 2024-01-07
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Enterprise-grade service for managing medication administration records
 * with regional compliance (CQC, Ofsted, CIW, CI, RQIA, HIQA), offline support,
 * and comprehensive auditing for both adult and children's care services.
 */

import { MARRepository } from '../database/marRepository';
import { RegionalComplianceService } from './regionalCompliance';
import { ClinicalDecisionSupportService } from './clinicalDecisionSupport';
import { 
  MedicationScheduleItem, 
  MedicationStatus,
  MedicationAdministrationRecord,
  MedicationVerificationResult,
  Staff,
  MedicationError,
  MedicationErrorCode
} from '../types';
import type { Region } from '@/types/region';
import type { CareHomeType } from '../types/compliance';
import { format } from 'date-fns';

interface MARServiceConfig {
  enableOfflineSupport?: boolean;
  syncInterval?: number; // in minutes
  maxOfflinePeriod?: number; // in hours
  isChildrenService?: boolean; // Flag for children's services
}

const DEFAULT_CONFIG: MARServiceConfig = {
  enableOfflineSupport: true,
  syncInterval: 5,
  maxOfflinePeriod: 24,
  isChildrenService: false,
};

export class MARService {
  private repository: MARRepository;
  private complianceService: RegionalComplianceService;
  private clinicalService: ClinicalDecisionSupportService;
  private config: MARServiceConfig;

  constructor(config: MARServiceConfig = {}) {
    this.repository = new MARRepository();
    this.complianceService = new RegionalComplianceService();
    this.clinicalService = new ClinicalDecisionSupportService();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create a new medication schedule with enhanced children's service support
   */
  async createSchedule(
    residentId: string,
    medicationId: string,
    scheduleData: {
      frequency: string;
      times: string[];
      daysOfWeek: string[];
      instructions?: string;
      parentalConsent?: boolean; // For children's services
      consentDate?: Date;        // Date of parental consent
      consentedBy?: string;      // Person who gave consent
    },
    region: Region,
    careHomeType: CareHomeType
  ): Promise<MedicationScheduleItem> {
    try {
      // Validate regional compliance
      const requirements = this.complianceService.getRequirements(region, careHomeType);
      
      // Additional Ofsted compliance checks for children's services
      if (this.config.isChildrenService) {
        if (!scheduleData.parentalConsent) {
          throw new MedicationError({
            code: MedicationErrorCode.CONSENT_REQUIRED,
            message: 'Parental consent required for medication administration',
            timestamp: new Date().toISOString(),
            details: 'Ofsted compliance requires documented parental consent',
          });
        }

        if (!scheduleData.consentDate || !scheduleData.consentedBy) {
          throw new MedicationError({
            code: MedicationErrorCode.INCOMPLETE_CONSENT,
            message: 'Incomplete parental consent information',
            timestamp: new Date().toISOString(),
            details: 'Consent date and consenting person must be recorded',
          });
        }
      }

      // Check clinical decision support with age-appropriate considerations
      const clinicalChecks = await this.clinicalService.performMedicationChecks(
        residentId,
        medicationId,
        {
          ...scheduleData,
          isChildrenService: this.config.isChildrenService,
        }
      );

      if (!clinicalChecks.isValid) {
        throw new Error(`Clinical validation failed: ${clinicalChecks.errors.join(', ')}`);
      }

      // Create schedule with compliance requirements
      const schedule = await this.repository.createSchedule({
        residentId,
        medicationId,
        frequency: scheduleData.frequency,
        times: scheduleData.times,
        daysOfWeek: scheduleData.daysOfWeek,
        instructions: scheduleData.instructions,
        requiresWitness: requirements.requiresWitness,
        requiresDoubleSignature: requirements.requiresDoubleSignature,
        requiresStockCheck: requirements.requiresStockCheck,
        parentalConsent: scheduleData.parentalConsent,
        consentDate: scheduleData.consentDate,
        consentedBy: scheduleData.consentedBy,
        isChildrenService: this.config.isChildrenService,
      });

      return schedule;
    } catch (error) {
      throw new MedicationError({
        code: MedicationErrorCode.SCHEDULE_FETCH_ERROR,
        message: 'Failed to create medication schedule',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Record a medication administration
   */
  async recordAdministration(
    scheduleId: string,
    data: {
      status: MedicationStatus;
      administeredBy: Staff;
      witness?: Staff;
      notes?: string;
    },
    region: Region,
    careHomeType: CareHomeType
  ): Promise<MedicationAdministrationRecord> {
    try {
      // Validate regional compliance
      const requirements = this.complianceService.getRequirements(region, careHomeType);
      
      // Validate witness requirement
      if (requirements.requiresWitness && !data.witness) {
        throw new Error('Witness signature required for this medication');
      }

      // Record administration with compliance checks
      const record = await this.repository.updateScheduleStatus(
        scheduleId,
        data.status,
        data.administeredBy,
        data.witness,
        data.notes,
        requirements
      );

      // Perform clinical checks
      await this.clinicalService.performPostAdministrationChecks(record);

      return record;
    } catch (error) {
      throw new MedicationError({
        code: MedicationErrorCode.ADMINISTRATION_ERROR,
        message: 'Failed to record medication administration',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get medication schedule for a resident
   */
  async getSchedule(
    residentId: string,
    date: Date,
    region: Region,
    careHomeType: CareHomeType
  ): Promise<MedicationScheduleItem[]> {
    try {
      // Get schedule with regional compliance
      const schedule = await this.repository.getScheduleForResident(
        residentId,
        date,
        new Date(date.setHours(23, 59, 59)),
        region
      );

      // Apply regional requirements
      const requirements = this.complianceService.getRequirements(region, careHomeType);
      
      // Enrich schedule with compliance information
      const enrichedSchedule = schedule.map(item => ({
        ...item,
        requiresWitness: requirements.requiresWitness,
        requiresDoubleSignature: requirements.requiresDoubleSignature,
        requiresStockCheck: requirements.requiresStockCheck,
      }));

      return enrichedSchedule;
    } catch (error) {
      throw new MedicationError({
        code: MedicationErrorCode.SCHEDULE_FETCH_ERROR,
        message: 'Failed to fetch medication schedule',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Verify medication administration
   */
  async verifyAdministration(
    administrationId: string,
    verification: MedicationVerificationResult,
    region: Region,
    careHomeType: CareHomeType
  ): Promise<void> {
    try {
      // Validate verification against regional requirements
      const requirements = this.complianceService.getRequirements(region, careHomeType);
      
      if (requirements.requiresDoubleSignature && !verification.verifiedBy) {
        throw new Error('Double signature verification required');
      }

      // Record verification
      await this.repository.recordVerification(
        administrationId,
        verification,
        region
      );
    } catch (error) {
      throw new MedicationError({
        code: MedicationErrorCode.VERIFICATION_ERROR,
        message: 'Failed to verify medication administration',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Handle offline data synchronization
   */
  async syncOfflineData(
    residentId: string,
    region: Region,
    careHomeType: CareHomeType
  ): Promise<void> {
    if (!this.config.enableOfflineSupport) return;

    try {
      const offlineKey = `medication_schedule_${residentId}_${format(new Date(), 'yyyy-MM-dd')}`;
      const storedData = localStorage.getItem(offlineKey);

      if (storedData) {
        const offlineSchedule = JSON.parse(storedData);
        const requirements = this.complianceService.getRequirements(region, careHomeType);

        // Validate offline data
        for (const item of offlineSchedule) {
          if (requirements.requiresWitness && !item.witness) {
            throw new Error('Witness signature required for offline administration');
          }

          // Sync each item
          await this.repository.updateScheduleStatus(
            item.id,
            item.status,
            item.administeredBy,
            item.witness,
            item.notes,
            requirements
          );
        }

        // Clear synced data
        localStorage.removeItem(offlineKey);
      }
    } catch (error) {
      throw new MedicationError({
        code: MedicationErrorCode.SYNC_ERROR,
        message: 'Failed to sync offline data',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate compliance report with Ofsted requirements
   */
  async generateComplianceReport(
    residentId: string,
    startDate: Date,
    endDate: Date,
    region: Region,
    careHomeType: CareHomeType
  ): Promise<any> {
    try {
      const schedule = await this.repository.getScheduleForResident(
        residentId,
        startDate,
        endDate,
        region
      );

      const requirements = this.complianceService.getRequirements(region, careHomeType);
      const clinicalReport = await this.clinicalService.performComplianceAudit(
        { id: residentId },
        schedule
      );

      // Additional Ofsted-specific reporting for children's services
      let ofstedReport = null;
      if (this.config.isChildrenService) {
        ofstedReport = {
          parentalConsents: await this.repository.getParentalConsents(residentId),
          medicationTraining: await this.repository.getStaffTrainingRecords(schedule),
          safeguardingMeasures: await this.clinicalService.getSafeguardingChecks(residentId),
          ageAppropriateAssessments: await this.clinicalService.getAgeAppropriateAssessments(residentId),
        };
      }

      return {
        schedule,
        requirements,
        clinicalReport,
        ofstedReport,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new MedicationError({
        code: MedicationErrorCode.VALIDATION_ERROR,
        message: 'Failed to generate compliance report',
        timestamp: new Date().toISOString(),
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}


