export interface DoLS {
  id: string;
  residentId: string;
  status: DoLSStatus;
  type: DoLSType;
  startDate: Date;
  endDate: Date;
  urgency: 'STANDARD' | 'URGENT';
  supervisingBody: string;
  assessments: DoLSAssessment[];
  reviews: DoLSReview[];
  conditions?: string[];
  representative?: DoLSRepresentative;
  notes?: string;
  documents: DoLSDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export type DoLSStatus =
  | 'PENDING'           // Application submitted, awaiting assessment
  | 'ACTIVE'            // Currently in force
  | 'EXPIRED'           // Past end date
  | 'WITHDRAWN'         // Application withdrawn
  | 'REJECTED'          // Application not granted
  | 'REVIEW_REQUIRED'   // Needs review
  | 'UNDER_REVIEW';     // Currently being reviewed

export type DoLSType =
  | 'STANDARD_AUTHORISATION'
  | 'URGENT_AUTHORISATION'
  | 'COURT_ORDER'
  | 'EXTENSION_REQUEST';

export interface DoLSAssessment {
  id: string;
  dolsId: string;
  type: DoLSAssessmentType;
  assessor: {
    name: string;
    role: string;
    organization: string;
  };
  date: Date;
  outcome: 'PASSED' | 'FAILED' | 'INCOMPLETE';
  recommendations?: string;
  notes?: string;
  nextReviewDate?: Date;
}

export type DoLSAssessmentType =
  | 'AGE'                    // Age assessment
  | 'MENTAL_HEALTH'          // Mental health assessment
  | 'MENTAL_CAPACITY'        // Mental capacity assessment
  | 'NO_REFUSALS'            // No refusals assessment
  | 'ELIGIBILITY'            // Eligibility assessment
  | 'BEST_INTERESTS';        // Best interests assessment

export interface DoLSReview {
  id: string;
  dolsId: string;
  reviewDate: Date;
  reviewType: 'PLANNED' | 'UNPLANNED';
  reviewer: {
    name: string;
    role: string;
  };
  outcome: 'MAINTAINED' | 'MODIFIED' | 'TERMINATED';
  changes?: string;
  nextReviewDate: Date;
}

export interface DoLSRepresentative {
  id: string;
  type: 'PAID' | 'UNPAID';
  name: string;
  relationship?: string;
  contactDetails: {
    phone: string;
    email?: string;
    address: string;
  };
  startDate: Date;
  endDate?: Date;
  visitFrequency?: string;
  lastVisit?: Date;
  nextVisit?: Date;
}

export interface DoLSDocument {
  id: string;
  type: DoLSDocumentType;
  title: string;
  fileUrl: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  uploadedAt: Date;
  expiryDate?: Date;
}

export type DoLSDocumentType =
  | 'APPLICATION_FORM'
  | 'ASSESSMENT_REPORT'
  | 'AUTHORISATION_FORM'
  | 'REVIEW_FORM'
  | 'COURT_ORDER'
  | 'CAPACITY_ASSESSMENT'
  | 'REPRESENTATIVE_AGREEMENT'
  | 'CORRESPONDENCE';


