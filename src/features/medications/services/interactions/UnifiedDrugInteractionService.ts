/**
 * @writecarenotes.com
 * @fileoverview Unified Drug Interaction Service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * UK and Ireland focused drug interaction service using regional regulatory
 * databases for medication safety checks in both adult and children's care homes.
 */

import { prisma } from '@/lib/prisma';
import { BNFService } from '../integrations/BNFService';
import { NICEService } from '../integrations/NICEService';
import { HIQAService } from '../integrations/HIQAService';
import { OfstedService } from '../integrations/OfstedService';
import { CIWService } from '../integrations/CIWService';
import { CareInspectorateService } from '../integrations/CareInspectorateService';
import { RQIAService } from '../integrations/RQIAService';
import type {
  DrugInteraction,
  DrugPair,
  DrugInfo,
  AllergyInfo,
  InteractionSeverity,
  FoodInteraction,
  DoseAlert,
  Region,
  CareHomeType
} from '../../types/interactions';

// Custom error types for better error handling
class DrugInteractionError extends Error {
  constructor(message: string, public readonly code: string, public readonly details?: any) {
    super(message);
    this.name = 'DrugInteractionError';
  }
}

class RegionalServiceError extends DrugInteractionError {
  constructor(message: string, region: Region, details?: any) {
    super(message, 'REGIONAL_SERVICE_ERROR', { region, ...details });
    this.name = 'RegionalServiceError';
  }
}

class ValidationError extends DrugInteractionError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class UnifiedDrugInteractionService {
  private bnfService: BNFService;
  private niceService: NICEService;
  private hiqaService: HIQAService;
  private ofstedService: OfstedService;
  private ciwService: CIWService;
  private careInspectorateService: CareInspectorateService;
  private rqiaService: RQIAService;

  constructor(
    private readonly region: Region,
    private readonly careHomeType: CareHomeType
  ) {
    if (!Object.values(Region).includes(region)) {
      throw new ValidationError('Invalid region specified', { region });
    }
    
    // Initialize core medical databases
    this.bnfService = new BNFService();
    this.niceService = new NICEService();

    // Initialize regional regulatory services
    switch (region) {
      case Region.ENGLAND:
        this.ofstedService = new OfstedService();
        break;
      case Region.WALES:
        this.ciwService = new CIWService();
        break;
      case Region.SCOTLAND:
        this.careInspectorateService = new CareInspectorateService();
        break;
      case Region.NORTHERN_IRELAND:
        this.rqiaService = new RQIAService();
        break;
      case Region.IRELAND:
        this.hiqaService = new HIQAService();
        break;
    }
  }

  async checkInteractions(
    newDrug: DrugInfo,
    currentMedications: DrugInfo[],
    allergies: AllergyInfo[]
  ): Promise<{
    drugInteractions: DrugInteraction[];
    allergyInteractions: AllergyInfo[];
    foodInteractions: FoodInteraction[];
    doseAlerts: DoseAlert[];
  }> {
    try {
      // Validate input parameters
      this.validateDrugInfo(newDrug);
      currentMedications.forEach(med => this.validateDrugInfo(med));
      this.validateAllergies(allergies);

      const [
        interactions,
        allergyInteractions,
        foodInteractions,
        doseAlerts
      ] = await Promise.all([
        this.getRegionalInteractions(newDrug, currentMedications),
        this.checkAllergyInteractions(newDrug, allergies),
        this.checkFoodInteractions(newDrug),
        this.checkDoseAlerts(newDrug)
      ]).catch(error => {
        throw new DrugInteractionError(
          'Failed to fetch interaction data',
          'INTERACTION_CHECK_ERROR',
          { error: error.message }
        );
      });

      return {
        drugInteractions: interactions,
        allergyInteractions,
        foodInteractions,
        doseAlerts
      };
    } catch (error) {
      if (error instanceof DrugInteractionError) {
        throw error;
      }
      throw new DrugInteractionError(
        'Failed to check interactions',
        'UNKNOWN_ERROR',
        { originalError: error.message }
      );
    }
  }

  private validateDrugInfo(drug: DrugInfo): void {
    if (!drug?.id || !drug?.name) {
      throw new ValidationError('Invalid drug information', { drug });
    }
  }

  private validateAllergies(allergies: AllergyInfo[]): void {
    if (!Array.isArray(allergies)) {
      throw new ValidationError('Invalid allergies format', { allergies });
    }
    allergies.forEach(allergy => {
      if (!allergy?.allergen) {
        throw new ValidationError('Invalid allergy information', { allergy });
      }
    });
  }

  private async getRegionalInteractions(
    newDrug: DrugInfo,
    currentMedications: DrugInfo[]
  ): Promise<DrugInteraction[]> {
    try {
      let interactions: DrugInteraction[] = [];

      // Get base medical interactions
      const [bnfResults, niceResults] = await Promise.all([
        this.bnfService.checkInteractions(newDrug, currentMedications),
        this.niceService.checkInteractions(newDrug, currentMedications)
      ]);
      
      interactions = [...bnfResults.drugInteractions, ...niceResults.drugInteractions];

      // Add regional regulatory checks for children's services
      if (this.careHomeType === CareHomeType.CHILDRENS) {
        let regulatoryResults;
        
        switch (this.region) {
          case Region.ENGLAND:
            regulatoryResults = await this.ofstedService.checkInteractions(newDrug, currentMedications);
            break;
          case Region.WALES:
            regulatoryResults = await this.ciwService.checkInteractions(newDrug, currentMedications);
            break;
          case Region.SCOTLAND:
            regulatoryResults = await this.careInspectorateService.checkInteractions(newDrug, currentMedications);
            break;
          case Region.NORTHERN_IRELAND:
            regulatoryResults = await this.rqiaService.checkInteractions(newDrug, currentMedications);
            break;
          case Region.IRELAND:
            regulatoryResults = await this.hiqaService.checkInteractions(newDrug, currentMedications);
            break;
        }

        if (regulatoryResults?.drugInteractions) {
          interactions = [...interactions, ...regulatoryResults.drugInteractions];
        }
      }

      return this.deduplicateItems(interactions, 'drug1Id:drug2Id');
    } catch (error) {
      if (error instanceof DrugInteractionError) {
        throw error;
      }
      throw new DrugInteractionError(
        'Failed to get regional interactions',
        'REGIONAL_INTERACTION_ERROR',
        { region: this.region, error: error.message }
      );
    }
  }

  private async checkAllergyInteractions(
    drug: DrugInfo,
    allergies: AllergyInfo[]
  ): Promise<AllergyInfo[]> {
    try {
      if (this.region === Region.IRELAND) {
        return await this.hiqaService.checkAllergies(drug, allergies)
          .catch(error => {
            throw new RegionalServiceError('HIQA allergy check error', this.region, error);
          });
      }

      const [bnfAllergies, niceAllergies] = await Promise.all([
        this.bnfService.checkAllergies(drug, allergies)
          .catch(error => {
            throw new RegionalServiceError('BNF allergy check error', this.region, error);
          }),
        this.niceService.checkAllergies(drug, allergies)
          .catch(error => {
            throw new RegionalServiceError('NICE allergy check error', this.region, error);
          })
      ]);

      return this.deduplicateItems([...bnfAllergies, ...niceAllergies], 'allergen');
    } catch (error) {
      if (error instanceof DrugInteractionError) {
        throw error;
      }
      throw new DrugInteractionError(
        'Failed to check allergy interactions',
        'ALLERGY_CHECK_ERROR',
        { error: error.message }
      );
    }
  }

  private async checkFoodInteractions(drug: DrugInfo): Promise<FoodInteraction[]> {
    try {
      if (this.region === Region.IRELAND) {
        return await this.hiqaService.getFoodInteractions(drug)
          .catch(error => {
            throw new RegionalServiceError('HIQA food interaction error', this.region, error);
          });
      }

      try {
        // Try BNF first as primary source for UK
        const foodInteractions = await this.bnfService.getFoodInteractions(drug);
        if (foodInteractions.length > 0) {
          return this.deduplicateItems(foodInteractions, 'food');
        }
      } catch (bnfError) {
        // Log BNF error but try NICE as backup
      }

      // Try NICE as backup
      const niceInteractions = await this.niceService.getFoodInteractions(drug)
        .catch(error => {
          throw new RegionalServiceError('NICE food interaction error', this.region, error);
        });

      return this.deduplicateItems(niceInteractions, 'food');
    } catch (error) {
      if (error instanceof DrugInteractionError) {
        throw error;
      }
      throw new DrugInteractionError(
        'Failed to check food interactions',
        'FOOD_INTERACTION_ERROR',
        { error: error.message }
      );
    }
  }

  private async checkDoseAlerts(drug: DrugInfo): Promise<DoseAlert[]> {
    try {
      // Get base medical dose alerts
      const [bnfAlerts, niceAlerts] = await Promise.all([
        this.bnfService.getDoseAlerts(drug),
        this.niceService.getDoseAlerts(drug)
      ]);

      let alerts = [...bnfAlerts, ...niceAlerts];

      // Add regional regulatory checks for children's services
      if (this.careHomeType === CareHomeType.CHILDRENS) {
        let regulatoryAlerts;
        
        switch (this.region) {
          case Region.ENGLAND:
            regulatoryAlerts = await this.ofstedService.getDoseAlerts(drug);
            break;
          case Region.WALES:
            regulatoryAlerts = await this.ciwService.getDoseAlerts(drug);
            break;
          case Region.SCOTLAND:
            regulatoryAlerts = await this.careInspectorateService.getDoseAlerts(drug);
            break;
          case Region.NORTHERN_IRELAND:
            regulatoryAlerts = await this.rqiaService.getDoseAlerts(drug);
            break;
          case Region.IRELAND:
            regulatoryAlerts = await this.hiqaService.getDoseAlerts(drug);
            break;
        }

        if (regulatoryAlerts) {
          alerts = [...alerts, ...regulatoryAlerts];
        }
      }

      return this.deduplicateItems(alerts, 'type');
    } catch (error) {
      if (error instanceof DrugInteractionError) {
        throw error;
      }
      throw new DrugInteractionError(
        'Failed to check dose alerts',
        'DOSE_ALERT_ERROR',
        { error: error.message }
      );
    }
  }

  private deduplicateItems<T>(items: T[], keyField: string): T[] {
    try {
      const merged = new Map<string, T>();
      
      for (const item of items) {
        const key = keyField.includes(':') 
          ? keyField.split(':').map(k => item[k]).join(':')
          : item[keyField];
          
        if (!merged.has(key) || this.hasHigherSeverity(item, merged.get(key))) {
          merged.set(key, item);
        }
      }

      return Array.from(merged.values());
    } catch (error) {
      throw new DrugInteractionError(
        'Failed to deduplicate items',
        'DEDUPLICATION_ERROR',
        { keyField, error: error.message }
      );
    }
  }

  private hasHigherSeverity(newItem: any, existingItem: any): boolean {
    try {
      if (!newItem || !existingItem || !('severity' in newItem) || !('severity' in existingItem)) {
        return false;
      }
      return newItem.severity > existingItem.severity;
    } catch (error) {
      throw new DrugInteractionError(
        'Failed to compare severities',
        'SEVERITY_COMPARISON_ERROR',
        { error: error.message }
      );
    }
  }

  async updateDatabase(): Promise<void> {
    try {
      if (this.region === Region.IRELAND) {
        await this.hiqaService.updateDatabase()
          .catch(error => {
            throw new RegionalServiceError('HIQA database update error', this.region, error);
          });
      } else {
        await Promise.all([
          this.bnfService.updateDatabase()
            .catch(error => {
              throw new RegionalServiceError('BNF database update error', this.region, error);
            }),
          this.niceService.updateDatabase()
            .catch(error => {
              throw new RegionalServiceError('NICE database update error', this.region, error);
            })
        ]);
      }
    } catch (error) {
      if (error instanceof DrugInteractionError) {
        throw error;
      }
      throw new DrugInteractionError(
        'Failed to update drug interaction database',
        'DATABASE_UPDATE_ERROR',
        { error: error.message }
      );
    }
  }

  async validateInteraction(
    drugPair: DrugPair,
    interaction: DrugInteraction
  ): Promise<boolean> {
    try {
      if (!drugPair?.drug1Id || !drugPair?.drug2Id) {
        throw new ValidationError('Invalid drug pair', { drugPair });
      }

      // Get base medical validations
      const [bnfValid, niceValid] = await Promise.all([
        this.bnfService.validateInteraction(drugPair, interaction),
        this.niceService.validateInteraction(drugPair, interaction)
      ]);

      // For children's services, also require regional regulatory validation
      if (this.careHomeType === CareHomeType.CHILDRENS) {
        let regulatoryValid = false;
        
        switch (this.region) {
          case Region.ENGLAND:
            regulatoryValid = await this.ofstedService.validateInteraction(drugPair, interaction);
            break;
          case Region.WALES:
            regulatoryValid = await this.ciwService.validateInteraction(drugPair, interaction);
            break;
          case Region.SCOTLAND:
            regulatoryValid = await this.careInspectorateService.validateInteraction(drugPair, interaction);
            break;
          case Region.NORTHERN_IRELAND:
            regulatoryValid = await this.rqiaService.validateInteraction(drugPair, interaction);
            break;
          case Region.IRELAND:
            regulatoryValid = await this.hiqaService.validateInteraction(drugPair, interaction);
            break;
        }

        // All validations must pass for children's medications
        return bnfValid && niceValid && regulatoryValid;
      }

      // For adult services, only require medical validations
      return bnfValid && niceValid;
    } catch (error) {
      if (error instanceof DrugInteractionError) {
        throw error;
      }
      throw new DrugInteractionError(
        'Failed to validate interaction',
        'VALIDATION_ERROR',
        { error: error.message }
      );
    }
  }
} 