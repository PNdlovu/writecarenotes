/**
 * @fileoverview Documentation Types for Medication Management
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

export interface DocumentationTemplate {
  id: string;
  careHomeId: string;
  type: 'CARE_PLAN' | 'REVIEW' | 'END_OF_LIFE' | 'HANDOVER' | 'ASSESSMENT';
  name: string;
  description?: string;
  sections: {
    id: string;
    title: string;
    type: 'TEXT' | 'CHECKBOX' | 'RADIO' | 'SELECT' | 'DATE' | 'TIME' | 'SIGNATURE';
    required: boolean;
    options?: string[];
    defaultValue?: string;
    validation?: {
      min?: number;
      max?: number;
      pattern?: string;
      message?: string;
    };
  }[];
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarePlan {
  id: string;
  residentId: string;
  careHomeId: string;
  templateId: string;
  type: 'REGULAR' | 'PRN' | 'CONTROLLED' | 'END_OF_LIFE';
  status: 'DRAFT' | 'ACTIVE' | 'UNDER_REVIEW' | 'ARCHIVED';
  reviewDate: string;
  sections: {
    id: string;
    title: string;
    content: string;
    attachments?: {
      name: string;
      type: string;
      url: string;
    }[];
  }[];
  approvals: {
    role: string;
    approvedBy: string;
    approvedAt: string;
    notes?: string;
  }[];
  reviews: {
    reviewedBy: string;
    reviewedAt: string;
    outcome: 'APPROVED' | 'NEEDS_UPDATE' | 'REJECTED';
    notes?: string;
  }[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationReview {
  id: string;
  residentId: string;
  careHomeId: string;
  type: 'REGULAR' | 'QUARTERLY' | 'ANNUAL' | 'EMERGENCY';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  reviewDate: string;
  medications: {
    medicationId: string;
    name: string;
    currentDose: string;
    effectiveness: number;
    sideEffects: string[];
    recommendation: 'CONTINUE' | 'MODIFY' | 'DISCONTINUE';
    changes?: {
      type: 'DOSE' | 'FREQUENCY' | 'ROUTE' | 'DISCONTINUE';
      from: string;
      to: string;
      reason: string;
    };
    notes?: string;
  }[];
  clinicalObservations?: {
    type: string;
    value: string;
    unit: string;
    timestamp: string;
    notes?: string;
  }[];
  recommendations: {
    category: 'MEDICATION' | 'MONITORING' | 'LIFESTYLE' | 'REFERRAL';
    description: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    timeframe?: string;
    assignedTo?: string;
  }[];
  reviewedBy: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HandoverDocument {
  id: string;
  residentId: string;
  careHomeId: string;
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT';
  date: string;
  medications: {
    medicationId: string;
    name: string;
    status: 'GIVEN' | 'MISSED' | 'REFUSED' | 'PENDING';
    time: string;
    notes?: string;
  }[];
  observations: {
    type: string;
    value: string;
    timestamp: string;
    notes?: string;
  }[];
  incidents?: {
    type: string;
    description: string;
    actions: string;
    timestamp: string;
  }[];
  followUp: {
    task: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    assignedTo?: string;
    dueDate?: string;
  }[];
  handedOverBy: string;
  handedOverTo: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentDocument {
  id: string;
  residentId: string;
  careHomeId: string;
  type: 'CAPACITY' | 'RISK' | 'SELF_ADMINISTRATION' | 'SWALLOWING' | 'COVERT';
  status: 'DRAFT' | 'COMPLETED' | 'UNDER_REVIEW' | 'ARCHIVED';
  assessmentDate: string;
  reviewDate: string;
  sections: {
    id: string;
    title: string;
    questions: {
      id: string;
      question: string;
      answer: string;
      evidence?: string;
      notes?: string;
    }[];
    outcome?: string;
    recommendations?: string;
  }[];
  decision: {
    outcome: string;
    rationale: string;
    restrictions?: string[];
    alternatives?: string[];
  };
  approvals: {
    role: string;
    approvedBy: string;
    approvedAt: string;
    notes?: string;
  }[];
  reviewHistory: {
    reviewedBy: string;
    reviewedAt: string;
    changes: string;
    outcome: string;
  }[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
} 


