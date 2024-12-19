import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/cache'
import { UserContext } from '@/types/context'
import { BedOccupancyStats, BedMaintenanceStats, BedTransferStats } from '../types/bed.types'

export class BedAnalyticsService {
  private static instance: BedAnalyticsService
  private constructor() {}

  public static getInstance(): BedAnalyticsService {
    if (!BedAnalyticsService.instance) {
      BedAnalyticsService.instance = new BedAnalyticsService()
    }
    return BedAnalyticsService.instance
  }

  async getOccupancyStats(
    startDate: Date,
    endDate: Date,
    context: UserContext
  ): Promise<BedOccupancyStats> {
    const cacheKey = `occupancy-stats-${context.careHomeId}-${startDate.toISOString()}-${endDate.toISOString()}`
    const cached = await cache.get(cacheKey)
    if (cached) return JSON.parse(cached)

    const occupancyData = await prisma.bedAssignment.groupBy({
      by: ['status', 'careLevel'],
      where: {
        careHomeId: context.careHomeId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    })

    const waitlistData = await prisma.waitlistEntry.groupBy({
      by: ['priority', 'careLevel'],
      where: {
        careHomeId: context.careHomeId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: true
    })

    const stats: BedOccupancyStats = {
      totalBeds: await this.getTotalBeds(context),
      occupiedBeds: occupancyData.reduce((acc, curr) => 
        curr.status === 'OCCUPIED' ? acc + curr._count : acc, 0),
      occupancyRate: 0,
      averageWaitTime: await this.calculateAverageWaitTime(context),
      byPriority: this.groupByPriority(waitlistData),
      byCareLevel: this.groupByCareLevel(occupancyData)
    }

    stats.occupancyRate = (stats.occupiedBeds / stats.totalBeds) * 100

    await cache.set(cacheKey, JSON.stringify(stats), 3600) // Cache for 1 hour
    return stats
  }

  async getMaintenanceStats(
    startDate: Date,
    endDate: Date,
    context: UserContext
  ): Promise<BedMaintenanceStats> {
    const maintenanceData = await prisma.bedMaintenance.findMany({
      where: {
        careHomeId: context.careHomeId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        bed: true
      }
    })

    return {
      totalMaintenanceRequests: maintenanceData.length,
      completedMaintenance: maintenanceData.filter(m => m.status === 'COMPLETED').length,
      averageCompletionTime: this.calculateAverageCompletionTime(maintenanceData),
      byType: this.groupMaintenanceByType(maintenanceData),
      overdueCount: maintenanceData.filter(m => 
        m.status !== 'COMPLETED' && m.nextDue < new Date()
      ).length
    }
  }

  async getTransferStats(
    startDate: Date,
    endDate: Date,
    context: UserContext
  ): Promise<BedTransferStats> {
    const transferData = await prisma.bedTransfer.findMany({
      where: {
        careHomeId: context.careHomeId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    return {
      totalTransfers: transferData.length,
      completedTransfers: transferData.filter(t => t.status === 'COMPLETED').length,
      averageProcessingTime: this.calculateAverageTransferTime(transferData),
      byReason: this.groupTransfersByReason(transferData),
      rejectionRate: this.calculateRejectionRate(transferData)
    }
  }

  private async getTotalBeds(context: UserContext): Promise<number> {
    return await prisma.bed.count({
      where: { careHomeId: context.careHomeId }
    })
  }

  private async calculateAverageWaitTime(context: UserContext): Promise<number> {
    const completedWaitlist = await prisma.waitlistEntry.findMany({
      where: {
        careHomeId: context.careHomeId,
        status: 'COMPLETED'
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    })

    if (completedWaitlist.length === 0) return 0

    const totalWaitTime = completedWaitlist.reduce((acc, entry) => {
      const waitTime = entry.completedAt!.getTime() - entry.createdAt.getTime()
      return acc + waitTime
    }, 0)

    return totalWaitTime / completedWaitlist.length / (1000 * 60 * 60 * 24) // Convert to days
  }

  private calculateAverageCompletionTime(maintenanceData: any[]): number {
    const completed = maintenanceData.filter(m => m.status === 'COMPLETED')
    if (completed.length === 0) return 0

    const totalTime = completed.reduce((acc, m) => {
      const completionTime = m.completedAt.getTime() - m.createdAt.getTime()
      return acc + completionTime
    }, 0)

    return totalTime / completed.length / (1000 * 60 * 60) // Convert to hours
  }

  private calculateAverageTransferTime(transferData: any[]): number {
    const completed = transferData.filter(t => t.status === 'COMPLETED')
    if (completed.length === 0) return 0

    const totalTime = completed.reduce((acc, t) => {
      const processingTime = t.completedAt.getTime() - t.createdAt.getTime()
      return acc + processingTime
    }, 0)

    return totalTime / completed.length / (1000 * 60 * 60) // Convert to hours
  }

  private groupByPriority(data: any[]): Record<string, number> {
    return data.reduce((acc, curr) => ({
      ...acc,
      [curr.priority]: curr._count
    }), {})
  }

  private groupByCareLevel(data: any[]): Record<string, number> {
    return data.reduce((acc, curr) => ({
      ...acc,
      [curr.careLevel]: curr._count
    }), {})
  }

  private groupMaintenanceByType(data: any[]): Record<string, number> {
    return data.reduce((acc, curr) => ({
      ...acc,
      [curr.type]: (acc[curr.type] || 0) + 1
    }), {})
  }

  private groupTransfersByReason(data: any[]): Record<string, number> {
    return data.reduce((acc, curr) => ({
      ...acc,
      [curr.reason]: (acc[curr.reason] || 0) + 1
    }), {})
  }

  private calculateRejectionRate(data: any[]): number {
    if (data.length === 0) return 0
    const rejectedCount = data.filter(t => t.status === 'REJECTED').length
    return (rejectedCount / data.length) * 100
  }
}


