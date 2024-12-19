/**
 * @fileoverview Compliance Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { apiClient } from '@/lib/apiClient';
import { syncService } from '@/lib/syncService';
import type { ComplianceRequirement, ComplianceAudit, ComplianceReport } from '@/types/global';

class ComplianceService {
  /**
   * Get compliance requirements for a care home
   */
  async getRequirements(careHomeId: string, headers?: Record<string, string>): Promise<ComplianceRequirement[]> {
    try {
      // Try to get cached data first
      const cachedData = await syncService.getCachedData(`/care-homes/${careHomeId}/requirements`);
      if (cachedData) {
        return cachedData as ComplianceRequirement[];
      }

      // Fetch from API if no cache
      const response = await apiClient.get(`/care-homes/${careHomeId}/requirements`, { headers });
      const requirements = response.data;

      // Cache the data
      await syncService.cacheData(`/care-homes/${careHomeId}/requirements`, requirements);

      return requirements;
    } catch (error) {
      console.error('Failed to fetch compliance requirements:', error);
      throw error;
    }
  }

  /**
   * Create a new compliance requirement
   */
  async createRequirement(careHomeId: string, data: Partial<ComplianceRequirement>, headers?: Record<string, string>): Promise<ComplianceRequirement> {
    try {
      const response = await apiClient.post(
        `/care-homes/${careHomeId}/requirements`,
        data,
        { headers }
      );

      // Invalidate cache
      await syncService.invalidateCache(`/care-homes/${careHomeId}/requirements`);

      return response.data;
    } catch (error) {
      console.error('Failed to create compliance requirement:', error);
      throw error;
    }
  }

  /**
   * Get compliance audits for a care home
   */
  async getAudits(careHomeId: string, headers?: Record<string, string>): Promise<ComplianceAudit[]> {
    try {
      // Try to get cached data first
      const cachedData = await syncService.getCachedData(`/care-homes/${careHomeId}/audits`);
      if (cachedData) {
        return cachedData as ComplianceAudit[];
      }

      // Fetch from API if no cache
      const response = await apiClient.get(`/care-homes/${careHomeId}/audits`, { headers });
      const audits = response.data;

      // Cache the data
      await syncService.cacheData(`/care-homes/${careHomeId}/audits`, audits);

      return audits;
    } catch (error) {
      console.error('Failed to fetch compliance audits:', error);
      throw error;
    }
  }

  /**
   * Create a new compliance audit
   */
  async createAudit(careHomeId: string, data: Partial<ComplianceAudit>, headers?: Record<string, string>): Promise<ComplianceAudit> {
    try {
      const response = await apiClient.post(
        `/care-homes/${careHomeId}/audits`,
        data,
        { headers }
      );

      // Invalidate cache
      await syncService.invalidateCache(`/care-homes/${careHomeId}/audits`);

      return response.data;
    } catch (error) {
      console.error('Failed to create compliance audit:', error);
      throw error;
    }
  }

  /**
   * Get compliance reports for a care home
   */
  async getReports(careHomeId: string, headers?: Record<string, string>): Promise<ComplianceReport[]> {
    try {
      // Try to get cached data first
      const cachedData = await syncService.getCachedData(`/care-homes/${careHomeId}/compliance-reports`);
      if (cachedData) {
        return cachedData as ComplianceReport[];
      }

      // Fetch from API if no cache
      const response = await apiClient.get(`/care-homes/${careHomeId}/compliance-reports`, { headers });
      const reports = response.data;

      // Cache the data
      await syncService.cacheData(`/care-homes/${careHomeId}/compliance-reports`, reports);

      return reports;
    } catch (error) {
      console.error('Failed to fetch compliance reports:', error);
      throw error;
    }
  }

  /**
   * Generate a new compliance report
   */
  async generateReport(careHomeId: string, data: { startDate: string; endDate: string }, headers?: Record<string, string>): Promise<ComplianceReport> {
    try {
      const response = await apiClient.post(
        `/care-homes/${careHomeId}/compliance-reports`,
        data,
        { headers }
      );

      // Invalidate cache
      await syncService.invalidateCache(`/care-homes/${careHomeId}/compliance-reports`);

      return response.data;
    } catch (error) {
      console.error('Failed to generate compliance report:', error);
      throw error;
    }
  }
}

export const complianceService = new ComplianceService();


