import { prisma } from '@/lib/prisma'
import { LiquidType, LiquidIntake } from '@prisma/client'

interface LiquidIntakeData {
  residentId: string
  type: LiquidType
  amount: number
  timestamp: Date
  notes?: string
}

interface DailyIntakeStats {
  total: number
  byType: {
    [key in LiquidType]?: number
  }
  progress: number
  remainingTarget: number
}

export class LiquidIntakeService {
  private static instance: LiquidIntakeService

  private constructor() {}

  public static getInstance(): LiquidIntakeService {
    if (!LiquidIntakeService.instance) {
      LiquidIntakeService.instance = new LiquidIntakeService()
    }
    return LiquidIntakeService.instance
  }

  // Core CRUD Operations
  async recordIntake(data: LiquidIntakeData): Promise<LiquidIntake> {
    return prisma.liquidIntake.create({
      data: {
        residentId: data.residentId,
        type: data.type,
        amount: data.amount,
        timestamp: data.timestamp,
        notes: data.notes
      }
    })
  }

  async batchRecordIntake(data: LiquidIntakeData[]): Promise<LiquidIntake[]> {
    return prisma.$transaction(
      data.map(intake =>
        prisma.liquidIntake.create({
          data: {
            residentId: intake.residentId,
            type: intake.type,
            amount: intake.amount,
            timestamp: intake.timestamp,
            notes: intake.notes
          }
        })
      )
    )
  }

  async updateIntake(
    id: string,
    data: Partial<LiquidIntakeData>
  ): Promise<LiquidIntake> {
    return prisma.liquidIntake.update({
      where: { id },
      data
    })
  }

  async deleteIntake(id: string): Promise<void> {
    await prisma.liquidIntake.delete({
      where: { id }
    })
  }

  // Analysis and Reporting
  async getDailyIntakeStats(
    residentId: string,
    date: Date
  ): Promise<DailyIntakeStats> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const intakes = await prisma.liquidIntake.findMany({
      where: {
        residentId,
        timestamp: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    })

    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
      include: { hydrationGoal: true }
    })

    const dailyTarget = resident?.hydrationGoal?.dailyTarget || 2000 // Default 2L if no goal set

    const byType: { [key in LiquidType]?: number } = {}
    let total = 0

    intakes.forEach(intake => {
      byType[intake.type] = (byType[intake.type] || 0) + intake.amount
      total += intake.amount
    })

    return {
      total,
      byType,
      progress: (total / dailyTarget) * 100,
      remainingTarget: Math.max(0, dailyTarget - total)
    }
  }

  async getWeeklyIntakeReport(
    residentId: string,
    startDate: Date
  ): Promise<{
    dailyStats: DailyIntakeStats[]
    weeklyAverage: number
    trends: {
      [key in LiquidType]?: number[]
    }
  }> {
    const dailyStats: DailyIntakeStats[] = []
    const trends: { [key in LiquidType]?: number[] } = {}

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const stats = await this.getDailyIntakeStats(residentId, date)
      dailyStats.push(stats)

      Object.entries(stats.byType).forEach(([type, amount]) => {
        if (!trends[type as LiquidType]) {
          trends[type as LiquidType] = []
        }
        trends[type as LiquidType]?.push(amount)
      })
    }

    const weeklyAverage =
      dailyStats.reduce((sum, day) => sum + day.total, 0) / 7

    return {
      dailyStats,
      weeklyAverage,
      trends
    }
  }

  // Export Functionality
  async exportIntakeData(
    residentId: string,
    startDate: Date,
    endDate: Date,
    format: 'CSV' | 'JSON' | 'PDF'
  ): Promise<string> {
    const intakes = await prisma.liquidIntake.findMany({
      where: {
        residentId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    switch (format) {
      case 'CSV':
        return this.generateCSV(intakes)
      case 'JSON':
        return JSON.stringify(intakes, null, 2)
      case 'PDF':
        return this.generatePDF(intakes)
      default:
        throw new Error('Unsupported export format')
    }
  }

  // Advanced Filtering
  async filterIntakes(params: {
    residentId: string
    startDate?: Date
    endDate?: Date
    types?: LiquidType[]
    minAmount?: number
    maxAmount?: number
    sortBy?: 'amount' | 'timestamp'
    sortOrder?: 'asc' | 'desc'
  }): Promise<LiquidIntake[]> {
    return prisma.liquidIntake.findMany({
      where: {
        residentId: params.residentId,
        timestamp: {
          gte: params.startDate,
          lte: params.endDate
        },
        type: params.types?.length
          ? { in: params.types }
          : undefined,
        amount: {
          gte: params.minAmount,
          lte: params.maxAmount
        }
      },
      orderBy: params.sortBy
        ? { [params.sortBy]: params.sortOrder || 'desc' }
        : undefined
    })
  }

  // Utility Methods
  private generateCSV(intakes: LiquidIntake[]): string {
    const headers = ['Date', 'Time', 'Type', 'Amount (ml)', 'Notes']
    const rows = intakes.map(intake => [
      intake.timestamp.toLocaleDateString(),
      intake.timestamp.toLocaleTimeString(),
      intake.type,
      intake.amount.toString(),
      intake.notes || ''
    ])

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
  }

  private generatePDF(intakes: LiquidIntake[]): string {
    // Implementation would use a PDF library like PDFKit
    // This is a placeholder returning a base64 string
    return 'PDF_CONTENT_BASE64'
  }
}

export const liquidIntakeService = LiquidIntakeService.getInstance()
