import { AnalyticsRepository } from './repositories/analyticsRepository'
import type { OrganizationMetrics, CareHomeMetricsSummary } from './analytics/types'

export class OrganizationAnalyticsService {
  private repository: AnalyticsRepository

  constructor() {
    this.repository = new AnalyticsRepository()
  }

  async getOrganizationMetrics(organizationId: string): Promise<OrganizationMetrics> {
    return this.repository.getOrganizationMetrics(organizationId)
  }

  async getCareHomeMetrics(organizationId: string): Promise<CareHomeMetricsSummary[]> {
    return this.repository.getCareHomeMetrics(organizationId)
  }

  async getHistoricalMetrics(
    organizationId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<{
    date: Date
    metrics: OrganizationMetrics
  }[]> {
    const endDate = new Date()
    let startDate: Date

    switch (period) {
      case 'day':
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'week':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    return this.repository.getHistoricalMetrics(organizationId, startDate, endDate)
  }

  async takeMetricsSnapshot(organizationId: string): Promise<void> {
    const metrics = await this.getOrganizationMetrics(organizationId)
    await this.repository.saveMetricsSnapshot(organizationId, metrics)
  }

  async getComplianceAnalytics(organizationId: string): Promise<{
    categoryScores: Record<string, number>
    riskAreas: { name: string; count: number }[]
    trendsLastMonth: {
      improvement: number
      decline: number
      unchanged: number
    }
  }> {
    return this.repository.getComplianceBreakdown(organizationId)
  }

  async generateAnalyticsReport(organizationId: string): Promise<{
    metrics: OrganizationMetrics
    careHomes: CareHomeMetricsSummary[]
    compliance: {
      categoryScores: Record<string, number>
      riskAreas: { name: string; count: number }[]
      trendsLastMonth: {
        improvement: number
        decline: number
        unchanged: number
      }
    }
    historicalData: {
      date: Date
      metrics: OrganizationMetrics
    }[]
  }> {
    const [
      metrics,
      careHomes,
      compliance,
      historicalData
    ] = await Promise.all([
      this.getOrganizationMetrics(organizationId),
      this.getCareHomeMetrics(organizationId),
      this.getComplianceAnalytics(organizationId),
      this.getHistoricalMetrics(organizationId, 'month')
    ])

    return {
      metrics,
      careHomes,
      compliance,
      historicalData
    }
  }
}


