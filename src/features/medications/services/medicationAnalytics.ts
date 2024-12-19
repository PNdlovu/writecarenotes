/**
 * @fileoverview Medication Analytics Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { parseISO, format, differenceInDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import type { StockHistory, MedicationHistory, MedicationAlert, AdherenceMetrics, AlertMetrics, TrendData, CostAnalysis, ComplianceReport, QualityMetrics } from '../types';
import { prisma } from '@/lib/prisma';

interface TimeSeriesPoint {
  date: Date;
  value: number;
}

interface AnomalyDetectionResult {
  date: Date;
  expected: number;
  actual: number;
  deviation: number;
  isAnomaly: boolean;
}

interface CorrelationResult {
  factor: string;
  correlation: number;
  significance: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Calculates moving average for smoothing time series data
 */
export function calculateMovingAverage(data: TimeSeriesPoint[], window: number): TimeSeriesPoint[] {
  return data.map((point, index) => {
    const start = Math.max(0, index - window + 1);
    const values = data.slice(start, index + 1).map(p => p.value);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    return { date: point.date, value: average };
  });
}

/**
 * Detects anomalies using Z-score method
 */
export function detectAnomalies(
  data: TimeSeriesPoint[],
  threshold = 2
): AnomalyDetectionResult[] {
  const values = data.map(p => p.value);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return data.map(point => {
    const deviation = Math.abs((point.value - mean) / stdDev);
    return {
      date: point.date,
      expected: mean,
      actual: point.value,
      deviation,
      isAnomaly: deviation > threshold,
    };
  });
}

/**
 * Analyzes correlations between usage and various factors
 */
export function analyzeCorrelations(
  stockHistory: StockHistory[],
  factors: Record<string, number[]>
): CorrelationResult[] {
  const usage = stockHistory
    .filter(entry => entry.type === 'OUT')
    .reduce((acc, entry) => {
      const date = format(parseISO(entry.timestamp), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + entry.quantity;
      return acc;
    }, {} as Record<string, number>);

  const usageValues = Object.values(usage);
  const results: CorrelationResult[] = [];

  for (const [factor, values] of Object.entries(factors)) {
    if (values.length !== usageValues.length) continue;

    const correlation = calculatePearsonCorrelation(usageValues, values);
    const significance = Math.abs(correlation) > 0.7 ? 'HIGH' :
                        Math.abs(correlation) > 0.4 ? 'MEDIUM' : 'LOW';

    results.push({
      factor,
      correlation,
      significance,
    });
  }

  return results;
}

/**
 * Calculates seasonality strength and patterns
 */
export function analyzeSeasonality(stockHistory: StockHistory[]): {
  seasonalityStrength: number;
  patterns: Record<string, number>;
} {
  const monthlyUsage: Record<string, number[]> = {};
  
  stockHistory
    .filter(entry => entry.type === 'OUT')
    .forEach(entry => {
      const date = parseISO(entry.timestamp);
      const month = format(date, 'MMM');
      if (!monthlyUsage[month]) monthlyUsage[month] = [];
      monthlyUsage[month].push(entry.quantity);
    });

  const monthlyAverages = Object.entries(monthlyUsage).reduce((acc, [month, values]) => {
    acc[month] = values.reduce((a, b) => a + b, 0) / values.length;
    return acc;
  }, {} as Record<string, number>);

  const totalAverage = Object.values(monthlyAverages).reduce((a, b) => a + b, 0) / 12;
  const seasonalityStrength = Object.values(monthlyAverages).reduce(
    (acc, avg) => acc + Math.pow(avg - totalAverage, 2),
    0
  ) / 12;

  return {
    seasonalityStrength,
    patterns: monthlyAverages,
  };
}

/**
 * Calculates Pearson correlation coefficient
 */
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
  const sumX2 = x.reduce((a, b) => a + b * b, 0);
  const sumY2 = y.reduce((a, b) => a + b * b, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Forecasts future demand using multiple methods
 */
export function forecastDemand(
  stockHistory: StockHistory[],
  days: number
): { date: Date; forecast: number; confidence: number }[] {
  const dailyUsage = stockHistory
    .filter(entry => entry.type === 'OUT')
    .reduce((acc, entry) => {
      const date = format(parseISO(entry.timestamp), 'yyyy-MM-dd');
      acc[date] = (acc[date] || 0) + entry.quantity;
      return acc;
    }, {} as Record<string, number>);

  const values = Object.values(dailyUsage);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length
  );

  // Simple exponential smoothing with trend
  const alpha = 0.2; // Smoothing factor
  const beta = 0.1; // Trend factor
  let level = mean;
  let trend = (values[values.length - 1] - values[0]) / values.length;

  return Array.from({ length: days }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);

    // Update level and trend
    level = alpha * values[values.length - 1] + (1 - alpha) * (level + trend);
    trend = beta * (level - values[values.length - 1]) + (1 - beta) * trend;

    // Calculate forecast and confidence based on prediction interval
    const forecast = Math.max(0, level + trend * i);
    const confidence = 1 - (stdDev * Math.sqrt(1 + i/values.length)) / forecast;

    return {
      date,
      forecast: Math.round(forecast),
      confidence: Math.max(0, Math.min(1, confidence)),
    };
  });
}

export class MedicationAnalytics {
  async generateComprehensiveReport(
    startDate: Date,
    endDate: Date,
    organizationId: string
  ) {
    const [
      adherenceData,
      alertMetrics,
      costAnalysis,
      complianceReport,
      qualityMetrics
    ] = await Promise.all([
      this.getAdherenceData(startDate, endDate, organizationId),
      this.getAlertMetrics(startDate, endDate, organizationId),
      this.analyzeCosts(startDate, endDate, organizationId),
      this.generateComplianceReport(startDate, endDate, organizationId),
      this.calculateQualityMetrics(startDate, endDate, organizationId)
    ]);

    return {
      adherenceData,
      alertMetrics,
      costAnalysis,
      complianceReport,
      qualityMetrics,
      generatedAt: new Date(),
      reportPeriod: {
        start: startDate,
        end: endDate
      }
    };
  }

  private async getAdherenceData(
    startDate: Date,
    endDate: Date,
    organizationId: string
  ) {
    const administrations = await prisma.medicationAdministration.findMany({
      where: {
        scheduledTime: {
          gte: startDate,
          lte: endDate
        },
        organization: { id: organizationId }
      },
      include: {
        medication: true,
        resident: true
      }
    });

    return {
      overall: this.calculateOverallAdherence(administrations),
      byMedicationType: this.calculateAdherenceByType(administrations),
      byTimeOfDay: this.analyzeTimeOfDayPatterns(administrations),
      missedDoseAnalysis: this.analyzeMissedDoses(administrations),
      trends: this.generateAdherenceTrends(administrations, startDate, endDate)
    };
  }

  private async analyzeCosts(
    startDate: Date,
    endDate: Date,
    organizationId: string
  ): Promise<CostAnalysis> {
    const medications = await prisma.medication.findMany({
      where: {
        organization: { id: organizationId }
      },
      include: {
        administrations: {
          where: {
            scheduledTime: {
              gte: startDate,
              lte: endDate
            }
          }
        },
        stock: true
      }
    });

    return {
      totalCost: this.calculateTotalCost(medications),
      byCategory: this.analyzeCostsByCategory(medications),
      wastage: this.calculateWastage(medications),
      projectedCosts: this.projectFutureCosts(medications),
      costOptimizationSuggestions: this.generateCostOptimizations(medications),
      trends: this.generateCostTrends(medications, startDate, endDate)
    };
  }

  private async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    organizationId: string
  ): Promise<ComplianceReport> {
    const [
      administrations,
      medications,
      staff,
      audits
    ] = await Promise.all([
      prisma.medicationAdministration.findMany({
        where: {
          scheduledTime: { gte: startDate, lte: endDate },
          organization: { id: organizationId }
        }
      }),
      prisma.medication.findMany({
        where: { organization: { id: organizationId } }
      }),
      prisma.staff.findMany({
        where: { organization: { id: organizationId } }
      }),
      prisma.audit.findMany({
        where: {
          timestamp: { gte: startDate, lte: endDate },
          organization: { id: organizationId }
        }
      })
    ]);

    return {
      administrationCompliance: this.analyzeAdministrationCompliance(administrations),
      stockManagement: this.analyzeStockCompliance(medications),
      staffCompetency: this.analyzeStaffCompetency(staff, administrations),
      auditFindings: this.analyzeAuditResults(audits),
      regulatoryRequirements: await this.checkRegulatoryCompliance(organizationId),
      recommendations: this.generateComplianceRecommendations({
        administrations,
        medications,
        staff,
        audits
      })
    };
  }

  private async calculateQualityMetrics(
    startDate: Date,
    endDate: Date,
    organizationId: string
  ): Promise<QualityMetrics> {
    const data = await this.gatherQualityData(startDate, endDate, organizationId);

    return {
      medicationErrors: this.analyzeMedicationErrors(data.errors),
      nearMissReporting: this.analyzeNearMisses(data.nearMisses),
      interventions: this.analyzeInterventions(data.interventions),
      residentOutcomes: this.analyzeResidentOutcomes(data.outcomes),
      staffPerformance: this.analyzeStaffPerformance(data.performance),
      recommendations: this.generateQualityRecommendations(data)
    };
  }

  // Helper methods for adherence analysis
  private calculateOverallAdherence(administrations: any[]) {
    // Implementation
  }

  private calculateAdherenceByType(administrations: any[]) {
    // Implementation
  }

  private analyzeTimeOfDayPatterns(administrations: any[]) {
    // Implementation
  }

  private analyzeMissedDoses(administrations: any[]) {
    // Implementation
  }

  private generateAdherenceTrends(administrations: any[], startDate: Date, endDate: Date) {
    // Implementation
  }

  // Helper methods for cost analysis
  private calculateTotalCost(medications: any[]) {
    // Implementation
  }

  private analyzeCostsByCategory(medications: any[]) {
    // Implementation
  }

  private calculateWastage(medications: any[]) {
    // Implementation
  }

  private projectFutureCosts(medications: any[]) {
    // Implementation
  }

  private generateCostOptimizations(medications: any[]) {
    // Implementation
  }

  private generateCostTrends(medications: any[], startDate: Date, endDate: Date) {
    // Implementation
  }

  // Helper methods for compliance analysis
  private analyzeAdministrationCompliance(administrations: any[]) {
    // Implementation
  }

  private analyzeStockCompliance(medications: any[]) {
    // Implementation
  }

  private analyzeStaffCompetency(staff: any[], administrations: any[]) {
    // Implementation
  }

  private analyzeAuditResults(audits: any[]) {
    // Implementation
  }

  private async checkRegulatoryCompliance(organizationId: string) {
    // Implementation
  }

  private generateComplianceRecommendations(data: any) {
    // Implementation
  }

  // Helper methods for quality metrics
  private async gatherQualityData(startDate: Date, endDate: Date, organizationId: string) {
    // Implementation
  }

  private analyzeMedicationErrors(errors: any[]) {
    // Implementation
  }

  private analyzeNearMisses(nearMisses: any[]) {
    // Implementation
  }

  private analyzeInterventions(interventions: any[]) {
    // Implementation
  }

  private analyzeResidentOutcomes(outcomes: any[]) {
    // Implementation
  }

  private analyzeStaffPerformance(performance: any[]) {
    // Implementation
  }

  private generateQualityRecommendations(data: any) {
    // Implementation
  }
}

import { prisma } from '@/lib/db';
import { MedicationAnalytics, TrendData, RiskLevel, DrugInteraction } from '../types/analytics';
import { Medication, MedicationAdministration } from '@prisma/client';
import { DateTime } from 'luxon';
import { OpenAI } from '@/lib/openai';
import { Cache } from '@/lib/cache';
import { Logger } from '@/lib/logger';

export class MedicationAnalyticsService {
  private readonly openai: OpenAI;
  private readonly cache: Cache;
  private readonly logger: Logger;

  constructor() {
    this.openai = new OpenAI();
    this.cache = new Cache();
    this.logger = new Logger('MedicationAnalytics');
  }

  async getResidentAnalytics(residentId: string, period: string): Promise<MedicationAnalytics> {
    const cacheKey = `analytics:resident:${residentId}:${period}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const [
      medications,
      administrations,
      missedDoses,
      interactions
    ] = await Promise.all([
      this.getMedicationTrends(residentId, period),
      this.getAdministrationCompliance(residentId, period),
      this.getMissedDoses(residentId, period),
      this.checkDrugInteractions(residentId)
    ]);

    const analytics: MedicationAnalytics = {
      medications,
      administrations,
      missedDoses,
      interactions,
      riskLevel: this.calculateRiskLevel({
        medications,
        administrations,
        missedDoses,
        interactions
      })
    };

    await this.cache.set(cacheKey, JSON.stringify(analytics), 3600); // Cache for 1 hour
    return analytics;
  }

  private async getMedicationTrends(residentId: string, period: string): Promise<TrendData> {
    const startDate = this.getPeriodStartDate(period);
    
    const medications = await prisma.medication.findMany({
      where: {
        residentId,
        startDate: { gte: startDate }
      },
      include: {
        administrations: true
      }
    });

    return {
      totalMedications: medications.length,
      activeRegularMedications: medications.filter(m => m.active && !m.prn).length,
      activePRNMedications: medications.filter(m => m.active && m.prn).length,
      recentChanges: medications.filter(m => 
        DateTime.fromJSDate(m.updatedAt) > DateTime.now().minus({ days: 7 })
      ).length,
      complianceRate: this.calculateComplianceRate(medications)
    };
  }

  private async getAdministrationCompliance(residentId: string, period: string): Promise<TrendData> {
    const startDate = this.getPeriodStartDate(period);
    
    const administrations = await prisma.medicationAdministration.findMany({
      where: {
        medication: {
          residentId
        },
        scheduledTime: { gte: startDate }
      }
    });

    return {
      totalAdministrations: administrations.length,
      onTimeRate: this.calculateOnTimeRate(administrations),
      missedRate: administrations.filter(a => a.status === 'MISSED').length / administrations.length,
      refusedRate: administrations.filter(a => a.status === 'REFUSED').length / administrations.length,
      lateAdministrations: this.calculateLateAdministrations(administrations)
    };
  }

  private async getMissedDoses(residentId: string, period: string): Promise<TrendData> {
    const startDate = this.getPeriodStartDate(period);
    
    const missedDoses = await prisma.medicationAdministration.findMany({
      where: {
        medication: {
          residentId
        },
        status: 'MISSED',
        scheduledTime: { gte: startDate }
      },
      include: {
        medication: true
      }
    });

    return {
      totalMissed: missedDoses.length,
      criticalMissed: missedDoses.filter(d => d.medication.critical).length,
      patterns: await this.analyzeMissedDosePatterns(missedDoses),
      impactScore: await this.calculateMissedDoseImpact(missedDoses)
    };
  }

  private async checkDrugInteractions(residentId: string): Promise<DrugInteraction[]> {
    const medications = await prisma.medication.findMany({
      where: {
        residentId,
        active: true
      }
    });

    const interactions = await this.analyzeInteractions(medications);
    const severityScores = await this.calculateInteractionSeverity(interactions);

    return interactions.map((interaction, index) => ({
      ...interaction,
      severity: severityScores[index],
      recommendations: this.generateInteractionRecommendations(interaction)
    }));
  }

  private async analyzeInteractions(medications: Medication[]): Promise<DrugInteraction[]> {
    try {
      const prompt = this.buildInteractionAnalysisPrompt(medications);
      const response = await this.openai.analyze(prompt);
      return this.parseInteractionResponse(response);
    } catch (error) {
      this.logger.error('Failed to analyze drug interactions', { error });
      return [];
    }
  }

  private calculateRiskLevel(analytics: MedicationAnalytics): RiskLevel {
    const riskFactors = {
      highRiskMedications: analytics.medications.filter(m => m.critical).length,
      recentChanges: analytics.medications.recentChanges,
      missedDoses: analytics.missedDoses.criticalMissed,
      interactions: analytics.interactions.filter(i => i.severity === 'HIGH').length
    };

    if (riskFactors.highRiskMedications > 2 || 
        riskFactors.interactions > 1 || 
        riskFactors.missedDoses > 3) {
      return 'HIGH';
    } else if (riskFactors.highRiskMedications > 0 || 
               riskFactors.recentChanges > 2 || 
               riskFactors.missedDoses > 1) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private getPeriodStartDate(period: string): Date {
    switch (period) {
      case '7d':
        return DateTime.now().minus({ days: 7 }).toJSDate();
      case '30d':
        return DateTime.now().minus({ days: 30 }).toJSDate();
      case '90d':
        return DateTime.now().minus({ days: 90 }).toJSDate();
      default:
        return DateTime.now().minus({ days: 30 }).toJSDate();
    }
  }

  private calculateComplianceRate(medications: Medication[]): number {
    const totalAdministrations = medications.reduce((sum, med) => 
      sum + med.administrations.length, 0);
    
    const successfulAdministrations = medications.reduce((sum, med) => 
      sum + med.administrations.filter(a => a.status === 'GIVEN').length, 0);

    return totalAdministrations > 0 ? 
      (successfulAdministrations / totalAdministrations) * 100 : 100;
  }

  private calculateOnTimeRate(administrations: MedicationAdministration[]): number {
    const onTimeThresholdMinutes = 30;
    const onTimeAdministrations = administrations.filter(admin => {
      const scheduledTime = DateTime.fromJSDate(admin.scheduledTime);
      const actualTime = DateTime.fromJSDate(admin.administeredTime || new Date());
      const diffMinutes = Math.abs(actualTime.diff(scheduledTime, 'minutes').minutes);
      return diffMinutes <= onTimeThresholdMinutes;
    });

    return administrations.length > 0 ? 
      (onTimeAdministrations.length / administrations.length) * 100 : 100;
  }

  private calculateLateAdministrations(administrations: MedicationAdministration[]): number {
    const lateThresholdMinutes = 60;
    return administrations.filter(admin => {
      if (!admin.administeredTime) return false;
      const scheduledTime = DateTime.fromJSDate(admin.scheduledTime);
      const actualTime = DateTime.fromJSDate(admin.administeredTime);
      const diffMinutes = actualTime.diff(scheduledTime, 'minutes').minutes;
      return diffMinutes > lateThresholdMinutes;
    }).length;
  }

  private async analyzeMissedDosePatterns(missedDoses: MedicationAdministration[]): Promise<string[]> {
    try {
      const patterns = this.findTemporalPatterns(missedDoses);
      const staffPatterns = await this.findStaffPatterns(missedDoses);
      const medicationPatterns = this.findMedicationPatterns(missedDoses);

      return [...patterns, ...staffPatterns, ...medicationPatterns];
    } catch (error) {
      this.logger.error('Failed to analyze missed dose patterns', { error });
      return [];
    }
  }

  private findTemporalPatterns(missedDoses: MedicationAdministration[]): string[] {
    const patterns: string[] = [];
    const timeSlots = this.groupByTimeSlot(missedDoses);
    
    Object.entries(timeSlots).forEach(([slot, doses]) => {
      if (doses.length >= 3) { // Pattern threshold
        patterns.push(`Frequent misses during ${slot} time slot (${doses.length} occurrences)`);
      }
    });

    return patterns;
  }

  private async findStaffPatterns(missedDoses: MedicationAdministration[]): Promise<string[]> {
    const patterns: string[] = [];
    const staffMisses = new Map<string, number>();

    missedDoses.forEach(dose => {
      if (dose.administeredBy) {
        staffMisses.set(dose.administeredBy, (staffMisses.get(dose.administeredBy) || 0) + 1);
      }
    });

    staffMisses.forEach((count, staffId) => {
      if (count >= 3) { // Pattern threshold
        patterns.push(`Staff member ${staffId} has ${count} missed doses`);
      }
    });

    return patterns;
  }

  private findMedicationPatterns(missedDoses: MedicationAdministration[]): string[] {
    const patterns: string[] = [];
    const medicationMisses = new Map<string, number>();

    missedDoses.forEach(dose => {
      const medId = dose.medicationId;
      medicationMisses.set(medId, (medicationMisses.get(medId) || 0) + 1);
    });

    medicationMisses.forEach((count, medId) => {
      if (count >= 3) { // Pattern threshold
        patterns.push(`Medication ${medId} has ${count} missed doses`);
      }
    });

    return patterns;
  }

  private groupByTimeSlot(administrations: MedicationAdministration[]): Record<string, MedicationAdministration[]> {
    return administrations.reduce((acc, admin) => {
      const hour = DateTime.fromJSDate(admin.scheduledTime).hour;
      let slot: string;

      if (hour >= 5 && hour < 12) slot = 'morning';
      else if (hour >= 12 && hour < 17) slot = 'afternoon';
      else if (hour >= 17 && hour < 22) slot = 'evening';
      else slot = 'night';

      if (!acc[slot]) acc[slot] = [];
      acc[slot].push(admin);
      return acc;
    }, {} as Record<string, MedicationAdministration[]>);
  }

  private async calculateMissedDoseImpact(missedDoses: MedicationAdministration[]): Promise<number> {
    const weights = {
      CRITICAL: 3,
      HIGH: 2,
      MEDIUM: 1,
      LOW: 0.5
    };

    return missedDoses.reduce((impact, dose) => {
      const medication = dose.medication;
      const weight = weights[medication.priority || 'MEDIUM'];
      return impact + weight;
    }, 0);
  }

  private buildInteractionAnalysisPrompt(medications: Medication[]): string {
    return `Analyze potential drug interactions for the following medications:
      ${medications.map(m => `- ${m.name} (${m.dosage} ${m.unit})`).join('\n')}
      
      Consider:
      1. Known drug-drug interactions
      2. Dosage-related risks
      3. Timing conflicts
      4. Cumulative effects
      5. Contraindications`;
  }

  private parseInteractionResponse(response: string): DrugInteraction[] {
    try {
      return JSON.parse(response) as DrugInteraction[];
    } catch (error) {
      this.logger.error('Failed to parse interaction response', { error, response });
      return [];
    }
  }

  private generateInteractionRecommendations(interaction: DrugInteraction): string[] {
    const recommendations: string[] = [];

    if (interaction.severity === 'HIGH') {
      recommendations.push('Immediate review required by healthcare provider');
      recommendations.push('Consider alternative medications');
    }

    if (interaction.type === 'TIMING_CONFLICT') {
      recommendations.push('Adjust administration times to avoid interaction');
    }

    if (interaction.type === 'CUMULATIVE_EFFECT') {
      recommendations.push('Monitor for cumulative side effects');
      recommendations.push('Consider dose adjustment');
    }

    return recommendations;
  }
}

export const medicationAnalytics = new MedicationAnalyticsService();


