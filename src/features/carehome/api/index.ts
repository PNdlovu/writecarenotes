import { CareHomeService } from '../services/CareHomeService';
import { validateCareHomeId, validateDateRange, validateUpdateCareHome } from './validation';
import type { CareHomeResponse, MetricsResponse, ComplianceResponse } from './types';

export class CareHomeAPI {
  constructor(private service: CareHomeService) {}

  async getCareHome(careHomeId: string): Promise<CareHomeResponse> {
    await validateCareHomeId(careHomeId);
    return this.service.getCareHomeDetails(careHomeId);
  }

  async getMetrics(
    careHomeId: string,
    startDate: string,
    endDate: string
  ): Promise<MetricsResponse> {
    await validateCareHomeId(careHomeId);
    await validateDateRange(startDate, endDate);
    
    const metrics = await this.service.getOperationalMetrics(careHomeId, {
      start: new Date(startDate),
      end: new Date(endDate)
    });

    return {
      id: careHomeId,
      timestamp: new Date().toISOString(),
      metrics: {
        occupancy: metrics.derived.occupancyRate,
        staffingLevels: metrics.derived.staffingRatio,
        incidentRate: metrics.residents.incidents.rate,
        complianceScore: metrics.compliance.regulatoryCompliance.score,
        satisfactionScore: metrics.residents.satisfaction.overall
      },
      trends: {
        weekly: metrics.trends.weekly,
        monthly: metrics.trends.monthly,
        quarterly: metrics.trends.quarterly
      }
    };
  }

  async getCompliance(careHomeId: string): Promise<ComplianceResponse> {
    await validateCareHomeId(careHomeId);
    
    const compliance = await this.service.validateRegionalCompliance(careHomeId);
    
    return {
      id: careHomeId,
      timestamp: compliance.timestamp.toISOString(),
      status: compliance.overallStatus,
      report: {
        overallScore: this.calculateOverallScore(compliance),
        categories: {
          safety: this.calculateCategoryScore(compliance, 'safety'),
          care: this.calculateCategoryScore(compliance, 'care'),
          staffing: this.calculateCategoryScore(compliance, 'staffing'),
          management: this.calculateCategoryScore(compliance, 'management'),
          environment: this.calculateCategoryScore(compliance, 'environment')
        },
        findings: compliance.regulations
          .filter(reg => reg.gaps.length > 0)
          .map(reg => ({
            category: reg.regulationId.split('-')[0],
            description: reg.gaps[0],
            severity: this.determineSeverity(reg.status),
            action: 'Review and implement corrective measures',
            dueDate: reg.dueDate?.toISOString() || 
              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }))
      },
      nextReviewDate: compliance.nextReviewDate.toISOString()
    };
  }

  async updateCareHome(
    careHomeId: string,
    data: unknown
  ): Promise<CareHomeResponse> {
    await validateCareHomeId(careHomeId);
    const validatedData = await validateUpdateCareHome(data);
    return this.service.updateCareHome(careHomeId, validatedData);
  }

  private calculateOverallScore(compliance: any): number {
    // Implementation would calculate a weighted score based on compliance status
    return 85; // Placeholder
  }

  private calculateCategoryScore(compliance: any, category: string): number {
    // Implementation would calculate category-specific scores
    return 90; // Placeholder
  }

  private determineSeverity(status: string): 'low' | 'medium' | 'high' {
    switch (status) {
      case 'NON_COMPLIANT':
        return 'high';
      case 'PARTIALLY_COMPLIANT':
        return 'medium';
      default:
        return 'low';
    }
  }
}


