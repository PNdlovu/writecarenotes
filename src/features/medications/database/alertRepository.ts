/**
 * @writecarenotes.com
 * @fileoverview Alert Repository for medication alerts
 * @version 1.0.0
 * @created 2024-01-07
 * @updated 2024-01-07
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Repository interface for managing medication alerts and notifications
 * with support for offline-first operations.
 */

import { 
  MedicationAlert,
  AlertType,
  AlertPriority,
  AlertStatus
} from '../types';
import { BaseRepository } from '@/database/baseRepository';

export class AlertRepository extends BaseRepository {
  /**
   * Create a new alert
   */
  async createAlert(data: {
    type: AlertType;
    priority: AlertPriority;
    details: any;
    status: AlertStatus;
    createdAt: Date;
    acknowledgedAt: Date | null;
    acknowledgedBy: string | null;
    region?: string;
  }): Promise<MedicationAlert> {
    return this.create('medication_alerts', data);
  }

  /**
   * Update alert status
   */
  async updateAlert(
    alertId: string,
    data: {
      status: AlertStatus;
      acknowledgedAt: Date;
      acknowledgedBy: string;
      notes?: string;
    }
  ): Promise<MedicationAlert> {
    return this.update('medication_alerts', alertId, data);
  }

  /**
   * Get alerts by date range
   */
  async getAlertsByDateRange(
    residentId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MedicationAlert[]> {
    return this.query('medication_alerts', {
      residentId,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });
  }

  /**
   * Get unacknowledged alerts
   */
  async getUnacknowledgedAlerts(residentId: string): Promise<MedicationAlert[]> {
    return this.query('medication_alerts', {
      residentId,
      status: AlertStatus.ACTIVE
    });
  }

  /**
   * Get high priority alerts
   */
  async getHighPriorityAlerts(residentId: string): Promise<MedicationAlert[]> {
    return this.query('medication_alerts', {
      residentId,
      priority: AlertPriority.HIGH,
      status: AlertStatus.ACTIVE
    });
  }

  /**
   * Delete acknowledged alerts older than retention period
   */
  async cleanupOldAlerts(retentionDays: number = 90): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    await this.delete('medication_alerts', {
      status: AlertStatus.ACKNOWLEDGED,
      acknowledgedAt: {
        $lt: cutoffDate
      }
    });
  }
} 