import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET } from '@/app/api/compliance/monitoring/route';
import { redis } from '@/lib/cache';
import { RequestLog } from '@/lib/request-logger';
import { withRateLimit } from '@/lib/rate-limit';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/cache');
jest.mock('@/lib/rate-limit');

describe('Compliance Monitoring API', () => {
  const mockSession = {
    user: { 
      id: 'test-user-id',
      role: 'ADMIN'
    }
  };

  const mockLogs: RequestLog[] = [
    {
      timestamp: new Date().toISOString(),
      method: 'GET',
      path: '/api/compliance/stats',
      query: { region: 'england' },
      userId: 'user1',
      organizationId: 'org1',
      duration: 150,
      status: 200,
      region: 'england',
      userAgent: 'test-agent',
      ip: '127.0.0.1'
    },
    {
      timestamp: new Date().toISOString(),
      method: 'POST',
      path: '/api/compliance/requirements',
      query: {},
      userId: 'user2',
      organizationId: 'org1',
      duration: 300,
      status: 400,
      region: 'wales',
      userAgent: 'test-agent',
      ip: '127.0.0.1'
    }
  ];

  beforeEach(() => {
    jest.resetAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (redis.keys as jest.Mock).mockResolvedValue(['log1', 'log2']);
    (redis.get as jest.Mock).mockImplementation((key) => {
      return Promise.resolve(mockLogs[parseInt(key.split(':')[1]) - 1]);
    });
    (withRateLimit as jest.Mock).mockResolvedValue({
      success: true,
      headers: {
        'X-RateLimit-Limit': '50',
        'X-RateLimit-Remaining': '49',
        'X-RateLimit-Reset': '60'
      }
    });
  });

  it('should return 401 if not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost/api/compliance/monitoring');
    const response = await GET(request);
    
    expect(response.status).toBe(401);
  });

  it('should return 401 if not admin', async () => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: { id: 'test-user-id', role: 'USER' }
    });
    
    const request = new NextRequest('http://localhost/api/compliance/monitoring');
    const response = await GET(request);
    
    expect(response.status).toBe(401);
  });

  it('should return 429 if rate limit exceeded', async () => {
    (withRateLimit as jest.Mock).mockResolvedValue({
      success: false,
      headers: {
        'X-RateLimit-Limit': '50',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': '60'
      }
    });
    
    const request = new NextRequest('http://localhost/api/compliance/monitoring');
    const response = await GET(request);
    
    expect(response.status).toBe(429);
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('should return 400 for invalid query parameters', async () => {
    const request = new NextRequest(
      'http://localhost/api/compliance/monitoring?timeWindow=0'
    );
    const response = await GET(request);
    
    expect(response.status).toBe(400);
  });

  it('should return monitoring data with default parameters', async () => {
    const request = new NextRequest('http://localhost/api/compliance/monitoring');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('metrics');
    expect(data).toHaveProperty('logs');
    expect(data).toHaveProperty('pagination');
    
    expect(data.metrics).toHaveProperty('errorRate');
    expect(data.metrics).toHaveProperty('avgResponseTime');
    expect(data.metrics).toHaveProperty('statusCodes');
    expect(data.metrics).toHaveProperty('regionDistribution');
  });

  it('should filter logs by region', async () => {
    const request = new NextRequest(
      'http://localhost/api/compliance/monitoring?region=england'
    );
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.logs.every((log: RequestLog) => log.region === 'england')).toBe(true);
  });

  it('should filter logs by status code', async () => {
    const request = new NextRequest(
      'http://localhost/api/compliance/monitoring?status=400'
    );
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.logs.every((log: RequestLog) => log.status === 400)).toBe(true);
  });

  it('should handle pagination correctly', async () => {
    const request = new NextRequest(
      'http://localhost/api/compliance/monitoring?page=1&pageSize=1'
    );
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.logs).toHaveLength(1);
    expect(data.pagination).toEqual({
      total: 2,
      page: 1,
      pageSize: 1,
      totalPages: 2
    });
  });

  it('should calculate metrics correctly', async () => {
    const request = new NextRequest('http://localhost/api/compliance/monitoring');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.metrics.statusCodes).toEqual({
      2: 1, // One 200 response
      4: 1  // One 400 response
    });
    expect(data.metrics.regionDistribution).toEqual({
      england: 1,
      wales: 1
    });
  });

  it('should handle errors gracefully', async () => {
    (redis.keys as jest.Mock).mockRejectedValue(new Error('Redis error'));
    
    const request = new NextRequest('http://localhost/api/compliance/monitoring');
    const response = await GET(request);
    
    expect(response.status).toBe(500);
  });
}); 