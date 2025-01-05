/**
 * @writecarenotes.com
 * @fileoverview Cross-reactivity analysis service for medications
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Advanced cross-reactivity analysis service for identifying potential
 * cross-reactions between medications and allergies, utilizing multiple
 * data sources and machine learning predictions.
 */

import { prisma } from '@/lib/prisma';
import { createMetricsCollector } from '../monitoring/metrics';
import { BNFService } from '../integrations/BNFService';
import { DrugBankService } from '../integrations/DrugBankService';
import { MLPredictionService } from '../analytics/MLPredictionService';
import type {
  CrossReactivity,
  AllergyInfo,
  ChemicalStructure,
  CrossReactivityPrediction,
  ConfidenceLevel
} from '../../types/interactions';

export class CrossReactivityService {
  private metricsCollector;
  private bnfService: BNFService;
  private drugBankService: DrugBankService;
  private mlPredictionService: MLPredictionService;
  private readonly SIMILARITY_THRESHOLD = 0.75;
  private readonly CACHE_DURATION = 12 * 60 * 60 * 1000; // 12 hours

  constructor() {
    this.metricsCollector = createMetricsCollector('cross-reactivity');
    this.bnfService = new BNFService();
    this.drugBankService = new DrugBankService();
    this.mlPredictionService = new MLPredictionService();
  }

  async analyze(
    medication: string,
    allergy: AllergyInfo
  ): Promise<CrossReactivity[]> {
    try {
      // Check cache first
      const cachedResults = await this.getCachedAnalysis(medication, allergy);
      if (cachedResults) {
        return cachedResults;
      }

      // Perform comprehensive analysis
      const [
        structuralAnalysis,
        knownPatterns,
        mlPredictions
      ] = await Promise.all([
        this.analyzeStructuralSimilarity(medication, allergy),
        this.checkKnownPatterns(medication, allergy),
        this.predictCrossReactivity(medication, allergy)
      ]);

      // Combine and validate results
      const crossReactivities = this.combineResults(
        structuralAnalysis,
        knownPatterns,
        mlPredictions
      );

      // Cache results
      await this.cacheResults(medication, allergy, crossReactivities);

      return crossReactivities;
    } catch (error) {
      this.metricsCollector.incrementError('cross-reactivity-analysis-failure');
      throw new Error('Failed to analyze cross-reactivity');
    }
  }

  private async analyzeStructuralSimilarity(
    medication: string,
    allergy: AllergyInfo
  ): Promise<CrossReactivity[]> {
    try {
      const [
        medicationStructure,
        allergyStructure
      ] = await Promise.all([
        this.getChemicalStructure(medication),
        this.getChemicalStructure(allergy.substance)
      ]);

      if (!medicationStructure || !allergyStructure) {
        return [];
      }

      const similarity = this.calculateStructuralSimilarity(
        medicationStructure,
        allergyStructure
      );

      if (similarity >= this.SIMILARITY_THRESHOLD) {
        return [{
          type: 'STRUCTURAL_SIMILARITY',
          source: 'Chemical Structure Analysis',
          description: `${Math.round(similarity * 100)}% structural similarity detected`,
          severity: this.determineSeverity(similarity),
          confidence: this.determineConfidence(similarity),
          evidence: {
            similarityScore: similarity,
            structuralDetails: this.getStructuralDetails(medicationStructure, allergyStructure)
          },
          recommendation: this.generateStructuralRecommendation(similarity)
        }];
      }

      return [];
    } catch (error) {
      this.metricsCollector.incrementError('structural-analysis-failure');
      throw error;
    }
  }

  private async checkKnownPatterns(
    medication: string,
    allergy: AllergyInfo
  ): Promise<CrossReactivity[]> {
    try {
      const [
        bnfPatterns,
        drugBankPatterns
      ] = await Promise.all([
        this.bnfService.getKnownCrossReactivityPatterns(medication, allergy),
        this.drugBankService.getKnownCrossReactivityPatterns(medication, allergy)
      ]);

      return [...bnfPatterns, ...drugBankPatterns].map(pattern => ({
        type: 'KNOWN_PATTERN',
        source: pattern.source,
        description: pattern.description,
        severity: pattern.severity,
        confidence: 'HIGH' as ConfidenceLevel,
        evidence: {
          patternId: pattern.id,
          references: pattern.references
        },
        recommendation: pattern.recommendation
      }));
    } catch (error) {
      this.metricsCollector.incrementError('known-patterns-check-failure');
      throw error;
    }
  }

  private async predictCrossReactivity(
    medication: string,
    allergy: AllergyInfo
  ): Promise<CrossReactivity[]> {
    try {
      const predictions = await this.mlPredictionService.predictCrossReactivity(
        medication,
        allergy
      );

      return predictions
        .filter(p => p.probability >= this.SIMILARITY_THRESHOLD)
        .map(prediction => ({
          type: 'ML_PREDICTION',
          source: 'Machine Learning Analysis',
          description: this.generatePredictionDescription(prediction),
          severity: this.determineSeverity(prediction.probability),
          confidence: this.determineConfidence(prediction.probability),
          evidence: {
            probability: prediction.probability,
            features: prediction.contributingFeatures
          },
          recommendation: this.generatePredictionRecommendation(prediction)
        }));
    } catch (error) {
      this.metricsCollector.incrementError('ml-prediction-failure');
      throw error;
    }
  }

  private async getCachedAnalysis(
    medication: string,
    allergy: AllergyInfo
  ): Promise<CrossReactivity[] | null> {
    const cached = await prisma.crossReactivityCache.findUnique({
      where: {
        medication_allergyId: {
          medication,
          allergyId: allergy.id
        }
      }
    });

    if (cached && this.isCacheValid(cached.updatedAt)) {
      return JSON.parse(cached.data);
    }

    return null;
  }

  private async cacheResults(
    medication: string,
    allergy: AllergyInfo,
    results: CrossReactivity[]
  ): Promise<void> {
    await prisma.crossReactivityCache.upsert({
      where: {
        medication_allergyId: {
          medication,
          allergyId: allergy.id
        }
      },
      update: {
        data: JSON.stringify(results),
        updatedAt: new Date()
      },
      create: {
        medication,
        allergyId: allergy.id,
        data: JSON.stringify(results),
        updatedAt: new Date()
      }
    });
  }

  private combineResults(
    structuralAnalysis: CrossReactivity[],
    knownPatterns: CrossReactivity[],
    mlPredictions: CrossReactivity[]
  ): CrossReactivity[] {
    const combined = [
      ...structuralAnalysis,
      ...knownPatterns,
      ...mlPredictions
    ];

    // Remove duplicates and conflicting results
    return this.deduplicateAndResolveConflicts(combined);
  }

  private determineSeverity(score: number): string {
    if (score >= 0.9) return 'CRITICAL';
    if (score >= 0.8) return 'HIGH';
    if (score >= 0.7) return 'MEDIUM';
    return 'LOW';
  }

  private determineConfidence(score: number): ConfidenceLevel {
    if (score >= 0.9) return 'HIGH';
    if (score >= 0.7) return 'MEDIUM';
    return 'LOW';
  }

  private async getChemicalStructure(substance: string): Promise<ChemicalStructure | null> {
    // Implementation
    return null;
  }

  private calculateStructuralSimilarity(
    structure1: ChemicalStructure,
    structure2: ChemicalStructure
  ): number {
    // Implementation
    return 0;
  }

  private getStructuralDetails(
    structure1: ChemicalStructure,
    structure2: ChemicalStructure
  ): object {
    // Implementation
    return {};
  }

  private generateStructuralRecommendation(similarity: number): string {
    // Implementation
    return '';
  }

  private generatePredictionDescription(prediction: CrossReactivityPrediction): string {
    // Implementation
    return '';
  }

  private generatePredictionRecommendation(prediction: CrossReactivityPrediction): string {
    // Implementation
    return '';
  }

  private deduplicateAndResolveConflicts(results: CrossReactivity[]): CrossReactivity[] {
    // Implementation
    return results;
  }

  private isCacheValid(updatedAt: Date): boolean {
    const age = Date.now() - updatedAt.getTime();
    return age < this.CACHE_DURATION;
  }
} 