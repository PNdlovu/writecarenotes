/**
 * @writecarenotes.com
 * @fileoverview British National Formulary (BNF) integration service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Integration service for accessing BNF medication data, guidelines,
 * and clinical recommendations. Provides access to official UK
 * medication information and safety data.
 */

import { prisma } from '@/lib/prisma';
import { createMetricsCollector } from '../monitoring/metrics';
import { BNFConfig } from '../../config/bnf.config';
import type {
  DrugInfo,
  AllergyInfo,
  DrugInteractionWarning,
  AllergyWarning,
  Contraindication,
  BNFDrugData
} from '../../types/interactions';

export class BNFService {
  private metricsCollector;
  private readonly config: BNFConfig;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.metricsCollector = createMetricsCollector('bnf-service');
    this.config = new BNFConfig();
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
        drug1Data,
        drug2Data
      ] = await Promise.all([
        this.getDrugData(drug1.id),
        this.getDrugData(drug2.id)
      ]);

      const warnings = this.analyzeDrugInteraction(
        drug1,
        drug2,
        drug1Data,
        drug2Data
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

      const drugData = await this.getDrugData(drug.id);
      const warnings = this.analyzeAllergyInteraction(drug, allergy, drugData);

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

      const drugData = await this.getDrugData(drug.id);
      const contraindications = this.extractContraindications(drug, drugData);

      // Cache results
      await this.cacheContraindications(drug.id, contraindications);

      return contraindications;
    } catch (error) {
      this.metricsCollector.incrementError('contraindications-fetch-failure');
      throw error;
    }
  }

  private async getDrugData(drugId: string): Promise<BNFDrugData> {
    try {
      // Check local cache first
      const cachedData = await this.getCachedDrugData(drugId);
      if (cachedData) {
        return cachedData;
      }

      // Fetch from BNF database
      const drugData = await this.fetchFromBNF(drugId);

      // Cache the results
      await this.cacheDrugData(drugId, drugData);

      return drugData;
    } catch (error) {
      this.metricsCollector.incrementError('drug-data-fetch-failure');
      throw error;
    }
  }

  private analyzeDrugInteraction(
    drug1: DrugInfo,
    drug2: DrugInfo,
    drug1Data: BNFDrugData,
    drug2Data: BNFDrugData
  ): DrugInteractionWarning[] {
    const warnings: DrugInteractionWarning[] = [];

    // Check direct interactions
    const directInteractions = this.checkDirectInteractions(drug1Data, drug2Data);
    if (directInteractions.length > 0) {
      warnings.push(...directInteractions);
    }

    // Check class-based interactions
    const classInteractions = this.checkClassInteractions(drug1Data, drug2Data);
    if (classInteractions.length > 0) {
      warnings.push(...classInteractions);
    }

    // Check mechanism-based interactions
    const mechanismInteractions = this.checkMechanismInteractions(drug1Data, drug2Data);
    if (mechanismInteractions.length > 0) {
      warnings.push(...mechanismInteractions);
    }

    return this.deduplicateWarnings(warnings);
  }

  private analyzeAllergyInteraction(
    drug: DrugInfo,
    allergy: AllergyInfo,
    drugData: BNFDrugData
  ): AllergyWarning[] {
    const warnings: AllergyWarning[] = [];

    // Check direct allergies
    const directAllergies = this.checkDirectAllergies(drugData, allergy);
    if (directAllergies.length > 0) {
      warnings.push(...directAllergies);
    }

    // Check class-based allergies
    const classAllergies = this.checkClassAllergies(drugData, allergy);
    if (classAllergies.length > 0) {
      warnings.push(...classAllergies);
    }

    return this.deduplicateAllergyWarnings(warnings);
  }

  private extractContraindications(
    drug: DrugInfo,
    drugData: BNFDrugData
  ): Contraindication[] {
    return drugData.contraindications.map(c => ({
      type: 'CONTRAINDICATION',
      severity: c.severity,
      description: c.description,
      evidence: {
        type: 'BNF_GUIDANCE',
        source: 'British National Formulary',
        reference: c.reference
      },
      recommendations: c.recommendations,
      condition: c.condition,
      sources: ['BNF']
    }));
  }

  private async getCachedDrugData(drugId: string): Promise<BNFDrugData | null> {
    const cached = await prisma.bnfDrugCache.findUnique({
      where: { drugId }
    });

    if (cached && this.isCacheValid(cached.updatedAt)) {
      return JSON.parse(cached.data);
    }

    return null;
  }

  private async cacheDrugData(
    drugId: string,
    data: BNFDrugData
  ): Promise<void> {
    await prisma.bnfDrugCache.upsert({
      where: { drugId },
      update: {
        data: JSON.stringify(data),
        updatedAt: new Date()
      },
      create: {
        drugId,
        data: JSON.stringify(data),
        updatedAt: new Date()
      }
    });
  }

  private async getCachedDrugInteraction(
    drug1Id: string,
    drug2Id: string
  ): Promise<DrugInteractionWarning[] | null> {
    const cacheKey = this.generateInteractionCacheKey(drug1Id, drug2Id);
    const cached = await prisma.bnfInteractionCache.findUnique({
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
    await prisma.bnfInteractionCache.upsert({
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
    const cached = await prisma.bnfAllergyCache.findUnique({
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
    await prisma.bnfAllergyCache.upsert({
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
    const cached = await prisma.bnfContraindicationCache.findUnique({
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
    await prisma.bnfContraindicationCache.upsert({
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

  private async fetchFromBNF(drugId: string): Promise<BNFDrugData> {
    // Implementation for fetching from BNF database
    return {} as BNFDrugData;
  }

  private checkDirectInteractions(
    drug1Data: BNFDrugData,
    drug2Data: BNFDrugData
  ): DrugInteractionWarning[] {
    // Implementation
    return [];
  }

  private checkClassInteractions(
    drug1Data: BNFDrugData,
    drug2Data: BNFDrugData
  ): DrugInteractionWarning[] {
    // Implementation
    return [];
  }

  private checkMechanismInteractions(
    drug1Data: BNFDrugData,
    drug2Data: BNFDrugData
  ): DrugInteractionWarning[] {
    // Implementation
    return [];
  }

  private checkDirectAllergies(
    drugData: BNFDrugData,
    allergy: AllergyInfo
  ): AllergyWarning[] {
    // Implementation
    return [];
  }

  private checkClassAllergies(
    drugData: BNFDrugData,
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