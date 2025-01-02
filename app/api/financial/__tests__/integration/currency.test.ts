/**
 * @fileoverview Currency API Integration Tests
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { createMocks } from 'node-mocks-http';
import { GET as getReports } from '../../routes/[organizationId]/currency/reports/route';
import { GET as getCharts } from '../../routes/[organizationId]/currency/charts/route';
import { auth } from '@/lib/auth';
import { Redis } from '@/lib/redis';
import { Metrics } from '@/lib/metrics';

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@/lib/redis');
jest.mock('@/lib/metrics');

describe('Currency API Integration', () => {
  const organizationId = 'test-org';
  const mockSession = {
    user: {
      organizationId,
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('Reports API', () => {
    it('should return JSON report by default', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {},
      });

      await getReports(req, { params: { organizationId } });

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('summary');
      expect(data).toHaveProperty('trends');
    });

    it('should generate CSV report', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          format: 'csv',
          template: 'default',
        },
      });

      await getReports(req, { params: { organizationId } });

      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()['content-type']).toBe('text/csv');
      expect(res._getHeaders()['content-disposition']).toContain('.csv');
    });

    it('should generate PDF report', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          format: 'pdf',
          template: 'detailed',
        },
      });

      await getReports(req, { params: { organizationId } });

      expect(res._getStatusCode()).toBe(200);
      expect(res._getHeaders()['content-type']).toBe('application/pdf');
      expect(res._getHeaders()['content-disposition']).toContain('.pdf');
    });

    it('should handle unauthorized access', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
        query: {},
      });

      await getReports(req, { params: { organizationId } });

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toHaveProperty('error');
    });

    it('should handle invalid parameters', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          format: 'invalid',
        },
      });

      await getReports(req, { params: { organizationId } });

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toHaveProperty('error');
    });
  });

  describe('Charts API', () => {
    beforeEach(() => {
      (Redis.prototype.get as jest.Mock).mockResolvedValue(null);
      (Metrics.prototype.getTimeSeries as jest.Mock).mockResolvedValue({
        '2024-03-01': 1000,
        '2024-03-02': 1500,
      });
    });

    it('should return volume chart data', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          metric: 'volume',
          type: 'line',
        },
      });

      await getCharts(req, { params: { organizationId } });

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('type', 'line');
      expect(data).toHaveProperty('datasets');
      expect(data.datasets[0]).toHaveProperty('label', 'Conversion Volume');
    });

    it('should return cached chart data when available', async () => {
      const cachedData = {
        type: 'line',
        labels: ['2024-03-01'],
        datasets: [{
          label: 'Cached Data',
          data: [1000],
        }],
      };
      (Redis.prototype.get as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));

      const { req, res } = createMocks({
        method: 'GET',
        query: {
          metric: 'volume',
        },
      });

      await getCharts(req, { params: { organizationId } });

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toEqual(cachedData);
    });

    it('should handle different chart types', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          metric: 'volume',
          type: 'bar',
        },
      });

      await getCharts(req, { params: { organizationId } });

      expect(res._getStatusCode()).toBe(200);
      const data = JSON.parse(res._getData());
      expect(data).toHaveProperty('type', 'bar');
    });

    it('should respect granularity parameter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          metric: 'volume',
          granularity: 'week',
        },
      });

      await getCharts(req, { params: { organizationId } });

      expect(res._getStatusCode()).toBe(200);
      expect(Metrics.prototype.getTimeSeries).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        'week',
        expect.any(String)
      );
    });

    it('should handle unauthorized access', async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const { req, res } = createMocks({
        method: 'GET',
        query: {},
      });

      await getCharts(req, { params: { organizationId } });

      expect(res._getStatusCode()).toBe(401);
      expect(JSON.parse(res._getData())).toHaveProperty('error');
    });

    it('should handle invalid metric parameter', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        query: {
          metric: 'invalid',
        },
      });

      await getCharts(req, { params: { organizationId } });

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toHaveProperty('error');
    });
  });
}); 