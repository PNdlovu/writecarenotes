/**
 * @fileoverview Assessment type definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

export interface Assessment {
  id: string;
  residentId: string;
  type: AssessmentType;
  status: AssessmentStatus;
  sections: Record<string, any>;
  // ... other fields
}

export interface CreateAssessmentDTO {
  residentId: string;
  type: AssessmentType;
  dueDate?: Date;
  metadata?: Record<string, any>;
}

export interface UpdateAssessmentDTO {
  status?: AssessmentStatus;
  completedBy?: string;
  completedAt?: Date;
  sections?: Assessment['sections'];
  metadata?: Record<string, any>;
}

export interface RequestContext {
  tenantId: string;
  userId: string;
  ip: string;
  userAgent: string;
} 