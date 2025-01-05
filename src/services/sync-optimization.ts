import { WebPubSubClient } from '@azure/web-pubsub'
import { DefaultAzureCredential } from '@azure/identity'
import { monitoringPerformanceService } from './monitoring-performance'

interface SyncMessage {
  id: string
  type: string
  payload: any
  timestamp: number
  priority: 'high' | 'medium' | 'low'
}

interface BatchUpdate {
  id: string
  messages: SyncMessage[]
  timestamp: number
}

interface ResourceUsage {
  cpu: number
  memory: number
  network: {
    sent: number
    received: number
  }
}

export class SyncOptimizationService {
  private static instance: SyncOptimizationService
  private pubsubClient: WebPubSubClient
  private messageQueue: Map<string, SyncMessage[]>
  private batchInterval: number
  private maxBatchSize: number
  private resourceThresholds: {
    cpu: number
    memory: number
    network: number
  }
  private activeConnections: Set<string>
  private messageHistory: Map<string, Set<string>>
  private rateLimits: Map<string, {
    count: number
    lastReset: number
  }>

  private constructor() {
    const credential = new DefaultAzureCredential()
    this.pubsubClient = new WebPubSubClient(
      process.env.AZURE_PUBSUB_CONNECTION_STRING!,
      'dashboard'
    )
    
    this.messageQueue = new Map()
    this.batchInterval = 100 // 100ms default batch interval
    this.maxBatchSize = 100 // Maximum messages per batch
    this.resourceThresholds = {
      cpu: 80, // 80% CPU threshold
      memory: 85, // 85% memory threshold
      network: 90 // 90% network capacity
    }
    this.activeConnections = new Set()
    this.messageHistory = new Map()
    this.rateLimits = new Map()

    this.initializeOptimization()
  }

  public static getInstance(): SyncOptimizationService {
    if (!SyncOptimizationService.instance) {
      SyncOptimizationService.instance = new SyncOptimizationService()
    }
    return SyncOptimizationService.instance
  }

  private initializeOptimization(): void {
    // Start batch processing
    setInterval(() => this.processBatches(), this.batchInterval)

    // Monitor resource usage
    setInterval(() => this.monitorResources(), 5000)

    // Clean up message history
    setInterval(() => this.cleanupMessageHistory(), 300000) // 5 minutes

    // Adjust batch settings based on performance
    setInterval(() => this.adjustBatchSettings(), 60000) // 1 minute
  }

  private async processBatches(): Promise<void> {
    for (const [channel, messages] of this.messageQueue.entries()) {
      if (messages.length === 0) continue

      // Sort by priority
      messages.sort((a, b) => {
        const priorityMap = { high: 0, medium: 1, low: 2 }
        return priorityMap[a.priority] - priorityMap[b.priority]
      })

      // Create batches
      const batches: BatchUpdate[] = []
      let currentBatch: SyncMessage[] = []
      let currentSize = 0

      for (const message of messages) {
        const messageSize = JSON.stringify(message).length
        
        if (currentSize + messageSize > this.maxBatchSize) {
          if (currentBatch.length > 0) {
            batches.push({
              id: `batch_${Date.now()}_${batches.length}`,
              messages: currentBatch,
              timestamp: Date.now()
            })
            currentBatch = []
            currentSize = 0
          }
        }

        currentBatch.push(message)
        currentSize += messageSize
      }

      if (currentBatch.length > 0) {
        batches.push({
          id: `batch_${Date.now()}_${batches.length}`,
          messages: currentBatch,
          timestamp: Date.now()
        })
      }

      // Send batches
      for (const batch of batches) {
        await this.sendBatch(channel, batch)
      }

      // Clear processed messages
      this.messageQueue.set(channel, [])
    }
  }

  private async sendBatch(channel: string, batch: BatchUpdate): Promise<void> {
    try {
      // Check rate limits
      if (!this.checkRateLimit(channel)) {
        // Queue for later if rate limited
        const remainingMessages = this.messageQueue.get(channel) || []
        remainingMessages.push(...batch.messages)
        this.messageQueue.set(channel, remainingMessages)
        return
      }

      // Compress batch if needed
      const compressedBatch = this.compressBatch(batch)

      // Send to active connections
      await this.pubsubClient.sendToGroup(channel, {
        type: 'batch',
        data: compressedBatch
      })

      // Update message history
      this.updateMessageHistory(channel, batch.messages)

    } catch (error) {
      console.error('Error sending batch:', error)
      // Requeue failed messages
      const remainingMessages = this.messageQueue.get(channel) || []
      remainingMessages.push(...batch.messages)
      this.messageQueue.set(channel, remainingMessages)
    }
  }

  private compressBatch(batch: BatchUpdate): any {
    // Implement diff-based compression
    const compressedMessages = batch.messages.map(message => {
      if (message.type === 'update' && message.payload.previous) {
        // Calculate and send only changed fields
        const diff = this.calculateDiff(
          message.payload.previous,
          message.payload.current
        )
        return {
          ...message,
          payload: {
            diff,
            type: 'diff'
          }
        }
      }
      return message
    })

    return {
      ...batch,
      messages: compressedMessages
    }
  }

  private calculateDiff(previous: any, current: any): any {
    const diff: any = {}

    for (const key in current) {
      if (JSON.stringify(current[key]) !== JSON.stringify(previous[key])) {
        diff[key] = current[key]
      }
    }

    return diff
  }

  private checkRateLimit(channel: string): boolean {
    const limit = this.rateLimits.get(channel)
    const now = Date.now()
    const maxRate = 100 // messages per second

    if (!limit) {
      this.rateLimits.set(channel, {
        count: 1,
        lastReset: now
      })
      return true
    }

    if (now - limit.lastReset >= 1000) {
      // Reset counter every second
      this.rateLimits.set(channel, {
        count: 1,
        lastReset: now
      })
      return true
    }

    if (limit.count >= maxRate) {
      return false
    }

    limit.count++
    return true
  }

  private updateMessageHistory(channel: string, messages: SyncMessage[]): void {
    const history = this.messageHistory.get(channel) || new Set()
    
    for (const message of messages) {
      history.add(message.id)
    }

    this.messageHistory.set(channel, history)
  }

  private cleanupMessageHistory(): void {
    const maxAge = 3600000 // 1 hour
    const now = Date.now()

    for (const [channel, history] of this.messageHistory.entries()) {
      const newHistory = new Set(
        Array.from(history).filter(id => {
          const timestamp = parseInt(id.split('_')[1])
          return now - timestamp < maxAge
        })
      )
      this.messageHistory.set(channel, newHistory)
    }
  }

  private async monitorResources(): Promise<void> {
    const usage = await this.getResourceUsage()

    // Adjust batch settings based on resource usage
    if (usage.cpu > this.resourceThresholds.cpu) {
      this.batchInterval = Math.min(this.batchInterval * 1.5, 1000)
      this.maxBatchSize = Math.max(this.maxBatchSize * 0.8, 50)
    } else if (usage.cpu < this.resourceThresholds.cpu * 0.5) {
      this.batchInterval = Math.max(this.batchInterval * 0.8, 100)
      this.maxBatchSize = Math.min(this.maxBatchSize * 1.2, 200)
    }

    // Adjust message compression based on network usage
    if (usage.network.sent > this.resourceThresholds.network) {
      this.enableCompression = true
    } else {
      this.enableCompression = false
    }
  }

  private async getResourceUsage(): Promise<ResourceUsage> {
    // Get CPU usage
    const cpuUsage = process.cpuUsage()
    const cpu = (cpuUsage.user + cpuUsage.system) / 1000000 // Convert to seconds

    // Get memory usage
    const memory = process.memoryUsage()
    const memoryUsage = (memory.heapUsed / memory.heapTotal) * 100

    // Get network usage (simplified)
    const network = {
      sent: 0,
      received: 0
    }

    return {
      cpu,
      memory: memoryUsage,
      network
    }
  }

  private adjustBatchSettings(): void {
    const stats = monitoringPerformanceService.getQueryStats()
    
    // Adjust based on query performance
    if (stats.avgQueryTime > 1000) { // 1 second
      this.batchInterval = Math.min(this.batchInterval * 1.2, 1000)
    } else if (stats.avgQueryTime < 100) { // 100ms
      this.batchInterval = Math.max(this.batchInterval * 0.8, 100)
    }

    // Adjust based on cache hit rate
    const hitRate = stats.cacheHits / (stats.cacheHits + stats.cacheMisses)
    if (hitRate < 0.8) { // Less than 80% cache hit rate
      this.maxBatchSize = Math.max(this.maxBatchSize * 0.9, 50)
    } else {
      this.maxBatchSize = Math.min(this.maxBatchSize * 1.1, 200)
    }
  }

  // Public Methods
  public async queueMessage(
    channel: string,
    message: Omit<SyncMessage, 'timestamp'>
  ): Promise<void> {
    const messages = this.messageQueue.get(channel) || []
    messages.push({
      ...message,
      timestamp: Date.now()
    })
    this.messageQueue.set(channel, messages)
  }

  public async connect(connectionId: string): Promise<void> {
    this.activeConnections.add(connectionId)
  }

  public async disconnect(connectionId: string): Promise<void> {
    this.activeConnections.delete(connectionId)
  }

  public getStats(): any {
    return {
      activeConnections: this.activeConnections.size,
      queueSizes: Array.from(this.messageQueue.entries()).map(([channel, messages]) => ({
        channel,
        size: messages.length
      })),
      batchSettings: {
        interval: this.batchInterval,
        maxSize: this.maxBatchSize
      },
      resourceUsage: this.getResourceUsage()
    }
  }
}

export const syncOptimizationService = SyncOptimizationService.getInstance()
