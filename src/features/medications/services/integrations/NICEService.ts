/**
 * @writecarenotes.com
 * @fileoverview NICE (National Institute for Health and Care Excellence) integration service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Integration service for accessing NICE clinical guidelines and
 * recommendations. Provides access to official UK healthcare
 * guidance and safety protocols.
 */

import { prisma } from '@/lib/prisma';
import { createMetricsCollector } from '../monitoring/metrics';
import { NICEConfig } from '../../config/nice.config';
import type {
  DrugInfo,
  AllergyInfo,
  DrugInteractionWarning,
  AllergyWarning,
  Contraindication,
  NICEGuidance,
  ClinicalRecommendation
} from '../../types/interactions';

export class NICEService {
  private metricsCollector;
  private readonly config: NICEConfig;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.metricsCollector = createMetricsCollector('nice-service');
    this.config = new NICEConfig();
  }

  async checkDrugInteraction(
    drug1: DrugInfo,
    drug2: DrugInfo
  ): Promise<DrugInteractionWarning[]> {
    try {
      // Check cache first
      const cachedWarnings = await this.getCachedDrugInteraction(drug1.id, drug2.id);
      if (cachedWarnings) {
        return cachedWarnings;
      }

      const [
        drug1Guidance,
        drug2Guidance
      ] = await Promise.all([
        this.getDrugGuidance(drug1.id),
        this.getDrugGuidance(drug2.id)
      ]);

      const warnings = this.analyzeInteractionGuidance(
        drug1,
        drug2,
        drug1Guidance,
        drug2Guidance
      );

      // Cache results
      await this.cacheDrugInteraction(drug1.id, drug2.id, warnings);

      return warnings;
    } catch (error) {
      this.metricsCollector.incrementError('drug-interaction-check-failure');
      throw error;
    }
  }

  async checkAllergyInteraction(
    drug: DrugInfo,
    allergy: AllergyInfo
  ): Promise<AllergyWarning[]> {
    try {
      // Check cache first
      const cachedWarnings = await this.getCachedAllergyInteraction(drug.id, allergy.id);
      if (cachedWarnings) {
        return cachedWarnings;
      }

      const guidance = await this.getDrugGuidance(drug.id);
      const warnings = this.analyzeAllergyGuidance(drug, allergy, guidance);

      // Cache results
      await this.cacheAllergyInteraction(drug.id, allergy.id, warnings);

      return warnings;
    } catch (error) {
      this.metricsCollector.incrementError('allergy-interaction-check-failure');
      throw error;
    }
  }

  async getContraindications(drug: DrugInfo): Promise<Contraindication[]> {
    try {
      // Check cache first
      const cachedContraindications = await this.getCachedContraindications(drug.id);
      if (cachedContraindications) {
        return cachedContraindications;
      }

      const guidance = await this.getDrugGuidance(drug.id);
      const contraindications = this.extractContraindications(drug, guidance);

      // Cache results
      await this.cacheContraindications(drug.id, contraindications);

      return contraindications;
    } catch (error) {
      this.metricsCollector.incrementError('contraindications-fetch-failure');
      throw error;
    }
  }

  async getClinicalRecommendations(drug: DrugInfo): Promise<ClinicalRecommendation[]> {
    try {
      // Check cache first
      const cachedRecommendations = await this.getCachedRecommendations(drug.id);
      if (cachedRecommendations) {
        return cachedRecommendations;
      }

      const guidance = await this.getDrugGuidance(drug.id);
      const recommendations = this.extractRecommendations(drug, guidance);

      // Cache results
      await this.cacheRecommendations(drug.id, recommendations);

      return recommendations;
    } catch (error) {
      this.metricsCollector.incrementError('recommendations-fetch-failure');
      throw error;
    }
  }

  private async getDrugGuidance(drugId: string): Promise<NICEGuidance> {
    try {
      // Check local cache first
      const cachedGuidance = await this.getCachedGuidance(drugId);
      if (cachedGuidance) {
        return cachedGuidance;
      }

      // Fetch from NICE database
      const guidance = await this.fetchFromNICE(drugId);

      // Cache the results
      await this.cacheGuidance(drugId, guidance);

      return guidance;
    } catch (error) {
      this.metricsCollector.incrementError('guidance-fetch-failure');
      throw error;
    }
  }

  private analyzeInteractionGuidance(
    drug1: DrugInfo,
    drug2: DrugInfo,
    guidance1: NICEGuidance,
    guidance2: NICEGuidance
  ): DrugInteractionWarning[] {
    const warnings: DrugInteractionWarning[] = [];

    // Check direct interactions
    const directWarnings = this.checkDirectGuidanceInteractions(guidance1, guidance2);
    if (directWarnings.length > 0) {
      warnings.push(...directWarnings);
    }

    // Check therapeutic class interactions
    const classWarnings = this.checkClassGuidanceInteractions(guidance1, guidance2);
    if (classWarnings.length > 0) {
      warnings.push(...classWarnings);
    }

    // Check clinical pathway conflicts
    const pathwayWarnings = this.checkPathwayConflicts(guidance1, guidance2);
    if (pathwayWarnings.length > 0) {
      warnings.push(...pathwayWarnings);
    }

    return this.deduplicateWarnings(warnings);
  }

  private analyzeAllergyGuidance(
    drug: DrugInfo,
    allergy: AllergyInfo,
    guidance: NICEGuidance
  ): AllergyWarning[] {
    const warnings: AllergyWarning[] = [];

    // Check direct allergy warnings
    const directWarnings = this.checkDirectAllergyGuidance(guidance, allergy);
    if (directWarnings.length > 0) {
      warnings.push(...directWarnings);
    }

    // Check class-based allergy warnings
    const classWarnings = this.checkClassAllergyGuidance(guidance, allergy);
    if (classWarnings.length > 0) {
      warnings.push(...classWarnings);
    }

    return this.deduplicateAllergyWarnings(warnings);
  }

  private extractContraindications(
    drug: DrugInfo,
    guidance: NICEGuidance
  ): Contraindication[] {
    return guidance.contraindications.map(c => ({
      type: 'CONTRAINDICATION',
      severity: c.severity,
      description: c.description,
      evidence: {
        type: 'NICE_GUIDANCE',
        source: 'NICE Guidelines',
        reference: c.reference,
        guidanceId: c.guidanceId
      },
      recommendations: c.recommendations,
      condition: c.condition,
      sources: ['NICE']
    }));
  }

  private extractRecommendations(
    drug: DrugInfo,
    guidance: NICEGuidance
  ): ClinicalRecommendation[] {
    return guidance.recommendations.map(r => ({
      type: r.type,
      description: r.description,
      evidence: {
        type: 'NICE_GUIDANCE',
        source: 'NICE Guidelines',
        reference: r.reference,
        guidanceId: r.guidanceId,
        evidenceLevel: r.evidenceLevel
      },
      implementation: r.implementation,
      monitoring: r.monitoring,
      reviewPeriod: r.reviewPeriod
    }));
  }

  private async getCachedGuidance(drugId: string): Promise<NICEGuidance | null> {
    const cached = await prisma.niceGuidanceCache.findUnique({
      where: { drugId }
    });

    if (cached && this.isCacheValid(cached.updatedAt)) {
      return JSON.parse(cached.data);
    }

    return null;
  }

  private async cacheGuidance(
    drugId: string,
    guidance: NICEGuidance
  ): Promise<void> {
    await prisma.niceGuidanceCache.upsert({
      where: { drugId },
      update: {
        data: JSON.stringify(guidance),
        updatedAt: new Date()
      },
      create: {
        drugId,
        data: JSON.stringify(guidance),
        updatedAt: new Date()
      }
    });
  }

  private async getCachedDrugInteraction(
    drug1Id: string,
    drug2Id: string
  ): Promise<DrugInteractionWarning[] | null> {
    const cacheKey = this.generateInteractionCacheKey(drug1Id, drug2Id);
    const cached = await prisma.niceInteractionCache.findUnique({
      where: { cacheKey }
    });

    if (cached && this.isCacheValid(cached.updatedAt)) {
      return JSON.parse(cached.data);
    }

    return null;
  }

  private async cacheDrugInteraction(
    drug1Id: string,
    drug2Id: string,
    warnings: DrugInteractionWarning[]
  ): Promise<void> {
    const cacheKey = this.generateInteractionCacheKey(drug1Id, drug2Id);
    await prisma.niceInteractionCache.upsert({
      where: { cacheKey },
      update: {
        data: JSON.stringify(warnings),
        updatedAt: new Date()
      },
      create: {
        cacheKey,
        data: JSON.stringify(warnings),
        updatedAt: new Date()
      }
    });
  }

  private generateInteractionCacheKey(drug1Id: string, drug2Id: string): string {
    return [drug1Id, drug2Id].sort().join('-');
  }

  private async getCachedAllergyInteraction(
    drugId: string,
    allergyId: string
  ): Promise<AllergyWarning[] | null> {
    const cached = await prisma.niceAllergyCache.findUnique({
      where: {
        drugId_allergyId: {
          drugId,
          allergyId
        }
      }
    });

    if (cached && this.isCacheValid(cached.updatedAt)) {
      return JSON.parse(cached.data);
    }

    return null;
  }

  private async cacheAllergyInteraction(
    drugId: string,
    allergyId: string,
    warnings: AllergyWarning[]
  ): Promise<void> {
    await prisma.niceAllergyCache.upsert({
      where: {
        drugId_allergyId: {
          drugId,
          allergyId
        }
      },
      update: {
        data: JSON.stringify(warnings),
        updatedAt: new Date()
      },
      create: {
        drugId,
        allergyId,
        data: JSON.stringify(warnings),
        updatedAt: new Date()
      }
    });
  }

  private async getCachedContraindications(
    drugId: string
  ): Promise<Contraindication[] | null> {
    const cached = await prisma.niceContraindicationCache.findUnique({
      where: { drugId }
    });

    if (cached && this.isCacheValid(cached.updatedAt)) {
      return JSON.parse(cached.data);
    }

    return null;
  }

  private async cacheContraindications(
    drugId: string,
    contraindications: Contraindication[]
  ): Promise<void> {
    await prisma.niceContraindicationCache.upsert({
      where: { drugId },
      update: {
        data: JSON.stringify(contraindications),
        updatedAt: new Date()
      },
      create: {
        drugId,
        data: JSON.stringify(contraindications),
        updatedAt: new Date()
      }
    });
  }

  private async getCachedRecommendations(
    drugId: string
  ): Promise<ClinicalRecommendation[] | null> {
    const cached = await prisma.niceRecommendationCache.findUnique({
      where: { drugId }
    });

    if (cached && this.isCacheValid(cached.updatedAt)) {
      return JSON.parse(cached.data);
    }

    return null;
  }

  private async cacheRecommendations(
    drugId: string,
    recommendations: ClinicalRecommendation[]
  ): Promise<void> {
    await prisma.niceRecommendationCache.upsert({
      where: { drugId },
      update: {
        data: JSON.stringify(recommendations),
        updatedAt: new Date()
      },
      create: {
        drugId,
        data: JSON.stringify(recommendations),
        updatedAt: new Date()
      }
    });
  }

  private async fetchFromNICE(drugId: string): Promise<NICEGuidance> {
    // Implementation for fetching from NICE database
    return {} as NICEGuidance;
  }

  private checkDirectGuidanceInteractions(
    guidance1: NICEGuidance,
    guidance2: NICEGuidance
  ): DrugInteractionWarning[] {
    // Implementation
    return [];
  }

  private checkClassGuidanceInteractions(
    guidance1: NICEGuidance,
    guidance2: NICEGuidance
  ): DrugInteractionWarning[] {
    // Implementation
    return [];
  }

  private checkPathwayConflicts(
    guidance1: NICEGuidance,
    guidance2: NICEGuidance
  ): DrugInteractionWarning[] {
    // Implementation
    return [];
  }

  private checkDirectAllergyGuidance(
    guidance: NICEGuidance,
    allergy: AllergyInfo
  ): AllergyWarning[] {
    // Implementation
    return [];
  }

  private checkClassAllergyGuidance(
    guidance: NICEGuidance,
    allergy: AllergyInfo
  ): AllergyWarning[] {
    // Implementation
    return [];
  }

  private deduplicateWarnings(warnings: DrugInteractionWarning[]): DrugInteractionWarning[] {
    // Implementation
    return warnings;
  }

  private deduplicateAllergyWarnings(warnings: AllergyWarning[]): AllergyWarning[] {
    // Implementation
    return warnings;
  }

  private isCacheValid(updatedAt: Date): boolean {
    const age = Date.now() - updatedAt.getTime();
    return age < this.CACHE_DURATION;
  }
} 