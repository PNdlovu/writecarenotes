/**
 * @fileoverview Core assessment type definitions for Write Care Notes
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { Region } from '@/types/region';
import { Organization } from '@/types/organization';

/**
 * Types of assessments supported by the system
 * @readonly
 */
export enum AssessmentType {
  INITIAL = 'INITIAL',
  PERIODIC = 'PERIODIC',
  INCIDENT = 'INCIDENT',
  CARE_REVIEW = 'CARE_REVIEW'
}

/**
 * Status of an assessment
 * @readonly
 */
export enum AssessmentStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
  REQUIRES_REVIEW = 'REQUIRES_REVIEW',
  OVERDUE = 'OVERDUE'
}

/**
 * Priority levels for assessments
 * @readonly
 */
export enum AssessmentPriority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

/**
 * Types of questions available in assessments
 * @readonly
 */
export enum QuestionType {
  TEXT = 'TEXT',
  CHOICE = 'CHOICE',
  SCALE = 'SCALE',
  DATE = 'DATE',
  CHECKBOX = 'CHECKBOX',
  SELECT = 'SELECT'
}

/**
 * Core assessment interface
 */
export interface Assessment {
  id: string;
  organizationId: string;
  residentId: string;
  type: AssessmentType;
  status: AssessmentStatus;
  priority: AssessmentPriority;
  title: string;
  description?: string;
  completedBy?: {
    id: string;
    name: string;
    role: string;
  };
  completedAt?: Date;
  dueDate: Date;
  sections: AssessmentSection[];
  metadata: AssessmentMetadata;
  witness?: {
    id: string;
    name: string;
    role: string;
    signedAt: Date;
  };
  attachments?: AssessmentAttachment[];
  history: AssessmentHistory[];
  region: Region;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

/**
 * Assessment section containing grouped questions
 */
export interface AssessmentSection {
  id: string;
  title: string;
  order: number;
  questions: AssessmentQuestion[];
  completedAt?: Date;
  notes?: string;
}

/**
 * Assessment question with type-safe answers
 */
export interface AssessmentQuestion {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  answer?: AssessmentAnswer;
  notes?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customValidator?: (value: any) => boolean;
  };
}

/**
 * Type-safe assessment answers
 */
export type AssessmentAnswer = 
  | string 
  | number 
  | boolean 
  | Date 
  | string[] 
  | null;

/**
 * Assessment metadata for tracking and compliance
 */
export interface AssessmentMetadata {
  version: string;
  templateId?: string;
  templateVersion?: string;
  requiresWitnessing: boolean;
  attachmentsRequired: boolean;
  complianceLevel: 'STANDARD' | 'ENHANCED';
  reviewFrequency?: number;
  nextReviewDate?: Date;
  tags?: string[];
  customFields?: Record<string, any>;
}

/**
 * Assessment attachment
 */
export interface AssessmentAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Assessment history entry
 */
export interface AssessmentHistory {
  id: string;
  date: Date;
  action: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  details?: string;
  changes?: Record<string, any>;
}

export const ASSESSMENT_TYPES = {
  ...Object.values(AssessmentType),
  NEEDS_ASSESSMENT: 'NEEDS_ASSESSMENT'
} as const;

export const NEEDS_ASSESSMENT_SECTIONS = {
  PHYSICAL_HEALTH: 'physical_health',
  MENTAL_HEALTH: 'mental_health',
  EDUCATIONAL: 'educational',
  SOCIAL_DEVELOPMENTAL: 'social_developmental',
  LIFE_SKILLS: 'life_skills',
  SAFETY_RISK: 'safety_risk',
  COMMUNICATION: 'communication',
  THERAPEUTIC: 'therapeutic'
} as const;
