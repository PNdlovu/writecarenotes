import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyticsService } from '../service';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { subHours, subDays } from 'date-fns';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    analyticsEvent: {
      findMany: vi.fn(),
      create: vi.fn()
    },
    performanceMetric: {
      findMany: vi.fn()
    },
    syncQueue: {
      count: vi.fn()
    },
    $queryRaw: vi.fn()
  }
}));

vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn()
  }
}));

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnalyticsService();
  });

  describe('getAnalytics', () => {
    it('fetches analytics data for 24h time range', async () => {
      const mockEvents = [{ id: 1, timestamp: Date.now() }];
      (prisma.analyticsEvent.findMany as any).mockResolvedValue(mockEvents);
      (prisma.syncQueue.count as any).mockResolvedValue(0);
      (prisma.$queryRaw as any).mockResolvedValue([{ size: 1000 }]);

      const result = await service.getAnalytics('24h');

      expect(prisma.analyticsEvent.findMany).toHaveBeenCalledWith({
        where: {
          timestamp: {
            gte: expect.any(Date)
          }
        },
        orderBy: {
          timestamp: 'desc'
        }
      });
      expect(result).toHaveProperty('events', mockEvents);
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('syncStatus');
    });

    it('uses cached metrics when available', async () => {
      const mockMetrics = { totalSize: 1000, eventCount: 10 };
      (redis.get as any).mockResolvedValue(JSON.stringify(mockMetrics));

      const result = await service.getAnalytics('24h');

      expect(result.metrics).toEqual(mockMetrics);
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });
  });

  describe('getPerformanceMetrics', () => {
    it('fetches performance metrics', async () => {
      const mockMetrics = [{ timestamp: Date.now(), syncDuration: 100 }];
      (prisma.performanceMetric.findMany as any).mockResolvedValue(mockMetrics);

      const result = await service.getPerformanceMetrics();

      expect(prisma.performanceMetric.findMany).toHaveBeenCalledWith({
        orderBy: {
          timestamp: 'desc'
        },
        take: 100
      });
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('trackEvent', () => {
    it('creates event and invalidates cache', async () => {
      const event = {
        type: 'test',
        timestamp: Date.now(),
        data: {},
        userId: 'user1'
      };

      await service.trackEvent(event);

      expect(prisma.analyticsEvent.create).toHaveBeenCalledWith({
        data: event
      });
      expect(redis.del).toHaveBeenCalledWith('analytics:metrics');
    });
  });
});
