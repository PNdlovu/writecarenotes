/**
 * @jest-environment jsdom
 */

import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { AssessmentType, AssessmentStatus } from '../types/assessment.types';
import * as assessmentApi from '../api/assessments';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

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

describe('Assessment API', () => {
  describe('getAssessments', () => {
    it('should fetch assessments successfully', async () => {
      server.use(
        rest.get('/api/residents/:residentId/assessments', (req, res, ctx) => {
          return res(ctx.json([mockAssessment]));
        })
      );

      const assessments = await assessmentApi.getAssessments('test-resident', mockContext);
      expect(assessments).toHaveLength(1);
      expect(assessments[0]).toEqual(mockAssessment);
    });

    it('should handle fetch error', async () => {
      server.use(
        rest.get('/api/residents/:residentId/assessments', (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      await expect(assessmentApi.getAssessments('test-resident', mockContext))
        .rejects.toThrow('Failed to fetch assessments');
    });
  });

  describe('getAssessmentById', () => {
    it('should fetch single assessment successfully', async () => {
      server.use(
        rest.get('/api/residents/:residentId/assessments/:assessmentId', (req, res, ctx) => {
          return res(ctx.json(mockAssessment));
        })
      );

      const assessment = await assessmentApi.getAssessmentById(
        'test-resident',
        'test-assessment',
        mockContext
      );
      expect(assessment).toEqual(mockAssessment);
    });

    it('should handle fetch error', async () => {
      server.use(
        rest.get('/api/residents/:residentId/assessments/:assessmentId', (req, res, ctx) => {
          return res(ctx.status(404));
        })
      );

      await expect(
        assessmentApi.getAssessmentById('test-resident', 'test-assessment', mockContext)
      ).rejects.toThrow('Failed to fetch assessment');
    });
  });

  describe('createAssessment', () => {
    const createData = {
      residentId: 'test-resident',
      type: AssessmentType.DAILY,
      dueDate: new Date(),
    };

    it('should create assessment successfully', async () => {
      server.use(
        rest.post('/api/residents/:residentId/assessments', (req, res, ctx) => {
          return res(ctx.json(mockAssessment));
        })
      );

      const assessment = await assessmentApi.createAssessment(
        'test-resident',
        createData,
        mockContext
      );
      expect(assessment).toEqual(mockAssessment);
    });

    it('should handle creation error', async () => {
      server.use(
        rest.post('/api/residents/:residentId/assessments', (req, res, ctx) => {
          return res(ctx.status(400));
        })
      );

      await expect(
        assessmentApi.createAssessment('test-resident', createData, mockContext)
      ).rejects.toThrow('Failed to create assessment');
    });
  });

  describe('updateAssessment', () => {
    const updateData = {
      status: AssessmentStatus.COMPLETED,
      completedAt: new Date(),
    };

    it('should update assessment successfully', async () => {
      server.use(
        rest.patch('/api/residents/:residentId/assessments/:assessmentId', (req, res, ctx) => {
          return res(ctx.json({ ...mockAssessment, ...updateData }));
        })
      );

      const assessment = await assessmentApi.updateAssessment(
        'test-resident',
        'test-assessment',
        updateData,
        mockContext
      );
      expect(assessment).toEqual({ ...mockAssessment, ...updateData });
    });

    it('should handle update error', async () => {
      server.use(
        rest.patch('/api/residents/:residentId/assessments/:assessmentId', (req, res, ctx) => {
          return res(ctx.status(400));
        })
      );

      await expect(
        assessmentApi.updateAssessment('test-resident', 'test-assessment', updateData, mockContext)
      ).rejects.toThrow('Failed to update assessment');
    });
  });

  describe('deleteAssessment', () => {
    it('should delete assessment successfully', async () => {
      server.use(
        rest.delete('/api/residents/:residentId/assessments/:assessmentId', (req, res, ctx) => {
          return res(ctx.status(204));
        })
      );

      await expect(
        assessmentApi.deleteAssessment('test-resident', 'test-assessment', mockContext)
      ).resolves.not.toThrow();
    });

    it('should handle deletion error', async () => {
      server.use(
        rest.delete('/api/residents/:residentId/assessments/:assessmentId', (req, res, ctx) => {
          return res(ctx.status(400));
        })
      );

      await expect(
        assessmentApi.deleteAssessment('test-resident', 'test-assessment', mockContext)
      ).rejects.toThrow('Failed to delete assessment');
    });
  });

  describe('exportAssessment', () => {
    it('should export assessment successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'application/pdf' });
      
      server.use(
        rest.get('/api/residents/:residentId/assessments/:assessmentId/export', (req, res, ctx) => {
          return res(
            ctx.set('Content-Type', 'application/pdf'),
            ctx.body(mockBlob)
          );
        })
      );

      const result = await assessmentApi.exportAssessment(
        'test-resident',
        'test-assessment',
        'PDF',
        mockContext
      );
      expect(result).toBeInstanceOf(Blob);
    });

    it('should handle export error', async () => {
      server.use(
        rest.get('/api/residents/:residentId/assessments/:assessmentId/export', (req, res, ctx) => {
          return res(ctx.status(400));
        })
      );

      await expect(
        assessmentApi.exportAssessment('test-resident', 'test-assessment', 'PDF', mockContext)
      ).rejects.toThrow('Failed to export assessment');
    });
  });
});


