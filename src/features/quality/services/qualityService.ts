/**
 * WriteCareNotes.com
 * @fileoverview Quality Service Implementation
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { 
  QualityAudit, 
  AuditType, 
  AuditStatus, 
  QualityFilter,
  QualityStats,
  ActionPlan,
  Action
} from '../types';

export class QualityService {
  private static instance: QualityService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || '';
  }

  public static getInstance(): QualityService {
    if (!QualityService.instance) {
      QualityService.instance = new QualityService();
    }
    return QualityService.instance;
  }

  /**
   * Creates a new quality audit
   */
  public async createAudit(audit: Omit<QualityAudit, 'id' | 'metadata'>): Promise<QualityAudit> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quality/audits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(audit),
      });

      if (!response.ok) {
        throw new Error(`Failed to create audit: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating audit:', error);
      throw error;
    }
  }

  /**
   * Retrieves a quality audit by ID
   */
  public async getAudit(auditId: string): Promise<QualityAudit> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quality/audits/${auditId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch audit: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching audit:', error);
      throw error;
    }
  }

  /**
   * Updates an existing quality audit
   */
  public async updateAudit(auditId: string, updates: Partial<QualityAudit>): Promise<QualityAudit> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quality/audits/${auditId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Failed to update audit: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating audit:', error);
      throw error;
    }
  }

  /**
   * Deletes a quality audit
   */
  public async deleteAudit(auditId: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quality/audits/${auditId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete audit: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting audit:', error);
      throw error;
    }
  }

  /**
   * Lists quality audits based on filters
   */
  public async listAudits(filters?: QualityFilter): Promise<QualityAudit[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (key === 'dateRange') {
              queryParams.append('startDate', value.start.toISOString());
              queryParams.append('endDate', value.end.toISOString());
            } else {
              queryParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`${this.baseUrl}/api/quality/audits?${queryParams}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch audits: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching audits:', error);
      throw error;
    }
  }

  /**
   * Creates an action plan for an audit
   */
  public async createActionPlan(auditId: string, plan: Omit<ActionPlan, 'id'>): Promise<ActionPlan> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quality/audits/${auditId}/action-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      });

      if (!response.ok) {
        throw new Error(`Failed to create action plan: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating action plan:', error);
      throw error;
    }
  }

  /**
   * Updates an action within an action plan
   */
  public async updateAction(
    auditId: string, 
    planId: string, 
    actionId: string, 
    updates: Partial<Action>
  ): Promise<Action> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/quality/audits/${auditId}/action-plan/${planId}/actions/${actionId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update action: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating action:', error);
      throw error;
    }
  }

  /**
   * Retrieves quality statistics for a care home
   */
  public async getQualityStats(careHomeId: string): Promise<QualityStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quality/stats/${careHomeId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch quality stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching quality stats:', error);
      throw error;
    }
  }

  /**
   * Exports audit data in specified format
   */
  public async exportAudit(auditId: string, format: 'pdf' | 'csv' | 'excel'): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/api/quality/audits/${auditId}/export?format=${format}`);

      if (!response.ok) {
        throw new Error(`Failed to export audit: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error exporting audit:', error);
      throw error;
    }
  }
} 