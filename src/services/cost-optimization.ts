import { ApplicationInsightsClient } from '@azure/applicationinsights'
import { DefaultAzureCredential } from '@azure/identity'
import { azureConfigService } from './azure-config'

interface CostMetrics {
  tokenUsage: {
    daily: number
    monthly: number
    perUser: Record<string, number>
  }
  apiCalls: {
    daily: number
    monthly: number
    perEndpoint: Record<string, number>
  }
  costs: {
    estimated: number
    breakdown: Record<string, number>
  }
}

interface OptimizationRule {
  type: 'TOKEN_LIMIT' | 'API_LIMIT' | 'COST_LIMIT'
  threshold: number
  action: 'REDUCE_QUALITY' | 'DISABLE_FEATURE' | 'NOTIFY_ADMIN'
}

export class CostOptimizationService {
  private static instance: CostOptimizationService
  private insights: ApplicationInsightsClient
  private metrics: CostMetrics
  private rules: OptimizationRule[]
  private lastReset: Date

  private constructor() {
    const credential = new DefaultAzureCredential()
    this.insights = new ApplicationInsightsClient(credential, process.env.APPLICATIONINSIGHTS_CONNECTION_STRING!)
    
    this.metrics = {
      tokenUsage: { daily: 0, monthly: 0, perUser: {} },
      apiCalls: { daily: 0, monthly: 0, perEndpoint: {} },
      costs: { estimated: 0, breakdown: {} }
    }

    this.rules = [
      {
        type: 'TOKEN_LIMIT',
        threshold: 0.8, // 80% of daily limit
        action: 'REDUCE_QUALITY'
      },
      {
        type: 'API_LIMIT',
        threshold: 0.9, // 90% of daily limit
        action: 'DISABLE_FEATURE'
      },
      {
        type: 'COST_LIMIT',
        threshold: 100, // $100 per day
        action: 'NOTIFY_ADMIN'
      }
    ]

    this.lastReset = new Date()
    this.setupDailyReset()
  }

  public static getInstance(): CostOptimizationService {
    if (!CostOptimizationService.instance) {
      CostOptimizationService.instance = new CostOptimizationService()
    }
    return CostOptimizationService.instance
  }

  private setupDailyReset(): void {
    setInterval(() => {
      const now = new Date()
      if (now.getDate() !== this.lastReset.getDate()) {
        this.resetDailyMetrics()
        this.lastReset = now
      }
    }, 60 * 60 * 1000) // Check every hour
  }

  private resetDailyMetrics(): void {
    this.metrics.tokenUsage.daily = 0
    this.metrics.apiCalls.daily = 0
    this.metrics.costs.estimated = 0
    
    // Log daily totals to Application Insights
    this.logMetrics('DAILY_RESET', this.metrics)
  }

  private async logMetrics(type: string, data: any): Promise<void> {
    await this.insights.trackMetric({
      name: `CostOptimization_${type}`,
      value: 1,
      properties: data
    })
  }

  public async trackTokenUsage(
    userId: string,
    tokens: number,
    endpoint: string
  ): Promise<boolean> {
    const config = await azureConfigService.getConfig()
    
    // Update metrics
    this.metrics.tokenUsage.daily += tokens
    this.metrics.tokenUsage.monthly += tokens
    this.metrics.tokenUsage.perUser[userId] = 
      (this.metrics.tokenUsage.perUser[userId] || 0) + tokens
    
    // Calculate costs
    const tokenCost = tokens * 0.00002 // $0.02 per 1000 tokens
    this.metrics.costs.estimated += tokenCost
    this.metrics.costs.breakdown[endpoint] = 
      (this.metrics.costs.breakdown[endpoint] || 0) + tokenCost

    // Check limits
    const dailyLimit = config.costManagement.maxDailyTokens
    if (this.metrics.tokenUsage.daily >= dailyLimit) {
      await this.handleLimitExceeded('TOKEN_LIMIT', userId)
      return false
    }

    // Log usage
    await this.logMetrics('TOKEN_USAGE', {
      userId,
      tokens,
      endpoint,
      daily: this.metrics.tokenUsage.daily,
      cost: tokenCost
    })

    return true
  }

  public async trackAPICall(
    userId: string,
    endpoint: string,
    cost: number
  ): Promise<boolean> {
    const config = await azureConfigService.getConfig()
    
    // Update metrics
    this.metrics.apiCalls.daily++
    this.metrics.apiCalls.monthly++
    this.metrics.apiCalls.perEndpoint[endpoint] = 
      (this.metrics.apiCalls.perEndpoint[endpoint] || 0) + 1
    
    // Update costs
    this.metrics.costs.estimated += cost
    this.metrics.costs.breakdown[endpoint] = 
      (this.metrics.costs.breakdown[endpoint] || 0) + cost

    // Check limits
    const dailyLimit = config.costManagement.maxDailyAPICalls
    if (this.metrics.apiCalls.daily >= dailyLimit) {
      await this.handleLimitExceeded('API_LIMIT', userId)
      return false
    }

    // Log usage
    await this.logMetrics('API_CALL', {
      userId,
      endpoint,
      cost,
      daily: this.metrics.apiCalls.daily
    })

    return true
  }

  private async handleLimitExceeded(
    limitType: OptimizationRule['type'],
    userId: string
  ): Promise<void> {
    const rule = this.rules.find(r => r.type === limitType)
    if (!rule) return

    switch (rule.action) {
      case 'REDUCE_QUALITY':
        await azureConfigService.getFeatureFlag('useAdvancedAI')
          .then(flag => {
            if (flag) {
              // Temporarily disable advanced features
              this.insights.trackEvent({
                name: 'CostOptimization_QualityReduced',
                properties: { userId, limitType }
              })
            }
          })
        break

      case 'DISABLE_FEATURE':
        // Disable the expensive feature
        await this.insights.trackEvent({
          name: 'CostOptimization_FeatureDisabled',
          properties: { userId, limitType }
        })
        break

      case 'NOTIFY_ADMIN':
        // Send notification to admin
        await this.insights.trackEvent({
          name: 'CostOptimization_AdminNotification',
          properties: {
            userId,
            limitType,
            metrics: this.metrics
          }
        })
        break
    }
  }

  public async getOptimizationSuggestions(): Promise<string[]> {
    const suggestions: string[] = []
    const config = await azureConfigService.getConfig()

    // Token usage optimization
    const avgTokensPerUser = Object.values(this.metrics.tokenUsage.perUser)
      .reduce((a, b) => a + b, 0) / Object.keys(this.metrics.tokenUsage.perUser).length

    if (avgTokensPerUser > config.costManagement.maxDailyTokens * 0.5) {
      suggestions.push('Consider implementing token caching for frequent queries')
    }

    // API call optimization
    const highUsageEndpoints = Object.entries(this.metrics.apiCalls.perEndpoint)
      .filter(([, calls]) => calls > config.costManagement.maxDailyAPICalls * 0.3)
      .map(([endpoint]) => endpoint)

    if (highUsageEndpoints.length > 0) {
      suggestions.push(`Implement response caching for high-usage endpoints: ${highUsageEndpoints.join(', ')}`)
    }

    // Cost optimization
    const expensiveEndpoints = Object.entries(this.metrics.costs.breakdown)
      .filter(([, cost]) => cost > this.metrics.costs.estimated * 0.2)
      .map(([endpoint]) => endpoint)

    if (expensiveEndpoints.length > 0) {
      suggestions.push(`Review usage patterns for expensive endpoints: ${expensiveEndpoints.join(', ')}`)
    }

    return suggestions
  }

  public getMetrics(): CostMetrics {
    return { ...this.metrics }
  }

  public async generateCostReport(): Promise<any> {
    const config = await azureConfigService.getConfig()
    const suggestions = await this.getOptimizationSuggestions()

    return {
      metrics: this.metrics,
      limits: {
        tokenUsage: {
          daily: config.costManagement.maxDailyTokens,
          used: this.metrics.tokenUsage.daily,
          percentage: (this.metrics.tokenUsage.daily / config.costManagement.maxDailyTokens) * 100
        },
        apiCalls: {
          daily: config.costManagement.maxDailyAPICalls,
          used: this.metrics.apiCalls.daily,
          percentage: (this.metrics.apiCalls.daily / config.costManagement.maxDailyAPICalls) * 100
        }
      },
      costs: {
        total: this.metrics.costs.estimated,
        breakdown: this.metrics.costs.breakdown,
        projected: this.metrics.costs.estimated * 30 // Monthly projection
      },
      optimization: {
        suggestions,
        potentialSavings: this.calculatePotentialSavings()
      }
    }
  }

  private calculatePotentialSavings(): number {
    const totalCost = this.metrics.costs.estimated
    const potentialSavings = Object.entries(this.metrics.costs.breakdown)
      .reduce((savings, [endpoint, cost]) => {
        // Estimate potential savings based on caching and optimization
        const cachePotential = cost * 0.3 // 30% savings from caching
        const optimizationPotential = cost * 0.2 // 20% from optimization
        return savings + cachePotential + optimizationPotential
      }, 0)

    return potentialSavings
  }
}

export const costOptimizationService = CostOptimizationService.getInstance()
