/**
 * @fileoverview Medication Interactions Service
 * @version 1.0.0
 * @created 2024-03-22
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { db } from '@/lib/db';
import type { Medication, Resident } from '../types';

interface DrugInteraction {
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  description: string;
  recommendation: string;
  evidence?: string;
  references?: string[];
}

interface AllergyInteraction {
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  allergen: string;
  reaction: string;
  recommendation: string;
}

interface FoodInteraction {
  type: 'AVOID' | 'TAKE_WITH' | 'TIMING';
  food: string;
  description: string;
  recommendation: string;
}

interface DoseAlert {
  type: 'MAX_DAILY' | 'MAX_SINGLE' | 'AGE_SPECIFIC' | 'WEIGHT_BASED';
  severity: 'HIGH' | 'MODERATE' | 'LOW';
  message: string;
  recommendation: string;
}

interface InteractionCheck {
  drugInteractions: DrugInteraction[];
  allergyInteractions: AllergyInteraction[];
  foodInteractions: FoodInteraction[];
  doseAlerts: DoseAlert[];
}

export class MedicationInteractionsService {
  /**
   * Check for all possible interactions for a medication
   */
  async checkInteractions(
    medication: Medication,
    resident: Resident,
    existingMedications: Medication[]
  ): Promise<InteractionCheck> {
    const [
      drugInteractions,
      allergyInteractions,
      foodInteractions,
      doseAlerts,
    ] = await Promise.all([
      this.checkDrugInteractions(medication, existingMedications),
      this.checkAllergyInteractions(medication, resident),
      this.checkFoodInteractions(medication),
      this.checkDoseAlerts(medication, resident),
    ]);

    return {
      drugInteractions,
      allergyInteractions,
      foodInteractions,
      doseAlerts,
    };
  }

  /**
   * Check for drug-drug interactions
   */
  private async checkDrugInteractions(
    medication: Medication,
    existingMedications: Medication[]
  ): Promise<DrugInteraction[]> {
    const interactions: DrugInteraction[] = [];

    // Query drug interactions database
    const drugInteractions = await db.drugInteraction.findMany({
      where: {
        OR: [
          { drug1: medication.name },
          { drug2: medication.name },
        ],
      },
    });

    // Check against existing medications
    for (const existing of existingMedications) {
      const matchingInteractions = drugInteractions.filter(
        interaction =>
          interaction.drug1 === existing.name ||
          interaction.drug2 === existing.name
      );

      interactions.push(
        ...matchingInteractions.map(interaction => ({
          severity: interaction.severity as 'HIGH' | 'MODERATE' | 'LOW',
          description: interaction.description,
          recommendation: interaction.recommendation,
          evidence: interaction.evidence,
          references: interaction.references,
        }))
      );
    }

    return interactions;
  }

  /**
   * Check for drug-allergy interactions
   */
  private async checkAllergyInteractions(
    medication: Medication,
    resident: Resident
  ): Promise<AllergyInteraction[]> {
    const interactions: AllergyInteraction[] = [];

    // Get resident's allergies
    const allergies = await db.allergy.findMany({
      where: { residentId: resident.id },
    });

    // Check medication against each allergy
    for (const allergy of allergies) {
      const allergyInteractions = await db.allergyInteraction.findMany({
        where: {
          OR: [
            { drug: medication.name, allergen: allergy.allergen },
            { drugClass: medication.class, allergen: allergy.allergen },
          ],
        },
      });

      interactions.push(
        ...allergyInteractions.map(interaction => ({
          severity: interaction.severity as 'HIGH' | 'MODERATE' | 'LOW',
          allergen: interaction.allergen,
          reaction: interaction.reaction,
          recommendation: interaction.recommendation,
        }))
      );
    }

    return interactions;
  }

  /**
   * Check for food-drug interactions
   */
  private async checkFoodInteractions(
    medication: Medication
  ): Promise<FoodInteraction[]> {
    const foodInteractions = await db.foodInteraction.findMany({
      where: {
        OR: [
          { drug: medication.name },
          { drugClass: medication.class },
        ],
      },
    });

    return foodInteractions.map(interaction => ({
      type: interaction.type as 'AVOID' | 'TAKE_WITH' | 'TIMING',
      food: interaction.food,
      description: interaction.description,
      recommendation: interaction.recommendation,
    }));
  }

  /**
   * Check for dose-related alerts
   */
  private async checkDoseAlerts(
    medication: Medication,
    resident: Resident
  ): Promise<DoseAlert[]> {
    const alerts: DoseAlert[] = [];

    // Get medication dosing guidelines
    const guidelines = await db.dosingGuideline.findMany({
      where: {
        OR: [
          { drug: medication.name },
          { drugClass: medication.class },
        ],
      },
    });

    for (const guideline of guidelines) {
      // Check maximum daily dose
      if (guideline.maxDailyDose) {
        const dailyDose = this.calculateDailyDose(medication);
        if (dailyDose > guideline.maxDailyDose) {
          alerts.push({
            type: 'MAX_DAILY',
            severity: 'HIGH',
            message: `Daily dose (${dailyDose}${medication.unit}) exceeds maximum recommended dose (${guideline.maxDailyDose}${medication.unit})`,
            recommendation: 'Review and adjust dosing schedule',
          });
        }
      }

      // Check maximum single dose
      if (guideline.maxSingleDose) {
        const singleDose = parseFloat(medication.dosage);
        if (singleDose > guideline.maxSingleDose) {
          alerts.push({
            type: 'MAX_SINGLE',
            severity: 'HIGH',
            message: `Single dose (${singleDose}${medication.unit}) exceeds maximum recommended single dose (${guideline.maxSingleDose}${medication.unit})`,
            recommendation: 'Review and adjust single dose',
          });
        }
      }

      // Check age-specific dosing
      if (guideline.ageRanges) {
        const age = this.calculateAge(resident.dateOfBirth);
        const ageRange = guideline.ageRanges.find(
          range => age >= range.minAge && age <= range.maxAge
        );

        if (ageRange) {
          const dailyDose = this.calculateDailyDose(medication);
          if (dailyDose > ageRange.maxDailyDose) {
            alerts.push({
              type: 'AGE_SPECIFIC',
              severity: 'HIGH',
              message: `Daily dose (${dailyDose}${medication.unit}) exceeds maximum recommended dose for age ${age} years (${ageRange.maxDailyDose}${medication.unit})`,
              recommendation: 'Adjust dose based on age-specific guidelines',
            });
          }
        }
      }

      // Check weight-based dosing
      if (guideline.weightBased && resident.weight) {
        const weightBasedDose = resident.weight * guideline.weightBased.dosePerKg;
        const dailyDose = this.calculateDailyDose(medication);

        if (dailyDose > weightBasedDose) {
          alerts.push({
            type: 'WEIGHT_BASED',
            severity: 'MODERATE',
            message: `Daily dose (${dailyDose}${medication.unit}) exceeds recommended weight-based dose (${weightBasedDose}${medication.unit} for ${resident.weight}kg)`,
            recommendation: 'Review dose based on current weight',
          });
        }
      }
    }

    return alerts;
  }

  /**
   * Calculate total daily dose from frequency and dosage
   */
  private calculateDailyDose(medication: Medication): number {
    const singleDose = parseFloat(medication.dosage);
    const frequency = medication.frequency.length;
    return singleDose * frequency;
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
} 


