import { ApplicationInsightsClient } from '@azure/applicationinsights'
import { DefaultAzureCredential } from '@azure/identity'
import { RedisClient } from '@azure/redis'
import { BlobServiceClient } from '@azure/storage-blob'

interface CacheConfig {
  ttl: number // Time to live in seconds
  maxSize: number // Maximum size in bytes
  updateInterval: number // Background update interval in seconds
}

interface MetricsAggregation {
  timestamp: Date
  interval: '1m' | '5m' | '1h' | '1d'
  metrics: {
    [key: string]: {
      sum: number
      avg: number
      min: number
      max: number
      count: number
    }
  }
}

interface QueryOptimization {
  cacheHits: number
  cacheMisses: number
  avgQueryTime: number
  slowQueries: Array<{
    query: string
    duration: number
    timestamp: Date
  }>
}

export class MonitoringPerformanceService {
  private static instance: MonitoringPerformanceService
  private insights: ApplicationInsightsClient
  private redis: RedisClient
  private blobClient: BlobServiceClient
  private metricCache: Map<string, { data: any; timestamp: number }>
  private aggregationCache: Map<string, MetricsAggregation>
  private queryStats: QueryOptimization
  private backgroundTasks: NodeJS.Timeout[]

  private constructor() {
    const credential = new DefaultAzureCredential()
    
    this.insights = new ApplicationInsightsClient(
      credential,
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING!
    )
    
    this.redis = new RedisClient({
      url: process.env.REDIS_CONNECTION_STRING!,
      credential
    })
    
    this.blobClient = BlobServiceClient.fromConnectionString(
      process.env.AZURE_STORAGE_CONNECTION_STRING!
    )

    this.metricCache = new Map()
    this.aggregationCache = new Map()
    this.backgroundTasks = []
    this.queryStats = {
      cacheHits: 0,
      cacheMisses: 0,
      avgQueryTime: 0,
      slowQueries: []
    }

    this.initializeOptimizations()
  }

  public static getInstance(): MonitoringPerformanceService {
    if (!MonitoringPerformanceService.instance) {
      MonitoringPerformanceService.instance = new MonitoringPerformanceService()
    }
    return MonitoringPerformanceService.instance
  }

  private async initializeOptimizations(): Promise<void> {
    // Start background cache updates
    this.startCacheUpdates()

    // Initialize data aggregation
    await this.initializeAggregation()

    // Setup query monitoring
    this.setupQueryMonitoring()
  }

  // Cache Management
  private async getCachedMetric(key: string): Promise<any> {
    // Try memory cache first
    const memoryCache = this.metricCache.get(key)
    if (memoryCache && Date.now() - memoryCache.timestamp < 300000) { // 5 minutes
      this.queryStats.cacheHits++
      return memoryCache.data
    }

    // Try Redis cache
    const redisCache = await this.redis.get(key)
    if (redisCache) {
      this.queryStats.cacheHits++
      // Update memory cache
      this.metricCache.set(key, {
        data: JSON.parse(redisCache),
        timestamp: Date.now()
      })
      return JSON.parse(redisCache)
    }

    this.queryStats.cacheMisses++
    return null
  }

  private async setCachedMetric(
    key: string,
    data: any,
    ttl: number = 300 // 5 minutes
  ): Promise<void> {
    // Set memory cache
    this.metricCache.set(key, {
      data,
      timestamp: Date.now()
    })

    // Set Redis cache
    await this.redis.set(key, JSON.stringify(data), {
      ex: ttl
    })

    // Manage cache size
    await this.manageCacheSize()
  }

  private async manageCacheSize(): Promise<void> {
    const maxCacheSize = 100 * 1024 * 1024 // 100MB
    let currentSize = 0

    // Calculate current cache size
    for (const [key, value] of this.metricCache) {
      currentSize += JSON.stringify(value).length
    }

    // If over limit, remove oldest entries
    if (currentSize > maxCacheSize) {
      const entries = Array.from(this.metricCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)

      while (currentSize > maxCacheSize && entries.length > 0) {
        const [key, value] = entries.shift()!
        currentSize -= JSON.stringify(value).length
        this.metricCache.delete(key)
        await this.redis.del(key)
      }
    }
  }

  // Data Aggregation
  private async initializeAggregation(): Promise<void> {
    // Setup aggregation intervals
    const intervals: Array<{
      interval: MetricsAggregation['interval']
      seconds: number
    }> = [
      { interval: '1m', seconds: 60 },
      { interval: '5m', seconds: 300 },
      { interval: '1h', seconds: 3600 },
      { interval: '1d', seconds: 86400 }
    ]

    // Start aggregation tasks
    for (const { interval, seconds } of intervals) {
      this.backgroundTasks.push(
        setInterval(
          () => this.aggregateMetrics(interval),
          seconds * 1000
        )
      )
    }
  }

  private async aggregateMetrics(
    interval: MetricsAggregation['interval']
  ): Promise<void> {
    const now = new Date()
    const metrics = await this.insights.query(`
      customMetrics
      | where timestamp >= ago(${interval})
      | summarize
          sum=sum(value),
          avg=avg(value),
          min=min(value),
          max=max(value),
          count=count()
        by name
    `)

    const aggregation: MetricsAggregation = {
      timestamp: now,
      interval,
      metrics: {}
    }

    for (const metric of metrics) {
      aggregation.metrics[metric.name] = {
        sum: metric.sum,
        avg: metric.avg,
        min: metric.min,
        max: metric.max,
        count: metric.count
      }
    }

    // Store aggregation
    this.aggregationCache.set(interval, aggregation)

    // Archive to blob storage for long-term storage
    await this.archiveAggregation(aggregation)
  }

  private async archiveAggregation(
    aggregation: MetricsAggregation
  ): Promise<void> {
    const containerClient = this.blobClient.getContainerClient('metric-aggregations')
    await containerClient.createIfNotExists()

    const blobName = `${aggregation.interval}/${aggregation.timestamp.toISOString()}.json`
    const blockBlobClient = containerClient.getBlockBlobClient(blobName)

    await blockBlobClient.upload(
      JSON.stringify(aggregation),
      JSON.stringify(aggregation).length
    )
  }

  // Query Optimization
  private setupQueryMonitoring(): void {
    this.backgroundTasks.push(
      setInterval(
        () => this.analyzeQueryPerformance(),
        60000 // Every minute
      )
    )
  }

  private async analyzeQueryPerformance(): Promise<void> {
    const slowQueryThreshold = 1000 // 1 second

    // Get recent query performance
    const queryMetrics = await this.insights.query(`
      requests
      | where timestamp >= ago(5m)
      | where name startswith "MetricsQuery"
      | project
          query=customDimensions.query,
          duration,
          timestamp
      | where duration > ${slowQueryThreshold}
    `)

    // Update query stats
    this.queryStats.slowQueries = queryMetrics.map((q: any) => ({
      query: q.query,
      duration: q.duration,
      timestamp: new Date(q.timestamp)
    }))

    // Calculate average query time
    const totalQueries = this.queryStats.cacheHits + this.queryStats.cacheMisses
    if (totalQueries > 0) {
      this.queryStats.avgQueryTime = queryMetrics.reduce(
        (sum: number, q: any) => sum + q.duration,
        0
      ) / totalQueries
    }
  }

  // Background Cache Updates
  private startCacheUpdates(): void {
    this.backgroundTasks.push(
      setInterval(
        () => this.updateFrequentlyAccessedMetrics(),
        60000 // Every minute
      )
    )
  }

  private async updateFrequentlyAccessedMetrics(): Promise<void> {
    // Get most frequently accessed metrics
    const frequentMetrics = await this.insights.query(`
      customEvents
      | where timestamp >= ago(1h)
      | where name == "MetricAccess"
      | summarize count() by metricName
      | top 10 by count_
    `)

    // Pre-fetch and cache these metrics
    for (const metric of frequentMetrics) {
      const data = await this.fetchMetricData(metric.metricName)
      await this.setCachedMetric(
        `metric:${metric.metricName}`,
        data,
        300 // 5 minutes TTL
      )
    }
  }

  private async fetchMetricData(metricName: string): Promise<any> {
    const startTime = Date.now()
    
    try {
      const data = await this.insights.query(`
        customMetrics
        | where name == "${metricName}"
        | where timestamp >= ago(1h)
        | summarize value=avg(value) by bin(timestamp, 1m)
      `)

      const duration = Date.now() - startTime
      if (duration > 1000) { // 1 second
        this.queryStats.slowQueries.push({
          query: metricName,
          duration,
          timestamp: new Date()
        })
      }

      return data
    } catch (error) {
      console.error(`Error fetching metric ${metricName}:`, error)
      throw error
    }
  }

  // Public Methods
  public async getMetrics(
    metricNames: string[],
    timeRange: { start: Date; end: Date }
  ): Promise<any> {
    const results: any = {}
    const fetchPromises = metricNames.map(async (name) => {
      const cacheKey = `metric:${name}:${timeRange.start.toISOString()}`
      let data = await this.getCachedMetric(cacheKey)

      if (!data) {
        data = await this.fetchMetricData(name)
        await this.setCachedMetric(cacheKey, data)
      }

      results[name] = data
    })

    await Promise.all(fetchPromises)
    return results
  }

  public getAggregation(
    interval: MetricsAggregation['interval']
  ): MetricsAggregation | undefined {
    return this.aggregationCache.get(interval)
  }

  public getQueryStats(): QueryOptimization {
    return { ...this.queryStats }
  }

  public async cleanup(): Promise<void> {
    // Clear background tasks
    for (const task of this.backgroundTasks) {
      clearInterval(task)
    }

    // Clear caches
    this.metricCache.clear()
    this.aggregationCache.clear()

    // Close connections
    await this.redis.quit()
  }
}

export const monitoringPerformanceService = MonitoringPerformanceService.getInstance()
