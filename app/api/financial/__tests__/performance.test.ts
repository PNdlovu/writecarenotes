/**
 * @fileoverview Performance Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { generateExport } from '../handlers/core/exportTemplates';
import { generateChartData } from '../routes/[organizationId]/currency/charts/route';
import { Redis } from '@/lib/redis';
import { Metrics } from '@/lib/metrics';

jest.mock('@/lib/redis');
jest.mock('@/lib/metrics');

describe('Performance Tests', () => {
  const organizationId = 'test-org';
  let startTime: number;

  beforeEach(() => {
    jest.clearAllMocks();
    startTime = Date.now();
  });

  afterEach(() => {
    const duration = Date.now() - startTime;
    // Each test should complete within 1 second
    expect(duration).toBeLessThan(1000);
  });

  describe('Report Generation Performance', () => {
    const mockData = {
      period: '2024-03',
      transactions: Array(1000).fill({ amount: 100 }),
      metrics: Array(50).fill({
        timestamp: new Date().toISOString(),
        value: Math.random() * 100,
      }),
    };

    it('should handle large datasets efficiently', async () => {
      const result = await generateExport(mockData, {
        title: 'Large Dataset Test',
        period: '2024-03',
        organizationId,
        format: 'csv',
      });
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should maintain performance with nested data', async () => {
      const nestedData = {
        ...mockData,
        regional: Object.fromEntries(
          Array(100).fill(null).map((_, i) => [
            `Region${i}`,
            {
              metrics: Array(20).fill({
                name: `Metric${i}`,
                value: Math.random() * 100,
              }),
            },
          ])
        ),
      };

      const result = await generateExport(nestedData, {
        title: 'Nested Data Test',
        period: '2024-03',
        organizationId,
        format: 'csv',
      });
      expect(result).toBeInstanceOf(Buffer);
    });

    it('should handle concurrent report generation', async () => {
      const promises = Array(5).fill(null).map(() =>
        generateExport(mockData, {
          title: 'Concurrent Test',
          period: '2024-03',
          organizationId,
          format: 'csv',
        })
      );

      const results = await Promise.all(promises);
      results.forEach(result => expect(result).toBeInstanceOf(Buffer));
    });
  });

  describe('Chart Generation Performance', () => {
    beforeEach(() => {
      (Redis.prototype.get as jest.Mock).mockResolvedValue(null);
      (Metrics.prototype.getTimeSeries as jest.Mock).mockResolvedValue(
        Object.fromEntries(
          Array(365).fill(null).map((_, i) => [
            new Date(2024, 0, i + 1).toISOString().split('T')[0],
            Math.random() * 1000,
          ])
        )
      );
    });

    it('should handle year-long data efficiently', async () => {
      const result = await generateChartData(organizationId, {
        period: '2024',
        granularity: 'day',
        type: 'line',
        metric: 'volume',
      });

      expect(result.labels).toHaveLength(365);
      expect(result.datasets[0].data).toHaveLength(365);
    });

    it('should maintain performance with multiple datasets', async () => {
      (Metrics.prototype.getGroupedTimeSeries as jest.Mock).mockResolvedValue(
        Object.fromEntries(
          Array(10).fill(null).map((_, i) => [
            `Dataset${i}`,
            Object.fromEntries(
              Array(100).fill(null).map((_, j) => [
                new Date(2024, 0, j + 1).toISOString().split('T')[0],
                Math.random() * 1000,
              ])
            ),
          ])
        )
      );

      const result = await generateChartData(organizationId, {
        period: '2024-01',
        granularity: 'day',
        type: 'line',
        metric: 'errors',
      });

      expect(result.datasets).toHaveLength(10);
      result.datasets.forEach(dataset => {
        expect(dataset.data).toHaveLength(100);
      });
    });

    it('should handle concurrent chart requests', async () => {
      const promises = Array(10).fill(null).map(() =>
        generateChartData(organizationId, {
          period: '2024-03',
          granularity: 'day',
          type: 'line',
          metric: 'volume',
        })
      );

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result.type).toBe('line');
        expect(result.datasets).toBeDefined();
      });
    });
  });

  describe('Cache Performance', () => {
    const mockCacheData = {
      type: 'line',
      labels: Array(100).fill(null).map((_, i) => `Label${i}`),
      datasets: [{
        label: 'Test Dataset',
        data: Array(100).fill(null).map(() => Math.random() * 1000),
      }],
    };

    beforeEach(() => {
      (Redis.prototype.get as jest.Mock).mockResolvedValue(JSON.stringify(mockCacheData));
    });

    it('should return cached data quickly', async () => {
      const result = await generateChartData(organizationId, {
        period: '2024-03',
        granularity: 'day',
        type: 'line',
        metric: 'volume',
      });

      expect(result).toEqual(mockCacheData);
      expect(Date.now() - startTime).toBeLessThan(100); // Should be very fast
    });

    it('should handle cache misses gracefully', async () => {
      (Redis.prototype.get as jest.Mock).mockResolvedValue(null);
      (Metrics.prototype.getTimeSeries as jest.Mock).mockResolvedValue({
        '2024-03-01': 1000,
        '2024-03-02': 1500,
      });

      const result = await generateChartData(organizationId, {
        period: '2024-03',
        granularity: 'day',
        type: 'line',
        metric: 'volume',
      });

      expect(result.datasets[0].data).toEqual([1000, 1500]);
    });

    it('should handle concurrent cache access', async () => {
      const promises = Array(20).fill(null).map(() =>
        generateChartData(organizationId, {
          period: '2024-03',
          granularity: 'day',
          type: 'line',
          metric: 'volume',
        })
      );

      const results = await Promise.all(promises);
      results.forEach(result => expect(result).toEqual(mockCacheData));
    });
  });

  describe('Memory Usage', () => {
    it('should handle memory-intensive operations', async () => {
      const largeData = {
        period: '2024-03',
        transactions: Array(10000).fill({
          id: Math.random().toString(),
          amount: Math.random() * 1000,
          timestamp: new Date().toISOString(),
          metadata: {
            user: 'Test User',
            location: 'Test Location',
            details: Array(10).fill('Test Detail'),
          },
        }),
      };

      const initialMemory = process.memoryUsage().heapUsed;
      await generateExport(largeData, {
        title: 'Memory Test',
        period: '2024-03',
        organizationId,
        format: 'csv',
      });
      const memoryUsed = process.memoryUsage().heapUsed - initialMemory;

      // Should not use more than 100MB additional memory
      expect(memoryUsed).toBeLessThan(100 * 1024 * 1024);
    });

    it('should clean up resources after large operations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Perform multiple large operations
      for (let i = 0; i < 5; i++) {
        await generateChartData(organizationId, {
          period: '2024',
          granularity: 'hour',
          type: 'line',
          metric: 'volume',
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const memoryUsed = process.memoryUsage().heapUsed - initialMemory;
      // Should not retain significant memory
      expect(memoryUsed).toBeLessThan(50 * 1024 * 1024);
    });
  });
}); 