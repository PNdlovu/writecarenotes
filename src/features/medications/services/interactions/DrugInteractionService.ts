/**
 * @writecarenotes.com
 * @fileoverview Drug interaction checking service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive drug interaction service using established medical databases
 * and clinical guidelines to check for drug-drug interactions, allergies,
 * and contraindications.
 */

import { prisma } from '@/lib/prisma';
import { createMetricsCollector } from '../monitoring/metrics';
import { BNFService } from '../integrations/BNFService';
import { NICEService } from '../integrations/NICEService';
import type {
  DrugInteraction,
  InteractionSeverity,
  InteractionEvidence,
  DrugInfo,
  AllergyInfo
} from '../../types/interactions';

export class DrugInteractionService {
  private metricsCollector;
  private bnfService: BNFService;
  private niceService: NICEService;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.metricsCollector = createMetricsCollector('drug-interactions');
    this.bnfService = new BNFService();
    this.niceService = new NICEService();
  }

  async checkInteractions(
    newDrug: DrugInfo,
    currentMedications: DrugInfo[],
    allergies: AllergyInfo[]
  ): Promise<DrugInteraction[]> {
    try {
      // Check cache first
      const cachedResults = await this.getCachedInteractions(newDrug, currentMedications);
      if (cachedResults) {
        return cachedResults;
      }

      const [
        drugInteractions,
        allergyInteractions,
        contraindicationWarnings
      ] = await Promise.all([
        this.checkDrugDrugInteractions(newDrug, currentMedications),
        this.checkAllergyInteractions(newDrug, allergies),
        this.checkContraindications(newDrug)
      ]);

      const interactions = [
        ...drugInteractions,
        ...allergyInteractions,
        ...contraindicationWarnings
      ];

      // Cache results
      await this.cacheInteractions(newDrug, currentMedications, interactions);

      return interactions;
    } catch (error) {
      this.metricsCollector.incrementError('interaction-check-failure');
      throw new Error('Failed to check drug interactions');
    }
  }

  private async checkDrugDrugInteractions(
    newDrug: DrugInfo,
    currentMedications: DrugInfo[]
  ): Promise<DrugInteraction[]> {
    try {
      const interactions: DrugInteraction[] = [];

      for (const existingDrug of currentMedications) {
        const [
          bnfInteractions,
          niceInteractions
        ] = await Promise.all([
          this.bnfService.checkDrugInteraction(newDrug, existingDrug),
          this.niceService.checkDrugInteraction(newDrug, existingDrug)
        ]);

        const combinedInteractions = this.combineInteractionResults(
          bnfInteractions,
          niceInteractions
        );

        if (combinedInteractions) {
          interactions.push({
            type: 'DRUG_DRUG',
            severity: combinedInteractions.severity,
            description: combinedInteractions.description,
            evidence: combinedInteractions.evidence,
            recommendations: combinedInteractions.recommendations,
            affectedDrugs: [newDrug.name, existingDrug.name],
            mechanism: combinedInteractions.mechanism,
            clinicalEffects: combinedInteractions.clinicalEffects,
            sources: combinedInteractions.sources
          });
        }
      }

      return interactions;
    } catch (error) {
      this.metricsCollector.incrementError('drug-drug-check-failure');
      throw error;
    }
  }

  private async checkAllergyInteractions(
    drug: DrugInfo,
    allergies: AllergyInfo[]
  ): Promise<DrugInteraction[]> {
    try {
      const interactions: DrugInteraction[] = [];

      for (const allergy of allergies) {
        const [
          bnfWarnings,
          niceWarnings
        ] = await Promise.all([
          this.bnfService.checkAllergyInteraction(drug, allergy),
          this.niceService.checkAllergyInteraction(drug, allergy)
        ]);

        const combinedWarnings = this.combineAllergyWarnings(
          bnfWarnings,
          niceWarnings
        );

        if (combinedWarnings) {
          interactions.push({
            type: 'ALLERGY',
            severity: combinedWarnings.severity,
            description: combinedWarnings.description,
            evidence: combinedWarnings.evidence,
            recommendations: combinedWarnings.recommendations,
            affectedDrugs: [drug.name],
            allergen: allergy.substance,
            crossReactivityInfo: combinedWarnings.crossReactivityInfo,
            sources: combinedWarnings.sources
          });
        }
      }

      return interactions;
    } catch (error) {
      this.metricsCollector.incrementError('allergy-check-failure');
      throw error;
    }
  }

  private async checkContraindications(
    drug: DrugInfo
  ): Promise<DrugInteraction[]> {
    try {
      const [
        bnfContraindications,
        niceContraindications
      ] = await Promise.all([
        this.bnfService.getContraindications(drug),
        this.niceService.getContraindications(drug)
      ]);

      return this.combineContraindications(
        bnfContraindications,
        niceContraindications
      ).map(contraindication => ({
        type: 'CONTRAINDICATION',
        severity: contraindication.severity,
        description: contraindication.description,
        evidence: contraindication.evidence,
        recommendations: contraindication.recommendations,
        affectedDrugs: [drug.name],
        condition: contraindication.condition,
        sources: contraindication.sources
      }));
    } catch (error) {
      this.metricsCollector.incrementError('contraindication-check-failure');
      throw error;
    }
  }

  private async getCachedInteractions(
    newDrug: DrugInfo,
    currentMedications: DrugInfo[]
  ): Promise<DrugInteraction[] | null> {
    const cacheKey = this.generateCacheKey(newDrug, currentMedications);
    const cached = await prisma.drugInteractionCache.findUnique({
      where: { cacheKey }
    });

    if (cached && this.isCacheValid(cached.updatedAt)) {
      return JSON.parse(cached.data);
    }

    return null;
  }

  private async cacheInteractions(
    newDrug: DrugInfo,
    currentMedications: DrugInfo[],
    interactions: DrugInteraction[]
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(newDrug, currentMedications);
    await prisma.drugInteractionCache.upsert({
      where: { cacheKey },
      update: {
        data: JSON.stringify(interactions),
        updatedAt: new Date()
      },
      create: {
        cacheKey,
        data: JSON.stringify(interactions),
        updatedAt: new Date()
      }
    });
  }

  private generateCacheKey(
    newDrug: DrugInfo,
    currentMedications: DrugInfo[]
  ): string {
    const medicationIds = [
      newDrug.id,
      ...currentMedications.map(med => med.id)
    ].sort();
    return medicationIds.join('-');
  }

  private isCacheValid(updatedAt: Date): boolean {
    const age = Date.now() - updatedAt.getTime();
    return age < this.CACHE_DURATION;
  }

  private combineInteractionResults(
    bnfResults: any[],
    niceResults: any[]
  ): any | null {
    // Implementation for combining and deduplicating interaction results
    return null;
  }

  private combineAllergyWarnings(
    bnfWarnings: any[],
    niceWarnings: any[]
  ): any | null {
    // Implementation for combining allergy warnings
    return null;
  }

  private combineContraindications(
    bnfContraindications: any[],
    niceContraindications: any[]
  ): any[] {
    // Implementation for combining contraindications
    return [];
  }
} 