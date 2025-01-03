/**
 * @fileoverview Assessment service for fetching and managing assessments
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';

export interface Assessment {
  id: string;
  title: string;
  type: string;
  status: string;
  residentId: string;
  assessorId: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const assessmentService = {
  fetchAssessments: async (params: {
    residentId?: string;
    assessorId?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<{ assessments: Assessment[]; total: number }> => {
    const { residentId, assessorId, status, type, page = 1, limit = 10 } = params;
    
    const where = {
      ...(residentId && { residentId }),
      ...(assessorId && { assessorId }),
      ...(status && { status }),
      ...(type && { type })
    };

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.assessment.count({ where })
    ]);

    return {
      assessments: assessments as Assessment[],
      total
    };
  },

  getAssessment: async (id: string): Promise<Assessment | null> => {
    const assessment = await prisma.assessment.findUnique({
      where: { id }
    });

    return assessment as Assessment | null;
  },

  createAssessment: async (data: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Assessment> => {
    const assessment = await prisma.assessment.create({
      data
    });

    return assessment as Assessment;
  },

  updateAssessment: async (id: string, data: Partial<Assessment>): Promise<Assessment> => {
    const assessment = await prisma.assessment.update({
      where: { id },
      data
    });

    return assessment as Assessment;
  },

  deleteAssessment: async (id: string): Promise<void> => {
    await prisma.assessment.delete({
      where: { id }
    });
  }
}; 
