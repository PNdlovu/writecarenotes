import { type HydrationRecord, type HydrationGoal } from '../types/hydration'

interface PatternInsight {
  type: 'PATTERN'
  title: string
  description: string
  confidence: number
  recommendation: string
  impact: 'HIGH' | 'MEDIUM' | 'LOW'
}

interface TrendInsight {
  type: 'TREND'
  title: string
  description: string
  trend: number
  prediction: string
  confidence: number
}

interface BehaviorInsight {
  type: 'BEHAVIOR'
  title: string
  description: string
  triggers: string[]
  suggestions: string[]
}

type AIInsight = PatternInsight | TrendInsight | BehaviorInsight

export class HydrationAIService {
  private static instance: HydrationAIService

  private constructor() {}

  public static getInstance(): HydrationAIService {
    if (!HydrationAIService.instance) {
      HydrationAIService.instance = new HydrationAIService()
    }
    return HydrationAIService.instance
  }

  // Analyze patterns in hydration behavior
  async analyzePatterns(records: HydrationRecord[]): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = []
    
    // Time-based patterns
    const timePatterns = this.analyzeTimePatterns(records)
    if (timePatterns) {
      insights.push({
        type: 'PATTERN',
        title: 'Optimal Hydration Times',
        description: `You tend to drink more water during ${timePatterns.join(', ')}`,
        confidence: 0.85,
        recommendation: 'Consider setting reminders during your less active periods',
        impact: 'MEDIUM'
      })
    }

    // Preference patterns
    const preferencePatterns = this.analyzeLiquidPreferences(records)
    insights.push({
      type: 'PATTERN',
      title: 'Liquid Preferences',
      description: preferencePatterns.description,
      confidence: 0.9,
      recommendation: preferencePatterns.recommendation,
      impact: 'HIGH'
    })

    return insights
  }

  // Predict future hydration needs
  async predictHydrationNeeds(
    records: HydrationRecord[],
    goal: HydrationGoal,
    weather?: { temperature: number; humidity: number }
  ): Promise<TrendInsight[]> {
    const insights: TrendInsight[] = []

    // Analyze weekly trends
    const weeklyTrend = this.calculateWeeklyTrend(records)
    insights.push({
      type: 'TREND',
      title: 'Weekly Hydration Trend',
      description: 'Based on your recent hydration patterns',
      trend: weeklyTrend,
      prediction: this.generateTrendPrediction(weeklyTrend),
      confidence: 0.88
    })

    // Weather-based predictions
    if (weather) {
      const weatherImpact = this.calculateWeatherImpact(weather)
      insights.push({
        type: 'TREND',
        title: 'Weather Impact',
        description: 'Predicted hydration needs based on weather',
        trend: weatherImpact,
        prediction: `Consider increasing intake by ${Math.round(weatherImpact * 100)}% due to weather conditions`,
        confidence: 0.92
      })
    }

    return insights
  }

  // Analyze behavior patterns
  async analyzeBehavior(records: HydrationRecord[]): Promise<BehaviorInsight[]> {
    return [{
      type: 'BEHAVIOR',
      title: 'Hydration Habits',
      description: 'Analysis of your hydration habits and potential improvements',
      triggers: this.identifyTriggers(records),
      suggestions: this.generateBehaviorSuggestions(records)
    }]
  }

  // Private helper methods
  private analyzeTimePatterns(records: HydrationRecord[]): string[] {
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

    return peakHours
  }

  private analyzeLiquidPreferences(records: HydrationRecord[]): {
    description: string
    recommendation: string
  } {
    const typeCounts = records.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sortedTypes = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([type]) => type)

    return {
      description: `Your preferred drinks are ${sortedTypes.slice(0, 2).join(' and ')}`,
      recommendation: 'Try incorporating more variety in your liquid intake for balanced hydration'
    }
  }

  private calculateWeeklyTrend(records: HydrationRecord[]): number {
    const dailyTotals = records.reduce((acc, record) => {
      const date = new Date(record.timestamp).toISOString().split('T')[0]
      acc[date] = (acc[date] || 0) + record.amount
      return acc
    }, {} as Record<string, number>)

    const totals = Object.values(dailyTotals)
    if (totals.length < 2) return 0

    const trend = (totals[totals.length - 1] - totals[0]) / totals[0]
    return trend
  }

  private generateTrendPrediction(trend: number): string {
    if (trend > 0.1) {
      return 'Your hydration habits are improving! Keep up the good work!'
    } else if (trend < -0.1) {
      return 'Your hydration intake has been decreasing. Consider setting reminders.'
    }
    return 'Your hydration habits are stable. Try to maintain this consistency.'
  }

  private calculateWeatherImpact(weather: { temperature: number; humidity: number }): number {
    // Basic formula for additional hydration needs based on temperature and humidity
    const temperatureImpact = Math.max(0, (weather.temperature - 20) * 0.02)
    const humidityImpact = Math.max(0, (weather.humidity - 50) * 0.01)
    return temperatureImpact + humidityImpact
  }

  private identifyTriggers(records: HydrationRecord[]): string[] {
    const triggers: string[] = []
    
    // Analyze meal-time correlation
    const mealTimeRecords = records.filter(r => {
      const hour = new Date(r.timestamp).getHours()
      return [8, 12, 18].includes(hour)
    })

    if (mealTimeRecords.length > records.length * 0.4) {
      triggers.push('Meal times are your primary hydration triggers')
    }

    // Analyze activity correlation
    if (records.some(r => r.notes?.toLowerCase().includes('exercise'))) {
      triggers.push('Physical activity')
    }

    return triggers
  }

  private generateBehaviorSuggestions(records: HydrationRecord[]): string[] {
    const suggestions: string[] = []
    
    // Analyze consistency
    const hourGaps = this.calculateHourGaps(records)
    if (hourGaps.some(gap => gap > 3)) {
      suggestions.push('Try to maintain more consistent hydration throughout the day')
    }

    // Analyze variety
    const uniqueTypes = new Set(records.map(r => r.type)).size
    if (uniqueTypes < 3) {
      suggestions.push('Consider incorporating more variety in your liquid choices')
    }

    return suggestions
  }

  private calculateHourGaps(records: HydrationRecord[]): number[] {
    const sortedRecords = [...records].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )

    return sortedRecords.slice(1).map((record, i) => {
      const current = new Date(record.timestamp).getTime()
      const previous = new Date(sortedRecords[i].timestamp).getTime()
      return (current - previous) / (1000 * 60 * 60)
    })
  }
}

export const hydrationAIService = HydrationAIService.getInstance()
