/**
 * @fileoverview Pain Medication Stock Integration
 * @version 1.0.0
 * @created 2024-03-21
 */

import { StockService } from '@/features/medications/services/stockService';
import { PrescriptionService } from '@/features/medications/services/prescriptionService';
import { TenantContext } from '@/lib/multi-tenant/types';
import { ResidentPainAssessment, CareHomeInterventionType } from '../types/care-home';

export class PainMedicationStockService {
  constructor(
    private tenantContext: TenantContext,
    private stockService: StockService,
    private prescriptionService: PrescriptionService
  ) {}

  async validateStockAvailability(assessment: ResidentPainAssessment): Promise<boolean> {
    const medicationInterventions = assessment.interventions.filter(
      i => i.type === CareHomeInterventionType.PRN_MEDICATION
    );

    for (const intervention of medicationInterventions) {
      const stockLevel = await this.stockService.getCurrentStock(intervention.medicationId);
      const prescription = await this.prescriptionService.getPrescription(intervention.medicationId);

      if (!stockLevel || stockLevel.quantity < prescription.minimumStockLevel) {
        await this.handleLowStock(intervention.medicationId, stockLevel?.quantity || 0);
        return false;
      }
    }

    return true;
  }

  private async handleLowStock(medicationId: string, currentQuantity: number): Promise<void> {
    // Create stock alert
    await this.stockService.createStockAlert({
      medicationId,
      currentQuantity,
      alertType: 'LOW_STOCK',
      priority: 'HIGH',
      createdAt: new Date()
    });

    // Check if reorder already in progress
    const pendingOrder = await this.stockService.getPendingOrder(medicationId);
    if (!pendingOrder) {
      await this.initiateReorder(medicationId);
    }
  }

  private async initiateReorder(medicationId: string): Promise<void> {
    const prescription = await this.prescriptionService.getPrescription(medicationId);
    
    await this.stockService.createOrder({
      medicationId,
      quantity: prescription.reorderQuantity,
      urgency: 'HIGH',
      reason: 'LOW_STOCK_PAIN_MEDICATION',
      requestedBy: this.tenantContext.userId
    });
  }
} 