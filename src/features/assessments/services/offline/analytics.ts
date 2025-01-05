import localforage from 'localforage';
import { CompressionService } from './compression';

interface AnalyticsEvent {
  id: string;
  type: string;
  timestamp: number;
  data: any;
  userId?: string;
  sessionId?: string;
}

interface AnalyticsBatch {
  id: string;
  events: AnalyticsEvent[];
  timestamp: number;
}

interface StorageMetrics {
  totalSize: number;
  eventCount: number;
  oldestEvent: number;
  newestEvent: number;
}

export class OfflineAnalytics {
  private static instance: OfflineAnalytics;
  private compressionService: CompressionService;
  private sessionId: string;
  private batchSize: number = 50;
  private maxStorageSize: number = 5 * 1024 * 1024; // 5MB
  private retentionDays: number = 30;

  private constructor() {
    this.compressionService = CompressionService.getInstance();
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): OfflineAnalytics {
    if (!OfflineAnalytics.instance) {
      OfflineAnalytics.instance = new OfflineAnalytics();
    }
    return OfflineAnalytics.instance;
  }

  private get store() {
    return localforage.createInstance({
      name: 'wsapp-analytics',
      storeName: 'events'
    });
  }

  async trackEvent(
    type: string,
    data: any,
    userId?: string
  ): Promise<void> {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type,
      timestamp: Date.now(),
      data,
      userId,
      sessionId: this.sessionId
    };

    await this.storeEvent(event);
    await this.enforceStorageLimits();
  }

  async trackAssessmentEvent(
    action: 'create' | 'update' | 'view' | 'complete',
    assessmentId: string,
    metadata: any = {}
  ): Promise<void> {
    await this.trackEvent('assessment', {
      action,
      assessmentId,
      ...metadata
    });
  }

  async trackSyncEvent(
    action: 'start' | 'complete' | 'fail',
    details: any = {}
  ): Promise<void> {
    await this.trackEvent('sync', {
      action,
      ...details
    });
  }

  async trackErrorEvent(
    error: Error,
    context: any = {}
  ): Promise<void> {
    await this.trackEvent('error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  async getEvents(
    startTime?: number,
    endTime?: number,
    eventTypes?: string[]
  ): Promise<AnalyticsEvent[]> {
    const events: AnalyticsEvent[] = [];
    await this.store.iterate<AnalyticsEvent, void>((event) => {
      if (this.filterEvent(event, startTime, endTime, eventTypes)) {
        events.push(event);
      }
    });
    return events.sort((a, b) => a.timestamp - b.timestamp);
  }

  async getStorageMetrics(): Promise<StorageMetrics> {
    let totalSize = 0;
    let eventCount = 0;
    let oldestEvent = Date.now();
    let newestEvent = 0;

    await this.store.iterate<AnalyticsEvent, void>((event) => {
      eventCount++;
      totalSize += JSON.stringify(event).length;
      oldestEvent = Math.min(oldestEvent, event.timestamp);
      newestEvent = Math.max(newestEvent, event.timestamp);
    });

    return {
      totalSize,
      eventCount,
      oldestEvent,
      newestEvent
    };
  }

  async createBatch(): Promise<AnalyticsBatch | null> {
    const events = await this.getEvents(
      Date.now() - this.retentionDays * 24 * 60 * 60 * 1000
    );

    if (events.length === 0) return null;

    const batch: AnalyticsBatch = {
      id: this.generateBatchId(),
      events: events.slice(0, this.batchSize),
      timestamp: Date.now()
    };

    // Compress batch before returning
    return {
      ...batch,
      events: this.compressionService.compress(batch.events) as any
    };
  }

  async clearProcessedEvents(eventIds: string[]): Promise<void> {
    for (const id of eventIds) {
      await this.store.removeItem(id);
    }
  }

  private async storeEvent(event: AnalyticsEvent): Promise<void> {
    await this.store.setItem(event.id, event);
  }

  private async enforceStorageLimits(): Promise<void> {
    const metrics = await this.getStorageMetrics();

    if (metrics.totalSize > this.maxStorageSize) {
      const events = await this.getEvents();
      const eventsToRemove = events
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, Math.floor(events.length * 0.2)); // Remove oldest 20%

      for (const event of eventsToRemove) {
        await this.store.removeItem(event.id);
      }
    }
  }

  private filterEvent(
    event: AnalyticsEvent,
    startTime?: number,
    endTime?: number,
    eventTypes?: string[]
  ): boolean {
    if (startTime && event.timestamp < startTime) return false;
    if (endTime && event.timestamp > endTime) return false;
    if (eventTypes && !eventTypes.includes(event.type)) return false;
    return true;
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateBatchId(): string {
    return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
