import { type HydrationRecord, type HydrationGoal } from '../types/hydration'

export class HydrationService {
  private static instance: HydrationService
  private baseUrl = '/api/nutrition/hydration'

  private constructor() {}

  public static getInstance(): HydrationService {
    if (!HydrationService.instance) {
      HydrationService.instance = new HydrationService()
    }
    return HydrationService.instance
  }

  // Create a new hydration record
  async createRecord(data: Omit<HydrationRecord, 'id'>): Promise<HydrationRecord> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create hydration record')
    }

    return response.json()
  }

  // Get hydration records for a resident
  async getRecords(params: {
    residentId: string
    startDate?: Date
    endDate?: Date
  }): Promise<{
    records: HydrationRecord[]
    dailyTotals: Record<string, number>
    goal?: HydrationGoal
  }> {
    const searchParams = new URLSearchParams({
      residentId: params.residentId,
      ...(params.startDate && { startDate: params.startDate.toISOString() }),
      ...(params.endDate && { endDate: params.endDate.toISOString() }),
    })

    const response = await fetch(`${this.baseUrl}?${searchParams.toString()}`)

    if (!response.ok) {
      throw new Error('Failed to fetch hydration records')
    }

    return response.json()
  }

  // Update a hydration record
  async updateRecord(id: string, data: Partial<HydrationRecord>): Promise<HydrationRecord> {
    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, ...data }),
    })

    if (!response.ok) {
      throw new Error('Failed to update hydration record')
    }

    return response.json()
  }

  // Calculate daily statistics
  calculateDailyStats(records: HydrationRecord[], goal?: HydrationGoal) {
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = records.filter(
      (record) => record.timestamp.toISOString().split('T')[0] === today
    )

    const totalIntake = todayRecords.reduce((sum, record) => sum + record.amount, 0)
    const targetAmount = goal?.dailyTarget || 2000 // Default to 2000ml if no goal set

    return {
      totalIntake,
      targetAmount,
      percentageAchieved: (totalIntake / targetAmount) * 100,
      remainingAmount: Math.max(0, targetAmount - totalIntake),
      recordCount: todayRecords.length,
      lastIntake: todayRecords[0], // Most recent record
      isOnTrack: totalIntake >= (targetAmount * this.getExpectedProgressPercentage()),
    }
  }

  // Helper method to calculate expected progress based on time of day
  private getExpectedProgressPercentage(): number {
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const dayProgress = (hours * 60 + minutes) / (24 * 60)
    return Math.min(dayProgress, 1)
  }

  // Generate smart recommendations
  generateRecommendations(stats: ReturnType<typeof this.calculateDailyStats>): string[] {
    const recommendations: string[] = []

    if (stats.totalIntake < stats.targetAmount) {
      const remaining = stats.remainingAmount
      recommendations.push(
        `You need ${remaining}ml more to reach your daily goal.`
      )
    }

    if (!stats.isOnTrack) {
      recommendations.push(
        'You\'re slightly behind schedule. Consider having a drink now.'
      )
    }

    if (stats.lastIntake) {
      const lastIntakeTime = new Date(stats.lastIntake.timestamp)
      const hoursSinceLastDrink = (Date.now() - lastIntakeTime.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceLastDrink > 2) {
        recommendations.push(
          `It's been ${Math.floor(hoursSinceLastDrink)} hours since your last drink.`
        )
      }
    }

    return recommendations
  }
}

export const hydrationService = HydrationService.getInstance()
