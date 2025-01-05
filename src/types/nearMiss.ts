export type NearMissType = 
  | 'WRONG_MEDICATION' 
  | 'WRONG_DOSE' 
  | 'WRONG_TIME' 
  | 'WRONG_RESIDENT' 
  | 'MISSED_DOSE' 
  | 'STOCK_ERROR' 
  | 'OTHER';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SafeguardingPriority = 'STANDARD' | 'URGENT';

export type Region = 'wales' | 'scotland' | 'belfast' | 'england' | 'dublin';

export interface ChildSpecificDetails {
  age: number;
  specialNeeds?: string;
  parentNotified: boolean;
  parentNotificationTime?: string;
  careplanUpdated: boolean;
  riskAssessmentCompleted: boolean;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  supportPlanCreated?: boolean;
  supportPlanReviewDate?: string;
}

export interface SafeguardingReferralDetails {
  referralTime: string;
  referredTo: string;
  priority: SafeguardingPriority;
  followUpRequired: boolean;
  followUpDate?: string;
  riskAssessment?: {
    completed: boolean;
    level: string;
    actions: string[];
  };
}

export interface SystemImprovements {
  processChanges: string;
  trainingNeeded: boolean;
  trainingDetails?: {
    type: string[];
    targetAudience: string[];
    deadline: string;
  };
  policyUpdatesRequired: boolean;
  policyUpdateDetails?: {
    policies: string[];
    changeDescription: string;
    reviewDate: string;
  };
  equipmentChanges?: {
    required: boolean;
    description?: string;
    cost?: number;
  };
}

export interface Reporter {
  id: string;
  name: string;
  role: string;
  department?: string;
  qualifications?: string[];
}

export interface NearMissReport {
  id: string;
  medicationId?: string;
  residentId: string;
  timestamp: string;
  type: NearMissType;
  severity: Severity;
  description: string;
  actionTaken: string;
  preventiveMeasures: string;
  reportedBy: Reporter;
  witnessName: string;
  regulatoryBody: string;
  isChildInvolved: boolean;
  childSpecificDetails?: ChildSpecificDetails;
  requiresSafeguardingReferral: boolean;
  safeguardingReferralDetails?: SafeguardingReferralDetails;
  systemImprovements?: SystemImprovements;
  metadata: {
    version: string;
    lastModified: string;
    modifiedBy: string;
    status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'CLOSED';
    reviewDate?: string;
    reviewedBy?: string;
    attachments?: Array<{
      id: string;
      type: string;
      url: string;
      name: string;
    }>;
  };
  analytics?: {
    timeToReport: number; // minutes from incident to report
    timeToAction: number; // minutes from report to action
    similarIncidents?: string[]; // IDs of similar incidents
    riskScore?: number; // calculated risk score
    trendCategory?: string; // categorization for trend analysis
  };
}


