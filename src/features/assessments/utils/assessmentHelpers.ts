/**
 * @fileoverview Assessment utility functions
 * @version 1.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Assessment, AssessmentSection, AssessmentStatus } from '../types/assessment.types';
import { z } from 'zod';
import { t } from '@/lib/i18n';
import { AssessmentType, AssessmentPriority } from '../types/assessment.types';

/**
 * Base schema for assessment validation
 */
const baseAssessmentSchema = z.object({
  residentId: z.string().uuid({ message: t('assessment.validation.invalidResidentId') }),
  organizationId: z.string().uuid({ message: t('assessment.validation.invalidOrganizationId') }),
  type: z.nativeEnum(AssessmentType, { 
    errorMap: () => ({ message: t('assessment.validation.invalidType') })
  }),
  title: z.string()
    .min(3, { message: t('assessment.validation.titleTooShort') })
    .max(200, { message: t('assessment.validation.titleTooLong') }),
  description: z.string()
    .max(2000, { message: t('assessment.validation.descriptionTooLong') })
    .optional(),
  dueDate: z.date()
    .min(new Date(), { message: t('assessment.validation.dueDatePast') }),
  priority: z.nativeEnum(AssessmentPriority, {
    errorMap: () => ({ message: t('assessment.validation.invalidPriority') })
  }),
  status: z.nativeEnum(AssessmentStatus, {
    errorMap: () => ({ message: t('assessment.validation.invalidStatus') })
  }).optional(),
  metadata: z.record(z.any()).optional()
});

/**
 * Schema for assessment sections
 */
const assessmentSectionSchema = z.object({
  id: z.string().uuid(),
  title: z.string()
    .min(1, { message: t('assessment.validation.sectionTitleRequired') })
    .max(200, { message: t('assessment.validation.sectionTitleTooLong') }),
  order: z.number().int().min(0),
  questions: z.array(z.object({
    id: z.string().uuid(),
    text: z.string()
      .min(1, { message: t('assessment.validation.questionTextRequired') })
      .max(1000, { message: t('assessment.validation.questionTextTooLong') }),
    type: z.enum(['TEXT', 'CHOICE', 'SCALE', 'DATE', 'CHECKBOX', 'SELECT']),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    answer: z.any().optional(),
    notes: z.string().max(1000).optional(),
    validation: z.object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      customValidator: z.function().optional()
    }).optional()
  }))
});

/**
 * Schema for assessment history
 */
const assessmentHistorySchema = z.object({
  id: z.string().uuid(),
  date: z.date(),
  action: z.string(),
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    role: z.string()
  }),
  details: z.string().optional(),
  changes: z.record(z.any()).optional()
});

/**
 * Complete assessment schema with all fields
 */
export const assessmentSchema = baseAssessmentSchema.extend({
  sections: z.array(assessmentSectionSchema),
  history: z.array(assessmentHistorySchema),
  completedBy: z.object({
    id: z.string().uuid(),
    name: z.string(),
    role: z.string()
  }).optional(),
  completedAt: z.date().optional(),
  witness: z.object({
    id: z.string().uuid(),
    name: z.string(),
    role: z.string(),
    signedAt: z.date()
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  version: z.number().int().positive()
});

/**
 * Validate assessment data
 */
export async function validateAssessment(data: any) {
  try {
    await assessmentSchema.parseAsync(data);
    return { isValid: true, errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      };
    }
    throw error;
  }
}

/**
 * Format assessment data for display
 */
export function formatAssessment(assessment: any) {
  return {
    ...assessment,
    dueDate: new Date(assessment.dueDate).toLocaleDateString(),
    completedAt: assessment.completedAt 
      ? new Date(assessment.completedAt).toLocaleString()
      : undefined,
    createdAt: new Date(assessment.createdAt).toLocaleString(),
    updatedAt: new Date(assessment.updatedAt).toLocaleString()
  };
}

/**
 * Calculate assessment completion percentage
 */
export function calculateCompletionPercentage(assessment: any): number {
  const totalQuestions = assessment.sections.reduce(
    (total: number, section: any) => total + section.questions.length,
    0
  );

  if (totalQuestions === 0) return 0;

  const answeredQuestions = assessment.sections.reduce(
    (total: number, section: any) => total + section.questions.filter(
      (q: any) => q.answer !== undefined && q.answer !== null
    ).length,
    0
  );

  return Math.round((answeredQuestions / totalQuestions) * 100);
}

/**
 * Check if assessment is overdue
 */
export function isAssessmentOverdue(assessment: any): boolean {
  if (assessment.status === AssessmentStatus.COMPLETED || 
      assessment.status === AssessmentStatus.ARCHIVED) {
    return false;
  }
  return new Date(assessment.dueDate) < new Date();
}

/**
 * Get available status transitions
 */
export function getAvailableStatusTransitions(currentStatus: AssessmentStatus): AssessmentStatus[] {
  const transitions: Record<AssessmentStatus, AssessmentStatus[]> = {
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

  return transitions[currentStatus] || [];
}

/**
 * Calculate the completion percentage of an assessment
 */
export function calculateCompletionPercentageLegacy(assessment: Assessment): number {
  const totalQuestions = assessment.sections.reduce(
    (total, section) => total + section.questions.length,
    0
  );
  
  const answeredQuestions = assessment.sections.reduce(
    (total, section) => total + section.questions.filter(q => q.answer !== undefined).length,
    0
  );

  return totalQuestions === 0 ? 0 : Math.round((answeredQuestions / totalQuestions) * 100);
}

/**
 * Check if an assessment is overdue
 */
export function isAssessmentOverdueLegacy(assessment: Assessment): boolean {
  if (!assessment.dueDate || assessment.status === 'COMPLETED') return false;
  return new Date() > new Date(assessment.dueDate);
}

/**
 * Get the next incomplete section in an assessment
 */
export function getNextIncompleteSection(assessment: Assessment): AssessmentSection | null {
  return assessment.sections.find(section => 
    section.questions.some(q => q.required && q.answer === undefined)
  ) || null;
}

/**
 * Check if an assessment can be completed
 */
export function canCompleteAssessment(assessment: Assessment): boolean {
  return assessment.sections.every(section =>
    section.questions.every(q => !q.required || q.answer !== undefined)
  );
}

/**
 * Sort assessments by date
 */
export function sortAssessments(
  assessments: Assessment[],
  order: 'asc' | 'desc' = 'desc'
): Assessment[] {
  return [...assessments].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Filter assessments by status
 */
export function filterAssessmentsByStatus(
  assessments: Assessment[],
  status: AssessmentStatus
): Assessment[] {
  return assessments.filter(assessment => assessment.status === status);
}

/**
 * Group assessments by type
 */
export function groupAssessmentsByType(
  assessments: Assessment[]
): Record<string, Assessment[]> {
  return assessments.reduce((groups, assessment) => ({
    ...groups,
    [assessment.type]: [...(groups[assessment.type] || []), assessment],
  }), {} as Record<string, Assessment[]>);
}


