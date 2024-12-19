/**
 * @fileoverview Assessment API client
 * @version 1.0.0
 * @created 2024-12-13
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Assessment, AssessmentType, AssessmentStatus } from '../types/assessment.types';
import { 
  auditAssessmentCreation,
  auditAssessmentUpdate,
  auditAssessmentCompletion,
  auditAssessmentDeletion,
  auditAssessmentAccess
} from '../utils/auditHelpers';

interface CreateAssessmentDTO {
  residentId: string;
  type: AssessmentType;
  dueDate?: Date;
  metadata?: Record<string, any>;
}

interface UpdateAssessmentDTO {
  status?: AssessmentStatus;
  completedBy?: string;
  completedAt?: Date;
  sections?: Assessment['sections'];
  metadata?: Record<string, any>;
}

interface RequestContext {
  tenantId: string;
  userId: string;
  ip: string;
  userAgent: string;
}

export async function getAssessments(residentId: string, context: RequestContext): Promise<Assessment[]> {
  const response = await fetch(`/api/residents/${residentId}/assessments`);
  if (!response.ok) {
    throw new Error('Failed to fetch assessments');
  }
  const assessments = await response.json();
  
  // Audit the bulk access
  await Promise.all(assessments.map(assessment => 
    auditAssessmentAccess(assessment.id, 'VIEW', context)
  ));
  
  return assessments;
}

export async function getAssessmentById(
  residentId: string,
  assessmentId: string,
  context: RequestContext
): Promise<Assessment> {
  const response = await fetch(`/api/residents/${residentId}/assessments/${assessmentId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch assessment');
  }
  const assessment = await response.json();
  
  // Audit the access
  await auditAssessmentAccess(assessmentId, 'VIEW', context);
  
  return assessment;
}

export async function createAssessment(
  residentId: string,
  data: CreateAssessmentDTO,
  context: RequestContext
): Promise<Assessment> {
  const response = await fetch(`/api/residents/${residentId}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create assessment');
  }
  
  const assessment = await response.json();
  
  // Audit the creation
  await auditAssessmentCreation(assessment, context);
  
  return assessment;
}

export async function updateAssessment(
  residentId: string,
  assessmentId: string,
  data: UpdateAssessmentDTO,
  context: RequestContext
): Promise<Assessment> {
  const response = await fetch(
    `/api/residents/${residentId}/assessments/${assessmentId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to update assessment');
  }
  
  const assessment = await response.json();
  
  // Audit the update
  await auditAssessmentUpdate(assessment, data, context);
  
  // If the assessment was completed, add a completion audit
  if (data.status === 'COMPLETED') {
    await auditAssessmentCompletion(assessment, context);
  }
  
  return assessment;
}

export async function deleteAssessment(
  residentId: string,
  assessmentId: string,
  context: RequestContext
): Promise<void> {
  // First get the assessment for audit purposes
  const assessment = await getAssessmentById(residentId, assessmentId, context);
  
  const response = await fetch(
    `/api/residents/${residentId}/assessments/${assessmentId}`,
    { method: 'DELETE' }
  );
  
  if (!response.ok) {
    throw new Error('Failed to delete assessment');
  }
  
  // Audit the deletion
  await auditAssessmentDeletion(assessment, context);
}

export async function exportAssessment(
  residentId: string,
  assessmentId: string,
  format: 'PDF' | 'CSV',
  context: RequestContext
): Promise<Blob> {
  const response = await fetch(
    `/api/residents/${residentId}/assessments/${assessmentId}/export?format=${format}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to export assessment');
  }
  
  // Audit the export
  await auditAssessmentAccess(assessmentId, 'EXPORT', context);
  
  return response.blob();
}


