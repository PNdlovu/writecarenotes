/**
 * @writecarenotes.com
 * @fileoverview Advanced Enterprise Medication Management Service
 * @version 1.0.0
 * @created 2024-01-07
 * @updated 2024-01-07
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive enterprise-grade medication management service supporting all UK & Ireland
 * care home types (CQC, Ofsted, CIW, CI, RQIA, HIQA). Features include:
 * - Multi-region and multi-language support
 * - Offline-first architecture
 * - Advanced error prevention system
 * - Real-time clinical decision support
 * - Comprehensive audit trails
 * - Age-appropriate medication management
 * - PIN-based verification
 */

import { MARService } from './marService';
import { RegionalComplianceService } from './regionalCompliance';
import { ClinicalDecisionSupportService } from './clinicalDecisionSupport';
import { MedicationAlertService } from './medicationAlertService';
import { StockService } from './stockService';
import { 
  MedicationScheduleItem, 
  MedicationStatus,
  MedicationAdministrationRecord,
  MedicationVerificationResult,
  Staff,
  MedicationError,
  MedicationErrorCode,
  MedicationInteraction,
  StockLevel,
  AlertPriority
} from '../types';
import type { Region } from '@/types/region';
import type { CareHomeType } from '../types/compliance';
import type { Language } from '@/types/language';
import { format } from 'date-fns';
import { translate } from '@/utils/i18n';

interface AdvancedMedicationConfig extends MARServiceConfig {
  language: Language;
  enableBarcodeScanning?: boolean;
  enablePinVerification?: boolean;
  stockAlertThreshold?: number;
  maxOfflinePeriod?: number;
}

const ADVANCED_DEFAULT_CONFIG: AdvancedMedicationConfig = {
  language: 'en',
  enableOfflineSupport: true,
  enableBarcodeScanning: true,
  enablePinVerification: true,
  syncInterval: 5,
  stockAlertThreshold: 7, // days
  maxOfflinePeriod: 24,
  isChildrenService: false,
};

export class AdvancedMedicationService extends MARService {
  private alertService: MedicationAlertService;
  private stockService: StockService;
  private language: Language;

  constructor(config: AdvancedMedicationConfig = ADVANCED_DEFAULT_CONFIG) {
    super(config);
    this.alertService = new MedicationAlertService();
    this.stockService = new StockService();
    this.language = config.language;
  }

  /**
   * Enhanced medication schedule creation with error prevention
   */
  async createSchedule(
    residentId: string,
    medicationId: string,
    scheduleData: {
      frequency: string;
      times: string[];
      daysOfWeek: string[];
      instructions?: string;
      parentalConsent?: boolean;
      consentDate?: Date;
      consentedBy?: string;
      route: string;
      dosage: string;
      maxDosage24Hr?: number;
    },
    region: Region,
    careHomeType: CareHomeType
  ): Promise<MedicationScheduleItem> {
    try {
      // Pre-validation checks
      await this.performPreScheduleChecks(residentId, medicationId, scheduleData);

      // Stock level verification
      await this.verifyStockLevels(medicationId, scheduleData);

      // Create base schedule
      const schedule = await super.createSchedule(
        residentId,
        medicationId,
        scheduleData,
        region,
        careHomeType
      );

      // Set up monitoring and alerts
      await this.setupMedicationMonitoring(schedule, region);

      return schedule;
    } catch (error) {
      this.handleError(error, 'createSchedule');
      throw error;
    }
  }

  /**
   * Enhanced medication administration with real-time safety checks and PIN verification
   */
  async recordAdministration(
    scheduleId: string,
    data: {
      status: MedicationStatus;
      administeredBy: Staff;
      witness?: Staff;
      notes?: string;
      barcode?: string;
      adminPin?: string;
      witnessPin?: string;
    },
    region: Region,
    careHomeType: CareHomeType
  ): Promise<MedicationAdministrationRecord> {
    try {
      // Real-time safety checks
      await this.performSafetyChecks(scheduleId, data);

      // Verify medication using barcode if enabled
      if (this.config.enableBarcodeScanning) {
        await this.verifyMedicationBarcode(scheduleId, data.barcode);
      }

      // Verify staff PIN if enabled
      if (this.config.enablePinVerification) {
        await this.verifyStaffPins(data);
      }

      // Record administration
      const record = await super.recordAdministration(
        scheduleId,
        data,
        region,
        careHomeType
      );

      // Post-administration checks and monitoring
      await this.performPostAdministrationMonitoring(record);

      return record;
    } catch (error) {
      this.handleError(error, 'recordAdministration');
      throw error;
    }
  }

  /**
   * Verify staff PINs for medication administration
   */
  private async verifyStaffPins(data: {
    administeredBy: Staff;
    witness?: Staff;
    adminPin?: string;
    witnessPin?: string;
  }): Promise<void> {
    // Verify administrator PIN
    if (!data.adminPin) {
      throw new MedicationError({
        code: MedicationErrorCode.PIN_REQUIRED,
        message: translate('medication.pinRequired', this.language),
        timestamp: new Date().toISOString(),
        details: 'Administrator PIN is required',
      });
    }

    const adminVerified = await this.verifyStaffPin(data.administeredBy.id, data.adminPin);
    if (!adminVerified) {
      throw new MedicationError({
        code: MedicationErrorCode.INVALID_PIN,
        message: translate('medication.invalidPin', this.language),
        timestamp: new Date().toISOString(),
        details: 'Invalid administrator PIN',
      });
    }

    // Verify witness PIN if witness is required
    if (data.witness && !data.witnessPin) {
      throw new MedicationError({
        code: MedicationErrorCode.WITNESS_PIN_REQUIRED,
        message: translate('medication.witnessPinRequired', this.language),
        timestamp: new Date().toISOString(),
        details: 'Witness PIN is required',
      });
    }

    if (data.witness && data.witnessPin) {
      const witnessVerified = await this.verifyStaffPin(data.witness.id, data.witnessPin);
      if (!witnessVerified) {
        throw new MedicationError({
          code: MedicationErrorCode.INVALID_WITNESS_PIN,
          message: translate('medication.invalidWitnessPin', this.language),
          timestamp: new Date().toISOString(),
          details: 'Invalid witness PIN',
        });
      }
    }
  }

  /**
   * Verify individual staff PIN
   */
  private async verifyStaffPin(staffId: string, pin: string): Promise<boolean> {
    try {
      // Hash the PIN before verification
      const hashedPin = await this.hashPin(pin);
      
      // Verify against stored PIN
      const staff = await this.repository.getStaffById(staffId);
      return staff.pinHash === hashedPin;
    } catch (error) {
      console.error('[AdvancedMedicationService] PIN verification failed:', error);
      return false;
    }
  }

  /**
   * Hash PIN for secure storage and comparison
   */
  private async hashPin(pin: string): Promise<string> {
    // Implement secure PIN hashing (e.g., using bcrypt or similar)
    // This is a placeholder - actual implementation would use proper cryptographic functions
    return pin; // Replace with actual hashing implementation
  }

  /**
   * Comprehensive medication error prevention system
   */
  private async performSafetyChecks(
    scheduleId: string,
    data: any
  ): Promise<void> {
    const checks = await Promise.all([
      this.checkDrugInteractions(scheduleId),
      this.checkAllergies(scheduleId),
      this.checkDuplicateAdministration(scheduleId),
      this.checkMaxDosage(scheduleId),
      this.checkTimingCompliance(scheduleId),
      this.checkStockAvailability(scheduleId),
    ]);

    const errors = checks.filter(check => !check.passed);
    if (errors.length > 0) {
      throw new MedicationError({
        code: MedicationErrorCode.SAFETY_CHECK_FAILED,
        message: translate('medication.safetyCheckFailed', this.language),
        timestamp: new Date().toISOString(),
        details: errors.map(e => e.message).join(', '),
      });
    }
  }

  /**
   * Real-time drug interaction checking
   */
  private async checkDrugInteractions(
    scheduleId: string
  ): Promise<MedicationInteraction[]> {
    const interactions = await this.clinicalService.checkInteractions(scheduleId);
    if (interactions.length > 0) {
      await this.alertService.createAlert({
        type: 'DRUG_INTERACTION',
        priority: AlertPriority.HIGH,
        details: interactions,
      });
    }
    return interactions;
  }

  /**
   * Stock level monitoring and alerts
   */
  private async verifyStockLevels(
    medicationId: string,
    scheduleData: any
  ): Promise<void> {
    const stockLevel = await this.stockService.getStockLevel(medicationId);
    const requiredStock = this.calculateRequiredStock(scheduleData);

    if (stockLevel.quantity < requiredStock) {
      await this.alertService.createAlert({
        type: 'LOW_STOCK',
        priority: AlertPriority.MEDIUM,
        details: {
          medicationId,
          current: stockLevel.quantity,
          required: requiredStock,
        },
      });
    }
  }

  /**
   * Enhanced error handling with translation support
   */
  private handleError(error: any, context: string): void {
    const errorMessage = translate(`medication.errors.${context}`, this.language);
    console.error(`[AdvancedMedicationService] ${errorMessage}:`, error);
    
    // Create alert for critical errors
    if (error instanceof MedicationError && error.code !== MedicationErrorCode.VALIDATION_ERROR) {
      this.alertService.createAlert({
        type: 'ERROR',
        priority: AlertPriority.HIGH,
        details: {
          context,
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  /**
   * Comprehensive compliance reporting with enhanced analytics
   */
  async generateEnhancedReport(
    residentId: string,
    startDate: Date,
    endDate: Date,
    region: Region,
    careHomeType: CareHomeType
  ): Promise<any> {
    try {
      const baseReport = await super.generateComplianceReport(
        residentId,
        startDate,
        endDate,
        region,
        careHomeType
      );

      // Enhanced analytics
      const enhancedReport = {
        ...baseReport,
        errorPrevention: await this.generateErrorPreventionStats(residentId, startDate, endDate),
        stockManagement: await this.stockService.generateStockReport(startDate, endDate),
        administrationCompliance: await this.calculateAdministrationCompliance(residentId, startDate, endDate),
        alerts: await this.alertService.getAlertsSummary(residentId, startDate, endDate),
      };

      return enhancedReport;
    } catch (error) {
      this.handleError(error, 'generateEnhancedReport');
      throw error;
    }
  }

  /**
   * Check allergies and contraindications
   */
  private async checkAllergies(scheduleId: string): Promise<{ passed: boolean; message?: string }> {
    try {
      const schedule = await this.repository.getScheduleById(scheduleId);
      const allergies = await this.clinicalService.getResidentAllergies(schedule.residentId);
      const contraindications = await this.clinicalService.getMedicationContraindications(schedule.medicationId);

      const allergicReactions = allergies.filter(allergy => 
        contraindications.some(contra => contra.substanceId === allergy.substanceId)
      );

      if (allergicReactions.length > 0) {
        return {
          passed: false,
          message: translate('medication.allergyWarning', this.language, {
            allergies: allergicReactions.map(a => a.name).join(', ')
          })
        };
      }

      return { passed: true };
    } catch (error) {
      console.error('[AdvancedMedicationService] Allergy check failed:', error);
      throw error;
    }
  }

  /**
   * Check for duplicate administration
   */
  private async checkDuplicateAdministration(scheduleId: string): Promise<{ passed: boolean; message?: string }> {
    try {
      const schedule = await this.repository.getScheduleById(scheduleId);
      const lastAdministration = await this.repository.getLastAdministration(
        schedule.residentId,
        schedule.medicationId
      );

      if (!lastAdministration) return { passed: true };

      const minTimeBetweenDoses = await this.clinicalService.getMinTimeBetweenDoses(schedule.medicationId);
      const timeSinceLastDose = Date.now() - lastAdministration.administeredAt.getTime();

      if (timeSinceLastDose < minTimeBetweenDoses) {
        return {
          passed: false,
          message: translate('medication.duplicateAdministration', this.language, {
            timeRemaining: Math.ceil((minTimeBetweenDoses - timeSinceLastDose) / (1000 * 60))
          })
        };
      }

      return { passed: true };
    } catch (error) {
      console.error('[AdvancedMedicationService] Duplicate check failed:', error);
      throw error;
    }
  }

  /**
   * Check maximum daily dosage
   */
  private async checkMaxDosage(scheduleId: string): Promise<{ passed: boolean; message?: string }> {
    try {
      const schedule = await this.repository.getScheduleById(scheduleId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const administrations = await this.repository.getAdministrationsByDateRange(
        schedule.residentId,
        schedule.medicationId,
        today,
        new Date()
      );

      const totalDosage = administrations.reduce((sum, admin) => sum + admin.dosage, 0);
      const maxDailyDosage = await this.clinicalService.getMaxDailyDosage(schedule.medicationId);

      if (totalDosage >= maxDailyDosage) {
        return {
          passed: false,
          message: translate('medication.maxDosageExceeded', this.language)
        };
      }

      return { passed: true };
    } catch (error) {
      console.error('[AdvancedMedicationService] Max dosage check failed:', error);
      throw error;
    }
  }

  /**
   * Check timing compliance
   */
  private async checkTimingCompliance(scheduleId: string): Promise<{ passed: boolean; message?: string }> {
    try {
      const schedule = await this.repository.getScheduleById(scheduleId);
      const now = new Date();
      const scheduledTime = new Date(schedule.scheduledTime);
      const tolerance = 30 * 60 * 1000; // 30 minutes

      if (Math.abs(now.getTime() - scheduledTime.getTime()) > tolerance) {
        return {
          passed: false,
          message: translate('medication.timingDeviation', this.language, {
            scheduled: format(scheduledTime, 'HH:mm')
          })
        };
      }

      return { passed: true };
    } catch (error) {
      console.error('[AdvancedMedicationService] Timing compliance check failed:', error);
      throw error;
    }
  }

  /**
   * Check stock availability
   */
  private async checkStockAvailability(scheduleId: string): Promise<{ passed: boolean; message?: string }> {
    try {
      const schedule = await this.repository.getScheduleById(scheduleId);
      const stockLevel = await this.stockService.getStockLevel(schedule.medicationId);

      if (stockLevel.quantity < schedule.dosage) {
        return {
          passed: false,
          message: translate('medication.insufficientStock', this.language, {
            available: stockLevel.quantity,
            required: schedule.dosage
          })
        };
      }

      return { passed: true };
    } catch (error) {
      console.error('[AdvancedMedicationService] Stock availability check failed:', error);
      throw error;
    }
  }

  /**
   * Perform pre-schedule validation checks
   */
  private async performPreScheduleChecks(
    residentId: string,
    medicationId: string,
    scheduleData: any
  ): Promise<void> {
    try {
      // Validate resident exists and is active
      const resident = await this.repository.getResidentById(residentId);
      if (!resident || !resident.isActive) {
        throw new MedicationError({
          code: MedicationErrorCode.INVALID_RESIDENT,
          message: translate('medication.invalidResident', this.language),
          timestamp: new Date().toISOString(),
          details: 'Resident not found or inactive'
        });
      }

      // Validate medication exists and is active
      const medication = await this.repository.getMedicationById(medicationId);
      if (!medication || !medication.isActive) {
        throw new MedicationError({
          code: MedicationErrorCode.INVALID_MEDICATION,
          message: translate('medication.invalidMedication', this.language),
          timestamp: new Date().toISOString(),
          details: 'Medication not found or inactive'
        });
      }

      // Validate schedule timing
      if (!this.isValidScheduleTiming(scheduleData)) {
        throw new MedicationError({
          code: MedicationErrorCode.INVALID_SCHEDULE,
          message: translate('medication.invalidSchedule', this.language),
          timestamp: new Date().toISOString(),
          details: 'Invalid schedule timing configuration'
        });
      }

      // Check for conflicts with existing schedules
      const conflicts = await this.checkScheduleConflicts(residentId, medicationId, scheduleData);
      if (conflicts.length > 0) {
        throw new MedicationError({
          code: MedicationErrorCode.SCHEDULE_CONFLICT,
          message: translate('medication.scheduleConflict', this.language),
          timestamp: new Date().toISOString(),
          details: conflicts.join(', ')
        });
      }
    } catch (error) {
      console.error('[AdvancedMedicationService] Pre-schedule checks failed:', error);
      throw error;
    }
  }

  /**
   * Validate schedule timing configuration
   */
  private isValidScheduleTiming(scheduleData: any): boolean {
    // Validate frequency
    if (!scheduleData.frequency || !['daily', 'weekly', 'monthly'].includes(scheduleData.frequency)) {
      return false;
    }

    // Validate times
    if (!Array.isArray(scheduleData.times) || scheduleData.times.length === 0) {
      return false;
    }

    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!scheduleData.times.every((time: string) => timeRegex.test(time))) {
      return false;
    }

    // Validate days of week if weekly
    if (scheduleData.frequency === 'weekly') {
      if (!Array.isArray(scheduleData.daysOfWeek) || scheduleData.daysOfWeek.length === 0) {
        return false;
      }
      if (!scheduleData.daysOfWeek.every((day: number) => day >= 0 && day <= 6)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check for schedule conflicts
   */
  private async checkScheduleConflicts(
    residentId: string,
    medicationId: string,
    scheduleData: any
  ): Promise<string[]> {
    const existingSchedules = await this.repository.getActiveSchedules(residentId);
    const conflicts: string[] = [];

    for (const existing of existingSchedules) {
      if (this.hasTimeOverlap(existing, scheduleData)) {
        conflicts.push(
          translate('medication.conflictWith', this.language, {
            medication: existing.medicationName,
            time: existing.scheduledTime
          })
        );
      }
    }

    return conflicts;
  }

  /**
   * Check for time overlap between schedules
   */
  private hasTimeOverlap(schedule1: any, schedule2: any): boolean {
    const tolerance = 30; // 30 minutes tolerance

    for (const time1 of schedule1.times) {
      for (const time2 of schedule2.times) {
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);
        
        const minutes1 = h1 * 60 + m1;
        const minutes2 = h2 * 60 + m2;
        
        if (Math.abs(minutes1 - minutes2) < tolerance) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Set up medication monitoring
   */
  private async setupMedicationMonitoring(
    schedule: MedicationScheduleItem,
    region: Region
  ): Promise<void> {
    try {
      // Set up stock level monitoring
      await this.stockService.setupStockMonitoring(schedule.medicationId, {
        reorderLevel: this.calculateReorderLevel(schedule),
        criticalLevel: this.calculateCriticalLevel(schedule)
      });

      // Set up compliance monitoring
      await this.setupComplianceMonitoring(schedule, region);

      // Set up interaction monitoring
      await this.setupInteractionMonitoring(schedule);

      // Set up expiry monitoring
      await this.setupExpiryMonitoring(schedule.medicationId);
    } catch (error) {
      console.error('[AdvancedMedicationService] Failed to setup monitoring:', error);
      throw error;
    }
  }

  /**
   * Calculate reorder level
   */
  private calculateReorderLevel(schedule: MedicationScheduleItem): number {
    const dailyDoses = schedule.times.length;
    const daysSupply = 14; // 2 weeks supply
    return Math.ceil(dailyDoses * daysSupply * 1.1); // 10% buffer
  }

  /**
   * Calculate critical stock level
   */
  private calculateCriticalLevel(schedule: MedicationScheduleItem): number {
    const dailyDoses = schedule.times.length;
    const daysSupply = 3; // 3 days supply
    return Math.ceil(dailyDoses * daysSupply);
  }

  /**
   * Set up compliance monitoring
   */
  private async setupComplianceMonitoring(
    schedule: MedicationScheduleItem,
    region: Region
  ): Promise<void> {
    const requirements = await this.complianceService.getRequirements(region, schedule.careHomeType);
    
    await this.alertService.createAlert({
      type: 'COMPLIANCE_MONITORING',
      priority: AlertPriority.MEDIUM,
      details: {
        scheduleId: schedule.id,
        requirements,
        monitoringStart: new Date()
      }
    });
  }

  /**
   * Set up interaction monitoring
   */
  private async setupInteractionMonitoring(schedule: MedicationScheduleItem): Promise<void> {
    const interactions = await this.clinicalService.getPotentialInteractions(
      schedule.residentId,
      schedule.medicationId
    );

    if (interactions.length > 0) {
      await this.alertService.createAlert({
        type: 'POTENTIAL_INTERACTION',
        priority: AlertPriority.HIGH,
        details: {
          scheduleId: schedule.id,
          interactions,
          monitoringStart: new Date()
        }
      });
    }
  }

  /**
   * Set up expiry monitoring
   */
  private async setupExpiryMonitoring(medicationId: string): Promise<void> {
    const stock = await this.stockService.getStockLevel(medicationId);
    
    if (stock.expiryDate) {
      const daysToExpiry = Math.ceil(
        (stock.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysToExpiry <= 90) {
        await this.alertService.createAlert({
          type: 'EXPIRY_WARNING',
          priority: AlertPriority.MEDIUM,
          details: {
            medicationId,
            expiryDate: stock.expiryDate,
            daysToExpiry
          }
        });
      }
    }
  }
} 