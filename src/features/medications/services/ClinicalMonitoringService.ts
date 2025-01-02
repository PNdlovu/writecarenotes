/**
 * @writecarenotes.com
 * @fileoverview Clinical monitoring and vital signs tracking service
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing clinical monitoring requirements, vital signs tracking,
 * and medication-related health observations. Provides real-time alerts and
 * trending analysis for clinical indicators across different care settings.
 *
 * Features:
 * - Vital signs monitoring
 * - Clinical observation tracking
 * - Alert threshold management
 * - Trend analysis
 * - Integration with medication records
 *
 * Mobile-First Considerations:
 * - Quick vital signs entry
 * - Real-time alerts
 * - Offline data collection
 * - Touch-optimized interface
 *
 * Enterprise Features:
 * - Clinical safety alerts
 * - Audit trail
 * - Compliance tracking
 * - Integration with care records
 */

import { z } from 'zod';
import { AuditService } from '@/lib/services/AuditService';
import { AlertService } from '@/lib/services/AlertService';

const vitalSignsSchema = z.object({
  residentId: z.string(),
  medicationId: z.string(),
  temperature: z.number().optional(),
  bloodPressureSystolic: z.number().optional(),
  bloodPressureDiastolic: z.number().optional(),
  heartRate: z.number().optional(),
  respiratoryRate: z.number().optional(),
  oxygenSaturation: z.number().optional(),
  bloodGlucose: z.number().optional(),
  timestamp: z.date(),
  notes: z.string().optional(),
});

export class ClinicalMonitoringService {
  private static instance: ClinicalMonitoringService;
  private auditService: AuditService;
  private alertService: AlertService;

  private constructor() {
    this.auditService = new AuditService();
    this.alertService = new AlertService();
  }

  public static getInstance(): ClinicalMonitoringService {
    if (!ClinicalMonitoringService.instance) {
      ClinicalMonitoringService.instance = new ClinicalMonitoringService();
    }
    return ClinicalMonitoringService.instance;
  }

  public async recordVitalSigns(data: z.infer<typeof vitalSignsSchema>) {
    const validated = vitalSignsSchema.parse(data);

    // Check for critical values
    await this.checkVitalSignsThresholds(validated);

    // Record the vital signs
    await this.auditService.log({
      action: 'VITAL_SIGNS_RECORDED',
      details: validated,
    });

    return validated;
  }

  private async checkVitalSignsThresholds(vitals: z.infer<typeof vitalSignsSchema>) {
    const alerts = [];

    if (vitals.temperature && (vitals.temperature < 35 || vitals.temperature > 38.5)) {
      alerts.push({
        type: 'CRITICAL',
        message: 'Temperature outside normal range',
        value: vitals.temperature,
      });
    }

    if (vitals.bloodPressureSystolic && 
       (vitals.bloodPressureSystolic < 90 || vitals.bloodPressureSystolic > 180)) {
      alerts.push({
        type: 'CRITICAL',
        message: 'Systolic blood pressure outside normal range',
        value: vitals.bloodPressureSystolic,
      });
    }

    if (vitals.heartRate && (vitals.heartRate < 50 || vitals.heartRate > 120)) {
      alerts.push({
        type: 'CRITICAL',
        message: 'Heart rate outside normal range',
        value: vitals.heartRate,
      });
    }

    // Send alerts if any thresholds exceeded
    if (alerts.length > 0) {
      await this.alertService.sendClinicalAlerts({
        residentId: vitals.residentId,
        medicationId: vitals.medicationId,
        alerts,
        timestamp: vitals.timestamp,
      });
    }
  }

  public async analyzeTrends(residentId: string, timeframe: { start: Date; end: Date }) {
    // Implement trend analysis logic here
    return {
      residentId,
      timeframe,
      trends: {
        // Add trend analysis results
      },
    };
  }
} 