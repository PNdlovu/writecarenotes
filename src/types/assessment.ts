import { Region } from './region';

export type AssessmentType = 
  | 'INITIAL'
  | 'REVIEW'
  | 'ADMISSION'
  | 'DISCHARGE'
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'ANNUAL'
  | 'AD_HOC';

export type AssessmentCategory =
  | 'MOBILITY'
  | 'PERSONAL_CARE'
  | 'NUTRITION'
  | 'MENTAL_HEALTH'
  | 'SOCIAL'
  | 'MEDICAL'
  | 'RISK'
  | 'CUSTOM';

export type AssessmentStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'SCHEDULED'
  | 'ARCHIVED';

export type AssessmentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questions: AssessmentQuestion[];
  order: number;
  isRequired: boolean;
  dependsOn?: {
    sectionId: string;
    condition: string;
  };
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'TEXT' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'SCALE' | 'DATE' | 'FILE' | 'OBSERVATION';
  options?: string[];
  isRequired: boolean;
  helpText?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customValidation?: string;
  };
  riskIndicators?: {
    condition: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    action: string;
  }[];
}

export interface AssessmentTemplate {
  id: string;
  name: string;
  description: string;
  category: AssessmentCategory;
  version: string;
  sections: AssessmentSection[];
  metadata: {
    createdBy: string;
    createdAt: string;
    lastModified: string;
    region: Region;
    regulatory?: {
      framework: string;
      requirements: string[];
    };
  };
  settings: {
    requireWitness: boolean;
    autoSchedule: boolean;
    frequency?: string;
    reminderDays?: number;
    allowDelegation: boolean;
    requireEvidence: boolean;
  };
}

export interface Assessment {
  id: string;
  templateId: string;
  residentId: string;
  type: AssessmentType;
  status: AssessmentStatus;
  priority: AssessmentPriority;
  dueDate?: string;
  completedDate?: string;
  assignedTo: string[];
  responses: {
    [questionId: string]: {
      value: any;
      notes?: string;
      evidence?: {
        type: string;
        url: string;
      }[];
      completedBy: string;
      completedAt: string;
    };
  };
  reviews?: {
    reviewerId: string;
    date: string;
    status: 'APPROVED' | 'REJECTED';
    comments: string;
  }[];
  analytics?: {
    completionTime: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    actionItems: string[];
    trends?: {
      category: string;
      change: 'IMPROVED' | 'DECLINED' | 'STABLE';
      value: number;
    }[];
  };
  history: {
    action: 'CREATED' | 'UPDATED' | 'COMPLETED' | 'REVIEWED';
    userId: string;
    timestamp: string;
    details?: string;
  }[];
}


