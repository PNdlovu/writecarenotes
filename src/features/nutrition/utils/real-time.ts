import { Server as SocketServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { performanceMonitor } from './performance'
import { advancedCache } from './advanced-cache'

interface UpdateMessage {
  type: string
  payload: any
  timestamp: number
}

interface ClientConnection {
  id: string
  subscriptions: Set<string>
  lastActivity: number
}

class RealTimeManager {
  private io: SocketServer
  private clients: Map<string, ClientConnection>
  private messageQueue: UpdateMessage[]
  private static instance: RealTimeManager

  private constructor(server: HTTPServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL,
        methods: ['GET', 'POST']
      }
    })

    this.clients = new Map()
    this.messageQueue = []

    this.setupSocketHandlers()
    this.startMaintenanceInterval()
  }

  public static initialize(server: HTTPServer): void {
    if (!RealTimeManager.instance) {
      RealTimeManager.instance = new RealTimeManager(server)
    }
  }

  public static getInstance(): RealTimeManager {
    if (!RealTimeManager.instance) {
      throw new Error('RealTimeManager not initialized')
    }
    return RealTimeManager.instance
  }

  // Client connection management
  private setupSocketHandlers(): void {
    this.io.on('connection', (socket) => {
      const metricId = performanceMonitor.startMetric(
        'socket_connection'
      )

      try {
        // Initialize client
        this.clients.set(socket.id, {
          id: socket.id,
          subscriptions: new Set(),
          lastActivity: Date.now()
        })

        // Handle subscriptions
        socket.on('subscribe', (channels: string[]) => {
          const client = this.clients.get(socket.id)
          if (client) {
            channels.forEach(channel => {
              client.subscriptions.add(channel)
              socket.join(channel)
            })
            client.lastActivity = Date.now()
          }
        })

        // Handle unsubscriptions
        socket.on('unsubscribe', (channels: string[]) => {
          const client = this.clients.get(socket.id)
          if (client) {
            channels.forEach(channel => {
              client.subscriptions.delete(channel)
              socket.leave(channel)
            })
            client.lastActivity = Date.now()
          }
        })

        // Handle disconnection
        socket.on('disconnect', () => {
          this.clients.delete(socket.id)
        })

        // Handle client heartbeat
        socket.on('heartbeat', () => {
          const client = this.clients.get(socket.id)
          if (client) {
            client.lastActivity = Date.now()
          }
        })
      } finally {
        performanceMonitor.endMetric(metricId)
      }
    })
  }

  // Real-time updates
  async broadcast(
    channel: string,
    type: string,
    payload: any
  ): Promise<void> {
    const metricId = performanceMonitor.startMetric('broadcast')
    try {
      const message: UpdateMessage = {
        type,
        payload,
        timestamp: Date.now()
      }

      // Add to message queue
      this.messageQueue.push(message)

      // Cache the update
      await advancedCache.set(
        `update:${channel}:${message.timestamp}`,
        message,
        { ttl: 3600 } // 1 hour
      )

      // Broadcast to subscribed clients
      this.io.to(channel).emit('update', message)

      // Update metrics
      this.updateMetrics(channel, message)
    } finally {
      performanceMonitor.endMetric(metricId)
    }
  }

  // Progressive loading
  async getUpdates(
    channel: string,
    since?: number
  ): Promise<UpdateMessage[]> {
    const metricId = performanceMonitor.startMetric('get_updates')
    try {
      // Get cached updates
      const cacheKey = `updates:${channel}`
      let updates = await advancedCache.get<UpdateMessage[]>(
        cacheKey
      )

      if (!updates) {
        // Fetch from database if not in cache
        updates = await this.fetchUpdatesFromDB(channel)
        await advancedCache.set(cacheKey, updates, { ttl: 3600 })
      }

      // Filter by timestamp if specified
      return since
        ? updates.filter(update => update.timestamp > since)
        : updates
    } finally {
      performanceMonitor.endMetric(metricId)
    }
  }

  // Maintenance and cleanup
  private startMaintenanceInterval(): void {
    setInterval(() => {
      this.performMaintenance()
    }, 60000) // Every minute
  }

  private async performMaintenance(): Promise<void> {
    const metricId = performanceMonitor.startMetric('maintenance')
    try {
      // Clean up inactive clients
      const now = Date.now()
      for (const [id, client] of this.clients.entries()) {
        if (now - client.lastActivity > 300000) {
          // 5 minutes
          this.clients.delete(id)
          this.io.sockets.sockets.get(id)?.disconnect(true)
        }
      }

      // Trim message queue
      const oneHourAgo = now - 3600000
      this.messageQueue = this.messageQueue.filter(
        msg => msg.timestamp > oneHourAgo
      )

      // Update metrics
      await this.updateGlobalMetrics()
    } finally {
      performanceMonitor.endMetric(metricId)
    }
  }

  // Metrics and monitoring
  private updateMetrics(
    channel: string,
    message: UpdateMessage
  ): void {
    performanceMonitor.trackMetric('broadcast_size', {
      channel,
      size: JSON.stringify(message).length
    })

    performanceMonitor.trackMetric('subscribers', {
      channel,
      count: this.io.sockets.adapter.rooms.get(channel)?.size || 0
    })
  }

  private async updateGlobalMetrics(): Promise<void> {
    performanceMonitor.trackMetric('active_connections', {
      count: this.clients.size
    })

    performanceMonitor.trackMetric('message_queue', {
      size: this.messageQueue.length
    })

    const memory = process.memoryUsage()
    performanceMonitor.trackMetric('memory_usage', {
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal
    })
  }

  // Utility methods
  private async fetchUpdatesFromDB(
    channel: string
  ): Promise<UpdateMessage[]> {
    // Implement your database fetch logic here
    return []
  }

  // Public API
  getConnectionStats(): {
    activeConnections: number
    messageQueueSize: number
    channels: Map<string, number>
  } {
    const channels = new Map<string, number>()
    this.io.sockets.adapter.rooms.forEach((room, channel) => {
      channels.set(channel, room.size)
    })

    return {
      activeConnections: this.clients.size,
      messageQueueSize: this.messageQueue.length,
      channels
    }
  }

  getClientInfo(clientId: string): ClientConnection | null {
    return this.clients.get(clientId) || null
  }
}

export const realTimeManager = RealTimeManager.getInstance()
