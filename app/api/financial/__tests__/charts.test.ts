/**
 * @fileoverview Chart Generation Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { Redis } from '@/lib/redis';
import { Metrics } from '@/lib/metrics';
import { generateChartData } from '../routes/[organizationId]/currency/charts/route';

// Mock Redis and Metrics
jest.mock('@/lib/redis');
jest.mock('@/lib/metrics');

describe('Chart Generation', () => {
  const organizationId = 'test-org';
  const defaultOptions = {
    period: '2024-03',
    granularity: 'day' as const,
    type: 'line' as const,
    metric: 'volume',
    limit: 10,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Volume Charts', () => {
    const mockVolumeData = {
      '2024-03-01': 1000,
      '2024-03-02': 1500,
      '2024-03-03': 1200,
    };

    beforeEach(() => {
      (Metrics.prototype.getTimeSeries as jest.Mock).mockResolvedValue(mockVolumeData);
    });

    it('should generate volume chart data', async () => {
      const result = await generateChartData(organizationId, {
        ...defaultOptions,
        metric: 'volume',
      });

      expect(result).toEqual({
        type: 'line',
        labels: ['2024-03-01', '2024-03-02', '2024-03-03'],
        datasets: [{
          label: 'Conversion Volume',
          data: [1000, 1500, 1200],
          borderColor: '#4CAF50',
          fill: false,
        }],
      });
    });

    it('should handle different chart types', async () => {
      const result = await generateChartData(organizationId, {
        ...defaultOptions,
        metric: 'volume',
        type: 'bar',
      });

      expect(result.type).toBe('bar');
    });
  });

  describe('Transaction Charts', () => {
    const mockTransactionData = {
      '2024-03-01': 100,
      '2024-03-02': 150,
      '2024-03-03': 120,
    };

    beforeEach(() => {
      (Metrics.prototype.getTimeSeries as jest.Mock).mockResolvedValue(mockTransactionData);
    });

    it('should generate transaction chart data', async () => {
      const result = await generateChartData(organizationId, {
        ...defaultOptions,
        metric: 'transactions',
      });

      expect(result).toEqual({
        type: 'line',
        labels: ['2024-03-01', '2024-03-02', '2024-03-03'],
        datasets: [{
          label: 'Transaction Count',
          data: [100, 150, 120],
          borderColor: '#2196F3',
          fill: false,
        }],
      });
    });
  });

  describe('Error Charts', () => {
    const mockErrorData = {
      'validation': {
        '2024-03-01': 5,
        '2024-03-02': 3,
      },
      'network': {
        '2024-03-01': 2,
        '2024-03-02': 1,
      },
    };

    beforeEach(() => {
      (Metrics.prototype.getGroupedTimeSeries as jest.Mock).mockResolvedValue(mockErrorData);
    });

    it('should generate error chart data', async () => {
      const result = await generateChartData(organizationId, {
        ...defaultOptions,
        metric: 'errors',
      });

      expect(result.type).toBe('line');
      expect(result.labels).toEqual(['2024-03-01', '2024-03-02']);
      expect(result.datasets).toHaveLength(2);
      expect(result.datasets[0].label).toBe('validation');
      expect(result.datasets[1].label).toBe('network');
    });
  });

  describe('Performance Charts', () => {
    const mockLatencyData = {
      '2024-03-01': 150,
      '2024-03-02': 140,
    };

    const mockSuccessData = {
      '2024-03-01': 0.98,
      '2024-03-02': 0.99,
    };

    beforeEach(() => {
      (Metrics.prototype.getTimeSeries as jest.Mock)
        .mockResolvedValueOnce(mockLatencyData);
      (Metrics.prototype.getSuccessRateTimeSeries as jest.Mock)
        .mockResolvedValue(mockSuccessData);
    });

    it('should generate performance chart data', async () => {
      const result = await generateChartData(organizationId, {
        ...defaultOptions,
        metric: 'performance',
      });

      expect(result.type).toBe('line');
      expect(result.labels).toEqual(['2024-03-01', '2024-03-02']);
      expect(result.datasets).toHaveLength(2);
      expect(result.datasets[0].label).toBe('Average Latency (ms)');
      expect(result.datasets[1].label).toBe('Success Rate (%)');
    });
  });

  describe('Regional Charts', () => {
    const mockRegionalData = {
      'England': 50000,
      'Scotland': 30000,
      'Wales': 20000,
    };

    beforeEach(() => {
      (Metrics.prototype.getGroupedSum as jest.Mock).mockResolvedValue(mockRegionalData);
    });

    it('should generate regional chart data', async () => {
      const result = await generateChartData(organizationId, {
        ...defaultOptions,
        metric: 'regional',
      });

      expect(result.type).toBe('line');
      expect(result.labels).toEqual(['England', 'Scotland', 'Wales']);
      expect(result.datasets).toHaveLength(1);
      expect(result.datasets[0].label).toBe('Volume by Region');
      expect(result.datasets[0].data).toEqual([50000, 30000, 20000]);
    });

    it('should respect limit option', async () => {
      const result = await generateChartData(organizationId, {
        ...defaultOptions,
        metric: 'regional',
        limit: 2,
      });

      expect(result.labels).toHaveLength(2);
      expect(result.datasets[0].data).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unsupported metric', async () => {
      await expect(generateChartData(organizationId, {
        ...defaultOptions,
        metric: 'invalid',
      }))
        .rejects
        .toThrow('Unsupported metric: invalid');
    });

    it('should handle empty data', async () => {
      (Metrics.prototype.getTimeSeries as jest.Mock).mockResolvedValue({});

      const result = await generateChartData(organizationId, defaultOptions);

      expect(result.labels).toHaveLength(0);
      expect(result.datasets[0].data).toHaveLength(0);
    });
  });
}); 