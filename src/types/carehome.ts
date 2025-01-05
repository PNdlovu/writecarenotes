import { Staff, Department, Resource, Schedule } from './core';

export interface CareHomeMetrics {
  totalStaff: number;
  occupancyRate: number;
  carePlansCount: number;
  activeIncidents: number;
  resourceUtilization: number;
  pendingMaintenance: number;
  staffingEfficiency?: number;
  qualityMetrics?: {
    residentSatisfaction: number;
    staffSatisfaction: number;
    careQualityScore: number;
  };
  complianceScore?: number;
  incidentResponseTime?: number;
}

export interface CareHomeStats {
  dailyOccupancy: Array<{ date: string; count: number }>;
  resourceUsage: Array<{ resource: string; usage: number }>;
  departmentMetrics: Array<{ department: string; staffCount: number; occupancy: number }>;
  staffingLevels: Array<{ shift: string; required: number; actual: number }>;
  qualityIndicators: Array<{
    indicator: string;
    value: number;
    target: number;
    trend: 'improving' | 'declining' | 'stable';
  }>;
  incidentTrends: Array<{
    category: string;
    count: number;
    previousPeriodCount: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  requestedBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  category: MaintenanceCategory;
  estimatedCost?: number;
  actualCost?: number;
  parts?: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
  inspectionRequired?: boolean;
  inspectionStatus?: 'pending' | 'passed' | 'failed';
  recurringSchedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    nextDueDate: string;
  };
}

export type MaintenanceCategory = 
  | 'GENERAL_REPAIR'
  | 'PREVENTIVE'
  | 'SAFETY_CRITICAL'
  | 'EQUIPMENT'
  | 'INFRASTRUCTURE'
  | 'ENVIRONMENTAL'
  | 'SPECIALIZED_EQUIPMENT';

export interface Incident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved' | 'under-investigation';
  location: string;
  reportedBy: string;
  description: string;
  timestamp: string;
  resolvedAt?: string;
  resolution?: string;
  category: IncidentCategory;
  affectedResidents?: string[];
  witnesses?: string[];
  immediateActions: string[];
  followUpActions?: string[];
  riskAssessment?: {
    likelihood: number;
    impact: number;
    mitigationSteps: string[];
  };
  notificationsSent?: Array<{
    recipient: string;
    method: 'email' | 'sms' | 'phone';
    timestamp: string;
    status: 'sent' | 'failed' | 'pending';
  }>;
  reviewDate?: string;
  preventiveMeasures?: string[];
}

export type IncidentCategory =
  | 'MEDICAL'
  | 'BEHAVIORAL'
  | 'FACILITY'
  | 'SECURITY'
  | 'STAFF'
  | 'MEDICATION'
  | 'VISITOR'
  | 'EMERGENCY';

export interface OccupancyData {
  currentOccupancy: number;
  maxCapacity: number;
  departments: Array<{
    id: string;
    name: string;
    currentOccupancy: number;
    maxCapacity: number;
    specializedCare?: string[];
    staffingRatio: number;
    waitingList?: number;
  }>;
  occupancyTrends: Array<{
    period: string;
    average: number;
    peak: number;
    low: number;
  }>;
  specializedUnits?: Array<{
    name: string;
    capacity: number;
    currentOccupancy: number;
    specialization: string;
    requiredStaffing: {
      nurses: number;
      careAssistants: number;
      specialists: number;
    };
  }>;
}

export type CareHomeType = 'CARE_HOME' | 'NURSING_HOME' | 'RESIDENTIAL_HOME' | 'SUPPORTED_LIVING';
export type RegulatoryBody = 'CQC' | 'CIW' | 'RQIA' | 'CARE_INSPECTORATE' | 'HIQA';
export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL' | 'UNDER_REVIEW';
export type InspectionRating = 'OUTSTANDING' | 'GOOD' | 'REQUIRES_IMPROVEMENT' | 'INADEQUATE';

export interface CareHomeCompliance {
  id: string;
  careHomeId: string;
  organizationId: string;
  regulatoryBody: RegulatoryBody;
  lastInspection: Date;
  nextInspection?: Date;
  rating: InspectionRating;
  score: number;
  requirements: ComplianceRequirement[];
  history: ComplianceHistory[];
  documents: ComplianceDocument[];
  status: ComplianceStatus;
  improvementPlan?: {
    areas: string[];
    actions: string[];
    timeline: string;
    responsibleParties: string[];
    progress: number;
  };
  riskAssessment?: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
    mitigationPlan: string;
  };
}

export interface ComplianceRequirement {
  id: string;
  category: string;
  description: string;
  status: ComplianceStatus;
  dueDate: Date;
  lastChecked: Date;
  assignedTo: string[];
  evidence?: string[];
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  verificationMethod: string[];
  dependencies?: string[];
  risks?: Array<{
    description: string;
    likelihood: number;
    impact: number;
    mitigation: string;
  }>;
}

export interface ComplianceHistory {
  date: Date;
  rating: InspectionRating;
  score: number;
  inspector?: string;
  notes?: string;
  documents?: string[];
  areasOfImprovement?: string[];
  bestPractices?: string[];
  actionsTaken?: string[];
  followUpRequired?: boolean;
  followUpDate?: Date;
}

export interface ComplianceDocument {
  id: string;
  type: 'INSPECTION_REPORT' | 'EVIDENCE' | 'POLICY' | 'CERTIFICATE' | 'TRAINING_RECORD' | 'AUDIT_REPORT';
  title: string;
  url: string;
  uploadedAt: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'PENDING_REVIEW';
  validUntil?: string;
  metadata?: {
    author: string;
    version: string;
    keywords: string[];
    relatedDocuments?: string[];
  };
  accessLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  reviewStatus?: {
    lastReviewed: string;
    reviewedBy: string;
    nextReviewDate: string;
    comments?: string[];
  };
}

export interface CareHomeResource {
  id: string;
  type: 'EQUIPMENT' | 'SUPPLIES' | 'MEDICATION' | 'STAFF' | 'SPACE';
  name: string;
  status: 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'DEPLETED';
  quantity: number;
  unit: string;
  location: string;
  lastChecked: Date;
  minimumRequired: number;
  reorderPoint: number;
  supplier?: {
    id: string;
    name: string;
    contact: string;
    leadTime: number;
  };
  maintenanceSchedule?: {
    frequency: string;
    lastMaintenance: Date;
    nextMaintenance: Date;
    provider: string;
  };
  costTracking?: {
    unitCost: number;
    totalCost: number;
    budget: number;
    expenses: Array<{
      date: string;
      amount: number;
      description: string;
    }>;
  };
}

// Settings and Preferences
export interface CareHomeSettings {
  id: string;
  careHomeId: string;
  name: string;
  address: string;
  contactInfo: ContactInfo;
  operatingHours: OperatingHours;
  departments: string[];
  capacity: number;
  features: CareHomeFeatures;
  preferences: CareHomePreferences;
}

export interface ContactInfo {
  phone: string;
  email: string;
  emergencyContact: string;
  emergencyPhone: string;
}

export interface OperatingHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface CareHomeFeatures {
  hasParking: boolean;
  hasWifi: boolean;
  isAccessible: boolean;
  hasEmergencyPower: boolean;
  hasSecurity: boolean;
}

export interface CareHomePreferences {
  theme: 'light' | 'dark';
  language: string;
  notificationsEnabled: boolean;
  autoScheduling: boolean;
  maintenanceAlerts: boolean;
  occupancyAlerts: boolean;
}


