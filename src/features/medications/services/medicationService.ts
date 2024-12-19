/**
 * @fileoverview Medication service implementation
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { MedicationWithResident, MedicationFormData } from '@/types/medication';
import { Medication, MedicationStatus } from '@prisma/client';
import { auditService } from '@/features/audit';
import { MedicationRepository } from './MedicationRepository';
import { Logger } from './Logger';
import { CacheService } from './CacheService';
import { z } from 'zod';
import { NotFoundError, ValidationError, InternalError, DatabaseError } from './errors';

export class MedicationService {
  constructor(
    private readonly repository: MedicationRepository,
    private readonly logger: Logger,
    private readonly cache: CacheService,
  ) {}

  async getMedication(id: string, tenantId: string): Promise<Medication> {
    try {
      // Try cache first
      const cached = await this.cache.get(`medication:${id}`);
      if (cached) {
        return JSON.parse(cached);
      }

      const medication = await this.repository.findById(id, tenantId);
      if (!medication) {
        throw new NotFoundError('Medication not found');
      }

      // Cache for 5 minutes
      await this.cache.set(`medication:${id}`, JSON.stringify(medication), 300);
      return medication;
    } catch (error) {
      this.logger.error('Failed to get medication', { error, id, tenantId });
      throw this.handleError(error);
    }
  }

  async createMedication(data: MedicationFormData, tenantId: string): Promise<Medication> {
    try {
      await this.validateMedicationData(data);
      const medication = await this.repository.create(data, tenantId);
      
      // Invalidate relevant caches
      await this.cache.delete(`medications:${tenantId}`);
      
      // Audit log
      await this.logger.audit('medication.created', {
        tenantId,
        medicationId: medication.id,
        data
      });

      return medication;
    } catch (error) {
      this.logger.error('Failed to create medication', { error, tenantId });
      throw this.handleError(error);
    }
  }

  async updateMedication(id: string, data: Partial<MedicationFormData>, tenantId: string): Promise<Medication> {
    try {
      await this.validateMedicationData(data);
      const medication = await this.repository.update(id, data, tenantId);
      
      // Invalidate caches
      await Promise.all([
        this.cache.delete(`medication:${id}`),
        this.cache.delete(`medications:${tenantId}`)
      ]);

      // Audit log
      await this.logger.audit('medication.updated', {
        tenantId,
        medicationId: id,
        changes: data
      });

      return medication;
    } catch (error) {
      this.logger.error('Failed to update medication', { error, id, tenantId });
      throw this.handleError(error);
    }
  }

  async deleteMedication(id: string, tenantId: string): Promise<void> {
    try {
      const medication = await this.repository.findById(id, tenantId);
      if (!medication) {
        throw new NotFoundError('Medication not found');
      }

      await this.repository.delete(id, tenantId);
      
      // Invalidate caches
      await Promise.all([
        this.cache.delete(`medication:${id}`),
        this.cache.delete(`medications:${tenantId}`)
      ]);

      // Audit log
      await this.logger.audit('medication.deleted', {
        tenantId,
        medicationId: id
      });
    } catch (error) {
      this.logger.error('Failed to delete medication', { error, id, tenantId });
      throw this.handleError(error);
    }
  }

  async getMedicationsByResident(residentId: string, tenantId: string): Promise<MedicationWithResident[]> {
    try {
      return await this.repository.findByResident(residentId, tenantId);
    } catch (error) {
      this.logger.error('Failed to get medications by resident', { error, residentId, tenantId });
      throw this.handleError(error);
    }
  }

  async getMedicationsByOrganization(
    organizationId: string,
    status?: MedicationStatus,
    tenantId: string
  ): Promise<MedicationWithResident[]> {
    try {
      return await this.repository.findByOrganization(organizationId, status, tenantId);
    } catch (error) {
      this.logger.error('Failed to get medications by organization', { error, organizationId, tenantId });
      throw this.handleError(error);
    }
  }

  private async validateMedicationData(data: MedicationFormData | Partial<MedicationFormData>) {
    const schema = z.object({
      name: z.string().min(1).max(200),
      dosage: z.number().positive(),
      unit: z.enum(['mg', 'ml', 'g', 'tablets']),
      frequency: z.string().min(1),
      route: z.string().min(1),
      startDate: z.string().datetime(),
      endDate: z.string().datetime().optional(),
      instructions: z.string().optional(),
      controlledDrug: z.boolean().optional(),
      requiresDoubleSignature: z.boolean().optional(),
      stockLevel: z.number().int().min(0).optional()
    });

    return schema.parseAsync(data);
  }

  private handleError(error: unknown): Error {
    if (error instanceof z.ZodError) {
      return new ValidationError('Invalid medication data', error.errors);
    }
    if (error instanceof NotFoundError) {
      return error;
    }
    if (error instanceof DatabaseError) {
      return new InternalError('Database operation failed');
    }
    return new InternalError('An unexpected error occurred');
  }
}


