/**
 * @fileoverview Assessment audit helpers for tracking and compliance
 * @version 1.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/db';
import { Assessment } from '../types/assessment.types';
import { RequestContext } from '@/types/context';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  module: string;
  action: string;
  userId: string;
  userName: string;
  userRole: string;
  resourceId: string;
  resourceType: string;
  organizationId: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  ip?: string;
  userAgent?: string;
}

/**
 * Create an audit log entry
 */
async function createAuditLog(entry: AuditLogEntry) {
  await prisma.auditLog.create({
    data: {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date()
    }
  });
}

/**
 * Audit assessment creation
 */
export async function auditAssessmentCreation(
  assessment: Assessment,
  context: RequestContext
) {
  await createAuditLog({
    module: 'assessments',
    action: 'CREATE',
    userId: context.userId,
    userName: context.userName,
    userRole: context.userRole,
    resourceId: assessment.id,
    resourceType: 'Assessment',
    organizationId: assessment.organizationId,
    changes: {
      type: assessment.type,
      residentId: assessment.residentId,
      dueDate: assessment.dueDate
    },
    metadata: assessment.metadata,
    ip: context.ip,
    userAgent: context.userAgent
  });
}

/**
 * Audit assessment update
 */
export async function auditAssessmentUpdate(
  assessment: Assessment,
  changes: Record<string, any>,
  context: RequestContext
) {
  await createAuditLog({
    module: 'assessments',
    action: 'UPDATE',
    userId: context.userId,
    userName: context.userName,
    userRole: context.userRole,
    resourceId: assessment.id,
    resourceType: 'Assessment',
    organizationId: assessment.organizationId,
    changes,
    metadata: {
      previousVersion: assessment.version,
      newVersion: assessment.version + 1,
      ...assessment.metadata
    },
    ip: context.ip,
    userAgent: context.userAgent
  });
}

/**
 * Audit assessment completion
 */
export async function auditAssessmentCompletion(
  assessment: Assessment,
  context: RequestContext
) {
  await createAuditLog({
    module: 'assessments',
    action: 'COMPLETE',
    userId: context.userId,
    userName: context.userName,
    userRole: context.userRole,
    resourceId: assessment.id,
    resourceType: 'Assessment',
    organizationId: assessment.organizationId,
    metadata: {
      completedAt: new Date(),
      witness: assessment.witness,
      completionPercentage: calculateCompletionPercentage(assessment),
      ...assessment.metadata
    },
    ip: context.ip,
    userAgent: context.userAgent
  });
}

/**
 * Audit assessment deletion
 */
export async function auditAssessmentDeletion(
  assessment: Assessment,
  context: RequestContext
) {
  await createAuditLog({
    module: 'assessments',
    action: 'DELETE',
    userId: context.userId,
    userName: context.userName,
    userRole: context.userRole,
    resourceId: assessment.id,
    resourceType: 'Assessment',
    organizationId: assessment.organizationId,
    metadata: {
      status: assessment.status,
      completionStatus: assessment.completedAt ? 'COMPLETED' : 'INCOMPLETE',
      ...assessment.metadata
    },
    ip: context.ip,
    userAgent: context.userAgent
  });
}

/**
 * Audit assessment access
 */
export async function auditAssessmentAccess(
  assessmentId: string,
  action: 'VIEW' | 'EXPORT' | 'PRINT',
  context: RequestContext
) {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId }
  });

  if (!assessment) return;

  await createAuditLog({
    module: 'assessments',
    action,
    userId: context.userId,
    userName: context.userName,
    userRole: context.userRole,
    resourceId: assessmentId,
    resourceType: 'Assessment',
    organizationId: assessment.organizationId,
    metadata: {
      accessType: action,
      status: assessment.status,
      ...assessment.metadata
    },
    ip: context.ip,
    userAgent: context.userAgent
  });
}

/**
 * Calculate assessment completion percentage
 */
function calculateCompletionPercentage(assessment: Assessment): number {
  const totalQuestions = assessment.sections.reduce(
    (total, section) => total + section.questions.length,
    0
  );

  if (totalQuestions === 0) return 0;

  const answeredQuestions = assessment.sections.reduce(
    (total, section) => total + section.questions.filter(
      q => q.answer !== undefined && q.answer !== null
    ).length,
    0
  );

  return Math.round((answeredQuestions / totalQuestions) * 100);
}


