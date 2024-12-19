import { getSystemMetrics } from './monitoring'
import { getFacilityCosts } from './analytics'
import { getOptimizationRules } from './optimization'
import { TableClient } from '@azure/data-tables'
import { env } from '@/env.mjs'

const metricsTable = TableClient.fromConnectionString(
  env.AZURE_STORAGE_CONNECTION_STRING,
  'smsmetrics'
)

interface DashboardMetrics {
  overview: {
    totalMessages: number
    deliveryRate: number
    totalCost: number
    activeAlerts: number
  }
  trends: {
    hourly: MetricPoint[]
    daily: MetricPoint[]
    monthly: MetricPoint[]
  }
  performance: {
    responseTime: number
    queueLength: number
    processingRate: number
    errorRate: number
  }
  costs: {
    current: CostBreakdown
    projected: CostBreakdown
    savings: CostSavings
  }
  compliance: {
    gdprStatus: boolean
    dataRetention: boolean
    encryptionStatus: boolean
    auditStatus: boolean
  }
}

interface MetricPoint {
  timestamp: Date
  value: number
  category?: string
}

interface CostBreakdown {
  total: number
  byCategory: Record<string, number>
  byFacility: Record<string, number>
  byTemplate: Record<string, number>
}

interface CostSavings {
  total: number
  optimization: number
  batching: number
  timing: number
}

export async function getDashboardMetrics(
  facilityId?: string,
  timespan: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<DashboardMetrics> {
  const [metrics, costs] = await Promise.all([
    getSystemMetrics(timespan),
    getFacilityCosts(facilityId || 'all', new Date(Date.now() - timespan), new Date()),
  ])

  // Calculate trends
  const trends = await calculateTrends(facilityId, timespan)

  // Get performance metrics
  const performance = await getPerformanceMetrics()

  // Calculate cost projections and savings
  const costAnalysis = await analyzeCosts(facilityId)

  // Check compliance status
  const compliance = await checkCompliance(facilityId)

  return {
    overview: {
      totalMessages: metrics.totalMessages,
      deliveryRate: calculateDeliveryRate(metrics),
      totalCost: costs.totalCost,
      activeAlerts: metrics.highSeverityAlerts,
    },
    trends,
    performance,
    costs: costAnalysis,
    compliance,
  }
}

async function calculateTrends(facilityId?: string, timespan: number = 24 * 60 * 60 * 1000) {
  const endTime = new Date()
  const startTime = new Date(endTime.getTime() - timespan)

  const metrics = metricsTable.listEntities({
    queryOptions: {
      filter: facilityId
        ? `PartitionKey eq '${facilityId}' and Timestamp ge datetime'${startTime.toISOString()}'`
        : `Timestamp ge datetime'${startTime.toISOString()}'`,
    },
  })

  const hourly: MetricPoint[] = []
  const daily: MetricPoint[] = []
  const monthly: MetricPoint[] = []

  // Process metrics into time series
  for await (const metric of metrics) {
    const timestamp = new Date(metric.Timestamp)
    const value = Number(metric.Value)
    const category = String(metric.Category)

    // Aggregate by hour
    const hourKey = new Date(timestamp.setMinutes(0, 0, 0))
    const hourPoint = hourly.find(p => p.timestamp.getTime() === hourKey.getTime())
    if (hourPoint) {
      hourPoint.value += value
    } else {
      hourly.push({ timestamp: hourKey, value, category })
    }

    // Aggregate by day
    const dayKey = new Date(timestamp.setHours(0, 0, 0, 0))
    const dayPoint = daily.find(p => p.timestamp.getTime() === dayKey.getTime())
    if (dayPoint) {
      dayPoint.value += value
    } else {
      daily.push({ timestamp: dayKey, value, category })
    }

    // Aggregate by month
    const monthKey = new Date(timestamp.setDate(1))
    const monthPoint = monthly.find(p => p.timestamp.getTime() === monthKey.getTime())
    if (monthPoint) {
      monthPoint.value += value
    } else {
      monthly.push({ timestamp: monthKey, value, category })
    }
  }

  return { hourly, daily, monthly }
}

async function getPerformanceMetrics() {
  // Implement real-time performance monitoring
  const startTime = Date.now()
  const metrics = {
    responseTime: 0,
    queueLength: 0,
    processingRate: 0,
    errorRate: 0,
  }

  try {
    // Monitor response time
    await metricsTable.listEntities({ queryOptions: { top: 1 } }).next()
    metrics.responseTime = Date.now() - startTime

    // Get queue length from Service Bus
    // metrics.queueLength = await getQueueLength()

    // Calculate processing rate (messages per second)
    const recentMetrics = await getSystemMetrics(60000) // Last minute
    metrics.processingRate = recentMetrics.totalMessages / 60

    // Calculate error rate
    metrics.errorRate = recentMetrics.highSeverityAlerts / recentMetrics.totalMessages
  } catch (error) {
    console.error('Error getting performance metrics:', error)
  }

  return metrics
}

async function analyzeCosts(facilityId?: string) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const current = await getFacilityCosts(facilityId || 'all', monthStart, now)

  // Project costs for the rest of the month
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysPassed = now.getDate()
  const projected = {
    total: (current.totalCost / daysPassed) * daysInMonth,
    byCategory: {},
    byFacility: {},
    byTemplate: {},
  }

  // Calculate potential savings
  const savings = {
    total: 0,
    optimization: 0,
    batching: 0,
    timing: 0,
  }

  // Calculate optimization savings
  const rules = getOptimizationRules('staff') // Use staff rules as baseline
  const potentialSavings = current.totalCost * 0.2 // Assume 20% potential savings
  savings.optimization = potentialSavings * 0.4 // 40% from message optimization
  savings.batching = potentialSavings * 0.3 // 30% from batching
  savings.timing = potentialSavings * 0.3 // 30% from timing optimization
  savings.total = potentialSavings

  return {
    current,
    projected,
    savings,
  }
}

async function checkCompliance(facilityId?: string) {
  // Implement compliance checks
  return {
    gdprStatus: true, // Implement actual GDPR compliance check
    dataRetention: true, // Check data retention policies
    encryptionStatus: true, // Verify encryption status
    auditStatus: true, // Check audit log status
  }
}

function calculateDeliveryRate(metrics: any) {
  const total = metrics.totalMessages
  const failed = metrics.byStatus?.failed || 0
  return total > 0 ? ((total - failed) / total) * 100 : 100
}

// Export types for API usage
export type { DashboardMetrics, MetricPoint, CostBreakdown, CostSavings } 


