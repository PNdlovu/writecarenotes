import { vi } from 'vitest';
import { auditLogger } from '@/lib/services/audit-logger';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    securityLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

describe('AuditLogger', () => {
  const mockSession = {
    user: {
      id: 'user123',
      organizationId: 'org123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'ADMIN',
    },
  };

  const mockRequest = {
    headers: new Map([
      ['x-forwarded-for', '192.168.1.1'],
      ['user-agent', 'Mozilla/5.0'],
    ]),
  } as unknown as Request;

  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
  });

  describe('logCarePlanAction', () => {
    it('creates audit log entry for care plan action', async () => {
      const metadata = { changes: { status: 'COMPLETED' } };
      
      await auditLogger.logCarePlanAction(
        'UPDATE',
        'careplan123',
        metadata,
        mockRequest
      );

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user123',
          organizationId: 'org123',
          action: 'UPDATE',
          resource: 'CARE_PLAN',
          resourceId: 'careplan123',
          metadata: expect.objectContaining({
            changes: { status: 'COMPLETED' },
            ip: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
          }),
          status: 'SUCCESS',
        }),
      });
    });

    it('creates security log for high-risk actions', async () => {
      await auditLogger.logCarePlanAction(
        'DELETE',
        'careplan123',
        {},
        mockRequest
      );

      expect(prisma.securityLog.create).toHaveBeenCalled();
    });

    it('handles missing user context', async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      
      const result = await auditLogger.logCarePlanAction(
        'UPDATE',
        'careplan123',
        {},
        mockRequest
      );

      expect(result).toBeUndefined();
      expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });
  });

  describe('logMedicationAction', () => {
    it('creates audit log entry for medication action', async () => {
      const metadata = { changes: { dose: '10mg' } };
      
      await auditLogger.logMedicationAction(
        'UPDATE',
        'med123',
        metadata,
        mockRequest
      );

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user123',
          organizationId: 'org123',
          action: 'UPDATE',
          resource: 'MEDICATION',
          resourceId: 'med123',
          metadata: expect.objectContaining({
            changes: { dose: '10mg' },
            ip: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
          }),
          status: 'SUCCESS',
        }),
      });
    });
  });

  describe('logError', () => {
    it('creates audit log entry for errors', async () => {
      const error = new Error('Test error');
      
      await auditLogger.logError(
        'UPDATE',
        'CARE_PLAN',
        'careplan123',
        error,
        {},
        mockRequest
      );

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'FAILURE',
          errorDetails: 'Test error',
        }),
      });
    });
  });

  describe('logBulkAction', () => {
    it('handles bulk actions correctly', async () => {
      const items = [
        { id: 'item1', metadata: { region: 'ENGLAND' } },
        { id: 'item2', metadata: { region: 'WALES' } },
      ];

      const result = await auditLogger.logBulkAction(
        'UPDATE',
        'CARE_PLAN',
        items,
        mockRequest
      );

      expect(prisma.auditLog.create).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        successful: 2,
        failed: 0,
      });
    });

    it('handles partial failures in bulk actions', async () => {
      const items = [
        { id: 'item1' },
        { id: 'item2' },
      ];

      (prisma.auditLog.create as jest.Mock)
        .mockResolvedValueOnce({})
        .mockRejectedValueOnce(new Error('Failed'));

      const result = await auditLogger.logBulkAction(
        'UPDATE',
        'CARE_PLAN',
        items,
        mockRequest
      );

      expect(result).toEqual({
        successful: 1,
        failed: 1,
      });
    });
  });

  describe('getAuditTrail', () => {
    it('retrieves audit trail with correct filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await auditLogger.getAuditTrail('CARE_PLAN', 'careplan123', {
        startDate,
        endDate,
        actions: ['UPDATE', 'DELETE'],
        limit: 10,
        offset: 0,
      });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          resource: 'CARE_PLAN',
          resourceId: 'careplan123',
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
          action: { in: ['UPDATE', 'DELETE'] },
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
        skip: 0,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });
    });
  });

  describe('getSecurityAuditTrail', () => {
    it('retrieves security audit trail with correct filters', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      await auditLogger.getSecurityAuditTrail('org123', {
        startDate,
        endDate,
        severity: 'HIGH',
        limit: 10,
        offset: 0,
      });

      expect(prisma.securityLog.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org123',
          timestamp: {
            gte: startDate,
            lte: endDate,
          },
          severity: 'HIGH',
        },
        orderBy: { timestamp: 'desc' },
        take: 10,
        skip: 0,
        include: {
          auditLog: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
        },
      });
    });
  });
}); 