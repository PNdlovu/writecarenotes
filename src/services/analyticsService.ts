/**
 * @fileoverview Analytics Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { apiClient } from '@/lib/apiClient';
import { syncService } from '@/lib/syncService';
import type { AnalyticsData, CareMetrics, OccupancyData } from '@/types/global';

class AnalyticsService {
  /**
   * Get analytics data for a care home
   */
  async getAnalytics(careHomeId: string, headers?: Record<string, string>): Promise<AnalyticsData> {
    try {
      // Try to get cached data first
      const cachedData = await syncService.getCachedData(`/care-homes/${careHomeId}/analytics`);
      if (cachedData) {
        return cachedData as AnalyticsData;
      }

      // Fetch from API if no cache
      const response = await apiClient.get(`/care-homes/${careHomeId}/analytics`, { headers });
      const analytics = response.data;

      // Cache the data
      await syncService.cacheData(`/care-homes/${careHomeId}/analytics`, analytics);

      return analytics;
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      throw error;
    }
  }

  /**
   * Get care metrics for a care home
   */
  async getCareMetrics(careHomeId: string, headers?: Record<string, string>): Promise<CareMetrics> {
    try {
      // Try to get cached data first
      const cachedData = await syncService.getCachedData(`/care-homes/${careHomeId}/metrics`);
      if (cachedData) {
        return cachedData as CareMetrics;
      }

      // Fetch from API if no cache
      const response = await apiClient.get(`/care-homes/${careHomeId}/metrics`, { headers });
      const metrics = response.data;

      // Cache the data
      await syncService.cacheData(`/care-homes/${careHomeId}/metrics`, metrics);

      return metrics;
    } catch (error) {
      console.error('Failed to fetch care metrics:', error);
      throw error;
    }
  }

  /**
   * Get occupancy data for a care home
   */
  async getOccupancyData(careHomeId: string, headers?: Record<string, string>): Promise<OccupancyData> {
    try {
      // Try to get cached data first
      const cachedData = await syncService.getCachedData(`/care-homes/${careHomeId}/occupancy`);
      if (cachedData) {
        return cachedData as OccupancyData;
      }

      // Fetch from API if no cache
      const response = await apiClient.get(`/care-homes/${careHomeId}/occupancy`, { headers });
      const occupancy = response.data;

      // Cache the data
      await syncService.cacheData(`/care-homes/${careHomeId}/occupancy`, occupancy);

      return occupancy;
    } catch (error) {
      console.error('Failed to fetch occupancy data:', error);
      throw error;
    }
  }

  /**
   * Get care home comparison data for an organization
   */
  async getCareHomeComparison(
    organizationId: string,
    careHomeIds: string[],
    headers?: Record<string, string>
  ) {
    try {
      const response = await apiClient.get(
        `/analytics/organization/${organizationId}/care-home-comparison`,
        {
          params: {
            careHomes: careHomeIds.join(','),
          },
          headers,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to fetch care home comparison:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();


