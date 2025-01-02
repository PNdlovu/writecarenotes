import { type HydrationRecord, type HydrationGoal } from '../types/hydration'

interface AIServiceConfig {
  maxDailyRequests: number
  maxMonthlyRequests: number
  complexAnalysisThreshold: number
  costPerUser: {
    basic: number
    advanced: number
  }
}

interface AIUsageMetrics {
  dailyRequests: number
  monthlyRequests: number
  lastRequestDate: Date
  monthStartDate: Date
}

interface BasicInsight {
  type: 'basic'
  title: string
  description: string
  importance: 'high' | 'medium' | 'low'
}

interface AdvancedInsight {
  type: 'advanced'
  title: string
  description: string
  confidence: number
  prediction?: string
  recommendations: string[]
}

type HydrationInsight = BasicInsight | AdvancedInsight

export class OptimizedHydrationAIService {
  private static instance: OptimizedHydrationAIService
  private config: AIServiceConfig
  private usageMetrics: Map<string, AIUsageMetrics>

  private constructor() {
    this.config = {
      maxDailyRequests: 1,
      maxMonthlyRequests: 20,
      complexAnalysisThreshold: 100,
      costPerUser: {
        basic: 0,
        advanced: 0.01
      }
    }
    this.usageMetrics = new Map()
  }

  public static getInstance(): OptimizedHydrationAIService {
    if (!OptimizedHydrationAIService.instance) {
      OptimizedHydrationAIService.instance = new OptimizedHydrationAIService()
    }
    return OptimizedHydrationAIService.instance
  }

  // Local analysis methods
  private analyzeBasicPatterns(records: HydrationRecord[]): BasicInsight[] {
    const insights: BasicInsight[] = []
    
    // Daily consistency analysis
    const dailyTotals = this.calculateDailyTotals(records)
    const consistency = this.calculateConsistencyScore(dailyTotals)
    
    insights.push({
      type: 'basic',
      title: 'Daily Consistency',
      description: `Your hydration consistency score is ${Math.round(consistency * 100)}%`,
      importance: consistency > 0.8 ? 'high' : consistency > 0.6 ? 'medium' : 'low'
    })

    // Time pattern analysis
    const timePatterns = this.analyzeTimingPatterns(records)
    insights.push({
      type: 'basic',
      title: 'Timing Patterns',
      description: timePatterns.description,
      importance: timePatterns.importance
    })

    return insights
  }

  private calculateDailyTotals(records: HydrationRecord[]): Map<string, number> {
    const totals = new Map<string, number>()
    
    records.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0]
      totals.set(date, (totals.get(date) || 0) + record.amount)
    })
    
    return totals
  }

  private calculateConsistencyScore(dailyTotals: Map<string, number>): number {
    const values = Array.from(dailyTotals.values())
    if (values.length < 2) return 1
    
    const mean = values.reduce((a, b) => a + b) / values.length
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length
    const standardDeviation = Math.sqrt(variance)
    
    return Math.max(0, 1 - (standardDeviation / mean))
  }

  private analyzeTimingPatterns(records: HydrationRecord[]): {
    description: string
    importance: 'high' | 'medium' | 'low'
  } {
    const hourCounts = new Array(24).fill(0)
    records.forEach(record => {
      const hour = new Date(record.timestamp).getHours()
      hourCounts[hour]++
    })

    const peakHours = hourCounts
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(({ hour }) => {
        const period = hour < 12 ? 'AM' : 'PM'
        const displayHour = hour % 12 || 12
        return `${displayHour}${period}`
      })

    const hasGoodDistribution = hourCounts.filter(count => count > 0).length > 8

    return {
      description: `You tend to drink most at ${peakHours.join(', ')}`,
      importance: hasGoodDistribution ? 'high' : 'medium'
    }
  }

  // Cloud analysis methods
  private async performCloudAnalysis(records: HydrationRecord[]): Promise<AdvancedInsight[]> {
    try {
      const response = await fetch('/api/ai/hydration-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records })
      })

      if (!response.ok) {
        throw new Error('Cloud analysis failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Cloud analysis error:', error)
      return []
    }
  }

  // Usage tracking
  private async trackUsage(userId: string): Promise<boolean> {
    const now = new Date()
    let metrics = this.usageMetrics.get(userId)

    if (!metrics) {
      metrics = {
        dailyRequests: 0,
        monthlyRequests: 0,
        lastRequestDate: new Date(0),
        monthStartDate: now
      }
    }

    // Reset counters if needed
    if (now.getMonth() !== metrics.monthStartDate.getMonth()) {
      metrics.monthlyRequests = 0
      metrics.monthStartDate = now
    }

    if (now.getDate() !== metrics.lastRequestDate.getDate()) {
      metrics.dailyRequests = 0
    }

    // Check limits
    if (metrics.dailyRequests >= this.config.maxDailyRequests ||
        metrics.monthlyRequests >= this.config.maxMonthlyRequests) {
      return false
    }

    // Update metrics
    metrics.dailyRequests++
    metrics.monthlyRequests++
    metrics.lastRequestDate = now
    this.usageMetrics.set(userId, metrics)

    return true
  }

  // Public methods
  public async analyzeHydration(
    userId: string,
    records: HydrationRecord[],
    goal: HydrationGoal
  ): Promise<HydrationInsight[]> {
    // Always perform basic analysis
    const basicInsights = this.analyzeBasicPatterns(records)

    // Check if advanced analysis is needed and allowed
    const needsAdvancedAnalysis = records.length >= this.config.complexAnalysisThreshold
    const canUseCloud = await this.trackUsage(userId)

    if (needsAdvancedAnalysis && canUseCloud) {
      const advancedInsights = await this.performCloudAnalysis(records)
      return [...basicInsights, ...advancedInsights]
    }

    return basicInsights
  }

  public getUsageMetrics(userId: string): AIUsageMetrics | undefined {
    return this.usageMetrics.get(userId)
  }

  public getConfig(): AIServiceConfig {
    return { ...this.config }
  }

  public updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }
}

export const optimizedHydrationAIService = OptimizedHydrationAIService.getInstance()
