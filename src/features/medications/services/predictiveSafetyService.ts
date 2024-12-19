import { prisma } from '@/lib/prisma';
import { EnhancedSafetyService } from './enhancedSafetyService';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';

interface PredictiveSafetyContext extends SafetyCheckContext {
  environmentalData?: {
    temperature?: number;
    humidity?: number;
    lightLevel?: number;
    noiseLevel?: number;
  };
  staffWorkload?: {
    hoursWorked: number;
    medicationsAdministered: number;
    breaksTaken: number;
  };
}

interface BiometricData {
  heartRate?: number;
  bloodPressure?: string;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  consciousness: 'ALERT' | 'VERBAL' | 'PAIN' | 'UNRESPONSIVE';
  painScore?: number;
}

interface BehavioralData {
  mood?: string;
  appetite?: string;
  mobility?: string;
  recentBehavioralChanges?: string[];
  sleepQuality?: string;
}

interface PredictiveSafetyResult extends SafetyCheckResult {
  riskScore: number;
  predictiveWarnings: string[];
  requiredActions: string[];
  biometricChecksRequired: boolean;
  behavioralChecksRequired: boolean;
  recommendedPrecautions: string[];
}

export class PredictiveSafetyService extends EnhancedSafetyService {
  async performPredictiveSafetyAnalysis(
    context: PredictiveSafetyContext
  ): Promise<PredictiveSafetyResult> {
    // Get base safety check results
    const baseResults = await super.performComprehensiveSafetyCheck(context);

    const predictiveWarnings: string[] = [];
    const requiredActions: string[] = [];
    const recommendedPrecautions: string[] = [];
    let riskScore = 0;
    let biometricChecksRequired = false;
    let behavioralChecksRequired = false;

    try {
      // 1. Analyze Historical Patterns
      const historicalRisks = await this.analyzeHistoricalPatterns(context);
      predictiveWarnings.push(...historicalRisks.warnings);
      riskScore += historicalRisks.riskScore;

      // 2. Environmental Risk Assessment
      const environmentalRisks = await this.assessEnvironmentalRisks(context);
      predictiveWarnings.push(...environmentalRisks.warnings);
      riskScore += environmentalRisks.riskScore;

      // 3. Staff Fatigue Analysis
      const staffRisks = await this.analyzeStaffRisks(context);
      predictiveWarnings.push(...staffRisks.warnings);
      riskScore += staffRisks.riskScore;

      // 4. Resident Behavioral Analysis
      const behavioralRisks = await this.analyzeResidentBehavior(context);
      predictiveWarnings.push(...behavioralRisks.warnings);
      riskScore += behavioralRisks.riskScore;
      behavioralChecksRequired = behavioralRisks.requiresCheck;

      // 5. Time-based Risk Analysis
      const timeRisks = await this.analyzeTimeBasedRisks(context);
      predictiveWarnings.push(...timeRisks.warnings);
      riskScore += timeRisks.riskScore;

      // 6. Medication Complexity Analysis
      const complexityRisks = await this.analyzeMedicationComplexity(context);
      predictiveWarnings.push(...complexityRisks.warnings);
      riskScore += complexityRisks.riskScore;

      // 7. Biometric Monitoring Requirements
      const biometricRisks = await this.analyzeBiometricRequirements(context);
      predictiveWarnings.push(...biometricRisks.warnings);
      riskScore += biometricRisks.riskScore;
      biometricChecksRequired = biometricRisks.requiresCheck;

      // Generate required actions based on risk score
      requiredActions.push(...this.generateRequiredActions(riskScore));

      // Generate recommended precautions
      recommendedPrecautions.push(...this.generatePrecautions(riskScore));

      // Log predictive analysis
      await this.logPredictiveAnalysis(context, {
        riskScore,
        predictiveWarnings,
        requiredActions,
      });

      return {
        ...baseResults,
        riskScore,
        predictiveWarnings,
        requiredActions,
        biometricChecksRequired,
        behavioralChecksRequired,
        recommendedPrecautions,
      };
    } catch (error) {
      console.error('Predictive safety analysis error:', error);
      return {
        ...baseResults,
        riskScore: 100, // High risk score on error
        predictiveWarnings: ['System error during predictive analysis'],
        requiredActions: ['Perform manual safety checks', 'Require supervisor verification'],
        biometricChecksRequired: true,
        behavioralChecksRequired: true,
        recommendedPrecautions: ['Exercise maximum caution'],
      };
    }
  }

  private async analyzeHistoricalPatterns(
    context: PredictiveSafetyContext
  ): Promise<{ warnings: string[]; riskScore: number }> {
    const warnings: string[] = [];
    let riskScore = 0;

    // Analyze medication administration history
    const history = await prisma.medicationAdministrationRecord.findMany({
      where: {
        residentId: context.residentId,
        medicationId: context.medicationId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      include: {
        errors: true,
        reactions: true,
      },
    });

    // Check for patterns in errors
    const errorPatterns = this.analyzeErrorPatterns(history);
    if (errorPatterns.length > 0) {
      warnings.push(
        `Historical error patterns detected: ${errorPatterns.join(', ')}`
      );
      riskScore += 20;
    }

    // Check for patterns in adverse reactions
    const reactionPatterns = this.analyzeReactionPatterns(history);
    if (reactionPatterns.length > 0) {
      warnings.push(
        `Historical reaction patterns detected: ${reactionPatterns.join(', ')}`
      );
      riskScore += 30;
    }

    // Analyze time-based patterns
    const timePatterns = this.analyzeTimePatterns(history);
    if (timePatterns.length > 0) {
      warnings.push(
        `Time-based risk patterns detected: ${timePatterns.join(', ')}`
      );
      riskScore += 15;
    }

    return { warnings, riskScore };
  }

  private async assessEnvironmentalRisks(
    context: PredictiveSafetyContext
  ): Promise<{ warnings: string[]; riskScore: number }> {
    const warnings: string[] = [];
    let riskScore = 0;

    if (context.environmentalData) {
      // Temperature risks
      if (context.environmentalData.temperature) {
        if (context.environmentalData.temperature > 25) {
          warnings.push('High temperature may affect medication stability');
          riskScore += 15;
        }
        if (context.environmentalData.temperature < 15) {
          warnings.push('Low temperature may affect medication stability');
          riskScore += 15;
        }
      }

      // Lighting risks
      if (context.environmentalData.lightLevel) {
        if (context.environmentalData.lightLevel < 50) { // Assuming lux measurement
          warnings.push('Poor lighting conditions increase risk of errors');
          riskScore += 20;
        }
      }

      // Noise risks
      if (context.environmentalData.noiseLevel) {
        if (context.environmentalData.noiseLevel > 60) { // Assuming dB measurement
          warnings.push('High noise levels may affect concentration');
          riskScore += 10;
        }
      }
    }

    return { warnings, riskScore };
  }

  private async analyzeStaffRisks(
    context: PredictiveSafetyContext
  ): Promise<{ warnings: string[]; riskScore: number }> {
    const warnings: string[] = [];
    let riskScore = 0;

    if (context.staffWorkload) {
      // Hours worked risks
      if (context.staffWorkload.hoursWorked > 10) {
        warnings.push('Staff member has worked extended hours - fatigue risk');
        riskScore += 25;
      }

      // Medication administration load
      if (context.staffWorkload.medicationsAdministered > 50) {
        warnings.push('High medication administration load - increased error risk');
        riskScore += 20;
      }

      // Break frequency
      if (context.staffWorkload.breaksTaken < 2 && context.staffWorkload.hoursWorked > 6) {
        warnings.push('Insufficient breaks taken - recommend break before proceeding');
        riskScore += 15;
      }
    }

    return { warnings, riskScore };
  }

  private async analyzeResidentBehavior(
    context: PredictiveSafetyContext
  ): Promise<{ warnings: string[]; riskScore: number; requiresCheck: boolean }> {
    const warnings: string[] = [];
    let riskScore = 0;
    let requiresCheck = false;

    // Get recent behavioral observations
    const recentBehavior = await prisma.behavioralObservation.findMany({
      where: {
        residentId: context.residentId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (recentBehavior.length > 0) {
      const latestBehavior = recentBehavior[0];

      // Check for concerning behaviors
      if (latestBehavior.agitation) {
        warnings.push('Recent agitation reported - assess appropriateness');
        riskScore += 20;
        requiresCheck = true;
      }

      if (latestBehavior.refusal) {
        warnings.push('Recent medication refusal - assess willingness');
        riskScore += 15;
        requiresCheck = true;
      }

      if (latestBehavior.confusion) {
        warnings.push('Recent confusion noted - verify understanding');
        riskScore += 25;
        requiresCheck = true;
      }
    }

    return { warnings, riskScore, requiresCheck };
  }

  private async analyzeTimeBasedRisks(
    context: PredictiveSafetyContext
  ): Promise<{ warnings: string[]; riskScore: number }> {
    const warnings: string[] = [];
    let riskScore = 0;

    // Get medication schedule
    const schedule = await prisma.medicationSchedule.findFirst({
      where: {
        medicationId: context.medicationId,
        residentId: context.residentId,
        active: true,
      },
    });

    if (schedule) {
      const currentTime = context.scannedAt;
      const scheduledTime = new Date(schedule.nextDueAt);
      const minutesDifference = differenceInMinutes(currentTime, scheduledTime);

      // Time window analysis
      if (Math.abs(minutesDifference) > 30) {
        warnings.push(
          `Significant time deviation (${minutesDifference} minutes) from scheduled time`
        );
        riskScore += Math.min(Math.abs(minutesDifference) / 2, 30);
      }

      // Check for time-critical medications
      if (schedule.timeCritical && Math.abs(minutesDifference) > 15) {
        warnings.push('Time-critical medication with significant delay');
        riskScore += 40;
      }
    }

    return { warnings, riskScore };
  }

  private async analyzeMedicationComplexity(
    context: PredictiveSafetyContext
  ): Promise<{ warnings: string[]; riskScore: number }> {
    const warnings: string[] = [];
    let riskScore = 0;

    // Get medication details
    const medication = await prisma.medication.findUnique({
      where: { id: context.medicationId },
      include: {
        interactions: true,
        contraindications: true,
        specialInstructions: true,
      },
    });

    if (medication) {
      // Complexity factors
      if (medication.interactions.length > 3) {
        warnings.push('Multiple drug interactions - extra verification required');
        riskScore += 20;
      }

      if (medication.contraindications.length > 2) {
        warnings.push('Multiple contraindications - careful assessment needed');
        riskScore += 15;
      }

      if (medication.specialInstructions.length > 2) {
        warnings.push('Complex administration instructions - verify understanding');
        riskScore += 10;
      }

      // High-alert medication checks
      if (medication.highAlert) {
        warnings.push('High-alert medication - enhanced precautions required');
        riskScore += 30;
      }
    }

    return { warnings, riskScore };
  }

  private async analyzeBiometricRequirements(
    context: PredictiveSafetyContext
  ): Promise<{ warnings: string[]; riskScore: number; requiresCheck: boolean }> {
    const warnings: string[] = [];
    let riskScore = 0;
    let requiresCheck = false;

    // Get recent vital signs
    const recentVitals = await prisma.vitalSigns.findFirst({
      where: {
        residentId: context.residentId,
      },
      orderBy: {
        recordedAt: 'desc',
      },
    });

    const medication = await prisma.medication.findUnique({
      where: { id: context.medicationId },
      include: {
        vitalSignRequirements: true,
      },
    });

    if (medication?.vitalSignRequirements.length > 0) {
      requiresCheck = true;

      if (!recentVitals) {
        warnings.push('No recent vital signs recorded - check required');
        riskScore += 25;
      } else {
        const hoursSinceVitals = differenceInHours(
          context.scannedAt,
          recentVitals.recordedAt
        );

        if (hoursSinceVitals > 4) {
          warnings.push(`Vital signs ${hoursSinceVitals} hours old - new check required`);
          riskScore += 20;
        }

        // Check if any vital signs are out of range
        if (recentVitals.outOfRange) {
          warnings.push('Previous vital signs out of normal range');
          riskScore += 30;
        }
      }
    }

    return { warnings, riskScore, requiresCheck };
  }

  private generateRequiredActions(riskScore: number): string[] {
    const actions: string[] = [];

    if (riskScore >= 80) {
      actions.push(
        'STOP: Supervisor verification required',
        'Complete full risk assessment',
        'Document mitigation strategies'
      );
    } else if (riskScore >= 60) {
      actions.push(
        'Double-check all parameters',
        'Verify with second staff member',
        'Record detailed notes'
      );
    } else if (riskScore >= 40) {
      actions.push(
        'Take extra time to verify details',
        'Document any concerns'
      );
    } else {
      actions.push('Proceed with standard safety protocols');
    }

    return actions;
  }

  private generatePrecautions(riskScore: number): string[] {
    const precautions: string[] = [];

    if (riskScore >= 80) {
      precautions.push(
        'Implement enhanced monitoring protocol',
        'Prepare emergency response equipment',
        'Alert medical team of high-risk administration'
      );
    } else if (riskScore >= 60) {
      precautions.push(
        'Increase observation frequency',
        'Have emergency protocols ready',
        'Document baseline vital signs'
      );
    } else if (riskScore >= 40) {
      precautions.push(
        'Monitor for immediate reactions',
        'Schedule follow-up check'
      );
    }

    return precautions;
  }

  private async logPredictiveAnalysis(
    context: PredictiveSafetyContext,
    results: {
      riskScore: number;
      predictiveWarnings: string[];
      requiredActions: string[];
    }
  ): Promise<void> {
    await prisma.predictiveAnalysisLog.create({
      data: {
        residentId: context.residentId,
        medicationId: context.medicationId,
        staffId: context.staffId,
        performedAt: context.scannedAt,
        riskScore: results.riskScore,
        warnings: results.predictiveWarnings,
        requiredActions: results.requiredActions,
        environmentalData: context.environmentalData || {},
        staffWorkload: context.staffWorkload || {},
      },
    });
  }

  private analyzeErrorPatterns(history: any[]): string[] {
    const patterns: string[] = [];
    const errorTypes = new Map<string, number>();

    history.forEach(record => {
      record.errors.forEach((error: any) => {
        const count = errorTypes.get(error.type) || 0;
        errorTypes.set(error.type, count + 1);
      });
    });

    errorTypes.forEach((count, type) => {
      if (count >= 2) {
        patterns.push(`Repeated ${type} errors (${count} occurrences)`);
      }
    });

    return patterns;
  }

  private analyzeReactionPatterns(history: any[]): string[] {
    const patterns: string[] = [];
    const reactionTypes = new Map<string, number>();

    history.forEach(record => {
      record.reactions.forEach((reaction: any) => {
        const count = reactionTypes.get(reaction.type) || 0;
        reactionTypes.set(reaction.type, count + 1);
      });
    });

    reactionTypes.forEach((count, type) => {
      if (count >= 2) {
        patterns.push(`Repeated ${type} reactions (${count} occurrences)`);
      }
    });

    return patterns;
  }

  private analyzeTimePatterns(history: any[]): string[] {
    const patterns: string[] = [];
    const timeDeviations = new Map<string, number>();

    history.forEach(record => {
      const scheduledTime = new Date(record.scheduledTime);
      const actualTime = new Date(record.actualTime);
      const deviation = differenceInMinutes(actualTime, scheduledTime);
      
      const deviationType = this.categorizeTimeDeviation(deviation);
      const count = timeDeviations.get(deviationType) || 0;
      timeDeviations.set(deviationType, count + 1);
    });

    timeDeviations.forEach((count, type) => {
      if (count >= 3) {
        patterns.push(`Consistent ${type} (${count} occurrences)`);
      }
    });

    return patterns;
  }

  private categorizeTimeDeviation(minutes: number): string {
    if (minutes <= -30) return 'early administration';
    if (minutes >= 30) return 'late administration';
    return 'on-time administration';
  }
}
