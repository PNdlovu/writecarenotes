/**
 * @fileoverview Pain Medication Reporting
 * @version 1.0.0
 * @created 2024-03-21
 */

import { prisma } from '@/lib/prisma';
import { TenantContext } from '@/lib/multi-tenant/types';
import { ResidentPainAssessment } from '../types/care-home';

export class PainMedicationReporting {
  constructor(private tenantContext: TenantContext) {}

  async generateMedicationEffectivenessReport(period: DateRange) {
    const assessments = await this.getAssessmentsWithMedications(period);
    
    return {
      prnUsage: this.analyzePRNUsage(assessments),
      medicationEffectiveness: this.analyzeMedicationEffectiveness(assessments),
      escalationPatterns: this.analyzeEscalationPatterns(assessments),
      recommendations: await this.generateMedicationRecommendations(assessments)
    };
  }

  private async getAssessmentsWithMedications(period: DateRange) {
    return await prisma.painAssessment.findMany({
      where: {
        tenantId: this.tenantContext.tenantId,
        assessmentDate: {
          gte: period.start,
          lte: period.end
        },
        interventions: {
          some: {
            type: {
              in: [
                CareHomeInterventionType.PRN_MEDICATION,
                CareHomeInterventionType.REGULAR_MEDICATION
              ]
            }
          }
        }
      },
      include: {
        resident: true,
        interventions: true
      }
    });
  }

  private analyzePRNUsage(assessments: ResidentPainAssessment[]) {
    const prnUsage = new Map<string, {
      totalUses: number,
      effectiveUses: number,
      averagePainReduction: number,
      timesBetweenDoses: number[],
      commonTriggers: Map<string, number>
    }>();

    for (const assessment of assessments) {
      const prnInterventions = assessment.interventions.filter(i => 
        i.type === CareHomeInterventionType.PRN_MEDICATION
      );

      for (const intervention of prnInterventions) {
        const current = prnUsage.get(intervention.medicationId) || {
          totalUses: 0,
          effectiveUses: 0,
          averagePainReduction: 0,
          timesBetweenDoses: [],
          commonTriggers: new Map<string, number>()
        };

        current.totalUses++;
        if (intervention.effectiveness >= 3) {
          current.effectiveUses++;
        }

        // Track pain reduction
        const followUp = this.findFollowUpAssessment(assessment);
        if (followUp) {
          const reduction = assessment.painScore - followUp.painScore;
          current.averagePainReduction = 
            (current.averagePainReduction * (current.totalUses - 1) + reduction) / current.totalUses;
        }

        // Track triggers
        assessment.triggers.forEach(trigger => {
          current.commonTriggers.set(
            trigger, 
            (current.commonTriggers.get(trigger) || 0) + 1
          );
        });

        prnUsage.set(intervention.medicationId, current);
      }
    }

    return Array.from(prnUsage.entries()).map(([medicationId, stats]) => ({
      medicationId,
      totalUses: stats.totalUses,
      effectiveRate: (stats.effectiveUses / stats.totalUses) * 100,
      averagePainReduction: stats.averagePainReduction,
      commonTriggers: Array.from(stats.commonTriggers.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    }));
  }

  private analyzeMedicationEffectiveness(assessments: ResidentPainAssessment[]) {
    const effectiveness = new Map<string, {
      totalAssessments: number,
      averageInitialPain: number,
      averagePainReduction: number,
      responseTime: number[],
      sideEffects: Map<string, number>
    }>();

    for (const assessment of assessments) {
      const medInterventions = assessment.interventions.filter(i => 
        i.type === CareHomeInterventionType.PRN_MEDICATION ||
        i.type === CareHomeInterventionType.REGULAR_MEDICATION
      );

      for (const intervention of medInterventions) {
        const stats = effectiveness.get(intervention.medicationId) || {
          totalAssessments: 0,
          averageInitialPain: 0,
          averagePainReduction: 0,
          responseTime: [],
          sideEffects: new Map<string, number>()
        };

        stats.totalAssessments++;
        stats.averageInitialPain = 
          (stats.averageInitialPain * (stats.totalAssessments - 1) + assessment.painScore) 
          / stats.totalAssessments;

        const followUp = this.findFollowUpAssessment(assessment);
        if (followUp) {
          const reduction = assessment.painScore - followUp.painScore;
          stats.averagePainReduction = 
            (stats.averagePainReduction * (stats.totalAssessments - 1) + reduction) 
            / stats.totalAssessments;
          
          const responseTime = followUp.assessmentDate.getTime() - assessment.assessmentDate.getTime();
          stats.responseTime.push(responseTime);
        }

        // Track side effects
        intervention.sideEffects?.forEach(effect => {
          stats.sideEffects.set(
            effect,
            (stats.sideEffects.get(effect) || 0) + 1
          );
        });

        effectiveness.set(intervention.medicationId, stats);
      }
    }

    return Array.from(effectiveness.entries()).map(([medicationId, stats]) => ({
      medicationId,
      averageInitialPain: stats.averageInitialPain,
      averagePainReduction: stats.averagePainReduction,
      medianResponseTime: this.calculateMedian(stats.responseTime),
      commonSideEffects: Array.from(stats.sideEffects.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    }));
  }

  private analyzeEscalationPatterns(assessments: ResidentPainAssessment[]) {
    const escalationPatterns = {
      highPainIncidents: 0,
      escalationsToGP: 0,
      escalationsToNurse: 0,
      averageResponseTime: 0,
      commonTriggers: new Map<string, number>(),
      medicationChanges: [] as {
        date: Date,
        residentId: string,
        reason: string,
        change: string
      }[]
    };

    // Group assessments by resident
    const byResident = this.groupByResident(assessments);

    for (const [residentId, residentAssessments] of byResident) {
      let previousAssessment: ResidentPainAssessment | null = null;

      for (const assessment of residentAssessments) {
        // Track high pain incidents
        if (assessment.painScore >= 7) {
          escalationPatterns.highPainIncidents++;
          
          if (assessment.notifiedNurse) {
            escalationPatterns.escalationsToNurse++;
          }
          
          // Track GP notifications
          if (assessment.gpNotified) {
            escalationPatterns.escalationsToGP++;
            
            // Track response times
            if (assessment.gpResponseTime) {
              const responseTime = assessment.gpResponseTime.getTime() - assessment.assessmentDate.getTime();
              escalationPatterns.averageResponseTime = 
                (escalationPatterns.averageResponseTime * (escalationPatterns.escalationsToGP - 1) + responseTime) 
                / escalationPatterns.escalationsToGP;
            }
          }

          // Track triggers for high pain
          assessment.triggers?.forEach(trigger => {
            escalationPatterns.commonTriggers.set(
              trigger,
              (escalationPatterns.commonTriggers.get(trigger) || 0) + 1
            );
          });
        }

        // Track medication changes after high pain
        if (previousAssessment?.painScore >= 7) {
          const medicationChanges = this.findMedicationChanges(previousAssessment, assessment);
          if (medicationChanges.length > 0) {
            escalationPatterns.medicationChanges.push(...medicationChanges.map(change => ({
              date: assessment.assessmentDate,
              residentId,
              reason: `High pain score (${previousAssessment.painScore})`,
              change
            })));
          }
        }

        previousAssessment = assessment;
      }
    }

    return {
      ...escalationPatterns,
      commonTriggers: Array.from(escalationPatterns.commonTriggers.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      averageResponseTime: Math.round(escalationPatterns.averageResponseTime / (1000 * 60)) // Convert to minutes
    };
  }

  private findMedicationChanges(previous: ResidentPainAssessment, current: ResidentPainAssessment): string[] {
    const changes: string[] = [];
    
    // Check for new medications
    const previousMeds = new Set(previous.interventions
      .filter(i => i.type === CareHomeInterventionType.PRN_MEDICATION)
      .map(i => i.medicationId));
    
    const currentMeds = new Set(current.interventions
      .filter(i => i.type === CareHomeInterventionType.PRN_MEDICATION)
      .map(i => i.medicationId));

    // New medications added
    for (const med of currentMeds) {
      if (!previousMeds.has(med)) {
        changes.push(`Added medication: ${med}`);
      }
    }

    // Medications discontinued
    for (const med of previousMeds) {
      if (!currentMeds.has(med)) {
        changes.push(`Discontinued medication: ${med}`);
      }
    }

    return changes;
  }

  private async generateMedicationRecommendations(assessments: ResidentPainAssessment[]) {
    const recommendations: MedicationRecommendation[] = [];
    const prnAnalysis = this.analyzePRNUsage(assessments);
    const effectivenessAnalysis = this.analyzeMedicationEffectiveness(assessments);

    // Check for ineffective medications
    effectivenessAnalysis.forEach(analysis => {
      if (analysis.averagePainReduction < 2) {
        recommendations.push({
          type: 'MEDICATION_REVIEW',
          priority: 'HIGH',
          description: `Consider reviewing ${analysis.medicationId} - low pain reduction effectiveness`,
          rationale: `Average pain reduction of ${analysis.averagePainReduction.toFixed(1)} points`
        });
      }
    });

    // Check for frequent PRN usage
    prnAnalysis.forEach(analysis => {
      if (analysis.totalUses > 10 && analysis.effectiveRate > 70) {
        recommendations.push({
          type: 'REGULAR_MEDICATION_CONSIDER',
          priority: 'MEDIUM',
          description: `Consider regular medication instead of PRN for ${analysis.medicationId}`,
          rationale: `Frequent effective use (${analysis.totalUses} times with ${analysis.effectiveRate.toFixed(1)}% effectiveness)`
        });
      }
    });

    return recommendations;
  }
} 