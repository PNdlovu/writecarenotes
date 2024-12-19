/**
 * @fileoverview Assessment Service - Business logic layer for assessments
 * @version 1.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { AssessmentRepository } from '../repositories/assessmentRepository';
import { AssessmentError, AssessmentErrorCode } from '../types/errors';
import { 
  Assessment, 
  AssessmentStatus, 
  AssessmentType,
  AssessmentPriority
} from '../types/assessment.types';
import { validateAssessment } from '../utils/validation';
import { useI18n } from '@/features/i18n/lib/config';
import { withAudit } from '@/lib/audit';
import { withCache } from '@/lib/cache';
import { RequestContext } from '@/types/context';

interface FindAssessmentsOptions {
  residentId?: string;
  organizationId: string;
  status?: AssessmentStatus[];
  type?: AssessmentType[];
  from?: Date;
  to?: Date;
  completedBy?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

interface CreateAssessmentDTO {
  residentId: string;
  organizationId: string;
  type: AssessmentType;
  title: string;
  description?: string;
  dueDate: Date;
  priority: AssessmentPriority;
  metadata?: Record<string, any>;
}

interface UpdateAssessmentDTO {
  title?: string;
  description?: string;
  status?: AssessmentStatus;
  priority?: AssessmentPriority;
  dueDate?: Date;
  sections?: Assessment['sections'];
  metadata?: Record<string, any>;
}

/**
 * Assessment Service class providing business logic with audit logging and caching
 */
export class AssessmentService {
  constructor(private repository: AssessmentRepository) {}

  /**
   * Find assessments with filtering and pagination
   */
  findAssessments = withCache(async (options: FindAssessmentsOptions, context: RequestContext) => {
    try {
      return await this.repository.findAssessments(options);
    } catch (error) {
      throw this.handleError(error);
    }
  }, 'assessments');

  /**
   * Find a single assessment by ID
   */
  findById = withCache(async (id: string, organizationId: string, context: RequestContext) => {
    try {
      return await this.repository.findById(id, organizationId);
    } catch (error) {
      throw this.handleError(error);
    }
  }, 'assessment');

  /**
   * Create a new assessment
   */
  create = withAudit(async (data: CreateAssessmentDTO, context: RequestContext) => {
    try {
      // Validate assessment data
      const validationResult = await validateAssessment(data);
      if (!validationResult.isValid) {
        throw new AssessmentError(
          AssessmentErrorCode.VALIDATION_ERROR,
          { errors: validationResult.errors }
        );
      }

      // Create assessment with initial status
      const assessment = await this.repository.create({
        ...data,
        status: AssessmentStatus.DRAFT,
        sections: [],
        history: [{
          id: crypto.randomUUID(),
          date: new Date(),
          action: 'CREATED',
          user: {
            id: context.userId,
            name: context.userName,
            role: context.userRole
          }
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      });

      return assessment;
    } catch (error) {
      throw this.handleError(error);
    }
  }, 'assessment.create');

  /**
   * Update an existing assessment
   */
  update = withAudit(async (
    id: string,
    organizationId: string,
    data: UpdateAssessmentDTO,
    context: RequestContext
  ) => {
    try {
      // Get current assessment
      const current = await this.repository.findById(id, organizationId);

      // Validate status transition
      if (data.status && !this.isValidStatusTransition(current.status, data.status)) {
        throw new AssessmentError(
          AssessmentErrorCode.INVALID_TRANSITION,
          { from: current.status, to: data.status }
        );
      }

      // Validate update data
      const validationResult = await validateAssessment({ ...current, ...data });
      if (!validationResult.isValid) {
        throw new AssessmentError(
          AssessmentErrorCode.VALIDATION_ERROR,
          { errors: validationResult.errors }
        );
      }

      // Update assessment
      const assessment = await this.repository.update(id, organizationId, {
        ...data,
        history: [
          ...current.history,
          {
            id: crypto.randomUUID(),
            date: new Date(),
            action: 'UPDATED',
            user: {
              id: context.userId,
              name: context.userName,
              role: context.userRole
            },
            changes: data
          }
        ],
        version: current.version + 1
      });

      return assessment;
    } catch (error) {
      throw this.handleError(error);
    }
  }, 'assessment.update');

  /**
   * Delete an assessment
   */
  delete = withAudit(async (id: string, organizationId: string, context: RequestContext) => {
    try {
      await this.repository.delete(id, organizationId);
    } catch (error) {
      throw this.handleError(error);
    }
  }, 'assessment.delete');

  /**
   * Archive an assessment
   */
  archive = withAudit(async (id: string, organizationId: string, context: RequestContext) => {
    try {
      return await this.repository.archive(id, organizationId);
    } catch (error) {
      throw this.handleError(error);
    }
  }, 'assessment.archive');

  /**
   * Complete an assessment
   */
  complete = withAudit(async (
    id: string,
    organizationId: string,
    data: { witness?: string },
    context: RequestContext
  ) => {
    try {
      const assessment = await this.repository.findById(id, organizationId);

      // Check if assessment can be completed
      if (assessment.status !== AssessmentStatus.IN_PROGRESS) {
        throw new AssessmentError(
          AssessmentErrorCode.INVALID_TRANSITION,
          { from: assessment.status, to: AssessmentStatus.COMPLETED }
        );
      }

      // Check if witness is required
      if (assessment.metadata.requiresWitnessing && !data.witness) {
        throw new AssessmentError(AssessmentErrorCode.WITNESS_REQUIRED);
      }

      // Complete the assessment
      return await this.repository.update(id, organizationId, {
        status: AssessmentStatus.COMPLETED,
        completedBy: context.userId,
        completedAt: new Date(),
        witness: data.witness ? {
          id: data.witness,
          signedAt: new Date()
        } : undefined,
        history: [
          ...assessment.history,
          {
            id: crypto.randomUUID(),
            date: new Date(),
            action: 'COMPLETED',
            user: {
              id: context.userId,
              name: context.userName,
              role: context.userRole
            }
          }
        ]
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }, 'assessment.complete');

  /**
   * Handle errors consistently
   */
  private handleError(error: any): never {
    if (error instanceof AssessmentError) {
      throw error;
    }
    throw new AssessmentError(
      AssessmentErrorCode.SYSTEM_ERROR,
      { error: error.message }
    );
  }

  /**
   * Validate assessment status transitions
   */
  private isValidStatusTransition(from: AssessmentStatus, to: AssessmentStatus): boolean {
    const validTransitions: Record<AssessmentStatus, AssessmentStatus[]> = {
      [AssessmentStatus.DRAFT]: [
        AssessmentStatus.IN_PROGRESS,
        AssessmentStatus.ARCHIVED
      ],
      [AssessmentStatus.IN_PROGRESS]: [
        AssessmentStatus.COMPLETED,
        AssessmentStatus.REQUIRES_REVIEW,
        AssessmentStatus.ARCHIVED
      ],
      [AssessmentStatus.COMPLETED]: [
        AssessmentStatus.REQUIRES_REVIEW,
        AssessmentStatus.ARCHIVED
      ],
      [AssessmentStatus.REQUIRES_REVIEW]: [
        AssessmentStatus.IN_PROGRESS,
        AssessmentStatus.COMPLETED,
        AssessmentStatus.ARCHIVED
      ],
      [AssessmentStatus.ARCHIVED]: [],
      [AssessmentStatus.OVERDUE]: [
        AssessmentStatus.IN_PROGRESS,
        AssessmentStatus.ARCHIVED
      ]
    };

    return validTransitions[from]?.includes(to) ?? false;
  }
}

export default new AssessmentService();


