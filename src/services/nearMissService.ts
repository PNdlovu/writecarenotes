import { NearMissReport, NearMissType, Severity } from '@/types/nearMiss';

class NearMissAnalytics {
  calculateRiskScore(report: NearMissReport): number {
    const severityScore = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4,
    }[report.severity];

    const typeScore = {
      WRONG_MEDICATION: 4,
      WRONG_DOSE: 3,
      WRONG_TIME: 2,
      WRONG_RESIDENT: 4,
      MISSED_DOSE: 2,
      STOCK_ERROR: 1,
      OTHER: 1,
    }[report.type];

    const childInvolvedScore = report.isChildInvolved ? 2 : 1;
    const safeguardingScore = report.requiresSafeguardingReferral ? 2 : 1;

    return (severityScore * typeScore * childInvolvedScore * safeguardingScore) / 16 * 100;
  }

  async findSimilarIncidents(report: NearMissReport): Promise<string[]> {
    // Implementation would connect to a backend service
    // This is a placeholder that would be replaced with actual implementation
    return [];
  }

  calculateTimeMetrics(report: NearMissReport) {
    const incidentTime = new Date(report.timestamp);
    const reportTime = new Date(report.metadata.lastModified);
    const actionTime = report.actionTaken ? new Date() : null;

    return {
      timeToReport: Math.round((reportTime.getTime() - incidentTime.getTime()) / (1000 * 60)),
      timeToAction: actionTime 
        ? Math.round((actionTime.getTime() - reportTime.getTime()) / (1000 * 60))
        : null,
    };
  }
}

class NearMissValidation {
  validateReport(report: NearMissReport): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!report.description) errors.push('Description is required');
    if (!report.actionTaken) errors.push('Action taken is required');
    if (!report.preventiveMeasures) errors.push('Preventive measures are required');

    // Child-specific validation
    if (report.isChildInvolved && !report.childSpecificDetails) {
      errors.push('Child specific details are required when a child is involved');
    }

    // Safeguarding validation
    if (report.requiresSafeguardingReferral && !report.safeguardingReferralDetails) {
      errors.push('Safeguarding referral details are required');
    }

    // High severity validation
    if (report.severity === 'HIGH' || report.severity === 'CRITICAL') {
      if (!report.systemImprovements) {
        errors.push('System improvements are required for high severity incidents');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export class NearMissService {
  private analytics: NearMissAnalytics;
  private validation: NearMissValidation;
  private baseUrl = '/api/medications/near-miss';

  constructor() {
    this.analytics = new NearMissAnalytics();
    this.validation = new NearMissValidation();
  }

  async submitReport(report: Omit<NearMissReport, 'id'>): Promise<{ success: boolean; errors?: string[] }> {
    try {
      // Validate the report
      const validationResult = this.validation.validateReport(report);
      if (!validationResult.valid) {
        return { success: false, errors: validationResult.errors };
      }

      // Calculate analytics
      const riskScore = this.analytics.calculateRiskScore(report as NearMissReport);
      const timeMetrics = this.analytics.calculateTimeMetrics(report as NearMissReport);
      const similarIncidents = await this.analytics.findSimilarIncidents(report as NearMissReport);
      const trendCategory = this.categorizeTrend(report.type, report.severity);

      // Prepare the final report with analytics
      const finalReport = {
        ...report,
        analytics: {
          riskScore,
          ...timeMetrics,
          similarIncidents,
          trendCategory,
        },
      };

      // Submit to API
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalReport),
      });

      if (!response.ok) {
        const error = await response.json();
        return { 
          success: false, 
          errors: [error.message || 'Failed to submit report'] 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error submitting near miss report:', error);
      return { 
        success: false, 
        errors: ['An unexpected error occurred while submitting the report'] 
      };
    }
  }

  async submitReportWithFiles(
    report: Omit<NearMissReport, 'id'>, 
    files: File[]
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const formData = new FormData();
      formData.append('report', JSON.stringify(report));
      
      files.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${this.baseUrl}/with-attachments`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return { 
          success: false, 
          errors: [error.message || 'Failed to submit report with attachments'] 
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error submitting near miss report with files:', error);
      return { 
        success: false, 
        errors: ['An unexpected error occurred while submitting the report'] 
      };
    }
  }

  private categorizeTrend(type: NearMissType, severity: Severity): string {
    if (severity === 'CRITICAL' || severity === 'HIGH') {
      return 'HIGH_PRIORITY';
    }

    switch (type) {
      case 'WRONG_MEDICATION':
      case 'WRONG_RESIDENT':
        return 'CRITICAL_ERROR';
      case 'WRONG_DOSE':
        return 'DOSAGE_ERROR';
      case 'WRONG_TIME':
      case 'MISSED_DOSE':
        return 'TIMING_ERROR';
      case 'STOCK_ERROR':
        return 'INVENTORY_ISSUE';
      default:
        return 'OTHER';
    }
  }

  async getNearMissStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalReports: number;
    byType: Record<NearMissType, number>;
    bySeverity: Record<Severity, number>;
    averageRiskScore: number;
    commonTrends: string[];
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate.toISOString());
      if (endDate) queryParams.append('endDate', endDate.toISOString());

      const response = await fetch(`${this.baseUrl}/stats?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch near miss statistics');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching near miss statistics:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const nearMissService = new NearMissService();


