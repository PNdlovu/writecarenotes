/**
 * @fileoverview Floor Plan Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { apiClient } from '@/lib/apiClient';
import { syncService } from '@/lib/syncService';
import type { FloorPlan } from '@/types/global';

class FloorPlanService {
  /**
   * Get floor plans for a care home
   */
  async getFloorPlans(careHomeId: string, headers?: Record<string, string>): Promise<FloorPlan[]> {
    try {
      // Try to get cached data first
      const cachedData = await syncService.getCachedData(`/care-homes/${careHomeId}/floorplans`);
      if (cachedData) {
        return cachedData as FloorPlan[];
      }

      // Fetch from API if no cache
      const response = await apiClient.get(`/care-homes/${careHomeId}/floorplans`, { headers });
      const floorPlans = response.data;

      // Cache the data
      await syncService.cacheData(`/care-homes/${careHomeId}/floorplans`, floorPlans);

      return floorPlans;
    } catch (error) {
      console.error('Failed to fetch floor plans:', error);
      throw error;
    }
  }

  /**
   * Create a new floor plan for a care home
   */
  async createFloorPlan(careHomeId: string, data: Partial<FloorPlan>, headers?: Record<string, string>): Promise<FloorPlan> {
    try {
      const response = await apiClient.post(
        `/care-homes/${careHomeId}/floorplans`,
        data,
        { headers }
      );

      // Invalidate cache
      await syncService.invalidateCache(`/care-homes/${careHomeId}/floorplans`);

      return response.data;
    } catch (error) {
      console.error('Failed to create floor plan:', error);
      throw error;
    }
  }

  /**
   * Update an existing floor plan
   */
  async updateFloorPlan(careHomeId: string, floorPlanId: string, data: Partial<FloorPlan>, headers?: Record<string, string>): Promise<FloorPlan> {
    try {
      const response = await apiClient.put(
        `/care-homes/${careHomeId}/floorplans/${floorPlanId}`,
        data,
        { headers }
      );

      // Invalidate cache
      await syncService.invalidateCache(`/care-homes/${careHomeId}/floorplans`);

      return response.data;
    } catch (error) {
      console.error('Failed to update floor plan:', error);
      throw error;
    }
  }

  /**
   * Delete a floor plan
   */
  async deleteFloorPlan(careHomeId: string, floorPlanId: string, headers?: Record<string, string>): Promise<void> {
    try {
      await apiClient.delete(
        `/care-homes/${careHomeId}/floorplans/${floorPlanId}`,
        { headers }
      );

      // Invalidate cache
      await syncService.invalidateCache(`/care-homes/${careHomeId}/floorplans`);
    } catch (error) {
      console.error('Failed to delete floor plan:', error);
      throw error;
    }
  }
}

export const floorPlanService = new FloorPlanService();


