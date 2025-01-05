import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

interface SafetyCheckContext {
  residentId: string;
  medicationId: string;
  staffId: string;
  careHomeId: string;
  scannedAt: Date;
}

interface VitalSigns {
  bloodPressure?: string;
  temperature?: number;
  pulseRate?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  bloodSugar?: number;
}

interface SafetyCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiresWitness: boolean;
  requiresDoubleCheck: boolean;
  vitalSignsRequired: boolean;
}

export class EnhancedSafetyService {
  async performComprehensiveSafetyCheck(context: SafetyCheckContext): Promise<SafetyCheckResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let requiresWitness = false;
    let requiresDoubleCheck = false;
    let vitalSignsRequired = false;

    try {
      // 1. Resident Status Checks
      await this.checkResidentStatus(context, errors, warnings);

      // 2. Medication Validation
      await this.validateMedication(context, errors, warnings);

      // 3. Staff Competency Check
      await this.validateStaffCompetency(context, errors, warnings);

      // 4. Environmental Safety
      await this.checkEnvironmentalSafety(context, errors, warnings);

      // 5. Clinical Safety
      const clinicalChecks = await this.performClinicalSafetyChecks(context);
      errors.push(...clinicalChecks.errors);
      warnings.push(...clinicalChecks.warnings);
      requiresWitness = clinicalChecks.requiresWitness;
      vitalSignsRequired = clinicalChecks.vitalSignsRequired;

      // 6. Documentation Completeness
      await this.validateDocumentation(context, errors, warnings);

      // 7. Time-based Safety Checks
      await this.performTimeBasedChecks(context, errors, warnings);

      // 8. Cross-reference with Care Plan
      await this.validateAgainstCarePlan(context, errors, warnings);

      // 9. Check for Recent Changes or Incidents
      await this.checkRecentChanges(context, errors, warnings);

      // Log all safety checks for audit
      await this.logSafetyCheck(context, errors, warnings);

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        requiresWitness,
        requiresDoubleCheck: errors.length > 0 || warnings.length > 0,
        vitalSignsRequired
      };
    } catch (error) {
      console.error('Safety check error:', error);
      return {
        isValid: false,
        errors: ['System error during safety check'],
        warnings,
        requiresWitness: true,
        requiresDoubleCheck: true,
        vitalSignsRequired: false
      };
    }
  }

  private async checkResidentStatus(
    context: SafetyCheckContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    const resident = await prisma.resident.findUnique({
      where: { id: context.residentId },
      include: {
        allergies: true,
        vitalSigns: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        },
        recentIncidents: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }
      }
    });

    if (!resident) {
      errors.push('Resident not found in system');
      return;
    }

    // Check for recent incidents
    if (resident.recentIncidents.length > 0) {
      warnings.push('Recent incidents reported - review incident log');
    }

    // Check vital signs if recorded recently
    if (resident.vitalSigns[0]) {
      const lastVitals = resident.vitalSigns[0];
      const vitalAge = Date.now() - lastVitals.recordedAt.getTime();
      if (vitalAge > 8 * 60 * 60 * 1000) { // 8 hours
        warnings.push('Vital signs not recorded in last 8 hours');
      }
    }

    // Check for allergies
    const medication = await prisma.medication.findUnique({
      where: { id: context.medicationId },
      include: { ingredients: true }
    });

    if (medication) {
      const allergyConflicts = resident.allergies.filter(allergy =>
        medication.ingredients.some(ing => ing.name === allergy.substance)
      );
      
      if (allergyConflicts.length > 0) {
        errors.push('ALLERGY ALERT: Known allergy to medication ingredient(s)');
      }
    }
  }

  private async validateMedication(
    context: SafetyCheckContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    const medication = await prisma.medication.findUnique({
      where: { id: context.medicationId },
      include: {
        prescriptions: {
          orderBy: { prescribedAt: 'desc' },
          take: 1
        },
        stockLevels: true,
        batchInfo: true
      }
    });

    if (!medication) {
      errors.push('Medication not found in system');
      return;
    }

    // Verify prescription is current
    const latestPrescription = medication.prescriptions[0];
    if (!latestPrescription) {
      errors.push('No valid prescription found');
    } else {
      const prescriptionAge = Date.now() - latestPrescription.prescribedAt.getTime();
      if (prescriptionAge > 30 * 24 * 60 * 60 * 1000) { // 30 days
        warnings.push('Prescription is over 30 days old - consider review');
      }
    }

    // Check stock levels
    const stock = medication.stockLevels[0];
    if (!stock || stock.quantity < stock.minimumLevel) {
      warnings.push('Stock levels below minimum - order more');
    }

    // Check batch information
    const batch = medication.batchInfo;
    if (batch) {
      if (new Date(batch.expiryDate) <= new Date()) {
        errors.push('EXPIRED MEDICATION');
      } else if (new Date(batch.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) {
        warnings.push('Medication expires within 30 days');
      }

      // Check for recalls
      const hasRecall = await prisma.medicationRecall.findFirst({
        where: {
          batchNumber: batch.batchNumber,
          active: true
        }
      });

      if (hasRecall) {
        errors.push('RECALL ALERT: This batch has been recalled');
      }
    }
  }

  private async validateStaffCompetency(
    context: SafetyCheckContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    const staff = await prisma.staff.findUnique({
      where: { id: context.staffId },
      include: {
        medicationTraining: {
          orderBy: { completedAt: 'desc' },
          take: 1
        },
        competencyAssessments: {
          orderBy: { assessedAt: 'desc' },
          take: 1
        }
      }
    });

    if (!staff) {
      errors.push('Staff member not found in system');
      return;
    }

    // Check medication training
    const training = staff.medicationTraining[0];
    if (!training) {
      errors.push('Staff member has no medication training record');
    } else {
      const trainingAge = Date.now() - training.completedAt.getTime();
      if (trainingAge > 365 * 24 * 60 * 60 * 1000) { // 1 year
        errors.push('Medication training expired - requires renewal');
      } else if (trainingAge > 300 * 24 * 60 * 60 * 1000) { // 10 months
        warnings.push('Medication training due for renewal soon');
      }
    }

    // Check competency assessment
    const assessment = staff.competencyAssessments[0];
    if (!assessment) {
      errors.push('No competency assessment found');
    } else if (!assessment.passed) {
      errors.push('Staff member has not passed latest competency assessment');
    }
  }

  private async checkEnvironmentalSafety(
    context: SafetyCheckContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    // Check medication storage conditions
    const storageCheck = await prisma.storageCondition.findFirst({
      where: { 
        careHomeId: context.careHomeId,
        medicationId: context.medicationId
      },
      include: {
        temperatureLogs: {
          orderBy: { recordedAt: 'desc' },
          take: 1
        }
      }
    });

    if (storageCheck?.temperatureLogs[0]) {
      const temp = storageCheck.temperatureLogs[0];
      if (temp.temperature > storageCheck.maxTemp || temp.temperature < storageCheck.minTemp) {
        errors.push('Storage temperature out of range - check medication condition');
      }
    }

    // Check for appropriate lighting
    const timeOfDay = new Date().getHours();
    if (timeOfDay < 6 || timeOfDay > 22) {
      warnings.push('Administering medication in low light conditions - ensure adequate lighting');
    }
  }

  private async performClinicalSafetyChecks(
    context: SafetyCheckContext
  ): Promise<{
    errors: string[];
    warnings: string[];
    requiresWitness: boolean;
    vitalSignsRequired: boolean;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let requiresWitness = false;
    let vitalSignsRequired = false;

    const medication = await prisma.medication.findUnique({
      where: { id: context.medicationId },
      include: {
        interactions: true,
        contraindications: true,
        monitoringRequirements: true
      }
    });

    if (!medication) {
      errors.push('Medication not found');
      return { errors, warnings, requiresWitness: true, vitalSignsRequired: false };
    }

    // Check for high-risk medication
    if (medication.highRisk) {
      requiresWitness = true;
      vitalSignsRequired = true;
      warnings.push('High-risk medication - requires witness and vital signs monitoring');
    }

    // Check recent medications for interactions
    const recentMeds = await prisma.medicationAdministration.findMany({
      where: {
        residentId: context.residentId,
        administeredAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        medication: {
          include: {
            interactions: true
          }
        }
      }
    });

    // Check for interactions
    for (const recent of recentMeds) {
      const interactions = medication.interactions.filter(int =>
        recent.medication.interactions.some(ri => ri.id === int.id)
      );
      
      if (interactions.length > 0) {
        errors.push(`Potential interaction with ${recent.medication.name}`);
        requiresWitness = true;
      }
    }

    // Check monitoring requirements
    if (medication.monitoringRequirements.length > 0) {
      vitalSignsRequired = true;
      const monitoringList = medication.monitoringRequirements
        .map(req => req.description)
        .join(', ');
      warnings.push(`Required monitoring: ${monitoringList}`);
    }

    return {
      errors,
      warnings,
      requiresWitness,
      vitalSignsRequired
    };
  }

  private async validateDocumentation(
    context: SafetyCheckContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    // Check for missing or incomplete documentation
    const recentDocs = await prisma.medicationAdministrationRecord.findMany({
      where: {
        residentId: context.residentId,
        medicationId: context.medicationId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    // Check for missing signatures
    const missingSignatures = recentDocs.filter(doc => !doc.signedBy);
    if (missingSignatures.length > 0) {
      errors.push('Previous administration records missing signatures');
    }

    // Check for incomplete documentation
    const incomplete = recentDocs.filter(doc => !doc.notes || doc.notes.length < 10);
    if (incomplete.length > 0) {
      warnings.push('Previous administration records have incomplete notes');
    }
  }

  private async performTimeBasedChecks(
    context: SafetyCheckContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    const schedule = await prisma.medicationSchedule.findFirst({
      where: {
        medicationId: context.medicationId,
        residentId: context.residentId,
        active: true
      }
    });

    if (!schedule) {
      errors.push('No active medication schedule found');
      return;
    }

    const currentTime = context.scannedAt;
    const scheduledTime = new Date(schedule.nextDueAt);
    const timeDifference = Math.abs(currentTime.getTime() - scheduledTime.getTime());
    const minutesDifference = Math.floor(timeDifference / (1000 * 60));

    if (minutesDifference > 30) {
      warnings.push(`Administration time differs from scheduled time by ${minutesDifference} minutes`);
    }

    // Check for missed doses
    const missedDoses = await prisma.medicationAdministrationRecord.count({
      where: {
        medicationId: context.medicationId,
        residentId: context.residentId,
        status: 'MISSED',
        scheduledAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    if (missedDoses > 0) {
      warnings.push(`${missedDoses} missed doses in the last 7 days - review medication compliance`);
    }
  }

  private async validateAgainstCarePlan(
    context: SafetyCheckContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    const carePlan = await prisma.carePlan.findFirst({
      where: {
        residentId: context.residentId,
        active: true
      },
      include: {
        medicationInstructions: true,
        healthConditions: true
      }
    });

    if (!carePlan) {
      errors.push('No active care plan found');
      return;
    }

    // Check if medication is part of care plan
    const medicationInstruction = carePlan.medicationInstructions.find(
      mi => mi.medicationId === context.medicationId
    );

    if (!medicationInstruction) {
      errors.push('Medication not listed in current care plan');
    } else {
      // Check for special instructions
      if (medicationInstruction.specialInstructions) {
        warnings.push(`Special instructions: ${medicationInstruction.specialInstructions}`);
      }
    }

    // Check for contraindications with health conditions
    const medication = await prisma.medication.findUnique({
      where: { id: context.medicationId },
      include: { contraindications: true }
    });

    if (medication) {
      const healthConflicts = carePlan.healthConditions.filter(condition =>
        medication.contraindications.some(ci => ci.healthConditionId === condition.id)
      );

      if (healthConflicts.length > 0) {
        errors.push('Medication may be contraindicated for resident\'s health conditions');
      }
    }
  }

  private async checkRecentChanges(
    context: SafetyCheckContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    // Check for recent medication changes
    const recentChanges = await prisma.medicationChange.findMany({
      where: {
        residentId: context.residentId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    });

    if (recentChanges.length > 0) {
      warnings.push('Recent medication changes detected - verify against latest instructions');
    }

    // Check for recent adverse events
    const recentAdverseEvents = await prisma.adverseEvent.findMany({
      where: {
        residentId: context.residentId,
        medicationId: context.medicationId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    });

    if (recentAdverseEvents.length > 0) {
      errors.push('Previous adverse events recorded - review before administration');
    }
  }

  private async logSafetyCheck(
    context: SafetyCheckContext,
    errors: string[],
    warnings: string[]
  ): Promise<void> {
    await prisma.safetyCheckLog.create({
      data: {
        residentId: context.residentId,
        medicationId: context.medicationId,
        staffId: context.staffId,
        careHomeId: context.careHomeId,
        performedAt: context.scannedAt,
        errors: errors,
        warnings: warnings,
        status: errors.length === 0 ? 'PASSED' : 'FAILED'
      }
    });
  }
}
