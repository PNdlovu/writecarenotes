/**
 * @fileoverview Electronic Prescription Service
 * @version 1.0.0
 * @created 2024-03-22
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { db } from '@/lib/db';
import { pharmacyApi } from '@/lib/pharmacyApi';
import { signatureService } from '@/lib/signatureService';
import type { Medication, Resident, User } from '../types';

interface Prescription {
  id: string;
  medicationId: string;
  residentId: string;
  prescriberId: string;
  pharmacyId: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'DISPENSED';
  prescriptionNumber?: string;
  dosageInstructions: string;
  quantity: number;
  refills: number;
  startDate: string;
  endDate?: string;
  notes?: string;
  signature?: {
    signedBy: string;
    signedAt: string;
    signatureData: string;
  };
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  dispensedBy?: string;
  dispensedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface RefillRequest {
  id: string;
  prescriptionId: string;
  requestedBy: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export class PrescriptionService {
  /**
   * Generate a new electronic prescription
   */
  async generatePrescription(
    medication: Medication,
    resident: Resident,
    prescriber: User,
    pharmacyId: string,
    options: {
      quantity: number;
      refills: number;
      notes?: string;
    }
  ): Promise<Prescription> {
    // Generate prescription details
    const prescription: Omit<Prescription, 'id'> = {
      medicationId: medication.id,
      residentId: resident.id,
      prescriberId: prescriber.id,
      pharmacyId,
      status: 'DRAFT',
      dosageInstructions: this.generateDosageInstructions(medication),
      quantity: options.quantity,
      refills: options.refills,
      startDate: new Date().toISOString(),
      notes: options.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    const savedPrescription = await db.prescription.create({
      data: prescription,
    });

    return savedPrescription;
  }

  /**
   * Sign a prescription electronically
   */
  async signPrescription(
    prescriptionId: string,
    prescriber: User,
    signatureData: string
  ): Promise<Prescription> {
    // Verify prescriber has signing rights
    if (!prescriber.canSignPrescriptions) {
      throw new Error('User does not have prescription signing rights');
    }

    // Validate signature
    const validSignature = await signatureService.validateSignature(
      signatureData,
      prescriber.id
    );

    if (!validSignature) {
      throw new Error('Invalid signature');
    }

    // Update prescription with signature
    const updatedPrescription = await db.prescription.update({
      where: { id: prescriptionId },
      data: {
        status: 'PENDING',
        signature: {
          signedBy: prescriber.id,
          signedAt: new Date().toISOString(),
          signatureData,
        },
        updatedAt: new Date().toISOString(),
      },
    });

    // Send to pharmacy system
    await this.sendToPharmacy(updatedPrescription);

    return updatedPrescription;
  }

  /**
   * Send prescription to pharmacy system
   */
  private async sendToPharmacy(prescription: Prescription): Promise<void> {
    try {
      // Get related data
      const [medication, resident, prescriber] = await Promise.all([
        db.medication.findUnique({ where: { id: prescription.medicationId } }),
        db.resident.findUnique({ where: { id: prescription.residentId } }),
        db.user.findUnique({ where: { id: prescription.prescriberId } }),
      ]);

      if (!medication || !resident || !prescriber) {
        throw new Error('Missing required data');
      }

      // Format for pharmacy system
      const prescriptionData = {
        prescriptionId: prescription.id,
        prescriptionNumber: prescription.prescriptionNumber,
        medication: {
          name: medication.name,
          dosage: medication.dosage,
          route: medication.route,
          frequency: medication.frequency,
        },
        resident: {
          id: resident.id,
          name: `${resident.firstName} ${resident.lastName}`,
          dateOfBirth: resident.dateOfBirth,
          nhsNumber: resident.nhsNumber,
        },
        prescriber: {
          id: prescriber.id,
          name: `${prescriber.firstName} ${prescriber.lastName}`,
          professionalNumber: prescriber.professionalNumber,
        },
        dosageInstructions: prescription.dosageInstructions,
        quantity: prescription.quantity,
        refills: prescription.refills,
        signature: prescription.signature,
      };

      // Send to pharmacy API
      await pharmacyApi.sendPrescription(prescriptionData);
    } catch (error) {
      console.error('Failed to send prescription to pharmacy:', error);
      throw new Error('Failed to send prescription to pharmacy system');
    }
  }

  /**
   * Track prescription status
   */
  async trackPrescription(prescriptionId: string): Promise<{
    prescription: Prescription;
    tracking: {
      currentStatus: string;
      estimatedReadyTime?: string;
      location?: string;
      lastUpdated: string;
    };
  }> {
    // Get prescription from database
    const prescription = await db.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    // Get tracking info from pharmacy
    const tracking = await pharmacyApi.trackPrescription(prescriptionId);

    return { prescription, tracking };
  }

  /**
   * Request prescription refill
   */
  async requestRefill(
    prescriptionId: string,
    requestedBy: string
  ): Promise<RefillRequest> {
    // Check if prescription exists and has refills available
    const prescription = await db.prescription.findUnique({
      where: { id: prescriptionId },
    });

    if (!prescription) {
      throw new Error('Prescription not found');
    }

    if (prescription.refills <= 0) {
      throw new Error('No refills remaining');
    }

    // Create refill request
    const refillRequest = await db.refillRequest.create({
      data: {
        prescriptionId,
        requestedBy,
        requestedAt: new Date().toISOString(),
        status: 'PENDING',
      },
    });

    // Notify pharmacy
    await pharmacyApi.notifyRefillRequest(refillRequest.id);

    return refillRequest;
  }

  /**
   * Generate standardized dosage instructions
   */
  private generateDosageInstructions(medication: Medication): string {
    const dosage = medication.dosage;
    const route = medication.route;
    const frequency = medication.frequency;
    
    let instructions = `Take ${dosage} ${route}`;
    
    if (frequency.length === 1) {
      instructions += ` ${frequency[0]}`;
    } else if (frequency.length > 1) {
      instructions += ` at the following times: ${frequency.join(', ')}`;
    }

    if (medication.type === 'PRN') {
      instructions += ' as needed';
      if (medication.maxDailyDose) {
        instructions += ` (maximum ${medication.maxDailyDose} in 24 hours)`;
      }
    }

    return instructions;
  }
} 


