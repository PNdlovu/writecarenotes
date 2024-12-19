/**
 * @fileoverview Dietary Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { apiClient } from '@/lib/apiClient';
import { syncService } from '@/lib/syncService';
import type { DietaryPlan, MealPlan, NutritionalAssessment } from '@/types/global';

class DietaryService {
  /**
   * Get dietary plans for a care home
   */
  async getDietaryPlans(careHomeId: string, headers?: Record<string, string>): Promise<DietaryPlan[]> {
    try {
      // Try to get cached data first
      const cachedData = await syncService.getCachedData(`/care-homes/${careHomeId}/dietary-plans`);
      if (cachedData) {
        return cachedData as DietaryPlan[];
      }

      // Fetch from API if no cache
      const response = await apiClient.get(`/care-homes/${careHomeId}/dietary-plans`, { headers });
      const plans = response.data;

      // Cache the data
      await syncService.cacheData(`/care-homes/${careHomeId}/dietary-plans`, plans);

      return plans;
    } catch (error) {
      console.error('Failed to fetch dietary plans:', error);
      throw error;
    }
  }

  /**
   * Create a new dietary plan
   */
  async createDietaryPlan(careHomeId: string, data: Partial<DietaryPlan>, headers?: Record<string, string>): Promise<DietaryPlan> {
    try {
      const response = await apiClient.post(
        `/care-homes/${careHomeId}/dietary-plans`,
        data,
        { headers }
      );

      // Invalidate cache
      await syncService.invalidateCache(`/care-homes/${careHomeId}/dietary-plans`);

      return response.data;
    } catch (error) {
      console.error('Failed to create dietary plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing dietary plan
   */
  async updateDietaryPlan(careHomeId: string, planId: string, data: Partial<DietaryPlan>, headers?: Record<string, string>): Promise<DietaryPlan> {
    try {
      const response = await apiClient.put(
        `/care-homes/${careHomeId}/dietary-plans/${planId}`,
        data,
        { headers }
      );

      // Invalidate cache
      await syncService.invalidateCache(`/care-homes/${careHomeId}/dietary-plans`);

      return response.data;
    } catch (error) {
      console.error('Failed to update dietary plan:', error);
      throw error;
    }
  }

  /**
   * Get meal plans for a care home
   */
  async getMealPlans(careHomeId: string, headers?: Record<string, string>): Promise<MealPlan[]> {
    try {
      // Try to get cached data first
      const cachedData = await syncService.getCachedData(`/care-homes/${careHomeId}/meal-plans`);
      if (cachedData) {
        return cachedData as MealPlan[];
      }

      // Fetch from API if no cache
      const response = await apiClient.get(`/care-homes/${careHomeId}/meal-plans`, { headers });
      const plans = response.data;

      // Cache the data
      await syncService.cacheData(`/care-homes/${careHomeId}/meal-plans`, plans);

      return plans;
    } catch (error) {
      console.error('Failed to fetch meal plans:', error);
      throw error;
    }
  }

  /**
   * Create a new meal plan
   */
  async createMealPlan(careHomeId: string, data: Partial<MealPlan>, headers?: Record<string, string>): Promise<MealPlan> {
    try {
      const response = await apiClient.post(
        `/care-homes/${careHomeId}/meal-plans`,
        data,
        { headers }
      );

      // Invalidate cache
      await syncService.invalidateCache(`/care-homes/${careHomeId}/meal-plans`);

      return response.data;
    } catch (error) {
      console.error('Failed to create meal plan:', error);
      throw error;
    }
  }

  /**
   * Get nutritional assessments for a care home
   */
  async getNutritionalAssessments(careHomeId: string, headers?: Record<string, string>): Promise<NutritionalAssessment[]> {
    try {
      // Try to get cached data first
      const cachedData = await syncService.getCachedData(`/care-homes/${careHomeId}/nutritional-assessments`);
      if (cachedData) {
        return cachedData as NutritionalAssessment[];
      }

      // Fetch from API if no cache
      const response = await apiClient.get(`/care-homes/${careHomeId}/nutritional-assessments`, { headers });
      const assessments = response.data;

      // Cache the data
      await syncService.cacheData(`/care-homes/${careHomeId}/nutritional-assessments`, assessments);

      return assessments;
    } catch (error) {
      console.error('Failed to fetch nutritional assessments:', error);
      throw error;
    }
  }

  /**
   * Create a new nutritional assessment
   */
  async createNutritionalAssessment(careHomeId: string, data: Partial<NutritionalAssessment>, headers?: Record<string, string>): Promise<NutritionalAssessment> {
    try {
      const response = await apiClient.post(
        `/care-homes/${careHomeId}/nutritional-assessments`,
        data,
        { headers }
      );

      // Invalidate cache
      await syncService.invalidateCache(`/care-homes/${careHomeId}/nutritional-assessments`);

      return response.data;
    } catch (error) {
      console.error('Failed to create nutritional assessment:', error);
      throw error;
    }
  }
}

export const dietaryService = new DietaryService();


