import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { GET, PUT } from '@/app/api/compliance/deadlines/route';
import { prisma } from '@/lib/prisma';
import { regulatoryCompliance } from '@/lib/services/regulatory-compliance';
import { addDays } from 'date-fns';

// Mock dependencies
jest.mock('next-auth');
jest.mock('@/lib/prisma');
jest.mock('@/lib/services/regulatory-compliance');
jest.mock('date-fns', () => ({
  addDays: jest.fn((date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000))
}));

describe('Compliance Deadlines API', () => {
  const mockSession = {
    user: { id: 'test-user-id' }
  };

  const mockOrganization = {
    id: 'test-org-id',
    name: 'Test Care Home'
  };

  const mockDate = new Date('2024-01-01');
  const mockReport = {
    upcomingDeadlines: [
      { id: '1', dueDate: addDays(mockDate, 3) },
      { id: '2', dueDate: addDays(mockDate, 15) },
      { id: '3', dueDate: addDays(mockDate, 45) }
    ],
    missingRequirements: [{ id: '4' }, { id: '5' }]
  };

  beforeEach(() => {
    jest.resetAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
    
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    (prisma.organization.findFirst as jest.Mock).mockResolvedValue(mockOrganization);
    (regulatoryCompliance.generateComplianceReport as jest.Mock).mockResolvedValue(mockReport);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('GET', () => {
    it('should return 401 if not authenticated', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/compliance/deadlines?region=england');
      const response = await GET(request);
      
      expect(response.status).toBe(401);
      expect(await response.text()).toBe('Unauthorized');
    });

    it('should return 400 if region is missing', async () => {
      const request = new NextRequest('http://localhost/api/compliance/deadlines');
      const response = await GET(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Region is required');
    });

    it('should return deadlines filtered by 7 days timeframe', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/deadlines?region=england&timeframe=7days'
      );
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.deadlines).toHaveLength(1);
      expect(data.total).toBe(1);
      expect(data.critical).toBe(1);
      expect(data.overdue).toBe(2);
    });

    it('should return deadlines filtered by 30 days timeframe', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/deadlines?region=england&timeframe=30days'
      );
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.deadlines).toHaveLength(2);
      expect(data.total).toBe(2);
    });

    it('should return all deadlines when timeframe is all', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/deadlines?region=england&timeframe=all'
      );
      const response = await GET(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.deadlines).toHaveLength(3);
      expect(data.total).toBe(3);
    });
  });

  describe('PUT', () => {
    const mockDeadline = {
      id: '1',
      status: 'COMPLETED',
      dueDate: new Date('2024-02-01')
    };

    it('should update deadline status', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/deadlines',
        {
          method: 'PUT',
          body: JSON.stringify({
            id: '1',
            status: 'COMPLETED'
          })
        }
      );

      (prisma.complianceDeadline.update as jest.Mock).mockResolvedValue(mockDeadline);

      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.status).toBe('COMPLETED');
      expect(prisma.complianceDeadline.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: expect.objectContaining({
          status: 'COMPLETED',
          updatedBy: mockSession.user.id
        })
      });
    });

    it('should update deadline date', async () => {
      const newDate = new Date('2024-03-01');
      const request = new NextRequest(
        'http://localhost/api/compliance/deadlines',
        {
          method: 'PUT',
          body: JSON.stringify({
            id: '1',
            newDate
          })
        }
      );

      (prisma.complianceDeadline.update as jest.Mock).mockResolvedValue({
        ...mockDeadline,
        dueDate: newDate
      });

      const response = await PUT(request);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(new Date(data.dueDate)).toEqual(newDate);
    });

    it('should return 400 if deadline ID is missing', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/deadlines',
        {
          method: 'PUT',
          body: JSON.stringify({
            status: 'COMPLETED'
          })
        }
      );

      const response = await PUT(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Deadline ID and either status or new date are required');
    });

    it('should return 400 if both status and newDate are missing', async () => {
      const request = new NextRequest(
        'http://localhost/api/compliance/deadlines',
        {
          method: 'PUT',
          body: JSON.stringify({
            id: '1'
          })
        }
      );

      const response = await PUT(request);
      
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Deadline ID and either status or new date are required');
    });
  });
}); 