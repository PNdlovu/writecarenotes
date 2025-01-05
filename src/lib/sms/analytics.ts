import { TableClient, odata } from '@azure/data-tables'
import { env } from '@/env.mjs'

const tableClient = TableClient.fromConnectionString(
  env.AZURE_STORAGE_CONNECTION_STRING,
  'smsanalytics'
)

interface SMSAnalyticsEntry {
  messageId: string
  phoneNumber: string
  template: string
  status: string
  timestamp: Date
  facilityId?: string
  userId?: string
  category?: string
  batchId?: string
  provider: string
  error?: string
  cost?: number
}

export async function trackSMSEvent(entry: SMSAnalyticsEntry) {
  const partitionKey = entry.facilityId || 'system'
  const rowKey = `${Date.now()}-${entry.messageId}`

  try {
    await tableClient.createEntity({
      partitionKey,
      rowKey,
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to track SMS event:', error)
    return { success: false, error: error.message }
  }
}

export interface SMSAnalyticsQuery {
  facilityId?: string
  startDate?: Date
  endDate?: Date
  status?: string
  template?: string
  category?: string
  batchId?: string
}

export interface SMSAnalyticsSummary {
  totalMessages: number
  successfulMessages: number
  failedMessages: number
  totalCost: number
  byTemplate: Record<string, number>
  byStatus: Record<string, number>
  byCategory: Record<string, number>
}

export async function querySMSAnalytics(query: SMSAnalyticsQuery): Promise<SMSAnalyticsSummary> {
  let filterString = ''

  if (query.facilityId) {
    filterString = `PartitionKey eq '${query.facilityId}'`
  }

  if (query.startDate) {
    const startFilter = `timestamp ge datetime'${query.startDate.toISOString()}'`
    filterString = filterString ? `${filterString} and ${startFilter}` : startFilter
  }

  if (query.endDate) {
    const endFilter = `timestamp le datetime'${query.endDate.toISOString()}'`
    filterString = filterString ? `${filterString} and ${endFilter}` : endFilter
  }

  if (query.status) {
    const statusFilter = `status eq '${query.status}'`
    filterString = filterString ? `${filterString} and ${statusFilter}` : statusFilter
  }

  if (query.template) {
    const templateFilter = `template eq '${query.template}'`
    filterString = filterString ? `${filterString} and ${templateFilter}` : templateFilter
  }

  if (query.category) {
    const categoryFilter = `category eq '${query.category}'`
    filterString = filterString ? `${filterString} and ${categoryFilter}` : categoryFilter
  }

  if (query.batchId) {
    const batchFilter = `batchId eq '${query.batchId}'`
    filterString = filterString ? `${filterString} and ${batchFilter}` : batchFilter
  }

  const entities = tableClient.listEntities({
    queryOptions: { filter: filterString },
  })

  const summary: SMSAnalyticsSummary = {
    totalMessages: 0,
    successfulMessages: 0,
    failedMessages: 0,
    totalCost: 0,
    byTemplate: {},
    byStatus: {},
    byCategory: {},
  }

  for await (const entity of entities) {
    summary.totalMessages++
    
    if (entity.status === 'delivered') {
      summary.successfulMessages++
    } else if (entity.status === 'failed') {
      summary.failedMessages++
    }

    if (entity.cost) {
      summary.totalCost += entity.cost
    }

    if (entity.template) {
      summary.byTemplate[entity.template] = (summary.byTemplate[entity.template] || 0) + 1
    }

    if (entity.status) {
      summary.byStatus[entity.status] = (summary.byStatus[entity.status] || 0) + 1
    }

    if (entity.category) {
      summary.byCategory[entity.category] = (summary.byCategory[entity.category] || 0) + 1
    }
  }

  return summary
}

export async function generateSMSReport(query: SMSAnalyticsQuery) {
  const summary = await querySMSAnalytics(query)
  
  return {
    summary,
    metrics: {
      deliveryRate: (summary.successfulMessages / summary.totalMessages) * 100,
      failureRate: (summary.failedMessages / summary.totalMessages) * 100,
      averageCost: summary.totalCost / summary.totalMessages,
    },
    topTemplates: Object.entries(summary.byTemplate)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5),
    categories: Object.entries(summary.byCategory)
      .sort(([, a], [, b]) => b - a),
  }
}

// Real-time monitoring
export async function getRecentFailures(minutes: number = 60) {
  const startTime = new Date(Date.now() - minutes * 60 * 1000)
  
  const failures = tableClient.listEntities({
    queryOptions: {
      filter: odata`status eq 'failed' and timestamp ge datetime'${startTime.toISOString()}'`,
    },
  })

  const results = []
  for await (const failure of failures) {
    results.push(failure)
  }

  return results
}

// Cost tracking
export async function getFacilityCosts(facilityId: string, startDate: Date, endDate: Date) {
  const costs = await querySMSAnalytics({
    facilityId,
    startDate,
    endDate,
  })

  return {
    totalCost: costs.totalCost,
    messageCount: costs.totalMessages,
    averageCost: costs.totalCost / costs.totalMessages,
    byCategory: Object.entries(costs.byCategory).map(([category, count]) => ({
      category,
      count,
      cost: (count / costs.totalMessages) * costs.totalCost,
    })),
  }
} 


