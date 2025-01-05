/**
 * @writecarenotes.com
 * @fileoverview Assessment repository with offline support
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Repository for managing care home assessments with offline capabilities.
 * Implements comprehensive assessment tracking and analysis while ensuring
 * compliance with UK and Ireland care regulations.
 */

import { OfflineService } from '@/lib/offline/offlineService';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';
import { AssessmentError, AssessmentErrorCode } from '../types/errors';
import { Assessment, AssessmentStatus, AssessmentType } from '../types/assessment.types';
import { t } from '@/lib/i18n';

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

/**
 * Assessment Repository class providing data access methods with offline support
 */
export class AssessmentRepository {
  /**
   * Find assessments with filtering and pagination
   */
  findAssessments = withOffline(async (options: FindAssessmentsOptions) => {
    try {
      const {
        residentId,
        organizationId,
        status,
        type,
        from,
        to,
        completedBy,
        searchTerm,
        page = 1,
        pageSize = 20
      } = options;

      const where = {
        organizationId,
        ...(residentId && { residentId }),
        ...(status?.length && { status: { in: status } }),
        ...(type?.length && { type: { in: type } }),
        ...(from && to && {
          createdAt: {
            gte: from,
            lte: to
          }
        }),
        ...(completedBy && { completedBy }),
        ...(searchTerm && {
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } }
          ]
        })
      };

      const [total, assessments] = await Promise.all([
        prisma.assessment.count({ where }),
        prisma.assessment.findMany({
          where,
          skip: (page - 1) * pageSize,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            resident: {
              select: {
                id: true,
                name: true
              }
            },
            completedByUser: {
              select: {
                id: true,
                name: true,
                role: true
              }
            },
            witness: {
              select: {
                id: true,
                name: true,
                role: true
              }
            },
            attachments: true,
            history: {
              orderBy: { createdAt: 'desc' }
            }
          }
        })
      ]);

      return {
        assessments,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize)
        }
      };
    } catch (error) {
      throw new AssessmentError(
        AssessmentErrorCode.DATABASE_ERROR,
        { error: error.message }
      );
    }
  }, 'assessments');

  /**
   * Find a single assessment by ID
   */
  findById = withOffline(async (id: string, organizationId: string) => {
    try {
      const assessment = await prisma.assessment.findFirst({
        where: {
          id,
          organizationId
        },
        include: {
          resident: {
            select: {
              id: true,
              name: true
            }
          },
          completedByUser: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          witness: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          attachments: true,
          history: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!assessment) {
        throw new AssessmentError(AssessmentErrorCode.NOT_FOUND);
      }

      return assessment;
    } catch (error) {
      if (error instanceof AssessmentError) {
        throw error;
      }
      throw new AssessmentError(
        AssessmentErrorCode.DATABASE_ERROR,
        { error: error.message }
      );
    }
  }, 'assessment');

  /**
   * Create a new assessment
   */
  create = withOffline(async (data: Omit<Assessment, 'id'>) => {
    try {
      return await prisma.assessment.create({
        data,
        include: {
          resident: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
    } catch (error) {
      throw new AssessmentError(
        AssessmentErrorCode.DATABASE_ERROR,
        { error: error.message }
      );
    }
  }, 'assessment');

  /**
   * Update an existing assessment
   */
  update = withOffline(async (id: string, organizationId: string, data: Partial<Assessment>) => {
    try {
      const assessment = await prisma.assessment.findFirst({
        where: { id, organizationId }
      });

      if (!assessment) {
        throw new AssessmentError(AssessmentErrorCode.NOT_FOUND);
      }

      return await prisma.assessment.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date()
        },
        include: {
          resident: {
            select: {
              id: true,
              name: true
            }
          },
          completedByUser: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          witness: {
            select: {
              id: true,
              name: true,
              role: true
            }
          },
          attachments: true,
          history: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } catch (error) {
      if (error instanceof AssessmentError) {
        throw error;
      }
      throw new AssessmentError(
        AssessmentErrorCode.DATABASE_ERROR,
        { error: error.message }
      );
    }
  }, 'assessment');

  /**
   * Delete an assessment
   */
  delete = withOffline(async (id: string, organizationId: string) => {
    try {
      const assessment = await prisma.assessment.findFirst({
        where: { id, organizationId }
      });

      if (!assessment) {
        throw new AssessmentError(AssessmentErrorCode.NOT_FOUND);
      }

      await prisma.assessment.delete({
        where: { id }
      });
    } catch (error) {
      if (error instanceof AssessmentError) {
        throw error;
      }
      throw new AssessmentError(
        AssessmentErrorCode.DATABASE_ERROR,
        { error: error.message }
      );
    }
  }, 'assessment');

  /**
   * Archive an assessment
   */
  archive = withOffline(async (id: string, organizationId: string) => {
    try {
      const assessment = await prisma.assessment.findFirst({
        where: { id, organizationId }
      });

      if (!assessment) {
        throw new AssessmentError(AssessmentErrorCode.NOT_FOUND);
      }

      return await prisma.assessment.update({
        where: { id },
        data: {
          status: AssessmentStatus.ARCHIVED,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      if (error instanceof AssessmentError) {
        throw error;
      }
      throw new AssessmentError(
        AssessmentErrorCode.DATABASE_ERROR,
        { error: error.message }
      );
    }
  }, 'assessment');
}

export default new AssessmentRepository();


