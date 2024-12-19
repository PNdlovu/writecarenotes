/**
 * @fileoverview Assessment module type definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

export * from './assessment.types';
export * from './errors';

// Core Types
export interface AssessmentSection {
  title: string;
  questions: Array<{
    id: string;
    question: string;
    type: string;
    required: boolean;
    answer?: string;
  }>;
}

export interface AssessmentHistory {
  date: string;
  action: string;
  user: {
    id: string;
    name: string;
  };
  details?: string;
}

export interface Assessment {
  id: string;
  residentId: string;
  residentName: string;
  assessmentType: string;
  category: string;
  status: 'Completed' | 'Pending Review' | 'In Progress';
  completedDate?: string;
  nextDueDate: string;
  assignedToId: string;
  assignedTo: string;
  score?: string;
  recommendations?: string[];
  notes?: string;
}

// Component Props Types
import { Assessment, AssessmentStatus, AssessmentPriority, AssessmentType } from './assessment.types';

/**
 * Props for the assessment viewer component
 */
export interface AssessmentViewerProps {
  assessment: Assessment;
  isReadOnly?: boolean;
  showHistory?: boolean;
  onEdit?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onComplete?: () => void;
  onArchive?: () => void;
}

/**
 * Assessment filter options
 */
export interface AssessmentFilters {
  search?: string;
  category?: string;
  status?: Assessment['status'];
  timeframe?: {
    start: Date;
    end: Date;
  };
}

/**
 * Props for the assessment dashboard component
 */
export interface AssessmentDashboardProps {
  assessments: Assessment[];
  filters: AssessmentFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading?: boolean;
  error?: Error;
  onCreateAssessment: () => void;
  onViewAssessment: (id: string) => void;
  onFilterChange: (filters: AssessmentFilters) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Props for assessment completion component
 */
export interface AssessmentCompletionProps {
  assessment: Assessment;
  availableWitnesses: Array<{
    id: string;
    name: string;
    role: string;
    availability: {
      start: Date;
      end: Date;
    };
  }>;
  validationRules?: Record<string, any>;
  onSubmit: (data: any) => Promise<void>;
  onSaveDraft: (data: any) => Promise<void>;
  onCancel: () => void;
  onRequestWitness: (witnessId: string) => Promise<void>;
}

/**
 * Assessment template interface
 */
export interface AssessmentTemplate {
  id: string;
  title: string;
  type: AssessmentType;
  category: string;
  description?: string;
  version: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  frequency?: {
    value: number;
    unit: 'DAYS' | 'WEEKS' | 'MONTHS';
  };
  sections: Array<{
    title: string;
    order: number;
    questions: Array<{
      text: string;
      type: string;
      required: boolean;
      options?: string[];
      validation?: Record<string, any>;
    }>;
  }>;
  metadata: {
    requiresWitnessing: boolean;
    attachmentsRequired: boolean;
    complianceLevel: 'STANDARD' | 'ENHANCED';
    applicableRegions: string[];
    tags?: string[];
    customFields?: Record<string, any>;
  };
  createdBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Props for template manager component
 */
export interface TemplateManagerProps {
  templates: AssessmentTemplate[];
  filters?: {
    status?: string[];
    category?: string[];
    type?: AssessmentType[];
    searchTerm?: string;
  };
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
  isLoading?: boolean;
  error?: Error;
  onCreateTemplate: () => void;
  onEditTemplate: (id: string) => void;
  onDuplicateTemplate: (id: string) => void;
  onDeleteTemplate: (id: string) => void;
  onToggleTemplateStatus: (id: string, status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') => void;
  onFilterChange?: (filters: any) => void;
  onPageChange?: (page: number) => void;
}

/**
 * Assessment form data interface
 */
export interface AssessmentFormData {
  residentId: string;
  assessmentType: string;
  category: string;
  dueDate: Date;
  assignedToId: string;
  notes?: string;
}
