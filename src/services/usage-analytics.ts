import { ApplicationInsightsClient } from '@azure/applicationinsights'
import { DefaultAzureCredential } from '@azure/identity'

interface UsageMetrics {
  activeUsers: {
    daily: number
    weekly: number
    monthly: number
  }
  features: {
    [key: string]: {
      usage: number
      successRate: number
      averageLatency: number
    }
  }
  performance: {
    averageResponseTime: number
    errorRate: number
    p95ResponseTime: number
  }
  engagement: {
    averageSessionDuration: number
    returningUsers: number
    featureAdoption: Record<string, number>
  }
}

interface PerformanceMetrics {
  endpoint: string
  duration: number
  success: boolean
  timestamp: Date
}

export class UsageAnalyticsService {
  private static instance: UsageAnalyticsService
  private insights: ApplicationInsightsClient
  private metrics: UsageMetrics
  private performanceData: PerformanceMetrics[]
  private readonly maxPerformanceDataPoints = 1000

  private constructor() {
    const credential = new DefaultAzureCredential()
    this.insights = new ApplicationInsightsClient(credential, process.env.APPLICATIONINSIGHTS_CONNECTION_STRING!)
    
    this.metrics = {
      activeUsers: { daily: 0, weekly: 0, monthly: 0 },
      features: {},
      performance: {
        averageResponseTime: 0,
        errorRate: 0,
        p95ResponseTime: 0
      },
      engagement: {
        averageSessionDuration: 0,
        returningUsers: 0,
        featureAdoption: {}
      }
    }

    this.performanceData = []
    this.setupPeriodicAnalysis()
  }

  public static getInstance(): UsageAnalyticsService {
    if (!UsageAnalyticsService.instance) {
      UsageAnalyticsService.instance = new UsageAnalyticsService()
    }
    return UsageAnalyticsService.instance
  }

  private setupPeriodicAnalysis(): void {
    setInterval(() => {
      this.analyzePerformanceMetrics()
    }, 5 * 60 * 1000) // Every 5 minutes
  }

  public async trackUserActivity(
    userId: string,
    feature: string,
    duration: number
  ): Promise<void> {
    // Update active users
    this.metrics.activeUsers.daily++
    
    // Update feature usage
    if (!this.metrics.features[feature]) {
      this.metrics.features[feature] = {
        usage: 0,
        successRate: 100,
        averageLatency: 0
      }
    }
    this.metrics.features[feature].usage++

    // Track engagement
    this.metrics.engagement.featureAdoption[feature] = 
      (this.metrics.engagement.featureAdoption[feature] || 0) + 1

    // Log to Application Insights
    await this.insights.trackEvent({
      name: 'UserActivity',
      properties: {
        userId,
        feature,
        duration
      }
    })
  }

  public async trackPerformance(metrics: PerformanceMetrics): Promise<void> {
    // Add to performance data
    this.performanceData.push(metrics)
    if (this.performanceData.length > this.maxPerformanceDataPoints) {
      this.performanceData.shift()
    }

    // Update feature metrics
    if (this.metrics.features[metrics.endpoint]) {
      const feature = this.metrics.features[metrics.endpoint]
      feature.averageLatency = 
        (feature.averageLatency * (feature.usage - 1) + metrics.duration) / feature.usage
      feature.successRate = 
        ((feature.successRate / 100 * (feature.usage - 1) + (metrics.success ? 1 : 0)) / feature.usage) * 100
    }

    // Log to Application Insights
    await this.insights.trackRequest({
      name: metrics.endpoint,
      url: metrics.endpoint,
      duration: metrics.duration,
      success: metrics.success,
      time: metrics.timestamp
    })
  }

  private analyzePerformanceMetrics(): void {
    if (this.performanceData.length === 0) return

    // Calculate average response time
    const totalDuration = this.performanceData.reduce(
      (sum, metric) => sum + metric.duration,
      0
    )
    this.metrics.performance.averageResponseTime = 
      totalDuration / this.performanceData.length

    // Calculate error rate
    const errors = this.performanceData.filter(metric => !metric.success).length
    this.metrics.performance.errorRate = 
      (errors / this.performanceData.length) * 100

    // Calculate P95 response time
    const sortedDurations = this.performanceData
      .map(metric => metric.duration)
      .sort((a, b) => a - b)
    const p95Index = Math.floor(sortedDurations.length * 0.95)
    this.metrics.performance.p95ResponseTime = sortedDurations[p95Index]
  }

  public async generateUsageReport(): Promise<any> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get historical data from Application Insights
    const historicalData = await this.insights.query(`
      customEvents
      | where timestamp >= ago(30d)
      | summarize count() by bin(timestamp, 1d), name
    `)

    return {
      overview: {
        activeUsers: this.metrics.activeUsers,
        totalFeatures: Object.keys(this.metrics.features).length,
        overallHealth: this.calculateSystemHealth()
      },
      features: {
        usage: this.metrics.features,
        topFeatures: this.getTopFeatures(),
        underutilizedFeatures: this.getUnderutilizedFeatures()
      },
      performance: {
        current: this.metrics.performance,
        trends: await this.getPerformanceTrends()
      },
      engagement: {
        metrics: this.metrics.engagement,
        trends: this.calculateEngagementTrends(historicalData)
      },
      recommendations: this.generateRecommendations()
    }
  }

  private calculateSystemHealth(): number {
    const errorRateScore = Math.max(0, 100 - this.metrics.performance.errorRate * 2)
    const performanceScore = Math.max(0, 100 - (this.metrics.performance.averageResponseTime / 1000) * 10)
    const adoptionScore = this.calculateFeatureAdoptionScore()

    return (errorRateScore + performanceScore + adoptionScore) / 3
  }

  private calculateFeatureAdoptionScore(): number {
    const features = Object.values(this.metrics.features)
    if (features.length === 0) return 100

    const totalPossibleUsage = features.length * this.metrics.activeUsers.monthly
    const totalActualUsage = features.reduce((sum, feature) => sum + feature.usage, 0)

    return (totalActualUsage / totalPossibleUsage) * 100
  }

  private getTopFeatures(): Array<{ feature: string; usage: number }> {
    return Object.entries(this.metrics.features)
      .map(([feature, metrics]) => ({
        feature,
        usage: metrics.usage
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 5)
  }

  private getUnderutilizedFeatures(): Array<{ feature: string; usage: number }> {
    const averageUsage = Object.values(this.metrics.features)
      .reduce((sum, metrics) => sum + metrics.usage, 0) / 
      Object.keys(this.metrics.features).length

    return Object.entries(this.metrics.features)
      .filter(([, metrics]) => metrics.usage < averageUsage * 0.5)
      .map(([feature, metrics]) => ({
        feature,
        usage: metrics.usage
      }))
  }

  private async getPerformanceTrends(): Promise<any> {
    const results = await this.insights.query(`
      requests
      | where timestamp >= ago(7d)
      | summarize 
          avgDuration=avg(duration),
          p95Duration=percentile(duration, 95),
          errorRate=100.0 * countif(success == false) / count()
        by bin(timestamp, 1h)
    `)

    return results
  }

  private calculateEngagementTrends(historicalData: any): any {
    // Process historical data to calculate engagement trends
    return {
      dailyActiveUsers: historicalData.dailyActiveUsers,
      weeklyActiveUsers: historicalData.weeklyActiveUsers,
      featureAdoption: historicalData.featureAdoption
    }
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = []

    // Performance recommendations
    if (this.metrics.performance.errorRate > 5) {
      recommendations.push('High error rate detected. Review error logs and implement error handling improvements.')
    }

    if (this.metrics.performance.averageResponseTime > 1000) {
      recommendations.push('Response times are above threshold. Consider implementing caching or optimization.')
    }

    // Feature adoption recommendations
    const underutilizedFeatures = this.getUnderutilizedFeatures()
    if (underutilizedFeatures.length > 0) {
      recommendations.push(`Low adoption of features: ${underutilizedFeatures.map(f => f.feature).join(', ')}. Consider UX improvements or user education.`)
    }

    // Engagement recommendations
    if (this.metrics.engagement.averageSessionDuration < 60) {
      recommendations.push('Short session durations detected. Review user journey and engagement strategies.')
    }

    return recommendations
  }

  public getMetrics(): UsageMetrics {
    return { ...this.metrics }
  }
}

export const usageAnalyticsService = UsageAnalyticsService.getInstance()
