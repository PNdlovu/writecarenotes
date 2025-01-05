import { performance } from 'perf_hooks'

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
  metadata?: Record<string, any>
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, PerformanceMetric[]>
  private thresholds: Map<string, number>

  private constructor() {
    this.metrics = new Map()
    this.thresholds = new Map()
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Start tracking a metric
  startMetric(
    name: string,
    metadata?: Record<string, any>
  ): string {
    const id = `${name}-${Date.now()}-${Math.random()}`
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      metadata
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)?.push(metric)

    return id
  }

  // End tracking a metric
  endMetric(id: string): void {
    const [name] = id.split('-')
    const metrics = this.metrics.get(name)
    if (!metrics) return

    const metric = metrics.find(m =>
      id.startsWith(`${m.name}-${m.startTime}`)
    )
    if (!metric) return

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime

    // Check threshold
    const threshold = this.thresholds.get(name)
    if (threshold && metric.duration > threshold) {
      console.warn(
        `Performance threshold exceeded for ${name}: ${metric.duration}ms (threshold: ${threshold}ms)`,
        metric.metadata
      )
    }
  }

  // Set performance threshold
  setThreshold(name: string, threshold: number): void {
    this.thresholds.set(name, threshold)
  }

  // Get metrics for a specific operation
  getMetrics(name: string): {
    count: number
    averageDuration: number
    minDuration: number
    maxDuration: number
    p95Duration: number
    metadata: Record<string, any>[]
  } {
    const metrics = this.metrics.get(name) || []
    const durations = metrics
      .filter(m => m.duration !== undefined)
      .map(m => m.duration as number)

    if (durations.length === 0) {
      return {
        count: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        p95Duration: 0,
        metadata: []
      }
    }

    durations.sort((a, b) => a - b)
    const p95Index = Math.floor(durations.length * 0.95)

    return {
      count: metrics.length,
      averageDuration:
        durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: durations[0],
      maxDuration: durations[durations.length - 1],
      p95Duration: durations[p95Index],
      metadata: metrics
        .filter(m => m.metadata)
        .map(m => m.metadata as Record<string, any>)
    }
  }

  // Clear metrics
  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }

  // Get all metric names
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys())
  }

  // Performance monitoring decorator
  static monitor(options: {
    name: string
    threshold?: number
  }) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value

      descriptor.value = async function (...args: any[]) {
        const monitor = PerformanceMonitor.getInstance()
        const metricId = monitor.startMetric(options.name, {
          args,
          method: propertyKey
        })

        if (options.threshold) {
          monitor.setThreshold(options.name, options.threshold)
        }

        try {
          const result = await originalMethod.apply(this, args)
          return result
        } finally {
          monitor.endMetric(metricId)
        }
      }

      return descriptor
    }
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance()

// Usage example:
// class ExampleService {
//   @PerformanceMonitor.monitor({
//     name: 'getData',
//     threshold: 1000
//   })
//   async getData() {
//     // Method implementation
//   }
// }
