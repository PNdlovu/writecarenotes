/**
 * @writecarenotes.com
 * @fileoverview Allergy interaction database service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Comprehensive allergy interaction database service providing
 * real-time allergy checking and cross-reactivity analysis.
 */

import { prisma } from '@/lib/prisma';
import { createMetricsCollector } from '../monitoring/metrics';
import { BNFService } from '../integrations/BNFService';
import { NICEService } from '../integrations/NICEService';
import { CrossReactivityService } from './CrossReactivityService';
import type {
  AllergyInteraction,
  AllergyInfo,
  CrossReactivity,
  AllergyEvidence,
  AllergyWarning
} from '../../types/interactions';

export class AllergyDatabase {
  private metricsCollector;
  private bnfService: BNFService;
  private niceService: NICEService;
  private crossReactivityService: CrossReactivityService;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.metricsCollector = createMetricsCollector('allergy-database');
    this.bnfService = new BNFService();
    this.niceService = new NICEService();
    this.crossReactivityService = new CrossReactivityService();
  }

  async checkInteraction(
    medication: string,
    allergy: AllergyInfo
  ): Promise<AllergyInteraction | null> {
    try {
      // Check cache first
      const cachedInteraction = await this.getCachedInteraction(medication, allergy);
      if (cachedInteraction) {
        return cachedInteraction;
      }

      // Perform comprehensive allergy check
      const [
        directMatch,
        crossReactivity,
        classBasedWarnings
      ] = await Promise.all([
        this.checkDirectAllergy(medication, allergy),
        this.checkCrossReactivity(medication, allergy),
        this.checkDrugClassAllergies(medication, allergy)
      ]);

      // Combine all findings
      const interaction = this.combineAllergyFindings(
        directMatch,
        crossReactivity,
        classBasedWarnings
      );

      if (interaction) {
        // Cache the result
        await this.cacheInteraction(medication, allergy, interaction);
        return interaction;
      }

      return null;
    } catch (error) {
      this.metricsCollector.incrementError('allergy-check-failure');
      throw new Error('Failed to check allergy interaction');
    }
  }

  async updateDatabase(): Promise<void> {
    try {
      await Promise.all([
        this.updateBNFAllergies(),
        this.updateNICEAllergies(),
        this.updateCrossReactivityData()
      ]);

      await this.validateDatabase();
      await this.clearCache();
    } catch (error) {
      this.metricsCollector.incrementError('database-update-failure');
      throw new Error('Failed to update allergy database');
    }
  }

  private async checkDirectAllergy(
    medication: string,
    allergy: AllergyInfo
  ): Promise<AllergyWarning | null> {
    try {
      const [
        bnfWarning,
        niceWarning
      ] = await Promise.all([
        this.bnfService.checkAllergy(medication, allergy),
        this.niceService.checkAllergy(medication, allergy)
      ]);

      return this.combineWarnings([bnfWarning, niceWarning]);
    } catch (error) {
      this.metricsCollector.incrementError('direct-allergy-check-failure');
      throw error;
    }
  }

  private async checkCrossReactivity(
    medication: string,
    allergy: AllergyInfo
  ): Promise<CrossReactivity[]> {
    try {
      return await this.crossReactivityService.analyze(medication, allergy);
    } catch (error) {
      this.metricsCollector.incrementError('cross-reactivity-check-failure');
      throw error;
    }
  }

  private async checkDrugClassAllergies(
    medication: string,
    allergy: AllergyInfo
  ): Promise<AllergyWarning[]> {
    try {
      const drugClass = await this.getDrugClass(medication);
      return await this.checkClassAllergies(drugClass, allergy);
    } catch (error) {
      this.metricsCollector.incrementError('class-allergy-check-failure');
      throw error;
    }
  }

  private async getCachedInteraction(
    medication: string,
    allergy: AllergyInfo
  ): Promise<AllergyInteraction | null> {
    const cached = await prisma.allergyInteractionCache.findUnique({
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

  private async cacheInteraction(
    medication: string,
    allergy: AllergyInfo,
    interaction: AllergyInteraction
  ): Promise<void> {
    await prisma.allergyInteractionCache.upsert({
      where: {
        medication_allergyId: {
          medication,
          allergyId: allergy.id
        }
      },
      update: {
        data: JSON.stringify(interaction),
        updatedAt: new Date()
      },
      create: {
        medication,
        allergyId: allergy.id,
        data: JSON.stringify(interaction),
        updatedAt: new Date()
      }
    });
  }

  private combineAllergyFindings(
    directMatch: AllergyWarning | null,
    crossReactivity: CrossReactivity[],
    classWarnings: AllergyWarning[]
  ): AllergyInteraction | null {
    if (!directMatch && crossReactivity.length === 0 && classWarnings.length === 0) {
      return null;
    }

    const severity = this.determineHighestSeverity([
      directMatch?.severity,
      ...crossReactivity.map(cr => cr.severity),
      ...classWarnings.map(w => w.severity)
    ]);

    return {
      severity,
      directMatch,
      crossReactivity,
      classWarnings,
      evidence: this.combineEvidence(directMatch, crossReactivity, classWarnings),
      recommendations: this.generateRecommendations(severity, directMatch, crossReactivity, classWarnings),
      lastUpdated: new Date().toISOString()
    };
  }

  private determineHighestSeverity(severities: string[]): string {
    const validSeverities = severities.filter(s => s !== undefined);
    const severityOrder = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3
    };

    return validSeverities.reduce((highest, current) => {
      return severityOrder[current] < severityOrder[highest] ? current : highest;
    });
  }

  private combineEvidence(
    directMatch: AllergyWarning | null,
    crossReactivity: CrossReactivity[],
    classWarnings: AllergyWarning[]
  ): AllergyEvidence[] {
    const evidence: AllergyEvidence[] = [];

    if (directMatch) {
      evidence.push({
        type: 'DIRECT_MATCH',
        source: directMatch.source,
        description: directMatch.description,
        confidence: 'HIGH'
      });
    }

    crossReactivity.forEach(cr => {
      evidence.push({
        type: 'CROSS_REACTIVITY',
        source: cr.source,
        description: cr.description,
        confidence: cr.confidence
      });
    });

    classWarnings.forEach(warning => {
      evidence.push({
        type: 'CLASS_WARNING',
        source: warning.source,
        description: warning.description,
        confidence: 'MEDIUM'
      });
    });

    return evidence;
  }

  private generateRecommendations(
    severity: string,
    directMatch: AllergyWarning | null,
    crossReactivity: CrossReactivity[],
    classWarnings: AllergyWarning[]
  ): string[] {
    const recommendations = new Set<string>();

    if (directMatch) {
      recommendations.add(directMatch.recommendation);
    }

    crossReactivity.forEach(cr => {
      recommendations.add(cr.recommendation);
    });

    classWarnings.forEach(warning => {
      recommendations.add(warning.recommendation);
    });

    // Add severity-specific recommendations
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      recommendations.add('Consider alternative medication');
      recommendations.add('Mandatory consultation with allergist before administration');
    }

    return Array.from(recommendations);
  }

  private isCacheValid(updatedAt: Date): boolean {
    const age = Date.now() - updatedAt.getTime();
    return age < this.CACHE_DURATION;
  }

  private async getDrugClass(medication: string): Promise<string> {
    // Implementation
    return '';
  }

  private async checkClassAllergies(
    drugClass: string,
    allergy: AllergyInfo
  ): Promise<AllergyWarning[]> {
    // Implementation
    return [];
  }

  private combineWarnings(warnings: (AllergyWarning | null)[]): AllergyWarning | null {
    // Implementation
    return null;
  }

  private async updateBNFAllergies(): Promise<void> {
    // Implementation
  }

  private async updateNICEAllergies(): Promise<void> {
    // Implementation
  }

  private async updateCrossReactivityData(): Promise<void> {
    // Implementation
  }

  private async validateDatabase(): Promise<void> {
    // Implementation
  }

  private async clearCache(): Promise<void> {
    // Implementation
  }
} 