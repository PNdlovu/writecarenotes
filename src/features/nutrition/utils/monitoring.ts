import { performanceMonitor } from './performance'
import { advancedCache } from './advanced-cache'
import { realTimeManager } from './real-time'

interface MetricData {
  value: number
  timestamp: number
  metadata?: Record<string, any>
}

interface Alert {
  id: string
  type: string
  message: string
  severity: 'info' | 'warning' | 'error'
  timestamp: number
  metadata?: Record<string, any>
}

interface MetricThreshold {
  warning: number
  error: number
  callback?: (alert: Alert) => void
}

class MonitoringSystem {
  private metrics: Map<string, MetricData[]>
  private alerts: Alert[]
  private thresholds: Map<string, MetricThreshold>
  private static instance: MonitoringSystem

  private constructor() {
    this.metrics = new Map()
    this.alerts = []
    this.thresholds = new Map()

    this.setupDefaultThresholds()
    this.startMonitoring()
  }

  public static getInstance(): MonitoringSystem {
    if (!MonitoringSystem.instance) {
      MonitoringSystem.instance = new MonitoringSystem()
    }
    return MonitoringSystem.instance
  }

  // Metric tracking
  trackMetric(
    name: string,
    value: number,
    metadata?: Record<string, any>
  ): void {
    const metricData: MetricData = {
      value,
      timestamp: Date.now(),
      metadata
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)?.push(metricData)

    // Check thresholds
    this.checkThresholds(name, value, metadata)

    // Trim old metrics
    this.trimMetrics(name)
  }

  // Alert management
  addAlert(
    type: string,
    message: string,
    severity: 'info' | 'warning' | 'error',
    metadata?: Record<string, any>
  ): void {
    const alert: Alert = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message,
      severity,
      timestamp: Date.now(),
      metadata
    }

    this.alerts.push(alert)
    this.notifyAlert(alert)
  }

  // Threshold management
  setThreshold(
    metric: string,
    threshold: MetricThreshold
  ): void {
    this.thresholds.set(metric, threshold)
  }

  // Performance monitoring
  private async monitorPerformance(): Promise<void> {
    // Monitor API performance
    const apiMetrics = performanceMonitor.getMetrics('api_request')
    this.trackMetric('api_response_time', apiMetrics.averageDuration)
    this.trackMetric('api_error_rate', apiMetrics.errorRate || 0)

    // Monitor cache performance
    const cacheStats = await advancedCache.getMemoryUsage()
    this.trackMetric('cache_memory_redis', cacheStats.redis)
    this.trackMetric('cache_memory_local', cacheStats.memory)

    // Monitor real-time system
    const rtStats = realTimeManager.getConnectionStats()
    this.trackMetric('active_connections', rtStats.activeConnections)
    this.trackMetric('message_queue_size', rtStats.messageQueueSize)

    // Monitor system resources
    const memory = process.memoryUsage()
    this.trackMetric('memory_usage', memory.heapUsed)
    this.trackMetric('memory_total', memory.heapTotal)
  }

  // Dashboard data
  async getDashboardData(): Promise<{
    metrics: Record<string, MetricData[]>
    alerts: Alert[]
    performance: any
    resources: any
  }> {
    const metrics: Record<string, MetricData[]> = {}
    this.metrics.forEach((data, key) => {
      metrics[key] = data.slice(-100) // Last 100 data points
    })

    const performance = {
      api: performanceMonitor.getMetrics('api_request'),
      cache: await advancedCache.getMemoryUsage(),
      realTime: realTimeManager.getConnectionStats()
    }

    const resources = {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }

    return {
      metrics,
      alerts: this.alerts.slice(-100),
      performance,
      resources
    }
  }

  // Analytics
  async generateAnalytics(
    startTime: number,
    endTime: number
  ): Promise<any> {
    const analytics: Record<string, any> = {}

    // Process metrics
    this.metrics.forEach((data, metric) => {
      const filteredData = data.filter(
        d => d.timestamp >= startTime && d.timestamp <= endTime
      )

      analytics[metric] = {
        average:
          filteredData.reduce((sum, d) => sum + d.value, 0) /
          filteredData.length,
        min: Math.min(...filteredData.map(d => d.value)),
        max: Math.max(...filteredData.map(d => d.value)),
        count: filteredData.length
      }
    })

    // Process alerts
    const alertsByType = this.alerts
      .filter(
        a => a.timestamp >= startTime && a.timestamp <= endTime
      )
      .reduce((acc, alert) => {
        if (!acc[alert.type]) acc[alert.type] = 0
        acc[alert.type]++
        return acc
      }, {} as Record<string, number>)

    return {
      metrics: analytics,
      alerts: alertsByType,
      timeRange: {
        start: startTime,
        end: endTime,
        duration: endTime - startTime
      }
    }
  }

  // Private utility methods
  private setupDefaultThresholds(): void {
    this.setThreshold('api_response_time', {
      warning: 1000, // 1 second
      error: 3000, // 3 seconds
      callback: this.handleApiLatencyAlert.bind(this)
    })

    this.setThreshold('memory_usage', {
      warning: 0.7, // 70% usage
      error: 0.9, // 90% usage
      callback: this.handleMemoryAlert.bind(this)
    })

    this.setThreshold('error_rate', {
      warning: 0.05, // 5% error rate
      error: 0.1, // 10% error rate
      callback: this.handleErrorRateAlert.bind(this)
    })
  }

  private startMonitoring(): void {
    setInterval(() => {
      this.monitorPerformance()
    }, 60000) // Every minute
  }

  private checkThresholds(
    metric: string,
    value: number,
    metadata?: Record<string, any>
  ): void {
    const threshold = this.thresholds.get(metric)
    if (!threshold) return

    if (value >= threshold.error) {
      this.addAlert(
        metric,
        `${metric} exceeded error threshold: ${value}`,
        'error',
        metadata
      )
    } else if (value >= threshold.warning) {
      this.addAlert(
        metric,
        `${metric} exceeded warning threshold: ${value}`,
        'warning',
        metadata
      )
    }

    if (threshold.callback) {
      threshold.callback({
        id: `${Date.now()}-${Math.random()}`,
        type: metric,
        message: `${metric} threshold check`,
        severity: value >= threshold.error ? 'error' : 'warning',
        timestamp: Date.now(),
        metadata: {
          value,
          threshold: value >= threshold.error ? 'error' : 'warning',
          ...metadata
        }
      })
    }
  }

  private trimMetrics(metric: string): void {
    const data = this.metrics.get(metric)
    if (!data) return

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
    this.metrics.set(
      metric,
      data.filter(d => d.timestamp > oneDayAgo)
    )
  }

  private notifyAlert(alert: Alert): void {
    // Implement your notification logic here
    console.log('Alert:', alert)
  }

  // Alert handlers
  private handleApiLatencyAlert(alert: Alert): void {
    // Implement specific handling for API latency alerts
    console.log('API Latency Alert:', alert)
  }

  private handleMemoryAlert(alert: Alert): void {
    // Implement specific handling for memory alerts
    console.log('Memory Alert:', alert)
  }

  private handleErrorRateAlert(alert: Alert): void {
    // Implement specific handling for error rate alerts
    console.log('Error Rate Alert:', alert)
  }
}

export const monitoringSystem = MonitoringSystem.getInstance()
