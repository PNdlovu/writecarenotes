import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET } from '@/app/api/compliance/stats/route';
import { prisma } from '@/lib/prisma';
import { regulatoryCompliance } from '@/lib/services/regulatory-compliance';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/prisma');
jest.mock('@/lib/services/regulatory-compliance');

describe('Compliance Stats API', () => {
  const mockSession = {
    user: { id: 'test-user-id' }
  };

  const mockOrganization = {
    id: 'test-org-id',
    name: 'Test Care Home'
  };

  const mockReport = {
    scores: {
      overall: 85,
      trend: 'up',
      byCategory: {
        safety: 90,
        care: 85,
        effectiveness: 80
      }
    },
    requirements: [
      { id: '1', status: 'COMPLIANT' },
      { id: '2', status: 'NON_COMPLIANT' }
    ],
    missingRequirements: [{ id: '3' }],
    upcomingDeadlines: [{ id: '4' }, { id: '5' }],
    recentSubmissions: [{ id: '6' }]
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.organization.findFirst as jest.Mock).mockResolvedValue(mockOrganization);
    (regulatoryCompliance.generateComplianceReport as jest.Mock).mockResolvedValue(mockReport);
  });

  it('should return 401 if not authenticated', async () => {
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost/api/compliance/stats?region=england');
    const response = await GET(request);
    
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('Unauthorized');
  });

  it('should return 400 if region is missing', async () => {
    const request = new NextRequest('http://localhost/api/compliance/stats');
    const response = await GET(request);
    
    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Region is required');
  });

  it('should return 404 if organization not found', async () => {
    (prisma.organization.findFirst as jest.Mock).mockResolvedValue(null);
    
    const request = new NextRequest('http://localhost/api/compliance/stats?region=england');
    const response = await GET(request);
    
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Organization not found');
  });

  it('should return compliance stats for valid request', async () => {
    const request = new NextRequest('http://localhost/api/compliance/stats?region=england');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toEqual({
      overallCompliance: 85,
      totalRequirements: 2,
      completedRequirements: 1,
      overdueRequirements: 1,
      upcomingDeadlines: 2,
      recentSubmissions: 1,
      complianceTrend: 'up',
      categoryScores: {
        safety: 90,
        care: 85,
        effectiveness: 80
      }
    });
  });

  it('should handle errors gracefully', async () => {
    (regulatoryCompliance.generateComplianceReport as jest.Mock).mockRejectedValue(new Error('Test error'));
    
    const request = new NextRequest('http://localhost/api/compliance/stats?region=england');
    const response = await GET(request);
    
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Internal Server Error');
  });
}); 