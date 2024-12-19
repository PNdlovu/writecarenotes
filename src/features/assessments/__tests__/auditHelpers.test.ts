import {
  auditAssessmentCreation,
  auditAssessmentUpdate,
  auditAssessmentCompletion,
  auditAssessmentDeletion,
  auditAssessmentAccess,
} from '../utils/auditHelpers';
import { AssessmentStatus, AssessmentType } from '../types/assessment.types';

// Mock Redis client
jest.mock('@upstash/redis', () => ({
  Redis: {
    fromEnv: jest.fn().mockReturnValue({
      lpush: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

describe('Audit Helpers', () => {
  const mockContext = {
    tenantId: 'test-tenant',
    userId: 'test-user',
    ip: 'localhost',
    userAgent: 'test-agent',
  };

  const mockAssessment = {
    id: 'test-assessment',
    residentId: 'test-resident',
    type: AssessmentType.DAILY,
    status: AssessmentStatus.IN_PROGRESS,
    sections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('auditAssessmentCreation', () => {
    it('should log assessment creation', async () => {
      await auditAssessmentCreation(mockAssessment, mockContext);

      // Verify Redis lpush was called with correct audit data
      expect(require('@upstash/redis').Redis.fromEnv().lpush).toHaveBeenCalledWith(
        'audit:assessments',
        expect.objectContaining({
          action: 'CREATE',
          assessmentId: mockAssessment.id,
          residentId: mockAssessment.residentId,
          userId: mockContext.userId,
          tenantId: mockContext.tenantId,
          timestamp: expect.any(String),
          metadata: expect.any(Object),
        })
      );
    });

    it('should handle errors gracefully', async () => {
      const redis = require('@upstash/redis').Redis.fromEnv();
      redis.lpush.mockRejectedValueOnce(new Error('Redis error'));

      await expect(auditAssessmentCreation(mockAssessment, mockContext))
        .resolves.not.toThrow();
    });
  });

  describe('auditAssessmentUpdate', () => {
    const updateData = {
      status: AssessmentStatus.COMPLETED,
      sections: [{ id: '1', completed: true }],
    };

    it('should log assessment update with changes', async () => {
      await auditAssessmentUpdate(mockAssessment, updateData, mockContext);

      expect(require('@upstash/redis').Redis.fromEnv().lpush).toHaveBeenCalledWith(
        'audit:assessments',
        expect.objectContaining({
          action: 'UPDATE',
          assessmentId: mockAssessment.id,
          changes: expect.objectContaining(updateData),
          userId: mockContext.userId,
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('auditAssessmentCompletion', () => {
    it('should log assessment completion', async () => {
      const completedAssessment = {
        ...mockAssessment,
        status: AssessmentStatus.COMPLETED,
        completedAt: new Date().toISOString(),
        completedBy: mockContext.userId,
      };

      await auditAssessmentCompletion(completedAssessment, mockContext);

      expect(require('@upstash/redis').Redis.fromEnv().lpush).toHaveBeenCalledWith(
        'audit:assessments',
        expect.objectContaining({
          action: 'COMPLETE',
          assessmentId: completedAssessment.id,
          completedBy: mockContext.userId,
          completedAt: expect.any(String),
        })
      );
    });
  });

  describe('auditAssessmentDeletion', () => {
    it('should log assessment deletion', async () => {
      await auditAssessmentDeletion(mockAssessment, mockContext);

      expect(require('@upstash/redis').Redis.fromEnv().lpush).toHaveBeenCalledWith(
        'audit:assessments',
        expect.objectContaining({
          action: 'DELETE',
          assessmentId: mockAssessment.id,
          userId: mockContext.userId,
          timestamp: expect.any(String),
          metadata: expect.objectContaining({
            assessmentType: mockAssessment.type,
            residentId: mockAssessment.residentId,
          }),
        })
      );
    });
  });

  describe('auditAssessmentAccess', () => {
    it('should log assessment access', async () => {
      await auditAssessmentAccess(mockAssessment.id, 'VIEW', mockContext);

      expect(require('@upstash/redis').Redis.fromEnv().lpush).toHaveBeenCalledWith(
        'audit:assessments',
        expect.objectContaining({
          action: 'ACCESS',
          accessType: 'VIEW',
          assessmentId: mockAssessment.id,
          userId: mockContext.userId,
          timestamp: expect.any(String),
        })
      );
    });

    it('should log assessment export', async () => {
      await auditAssessmentAccess(mockAssessment.id, 'EXPORT', mockContext);

      expect(require('@upstash/redis').Redis.fromEnv().lpush).toHaveBeenCalledWith(
        'audit:assessments',
        expect.objectContaining({
          action: 'ACCESS',
          accessType: 'EXPORT',
          assessmentId: mockAssessment.id,
          userId: mockContext.userId,
          timestamp: expect.any(String),
        })
      );
    });
  });
});


