/**
 * WriteCareNotes.com
 * @fileoverview Dietary Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import type { 
  DietaryRequirement,
  MealPlan,
  DietaryFilter,
  DietaryType
} from '../types';
import { ApiError } from '@/lib/errors';
import { auditService } from '@/lib/audit';
import { validateDietaryRequirement, validateMealPlan } from '../utils/validation';
import { DietaryRepository } from './repositories/dietaryRepository';

export class DietaryService {
  private static instance: DietaryService;
  private repository: DietaryRepository;

  private constructor() {
    this.repository = new DietaryRepository();
  }

  public static getInstance(): DietaryService {
    if (!DietaryService.instance) {
      DietaryService.instance = new DietaryService();
    }
    return DietaryService.instance;
  }

  async createDietaryRequirement(
    residentId: string,
    data: Omit<DietaryRequirement, 'id' | 'metadata'>
  ): Promise<DietaryRequirement> {
    try {
      // Validate data
      const validation = validateDietaryRequirement(data);
      if (!validation.valid) {
        throw new ApiError('ValidationError', validation.errors.join(', '));
      }

      // Create requirement
      const requirement = await this.repository.createRequirement({
        ...data,
        residentId,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system', // TODO: Get from context
          updatedBy: 'system',
          version: 1
        }
      });

      // Audit trail
      await auditService.log({
        action: 'DIETARY_REQUIREMENT_CREATED',
        resourceId: requirement.id,
        details: {
          residentId,
          type: requirement.type
        }
      });

      return requirement;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to create dietary requirement');
    }
  }

  async getDietaryRequirement(id: string): Promise<DietaryRequirement> {
    try {
      const requirement = await this.repository.findRequirementById(id);
      if (!requirement) {
        throw new ApiError('NotFoundError', 'Dietary requirement not found');
      }
      return requirement;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to fetch dietary requirement');
    }
  }

  async updateDietaryRequirement(
    id: string,
    updates: Partial<DietaryRequirement>
  ): Promise<DietaryRequirement> {
    try {
      const existing = await this.repository.findRequirementById(id);
      if (!existing) {
        throw new ApiError('NotFoundError', 'Dietary requirement not found');
      }

      // Validate updates
      const validation = validateDietaryRequirement({
        ...existing,
        ...updates
      });
      if (!validation.valid) {
        throw new ApiError('ValidationError', validation.errors.join(', '));
      }

      // Update requirement
      const requirement = await this.repository.updateRequirement(id, {
        ...updates,
        metadata: {
          ...existing.metadata,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system', // TODO: Get from context
          version: existing.metadata.version + 1
        }
      });

      // Audit trail
      await auditService.log({
        action: 'DIETARY_REQUIREMENT_UPDATED',
        resourceId: requirement.id,
        details: {
          updates: Object.keys(updates)
        }
      });

      return requirement;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to update dietary requirement');
    }
  }

  async createMealPlan(
    residentId: string,
    data: Omit<MealPlan, 'id' | 'metadata'>
  ): Promise<MealPlan> {
    try {
      // Validate data
      const validation = validateMealPlan(data);
      if (!validation.valid) {
        throw new ApiError('ValidationError', validation.errors.join(', '));
      }

      // Create meal plan
      const mealPlan = await this.repository.createMealPlan({
        ...data,
        residentId,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'system', // TODO: Get from context
          updatedBy: 'system',
          version: 1
        }
      });

      // Audit trail
      await auditService.log({
        action: 'MEAL_PLAN_CREATED',
        resourceId: mealPlan.id,
        details: {
          residentId,
          date: mealPlan.date
        }
      });

      return mealPlan;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to create meal plan');
    }
  }

  async updateMealPlan(
    id: string,
    updates: Partial<MealPlan>
  ): Promise<MealPlan> {
    try {
      const existing = await this.repository.findMealPlanById(id);
      if (!existing) {
        throw new ApiError('NotFoundError', 'Meal plan not found');
      }

      // Validate updates
      const validation = validateMealPlan({
        ...existing,
        ...updates
      });
      if (!validation.valid) {
        throw new ApiError('ValidationError', validation.errors.join(', '));
      }

      // Update meal plan
      const mealPlan = await this.repository.updateMealPlan(id, {
        ...updates,
        metadata: {
          ...existing.metadata,
          updatedAt: new Date().toISOString(),
          updatedBy: 'system', // TODO: Get from context
          version: existing.metadata.version + 1
        }
      });

      // Audit trail
      await auditService.log({
        action: 'MEAL_PLAN_UPDATED',
        resourceId: mealPlan.id,
        details: {
          updates: Object.keys(updates)
        }
      });

      return mealPlan;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('InternalError', 'Failed to update meal plan');
    }
  }

  async searchDietaryRequirements(filter: DietaryFilter): Promise<DietaryRequirement[]> {
    try {
      return this.repository.searchRequirements(filter);
    } catch (error) {
      throw new ApiError('InternalError', 'Failed to search dietary requirements');
    }
  }

  async getMealPlansForResident(
    residentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MealPlan[]> {
    try {
      return this.repository.findMealPlansByDateRange(residentId, startDate, endDate);
    } catch (error) {
      throw new ApiError('InternalError', 'Failed to fetch meal plans');
    }
  }
} 