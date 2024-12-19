import { OpenAI } from '@/lib/openai';
import { Cache } from '@/lib/cache';
import { Logger } from '@/lib/logger';
import { prisma } from '@/lib/db';
import { RiskLevel, AIInsights } from '../types/analytics';
import { Medication, MedicationAdministration, Resident } from '@prisma/client';
import { DateTime } from 'luxon';

export class MedicationSafetyService {
  private readonly openai: OpenAI;
  private readonly cache: Cache;
  private readonly logger: Logger;

  constructor() {
    this.openai = new OpenAI();
    this.cache = new Cache();
    this.logger = new Logger('MedicationSafety');
  }

  async analyzeSafetyRisks(residentId: string): Promise<AIInsights> {
    const cacheKey = `safety:resident:${residentId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    try {
      const [
        resident,
        medications,
        administrations,
        healthRecords
      ] = await Promise.all([
        this.getResidentData(residentId),
        this.getActiveMedications(residentId),
        this.getRecentAdministrations(residentId),
        this.getHealthRecords(residentId)
      ]);

      const insights = await this.generateSafetyInsights({
        resident,
        medications,
        administrations,
        healthRecords
      });

      await this.cache.set(cacheKey, JSON.stringify(insights), 3600); // Cache for 1 hour
      return insights;
    } catch (error) {
      this.logger.error('Failed to analyze safety risks', { error, residentId });
      throw error;
    }
  }

  private async generateSafetyInsights(data: {
    resident: Resident;
    medications: Medication[];
    administrations: MedicationAdministration[];
    healthRecords: any[];
  }): Promise<AIInsights> {
    const riskPredictions = await this.predictRisks(data);
    const optimizationSuggestions = await this.generateOptimizations(data);
    const patterns = await this.detectPatterns(data);

    return {
      riskPredictions,
      optimizationSuggestions,
      patterns
    };
  }

  private async predictRisks(data: any): Promise<AIInsights['riskPredictions']> {
    const prompt = this.buildRiskAnalysisPrompt(data);
    
    try {
      const response = await this.openai.analyze(prompt);
      const risks = this.parseRiskResponse(response);

      // Validate and enhance risk predictions
      return risks.map(risk => ({
        ...risk,
        factors: this.validateRiskFactors(risk.factors, data),
        recommendations: this.enhanceRecommendations(risk.recommendations, data)
      }));
    } catch (error) {
      this.logger.error('Failed to predict risks', { error });
      return [];
    }
  }

  private async generateOptimizations(data: any): Promise<AIInsights['optimizationSuggestions']> {
    try {
      const optimizations = [];

      // Analyze medication timing
      const timingOptimizations = await this.analyzeTimingOptimizations(data.medications);
      optimizations.push(...timingOptimizations);

      // Analyze dose optimizations
      const doseOptimizations = await this.analyzeDoseOptimizations(data);
      optimizations.push(...doseOptimizations);

      // Analyze alternative medications
      const alternativeOptimizations = await this.analyzeAlternatives(data);
      optimizations.push(...alternativeOptimizations);

      return optimizations;
    } catch (error) {
      this.logger.error('Failed to generate optimizations', { error });
      return [];
    }
  }

  private async detectPatterns(data: any): Promise<AIInsights['patterns']> {
    try {
      const patterns = [];

      // Analyze administration patterns
      const adminPatterns = this.analyzeAdministrationPatterns(data.administrations);
      patterns.push(...adminPatterns);

      // Analyze health outcome patterns
      const healthPatterns = await this.analyzeHealthOutcomes(data);
      patterns.push(...healthPatterns);

      // Analyze behavioral patterns
      const behavioralPatterns = this.analyzeBehavioralPatterns(data);
      patterns.push(...behavioralPatterns);

      return patterns.map(pattern => ({
        ...pattern,
        confidence: this.calculatePatternConfidence(pattern)
      }));
    } catch (error) {
      this.logger.error('Failed to detect patterns', { error });
      return [];
    }
  }

  private async analyzeTimingOptimizations(medications: Medication[]): Promise<any[]> {
    const optimizations = [];
    const medicationTimings = this.groupMedicationsByTiming(medications);

    // Check for timing conflicts
    const conflicts = this.findTimingConflicts(medicationTimings);
    if (conflicts.length > 0) {
      optimizations.push({
        type: 'TIMING_OPTIMIZATION',
        description: 'Potential timing conflicts detected',
        impact: 'HIGH',
        implementation: conflicts.map(conflict => 
          `Adjust timing of ${conflict.medications.join(' and ')}`)
      });
    }

    // Optimize for resident's schedule
    const scheduleOptimizations = await this.optimizeForResidentSchedule(medicationTimings);
    optimizations.push(...scheduleOptimizations);

    return optimizations;
  }

  private async analyzeDoseOptimizations(data: any): Promise<any[]> {
    const optimizations = [];

    // Check for sub-optimal dosing
    const doseIssues = await this.analyzeDoseEffectiveness(data);
    if (doseIssues.length > 0) {
      optimizations.push({
        type: 'DOSE_OPTIMIZATION',
        description: 'Potential dose optimization opportunities',
        impact: 'MEDIUM',
        implementation: doseIssues.map(issue => issue.recommendation)
      });
    }

    // Check for cumulative effects
    const cumulativeEffects = this.analyzeCumulativeEffects(data.medications);
    if (cumulativeEffects.length > 0) {
      optimizations.push({
        type: 'CUMULATIVE_EFFECT',
        description: 'Potential cumulative medication effects',
        impact: 'HIGH',
        implementation: cumulativeEffects.map(effect => effect.recommendation)
      });
    }

    return optimizations;
  }

  private async analyzeAlternatives(data: any): Promise<any[]> {
    const optimizations = [];

    // Check for newer alternatives
    const alternatives = await this.findMedicationAlternatives(data.medications);
    if (alternatives.length > 0) {
      optimizations.push({
        type: 'ALTERNATIVE_MEDICATIONS',
        description: 'Potential alternative medications available',
        impact: 'MEDIUM',
        implementation: alternatives.map(alt => 
          `Consider ${alt.alternative} as alternative to ${alt.current}`)
      });
    }

    // Check for cost optimizations
    const costOptimizations = await this.analyzeCostOptimizations(data.medications);
    if (costOptimizations.length > 0) {
      optimizations.push({
        type: 'COST_OPTIMIZATION',
        description: 'Cost optimization opportunities',
        impact: 'MEDIUM',
        implementation: costOptimizations
      });
    }

    return optimizations;
  }

  private analyzeAdministrationPatterns(administrations: MedicationAdministration[]): any[] {
    const patterns = [];

    // Analyze time-based patterns
    const timePatterns = this.analyzeTimePatterns(administrations);
    patterns.push(...timePatterns);

    // Analyze compliance patterns
    const compliancePatterns = this.analyzeCompliancePatterns(administrations);
    patterns.push(...compliancePatterns);

    // Analyze staff patterns
    const staffPatterns = this.analyzeStaffPatterns(administrations);
    patterns.push(...staffPatterns);

    return patterns;
  }

  private async analyzeHealthOutcomes(data: any): Promise<any[]> {
    const patterns = [];

    // Analyze effectiveness patterns
    const effectivenessPatterns = await this.analyzeEffectivenessPatterns(data);
    patterns.push(...effectivenessPatterns);

    // Analyze side effect patterns
    const sideEffectPatterns = await this.analyzeSideEffectPatterns(data);
    patterns.push(...sideEffectPatterns);

    return patterns;
  }

  private analyzeBehavioralPatterns(data: any): any[] {
    return [
      // Analyze medication adherence behavior
      ...this.analyzeAdherencePatterns(data.administrations),
      
      // Analyze refusal patterns
      ...this.analyzeRefusalPatterns(data.administrations),
      
      // Analyze PRN request patterns
      ...this.analyzePRNPatterns(data.administrations)
    ];
  }

  private calculatePatternConfidence(pattern: any): number {
    const factors = {
      dataPoints: pattern.supportingData?.length || 0,
      consistency: this.calculatePatternConsistency(pattern),
      timeSpan: this.calculatePatternTimeSpan(pattern),
      correlation: this.calculatePatternCorrelation(pattern)
    };

    // Weight and combine factors
    return (
      (factors.dataPoints * 0.3) +
      (factors.consistency * 0.3) +
      (factors.timeSpan * 0.2) +
      (factors.correlation * 0.2)
    );
  }

  private async getResidentData(residentId: string): Promise<Resident> {
    return await prisma.resident.findUnique({
      where: { id: residentId },
      include: {
        healthConditions: true,
        allergies: true
      }
    });
  }

  private async getActiveMedications(residentId: string): Promise<Medication[]> {
    return await prisma.medication.findMany({
      where: {
        residentId,
        active: true
      }
    });
  }

  private async getRecentAdministrations(residentId: string): Promise<MedicationAdministration[]> {
    const thirtyDaysAgo = DateTime.now().minus({ days: 30 }).toJSDate();
    
    return await prisma.medicationAdministration.findMany({
      where: {
        medication: {
          residentId
        },
        scheduledTime: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        medication: true
      }
    });
  }

  private async getHealthRecords(residentId: string): Promise<any[]> {
    // Implement health records retrieval
    return [];
  }

  private buildRiskAnalysisPrompt(data: any): string {
    return `Analyze medication safety risks for resident with the following profile:
      Age: ${data.resident.age}
      Health Conditions: ${data.resident.healthConditions.map(c => c.name).join(', ')}
      Current Medications: ${data.medications.map(m => `${m.name} ${m.dosage}${m.unit}`).join(', ')}
      
      Consider:
      1. Drug interactions
      2. Age-related risks
      3. Health condition contraindications
      4. Recent administration history
      5. Compliance patterns`;
  }

  private parseRiskResponse(response: string): any[] {
    try {
      return JSON.parse(response);
    } catch (error) {
      this.logger.error('Failed to parse risk response', { error });
      return [];
    }
  }

  private validateRiskFactors(factors: string[], data: any): string[] {
    // Implement risk factor validation
    return factors;
  }

  private enhanceRecommendations(recommendations: string[], data: any): string[] {
    // Implement recommendation enhancement
    return recommendations;
  }
}

export const medicationSafety = new MedicationSafetyService();


