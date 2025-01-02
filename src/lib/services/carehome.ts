/**
 * @fileoverview Enterprise-grade care home management service.
 * Provides comprehensive functionality for managing care homes,
 * including metrics, maintenance, compliance, and resource management.
 * @module services/careHome
 */

import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { CareHomeError } from '@/lib/errors';
import { logger } from '@/lib/logger';
import type {
  CareHomeMetrics,
  CareHomeStats,
  OccupancyData,
  MaintenanceRequest,
  Incident,
  CareHomeResource,
  CareHomeCompliance,
  CareHomeSettings,
  CareHomePreferences
} from '@/types/careHome';
import {
  careHomeSchema,
  maintenanceRequestSchema,
  incidentSchema,
  resourceSchema,
  complianceSchema
} from '../validations/careHome';

/**
 * Enterprise-grade care home management service class
 * @class CareHomeService
 */
export class CareHomeService {
  /**
   * Get care home metrics with performance monitoring
   * @param {string} careHomeId - Unique identifier of the care home
   * @returns {Promise<CareHomeMetrics>} Care home metrics data
   * @throws {CareHomeError} If care home not found or metrics calculation fails
   */
  static getCareHomeMetrics = cache(async (careHomeId: string): Promise<CareHomeMetrics> => {
    const startTime = Date.now();
    try {
      logger.info('Fetching care home metrics', { careHomeId });

      const [
        careHome,
        staffCount,
        departmentsCount,
        occupiedBeds,
        activeIncidents,
        maintenanceRequests,
        carePlans
      ] = await Promise.all([
        prisma.careHome.findUnique({ where: { id: careHomeId } }),
        prisma.staff.count({ where: { careHomeId } }),
        prisma.department.count({ where: { careHomeId } }),
        prisma.bed.count({ where: { careHomeId, status: 'OCCUPIED' } }),
        prisma.incident.count({ where: { careHomeId, status: 'active' } }),
        prisma.maintenanceRequest.count({ where: { careHomeId, status: 'pending' } }),
        prisma.carePlan.count({ where: { careHomeId, status: 'ACTIVE' } })
      ]);

      if (!careHome) {
        throw new CareHomeError('Care home not found', { careHomeId });
      }

      const totalBeds = careHome.totalBeds || 0;
      const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

      // Calculate advanced metrics
      const [
        resourceUtilization,
        staffingEfficiency,
        qualityMetrics
      ] = await Promise.all([
        this.calculateResourceUtilization(careHomeId),
        this.calculateStaffingEfficiency(careHomeId),
        this.getQualityMetrics(careHomeId)
      ]);

      const metrics = {
        totalStaff: staffCount,
        occupancyRate,
        carePlansCount: carePlans,
        activeIncidents,
        resourceUtilization,
        pendingMaintenance: maintenanceRequests,
        staffingEfficiency,
        qualityMetrics,
        complianceScore: careHome.complianceScore,
        incidentResponseTime: careHome.avgIncidentResponseTime
      };

      logger.info('Care home metrics fetched successfully', {
        careHomeId,
        duration: Date.now() - startTime
      });

      return metrics;
    } catch (error) {
      logger.error('Error fetching care home metrics', {
        careHomeId,
        error,
        duration: Date.now() - startTime
      });
      throw new CareHomeError(
        'Failed to fetch care home metrics',
        { careHomeId, cause: error }
      );
    }
  });

  /**
   * Get care home statistics
   */
  static getCareHomeStats = cache(async (careHomeId: string): Promise<CareHomeStats> => {
    try {
      const [occupancyData, resourceData, departmentData, staffingData] = await Promise.all([
        this.getDailyOccupancy(careHomeId),
        this.getResourceUsage(careHomeId),
        this.getDepartmentMetrics(careHomeId),
        this.getStaffingLevels(careHomeId)
      ]);

      // Get quality indicators
      const qualityIndicators = await this.getQualityIndicators(careHomeId);

      // Get incident trends
      const incidentTrends = await this.getIncidentTrends(careHomeId);

      return {
        dailyOccupancy: occupancyData,
        resourceUsage: resourceData,
        departmentMetrics: departmentData,
        staffingLevels: staffingData,
        qualityIndicators,
        incidentTrends
      };
    } catch (error) {
      console.error('Error fetching care home stats:', error);
      throw new Error('Failed to fetch care home statistics');
    }
  });

  /**
   * Create maintenance request with validation and notifications
   * @param {string} careHomeId - Care home identifier
   * @param {Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>} data - Maintenance request data
   * @returns {Promise<MaintenanceRequest>} Created maintenance request
   * @throws {CareHomeError} If validation fails or request creation fails
   */
  static createMaintenanceRequest = async (
    careHomeId: string,
    data: Omit<MaintenanceRequest, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const startTime = Date.now();
    try {
      logger.info('Creating maintenance request', { careHomeId });

      // Validate request data
      const validated = await maintenanceRequestSchema.parseAsync(data);

      // Create maintenance request with transaction
      const request = await prisma.$transaction(async (tx) => {
        const newRequest = await tx.maintenanceRequest.create({
          data: {
            ...validated,
            careHomeId,
            status: 'pending'
          }
        });

        // Update care home maintenance metrics
        await tx.careHome.update({
          where: { id: careHomeId },
          data: {
            pendingMaintenanceCount: { increment: 1 },
            lastMaintenanceRequest: new Date()
          }
        });

        return newRequest;
      });

      // Handle critical maintenance notifications
      if (validated.priority === 'critical') {
        await this.notifySafetyCriticalMaintenance(request);
      }

      logger.info('Maintenance request created successfully', {
        careHomeId,
        requestId: request.id,
        duration: Date.now() - startTime
      });

      return request;
    } catch (error) {
      logger.error('Error creating maintenance request', {
        careHomeId,
        error,
        duration: Date.now() - startTime
      });
      throw new CareHomeError(
        'Failed to create maintenance request',
        { careHomeId, cause: error }
      );
    }
  };

  /**
   * Report incident
   */
  static reportIncident = async (
    careHomeId: string,
    data: Omit<Incident, 'id' | 'timestamp' | 'status'>
  ) => {
    try {
      // Validate incident data
      const validated = await incidentSchema.parseAsync(data);

      // Create incident record
      const incident = await prisma.incident.create({
        data: {
          ...validated,
          careHomeId,
          status: 'active',
          timestamp: new Date().toISOString()
        }
      });

      // Handle immediate notifications based on severity
      await this.handleIncidentNotifications(incident);

      // Update care home risk assessment if needed
      if (validated.severity === 'high' || validated.severity === 'critical') {
        await this.updateCareHomeRiskAssessment(careHomeId, incident);
      }

      return incident;
    } catch (error) {
      console.error('Error reporting incident:', error);
      throw new Error('Failed to report incident');
    }
  };

  /**
   * Update care home resource inventory
   */
  static updateCareHomeResource = async (
    careHomeId: string,
    resourceId: string,
    data: Partial<CareHomeResource>
  ) => {
    try {
      // Validate resource data
      const validated = await resourceSchema.partial().parseAsync(data);

      // Update resource
      const resource = await prisma.resource.update({
        where: { id: resourceId },
        data: validated
      });

      // Check if reorder is needed
      if (resource.quantity <= resource.reorderPoint) {
        await this.handleResourceReorder(resource);
      }

      return resource;
    } catch (error) {
      console.error('Error updating care home resource:', error);
      throw new Error('Failed to update care home resource');
    }
  };

  /**
   * Update care home compliance status
   */
  static updateCareHomeCompliance = async (
    careHomeId: string,
    data: Partial<CareHomeCompliance>
  ) => {
    try {
      // Validate compliance data
      const validated = await complianceSchema.partial().parseAsync(data);

      // Update compliance record
      const compliance = await prisma.compliance.update({
        where: { careHomeId },
        data: validated
      });

      // If compliance status changed, update care home record
      if (validated.status) {
        await prisma.careHome.update({
          where: { id: careHomeId },
          data: { complianceStatus: validated.status }
        });
      }

      return compliance;
    } catch (error) {
      console.error('Error updating care home compliance:', error);
      throw new Error('Failed to update care home compliance status');
    }
  };

  /**
   * Update care home settings with validation and user preference sync
   * @param {string} careHomeId - Care home identifier
   * @param {Partial<CareHomeSettings>} data - Settings update data
   * @returns {Promise<CareHomeSettings>} Updated care home settings
   * @throws {CareHomeError} If validation fails or update fails
   */
  static updateCareHomeSettings = async (
    careHomeId: string,
    data: Partial<CareHomeSettings>
  ) => {
    const startTime = Date.now();
    try {
      logger.info('Updating care home settings', { careHomeId });

      // Validate settings data
      const validated = await careHomeSchema.partial().parseAsync(data);

      // Update settings with transaction
      const settings = await prisma.$transaction(async (tx) => {
        const updatedSettings = await tx.careHomeSettings.update({
          where: { careHomeId },
          data: validated
        });

        // Sync user preferences if theme is updated
        if (data.preferences?.theme) {
          await tx.userPreferences.updateMany({
            where: { careHomeId },
            data: { theme: data.preferences.theme }
          });
        }

        return updatedSettings;
      });

      logger.info('Care home settings updated successfully', {
        careHomeId,
        duration: Date.now() - startTime
      });

      return settings;
    } catch (error) {
      logger.error('Error updating care home settings', {
        careHomeId,
        error,
        duration: Date.now() - startTime
      });
      throw new CareHomeError(
        'Failed to update care home settings',
        { careHomeId, cause: error }
      );
    }
  };

  /**
   * Get care home settings
   */
  static getCareHomeSettings = cache(async (careHomeId: string): Promise<CareHomeSettings> => {
    try {
      const settings = await prisma.careHomeSettings.findUnique({
        where: { careHomeId },
        include: {
          departments: true,
          features: true,
          preferences: true
        }
      });

      if (!settings) {
        throw new Error('Care home settings not found');
      }

      return settings;
    } catch (error) {
      console.error('Error fetching care home settings:', error);
      throw new Error('Failed to fetch care home settings');
    }
  });

  /**
   * Get care home by ID
   */
  static getCareHomeById = cache(async (id: string): Promise<CareHomeSettings> => {
    try {
      const careHome = await prisma.careHome.findUnique({
        where: { id },
        include: {
          departments: true,
          features: true,
          preferences: true
        }
      });

      if (!careHome) {
        throw new Error('Care home not found');
      }

      return careHome;
    } catch (error) {
      console.error('Error fetching care home:', error);
      throw new Error('Failed to fetch care home');
    }
  });

  /**
   * Get all care homes for an organization
   * @param {string} organizationId - Organization identifier
   * @returns {Promise<Array>} List of care homes
   */
  static async getCareHomes(organizationId: string) {
    try {
      logger.info('Fetching care homes', { organizationId });
      
      const careHomes = await prisma.careHome.findMany({
        where: { organizationId },
        include: {
          departments: true,
          staff: {
            select: {
              id: true,
              name: true,
              role: true,
              status: true
            }
          }
        }
      });

      return careHomes;
    } catch (error) {
      logger.error('Error fetching care homes', { organizationId, error });
      throw new CareHomeError('Failed to fetch care homes', { organizationId, cause: error });
    }
  }

  /**
   * Create a new care home
   * @param {string} organizationId - Organization identifier
   * @param {object} data - Care home data
   * @returns {Promise<object>} Created care home
   */
  static async createCareHome(organizationId: string, data: any) {
    try {
      logger.info('Creating care home', { organizationId });

      // Validate care home data
      const validated = await careHomeSchema.parseAsync(data);

      const careHome = await prisma.careHome.create({
        data: {
          ...validated,
          organizationId,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      logger.info('Care home created successfully', {
        organizationId,
        careHomeId: careHome.id
      });

      return careHome;
    } catch (error) {
      logger.error('Error creating care home', { organizationId, error });
      throw new CareHomeError('Failed to create care home', { organizationId, cause: error });
    }
  }

  // Private helper methods with proper error handling
  private static async calculateResourceUtilization(careHomeId: string): Promise<number> {
    try {
      const resources = await prisma.resource.findMany({
        where: { careHomeId, status: 'IN_USE' }
      });

      const totalResources = await prisma.resource.count({
        where: { careHomeId }
      });

      return totalResources > 0
        ? Math.round((resources.length / totalResources) * 100)
        : 0;
    } catch (error) {
      logger.error('Error calculating resource utilization', {
        careHomeId,
        error
      });
      throw new CareHomeError(
        'Failed to calculate resource utilization',
        { careHomeId, cause: error }
      );
    }
  }

  private static async calculateStaffingEfficiency(careHomeId: string): Promise<number> {
    try {
      const [scheduledHours, workedHours] = await Promise.all([
        prisma.staffSchedule.aggregate({
          where: { careHomeId },
          _sum: { scheduledHours: true }
        }),
        prisma.staffTimesheet.aggregate({
          where: { careHomeId },
          _sum: { hoursWorked: true }
        })
      ]);

      const total = scheduledHours._sum.scheduledHours || 0;
      const worked = workedHours._sum.hoursWorked || 0;

      return total > 0 ? Math.round((worked / total) * 100) : 0;
    } catch (error) {
      logger.error('Error calculating staffing efficiency', {
        careHomeId,
        error
      });
      throw new CareHomeError(
        'Failed to calculate staffing efficiency',
        { careHomeId, cause: error }
      );
    }
  }

  private static async getQualityMetrics(careHomeId: string) {
    try {
      const [residentSurveys, staffSurveys, careAudits] = await Promise.all([
        prisma.residentSurvey.aggregate({
          where: { careHomeId },
          _avg: { satisfaction: true }
        }),
        prisma.staffSurvey.aggregate({
          where: { careHomeId },
          _avg: { satisfaction: true }
        }),
        prisma.careAudit.aggregate({
          where: { careHomeId },
          _avg: { score: true }
        })
      ]);

      return {
        residentSatisfaction: Math.round((residentSurveys._avg.satisfaction || 0) * 100),
        staffSatisfaction: Math.round((staffSurveys._avg.satisfaction || 0) * 100),
        careQualityScore: Math.round((careAudits._avg.score || 0) * 100)
      };
    } catch (error) {
      logger.error('Error fetching quality metrics', {
        careHomeId,
        error
      });
      throw new CareHomeError(
        'Failed to fetch quality metrics',
        { careHomeId, cause: error }
      );
    }
  }

  private static async getDailyOccupancy(careHomeId: string) {
    // Implementation for getting daily occupancy
    return [];
  }

  private static async getResourceUsage(careHomeId: string) {
    // Implementation for getting resource usage
    return [];
  }

  private static async getDepartmentMetrics(careHomeId: string) {
    // Implementation for getting department metrics
    return [];
  }

  private static async getStaffingLevels(careHomeId: string) {
    // Implementation for getting staffing levels
    return [];
  }

  private static async getQualityIndicators(careHomeId: string) {
    // Implementation for getting quality indicators
    return [];
  }

  private static async getIncidentTrends(careHomeId: string) {
    // Implementation for getting incident trends
    return [];
  }

  private static async notifySafetyCriticalMaintenance(request: MaintenanceRequest) {
    try {
      const careHome = await prisma.careHome.findUnique({
        where: { id: request.careHomeId },
        include: {
          managers: true,
          maintenanceStaff: true
        }
      });

      if (!careHome) {
        throw new Error('Care home not found');
      }

      // Send notifications to relevant staff
      const notifications = [
        ...careHome.managers,
        ...careHome.maintenanceStaff
      ].map(staff => ({
        userId: staff.id,
        type: 'MAINTENANCE_CRITICAL',
        title: 'Critical Maintenance Required',
        message: `Critical maintenance request: ${request.title}`,
        priority: 'HIGH'
      }));

      await prisma.notification.createMany({
        data: notifications
      });

      logger.info('Safety critical maintenance notifications sent', {
        requestId: request.id,
        recipientCount: notifications.length
      });
    } catch (error) {
      logger.error('Error sending maintenance notifications', {
        requestId: request.id,
        error
      });
      // Don't throw here - notification failure shouldn't block request creation
    }
  }

  private static async handleIncidentNotifications(incident: Incident) {
    // Implementation for incident notifications
  }

  private static async updateCareHomeRiskAssessment(careHomeId: string, incident: Incident) {
    // Implementation for updating care home risk assessment
  }

  private static async handleResourceReorder(resource: CareHomeResource) {
    // Implementation for handling resource reorders
  }
}


