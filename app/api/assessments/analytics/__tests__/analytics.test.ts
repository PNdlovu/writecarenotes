import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { GET, POST } from '../route';
import { getAnalyticsService } from '../service';
import { auth } from '@/auth';

vi.mock('@/auth', () => ({
  auth: vi.fn()
}));

vi.mock('../service', () => ({
  getAnalyticsService: vi.fn()
}));

describe('Analytics API', () => {
  const mockSession = {
    user: { id: 'test-user-id' }
  };

  const mockAnalyticsService = {
    getAnalytics: vi.fn(),
    trackEvent: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (auth as any).mockResolvedValue(mockSession);
    (getAnalyticsService as any).mockReturnValue(mockAnalyticsService);
  });

  describe('GET /api/assessments/analytics', () => {
    it('returns 401 when not authenticated', async () => {
      (auth as any).mockResolvedValue(null);
      const req = new Request('http://localhost/api/assessments/analytics?timeRange=24h');
      const response = await GET(req);
      expect(response.status).toBe(401);
    });

    it('returns 400 for invalid time range', async () => {
      const req = new Request('http://localhost/api/assessments/analytics?timeRange=invalid');
      const response = await GET(req);
      expect(response.status).toBe(400);
    });

    it('returns analytics data for valid request', async () => {
      const mockData = { events: [], metrics: {}, syncStatus: {} };
      mockAnalyticsService.getAnalytics.mockResolvedValue(mockData);

      const req = new Request('http://localhost/api/assessments/analytics?timeRange=24h');
      const response = await GET(req);
      
      expect(response).toBeInstanceOf(NextResponse);
      expect(await response.json()).toEqual(mockData);
      expect(mockAnalyticsService.getAnalytics).toHaveBeenCalledWith('24h');
    });
  });

  describe('POST /api/assessments/analytics', () => {
    it('returns 401 when not authenticated', async () => {
      (auth as any).mockResolvedValue(null);
      const req = new Request('http://localhost/api/assessments/analytics', {
        method: 'POST',
        body: JSON.stringify({ type: 'test' })
      });
      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    it('tracks event for valid request', async () => {
      const eventData = { type: 'test_event', data: { test: true } };
      const req = new Request('http://localhost/api/assessments/analytics', {
        method: 'POST',
        body: JSON.stringify(eventData)
      });

      const response = await POST(req);
      
      expect(response.status).toBe(200);
      expect(mockAnalyticsService.trackEvent).toHaveBeenCalledWith({
        ...eventData,
        userId: mockSession.user.id,
        timestamp: expect.any(Number)
      });
    });
  });
});
