import { AzureKeyCredential, OpenAIClient } from '@azure/openai'
import { CognitiveServicesCredentials } from '@azure/ms-rest-azure-js'
import { TextAnalyticsClient } from '@azure/ai-text-analytics'
import { type HydrationRecord, type HydrationGoal } from '../types/hydration'

interface AzureAIConfig {
  openAI: {
    endpoint: string
    apiKey: string
    deploymentName: string
    maxTokens: number
  }
  cognitive: {
    endpoint: string
    apiKey: string
    maxBatchSize: number
  }
  costManagement: {
    maxDailyTokens: number
    maxMonthlyTokens: number
    maxDailyAPICalls: number
  }
}

interface UsageMetrics {
  tokensUsed: number
  apiCalls: number
  lastReset: Date
}

export class AzureAIService {
  private static instance: AzureAIService
  private openAIClient: OpenAIClient
  private textAnalyticsClient: TextAnalyticsClient
  private usageMetrics: Map<string, UsageMetrics>
  private config: AzureAIConfig

  private constructor() {
    this.config = {
      openAI: {
        endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
        apiKey: process.env.AZURE_OPENAI_API_KEY!,
        deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT!,
        maxTokens: 1000
      },
      cognitive: {
        endpoint: process.env.AZURE_COGNITIVE_ENDPOINT!,
        apiKey: process.env.AZURE_COGNITIVE_API_KEY!,
        maxBatchSize: 25
      },
      costManagement: {
        maxDailyTokens: 10000,
        maxMonthlyTokens: 100000,
        maxDailyAPICalls: 1000
      }
    }

    this.openAIClient = new OpenAIClient(
      this.config.openAI.endpoint,
      new AzureKeyCredential(this.config.openAI.apiKey)
    )

    this.textAnalyticsClient = new TextAnalyticsClient(
      this.config.cognitive.endpoint,
      new AzureKeyCredential(this.config.cognitive.apiKey)
    )

    this.usageMetrics = new Map()
  }

  public static getInstance(): AzureAIService {
    if (!AzureAIService.instance) {
      AzureAIService.instance = new AzureAIService()
    }
    return AzureAIService.instance
  }

  private async checkUsageLimits(userId: string): Promise<boolean> {
    let metrics = this.usageMetrics.get(userId)
    const now = new Date()

    if (!metrics || this.shouldResetMetrics(metrics.lastReset)) {
      metrics = {
        tokensUsed: 0,
        apiCalls: 0,
        lastReset: now
      }
      this.usageMetrics.set(userId, metrics)
    }

    return metrics.tokensUsed < this.config.costManagement.maxDailyTokens &&
           metrics.apiCalls < this.config.costManagement.maxDailyAPICalls
  }

  private shouldResetMetrics(lastReset: Date): boolean {
    const now = new Date()
    return now.getDate() !== lastReset.getDate() ||
           now.getMonth() !== lastReset.getMonth()
  }

  private updateMetrics(userId: string, tokens: number): void {
    const metrics = this.usageMetrics.get(userId)
    if (metrics) {
      metrics.tokensUsed += tokens
      metrics.apiCalls += 1
      this.usageMetrics.set(userId, metrics)
    }
  }

  private async analyzeHydrationPatterns(records: HydrationRecord[]): Promise<string> {
    const prompt = `Analyze the following hydration records and provide insights:
      ${JSON.stringify(records.slice(-50))}
      Focus on:
      1. Time patterns
      2. Amount consistency
      3. Types of liquids
      4. Potential improvements
      Format the response as a concise JSON object.`

    const response = await this.openAIClient.getCompletions(
      this.config.openAI.deploymentName,
      [prompt],
      { maxTokens: this.config.openAI.maxTokens }
    )

    return response.choices[0].text
  }

  private async analyzeSentiment(notes: string[]): Promise<any> {
    const batchedNotes = notes.filter(Boolean).slice(0, this.config.cognitive.maxBatchSize)
    if (batchedNotes.length === 0) return null

    const results = await this.textAnalyticsClient.analyzeSentiment(batchedNotes)
    return Array.from(results).map(result => ({
      sentiment: result.sentiment,
      confidence: result.confidenceScores
    }))
  }

  public async generateHydrationInsights(
    userId: string,
    records: HydrationRecord[],
    goal: HydrationGoal
  ): Promise<any> {
    if (!(await this.checkUsageLimits(userId))) {
      return this.generateBasicInsights(records, goal)
    }

    try {
      const [patternAnalysis, sentimentAnalysis] = await Promise.all([
        this.analyzeHydrationPatterns(records),
        this.analyzeSentiment(records.map(r => r.notes).filter(Boolean))
      ])

      // Estimate token usage (rough estimate)
      const estimatedTokens = JSON.stringify(records).length / 4
      this.updateMetrics(userId, estimatedTokens)

      return {
        patterns: JSON.parse(patternAnalysis),
        sentiment: sentimentAnalysis,
        goal: {
          progress: this.calculateGoalProgress(records, goal),
          recommendations: this.generateRecommendations(records, goal)
        }
      }
    } catch (error) {
      console.error('Azure AI Service Error:', error)
      return this.generateBasicInsights(records, goal)
    }
  }

  private generateBasicInsights(
    records: HydrationRecord[],
    goal: HydrationGoal
  ) {
    const dailyTotals = this.calculateDailyTotals(records)
    const averageIntake = this.calculateAverageIntake(dailyTotals)
    const consistency = this.calculateConsistency(dailyTotals)

    return {
      patterns: {
        averageIntake,
        consistency,
        goalProgress: (averageIntake / goal.dailyTarget) * 100,
        trend: this.calculateTrend(dailyTotals)
      },
      recommendations: [
        averageIntake < goal.dailyTarget
          ? 'Try to increase your daily intake to reach your goal'
          : 'Great job maintaining your hydration goal!',
        consistency < 0.7
          ? 'Work on maintaining more consistent hydration throughout the day'
          : 'You\'re maintaining good hydration consistency'
      ]
    }
  }

  private calculateDailyTotals(records: HydrationRecord[]): Map<string, number> {
    const totals = new Map<string, number>()
    records.forEach(record => {
      const date = new Date(record.timestamp).toISOString().split('T')[0]
      totals.set(date, (totals.get(date) || 0) + record.amount)
    })
    return totals
  }

  private calculateAverageIntake(dailyTotals: Map<string, number>): number {
    const values = Array.from(dailyTotals.values())
    return values.reduce((a, b) => a + b, 0) / values.length
  }

  private calculateConsistency(dailyTotals: Map<string, number>): number {
    const values = Array.from(dailyTotals.values())
    if (values.length < 2) return 1

    const mean = this.calculateAverageIntake(dailyTotals)
    const variance = values.reduce((acc, val) => 
      acc + Math.pow(val - mean, 2), 0) / values.length
    
    return Math.max(0, 1 - Math.sqrt(variance) / mean)
  }

  private calculateTrend(dailyTotals: Map<string, number>): number {
    const values = Array.from(dailyTotals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, value]) => value)

    if (values.length < 2) return 0

    const firstWeek = values.slice(0, 7).reduce((a, b) => a + b, 0) / 7
    const lastWeek = values.slice(-7).reduce((a, b) => a + b, 0) / 7

    return ((lastWeek - firstWeek) / firstWeek) * 100
  }

  private calculateGoalProgress(
    records: HydrationRecord[],
    goal: HydrationGoal
  ): number {
    const today = new Date().toISOString().split('T')[0]
    const todayTotal = records
      .filter(r => r.timestamp.split('T')[0] === today)
      .reduce((sum, r) => sum + r.amount, 0)

    return (todayTotal / goal.dailyTarget) * 100
  }

  private generateRecommendations(
    records: HydrationRecord[],
    goal: HydrationGoal
  ): string[] {
    const recommendations: string[] = []
    const todayProgress = this.calculateGoalProgress(records, goal)

    if (todayProgress < 100) {
      recommendations.push(
        `You need ${Math.round(goal.dailyTarget - (todayProgress / 100 * goal.dailyTarget))}ml more to reach your daily goal`
      )
    }

    const timeGaps = this.analyzeTimeGaps(records)
    if (timeGaps.length > 0) {
      recommendations.push(
        `Consider drinking water during: ${timeGaps.join(', ')}`
      )
    }

    return recommendations
  }

  private analyzeTimeGaps(records: HydrationRecord[]): string[] {
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = records
      .filter(r => r.timestamp.split('T')[0] === today)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    const gaps: string[] = []
    const hours = new Array(24).fill(0)

    todayRecords.forEach(record => {
      const hour = new Date(record.timestamp).getHours()
      hours[hour]++
    })

    // Find gaps of 3 or more hours
    let gapStart = -1
    for (let i = 6; i < 22; i++) { // Only consider 6 AM to 10 PM
      if (hours[i] === 0) {
        if (gapStart === -1) gapStart = i
      } else if (gapStart !== -1) {
        if (i - gapStart >= 3) {
          gaps.push(`${gapStart % 12 || 12}${gapStart < 12 ? 'AM' : 'PM'}-${i % 12 || 12}${i < 12 ? 'AM' : 'PM'}`)
        }
        gapStart = -1
      }
    }

    return gaps
  }

  public getUsageMetrics(userId: string): UsageMetrics | undefined {
    return this.usageMetrics.get(userId)
  }

  public getConfig(): Readonly<AzureAIConfig> {
    return { ...this.config }
  }
}

export const azureAIService = AzureAIService.getInstance()
