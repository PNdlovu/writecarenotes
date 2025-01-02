import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface OrganizationMetrics {
  totalCareHomes: number
  totalResidents: number
  totalStaff: number
  averageOccupancy: number
  complianceScore: number
}

export interface CareHomeMetricsSummary {
  careHomeId: string
  careHomeName: string
  metrics: {
    residents: number
    staff: number
    occupancy: number
    compliance: number
  }
}

export class OrganizationAnalyticsRepository {
  async getOrganizationMetrics(organizationId: string): Promise<OrganizationMetrics> {
    const [
      careHomes,
      residents,
      staff,
      occupancyData,
      complianceData,
    ] = await Promise.all([
      prisma.careHome.count({
        where: { organizationId },
      }),
      prisma.resident.count({
        where: { careHome: { organizationId } },
      }),
      prisma.staff.count({
        where: { careHome: { organizationId } },
      }),
      prisma.careHome.findMany({
        where: { organizationId },
        select: {
          currentOccupancy: true,
          capacity: true,
        },
      }),
      prisma.compliance.findMany({
        where: { careHome: { organizationId } },
        select: {
          score: true,
        },
      }),
    ])

    const averageOccupancy = occupancyData.reduce((acc, curr) => {
      return acc + (curr.currentOccupancy / curr.capacity) * 100
    }, 0) / occupancyData.length

    const averageCompliance = complianceData.reduce((acc, curr) => {
      return acc + curr.score
    }, 0) / complianceData.length

    return {
      totalCareHomes: careHomes,
      totalResidents: residents,
      totalStaff: staff,
      averageOccupancy,
      complianceScore: averageCompliance,
    }
  }

  async getCareHomeMetrics(organizationId: string): Promise<CareHomeMetricsSummary[]> {
    const careHomes = await prisma.careHome.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        currentOccupancy: true,
        capacity: true,
        _count: {
          select: {
            residents: true,
            staff: true,
          },
        },
        compliance: {
          select: {
            score: true,
          },
        },
      },
    })

    return careHomes.map(ch => ({
      careHomeId: ch.id,
      careHomeName: ch.name,
      metrics: {
        residents: ch._count.residents,
        staff: ch._count.staff,
        occupancy: (ch.currentOccupancy / ch.capacity) * 100,
        compliance: ch.compliance?.score ?? 0,
      },
    }))
  }

  async getHistoricalMetrics(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    date: Date
    metrics: OrganizationMetrics
  }[]> {
    const metrics = await prisma.organizationMetricsSnapshot.findMany({
      where: {
        organizationId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return metrics.map(m => ({
      date: m.date,
      metrics: m.metrics as unknown as OrganizationMetrics,
    }))
  }

  async saveMetricsSnapshot(
    organizationId: string,
    metrics: OrganizationMetrics
  ): Promise<void> {
    await prisma.organizationMetricsSnapshot.create({
      data: {
        organizationId,
        date: new Date(),
        metrics: metrics as unknown as Prisma.JsonObject,
      },
    })
  }

  async getComplianceBreakdown(organizationId: string): Promise<{
    categoryScores: Record<string, number>
    riskAreas: { name: string; count: number }[]
    trendsLastMonth: {
      improvement: number
      decline: number
      unchanged: number
    }
  }> {
    // Get all compliance records for the organization's care homes
    const complianceRecords = await prisma.compliance.findMany({
      where: { careHome: { organizationId } },
      include: {
        categories: true,
        risks: true,
        history: {
          where: {
            date: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        },
      },
    })

    // Calculate category scores
    const categoryScores: Record<string, number> = {}
    complianceRecords.forEach(record => {
      record.categories.forEach(category => {
        if (!categoryScores[category.name]) {
          categoryScores[category.name] = 0
        }
        categoryScores[category.name] += category.score
      })
    })

    // Calculate risk areas
    const riskAreas = Object.entries(
      complianceRecords.reduce((acc, record) => {
        record.risks.forEach(risk => {
          if (!acc[risk.name]) {
            acc[risk.name] = 0
          }
          acc[risk.name]++
        })
        return acc
      }, {} as Record<string, number>)
    ).map(([name, count]) => ({ name, count }))

    // Calculate trends
    const trends = {
      improvement: 0,
      decline: 0,
      unchanged: 0,
    }

    complianceRecords.forEach(record => {
      const historySorted = record.history.sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      )
      
      if (historySorted.length >= 2) {
        const diff = historySorted[0].score - historySorted[historySorted.length - 1].score
        if (diff > 0) trends.improvement++
        else if (diff < 0) trends.decline++
        else trends.unchanged++
      }
    })

    return {
      categoryScores,
      riskAreas,
      trendsLastMonth: trends,
    }
  }
}


