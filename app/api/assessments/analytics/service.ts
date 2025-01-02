import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import type { AnalyticsEvent, AnalyticsData, PerformanceData } from '@/features/assessments/types';
import { subHours, subDays } from 'date-fns';

export function getAnalyticsService() {
  return new AnalyticsService();
}

export class AnalyticsService {
  async getAnalytics(timeRange: string): Promise<AnalyticsData> {
    const startTime = this.getStartTime(timeRange);
    
    const events = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: startTime
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    const metrics = await this.calculateMetrics(events);
    const syncStatus = await this.getSyncStatus();

    return {
      events,
      metrics,
      syncStatus
    };
  }

  async getPerformanceMetrics(): Promise<PerformanceData[]> {
    return prisma.performanceMetric.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: 100
    });
  }

  async trackEvent(event: Omit<AnalyticsEvent, 'id'>): Promise<void> {
    await prisma.analyticsEvent.create({
      data: {
        type: event.type,
        timestamp: event.timestamp,
        data: event.data,
        userId: event.userId,
        sessionId: event.sessionId
      }
    });

    // Cache invalidation
    await redis.del('analytics:metrics');
  }

  private getStartTime(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case '24h':
        return subHours(now, 24);
      case '7d':
        return subDays(now, 7);
      case '30d':
        return subDays(now, 30);
      default:
        return subHours(now, 24);
    }
  }

  private async calculateMetrics(events: AnalyticsEvent[]) {
    const cachedMetrics = await redis.get('analytics:metrics');
    if (cachedMetrics) {
      return JSON.parse(cachedMetrics);
    }

    const metrics = {
      totalSize: await this.calculateStorageSize(),
      eventCount: events.length,
      oldestEvent: events[events.length - 1]?.timestamp || 0,
      newestEvent: events[0]?.timestamp || 0
    };

    await redis.set('analytics:metrics', JSON.stringify(metrics), 'EX', 300); // Cache for 5 minutes
    return metrics;
  }

  private async calculateStorageSize(): Promise<number> {
    const result = await prisma.$queryRaw`
      SELECT pg_total_relation_size('analytics_events') as size;
    `;
    return (result as any)[0].size;
  }

  private async getSyncStatus() {
    const [pending, processing, failed, completed] = await Promise.all([
      prisma.syncQueue.count({ where: { status: 'pending' } }),
      prisma.syncQueue.count({ where: { status: 'processing' } }),
      prisma.syncQueue.count({ where: { status: 'failed' } }),
      prisma.syncQueue.count({ where: { status: 'completed' } })
    ]);

    return {
      pendingCount: pending,
      processingCount: processing,
      failedCount: failed,
      completedCount: completed
    };
  }
}
