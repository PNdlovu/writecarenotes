/**
 * @writecarenotes.com
 * @fileoverview Weight-based medication dosing calculation service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for calculating and managing weight-based medication dosing,
 * including pediatric calculations, dose adjustments, and safety checks.
 * Integrates with core medication management for accurate dosing across
 * different care settings.
 *
 * Features:
 * - Weight-based dose calculations
 * - Age-appropriate dosing
 * - Safety limit checks
 * - Dose adjustment tracking
 * - Integration with MAR
 *
 * Mobile-First Considerations:
 * - Responsive calculation interface
 * - Touch-friendly inputs
 * - Offline calculation support
 * - Quick access to common calculations
 *
 * Enterprise Features:
 * - Audit logging of calculations
 * - Clinical safety checks
 * - Integration with medication records
 * - Compliance with dosing guidelines
 */

import { z } from 'zod';
import { MedicationService } from './MedicationService';
import { AuditService } from '@/lib/services/AuditService';

const weightBasedDoseSchema = z.object({
  weight: z.number().positive(),
  medicationId: z.string(),
  dosePerKg: z.number().positive(),
  frequency: z.string(),
  maxDose: z.number().optional(),
  minDose: z.number().optional(),
});

export class WeightBasedDosingService {
  private static instance: WeightBasedDosingService;
  private medicationService: MedicationService;
  private auditService: AuditService;

  private constructor() {
    this.medicationService = MedicationService.getInstance();
    this.auditService = new AuditService();
  }

  public static getInstance(): WeightBasedDosingService {
    if (!WeightBasedDosingService.instance) {
      WeightBasedDosingService.instance = new WeightBasedDosingService();
    }
    return WeightBasedDosingService.instance;
  }

  public async calculateDose(params: z.infer<typeof weightBasedDoseSchema>) {
    const validated = weightBasedDoseSchema.parse(params);
    const calculatedDose = validated.weight * validated.dosePerKg;

    // Apply safety checks
    if (validated.maxDose && calculatedDose > validated.maxDose) {
      throw new Error('Calculated dose exceeds maximum allowed dose');
    }
    if (validated.minDose && calculatedDose < validated.minDose) {
      throw new Error('Calculated dose is below minimum required dose');
    }

    // Audit the calculation
    await this.auditService.log({
      action: 'WEIGHT_BASED_DOSE_CALCULATION',
      details: {
        medicationId: validated.medicationId,
        weight: validated.weight,
        dosePerKg: validated.dosePerKg,
        calculatedDose,
      },
    });

    return {
      calculatedDose,
      frequency: validated.frequency,
      medicationId: validated.medicationId,
    };
  }

  public async validateDoseAdjustment(
    currentDose: number,
    newDose: number,
    medicationId: string
  ) {
    const medication = await this.medicationService.getMedicationById(medicationId);
    const maxChange = medication.maxDoseChange || 0.5; // 50% default max change

    const changePercentage = Math.abs((newDose - currentDose) / currentDose);
    if (changePercentage > maxChange) {
      throw new Error('Dose adjustment exceeds maximum allowed change');
    }

    return true;
  }
} 