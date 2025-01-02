/**
 * WriteCareNotes.com
 * @fileoverview Emergency Service Implementation
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { AccessManagementService } from '@/features/access-management/services/AccessManagementService';
import { NotificationService } from '@/features/notifications/services/NotificationService';
import { SecurityConfig } from '@/features/access-management/types';
import {
  EmergencyIncident,
  EmergencyProtocol,
  EmergencyAction,
  EmergencyNotification,
  EmergencyReport,
  EmergencyType,
  EmergencyStatus,
  EmergencySeverity,
  EmergencyDashboardFilters
} from '../types';

export class EmergencyService {
  private static instance: EmergencyService;
  private baseUrl: string;
  private accessService: AccessManagementService;
  private notificationService: NotificationService;

  private constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || '';
    
    const config: SecurityConfig = {
      algorithm: 'aes-256-gcm',
      ivLength: 16,
      encryptionKey: Buffer.from(process.env.ENCRYPTION_KEY || '', 'base64'),
      tokenSecret: process.env.JWT_SECRET || '',
      tokenExpiry: 24 * 60 * 60,
      mfaEnabled: true,
      passwordPolicy: {
        minLength: 12,
        requireNumbers: true,
        requireSpecialChars: true,
        requireUppercase: true,
        requireLowercase: true,
        expiryDays: 90,
        preventReuse: 5
      }
    };

    this.accessService = new AccessManagementService(config);
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  /**
   * Creates a new emergency incident
   */
  public async createIncident(incident: Omit<EmergencyIncident, 'id' | 'timeline' | 'createdAt' | 'updatedAt'>): Promise<EmergencyIncident> {
    try {
      const response = await fetch(`${this.baseUrl}/api/emergency/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident)
      });

      if (!response.ok) {
        throw new Error(`Failed to create incident: ${response.statusText}`);
      }

      const createdIncident = await response.json();

      // Notify relevant personnel
      await this.notifyEmergencyTeam(createdIncident);

      return createdIncident;
    } catch (error) {
      console.error('Error creating incident:', error);
      throw error;
    }
  }

  /**
   * Updates an existing emergency incident
   */
  public async updateIncident(incidentId: string, updates: Partial<EmergencyIncident>): Promise<EmergencyIncident> {
    try {
      const response = await fetch(`${this.baseUrl}/api/emergency/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`Failed to update incident: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating incident:', error);
      throw error;
    }
  }

  /**
   * Retrieves an emergency incident by ID
   */
  public async getIncident(incidentId: string): Promise<EmergencyIncident> {
    try {
      const response = await fetch(`${this.baseUrl}/api/emergency/incidents/${incidentId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch incident: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching incident:', error);
      throw error;
    }
  }

  /**
   * Lists emergency incidents based on filters
   */
  public async listIncidents(filters?: EmergencyDashboardFilters): Promise<EmergencyIncident[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (key === 'dateRange') {
              queryParams.append('startDate', value.start.toISOString());
              queryParams.append('endDate', value.end.toISOString());
            } else if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key + '[]', v));
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/api/emergency/incidents?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch incidents: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    }
  }

  /**
   * Records an action taken during an emergency
   */
  public async recordAction(incidentId: string, action: Omit<EmergencyAction, 'id'>): Promise<EmergencyAction> {
    try {
      const response = await fetch(`${this.baseUrl}/api/emergency/incidents/${incidentId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action)
      });

      if (!response.ok) {
        throw new Error(`Failed to record action: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error recording action:', error);
      throw error;
    }
  }

  /**
   * Creates or updates an emergency protocol
   */
  public async saveProtocol(protocol: Omit<EmergencyProtocol, 'id'>): Promise<EmergencyProtocol> {
    try {
      const response = await fetch(`${this.baseUrl}/api/emergency/protocols`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(protocol)
      });

      if (!response.ok) {
        throw new Error(`Failed to save protocol: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving protocol:', error);
      throw error;
    }
  }

  /**
   * Retrieves emergency protocols by type
   */
  public async getProtocols(type?: EmergencyType): Promise<EmergencyProtocol[]> {
    try {
      const url = type 
        ? `${this.baseUrl}/api/emergency/protocols?type=${type}`
        : `${this.baseUrl}/api/emergency/protocols`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch protocols: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching protocols:', error);
      throw error;
    }
  }

  /**
   * Creates an emergency report
   */
  public async createReport(report: Omit<EmergencyReport, 'id' | 'submittedAt'>): Promise<EmergencyReport> {
    try {
      const response = await fetch(`${this.baseUrl}/api/emergency/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });

      if (!response.ok) {
        throw new Error(`Failed to create report: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  /**
   * Updates an emergency report's status
   */
  public async updateReportStatus(
    reportId: string,
    status: 'SUBMITTED' | 'REVIEWED' | 'APPROVED',
    reviewedBy?: string
  ): Promise<EmergencyReport> {
    try {
      const response = await fetch(`${this.baseUrl}/api/emergency/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reviewedBy })
      });

      if (!response.ok) {
        throw new Error(`Failed to update report status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating report status:', error);
      throw error;
    }
  }

  /**
   * Sends emergency notifications
   */
  private async notifyEmergencyTeam(incident: EmergencyIncident): Promise<void> {
    try {
      const notifications: EmergencyNotification[] = incident.responders.map(responder => ({
        id: crypto.randomUUID(),
        incidentId: incident.id,
        type: 'SYSTEM',
        recipient: responder,
        message: `Emergency: ${incident.type} incident reported at ${incident.location}. Severity: ${incident.severity}`,
        priority: incident.severity === 'CRITICAL' ? 'URGENT' : 'HIGH',
        status: 'PENDING'
      }));

      await Promise.all(notifications.map(notification =>
        this.notificationService.send(notification)
      ));
    } catch (error) {
      console.error('Error notifying emergency team:', error);
      // Don't throw here to prevent blocking the incident creation
      // but log for monitoring
    }
  }

  /**
   * Retrieves emergency access history
   */
  public async getEmergencyAccessHistory(userId: string): Promise<EmergencyAccess[]> {
    try {
      const accessDecision = await this.accessService.checkAccess({
        userId,
        resourceType: 'emergency_access',
        resourceId: 'global',
        action: 'view'
      });

      if (!accessDecision.allowed) {
        throw new Error('User does not have permission to view emergency access history');
      }

      const response = await fetch(`${this.baseUrl}/api/emergency/access?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch emergency access history');
      }

      await this.accessService.auditLog({
        action: 'EMERGENCY_ACCESS_HISTORY_VIEWED',
        description: 'Emergency access history viewed',
        userId,
        tenantId: 'current-tenant-id',
        timestamp: new Date()
      });

      return response.json();
    } catch (error) {
      console.error('Error fetching emergency access history:', error);
      throw error;
    }
  }
}
