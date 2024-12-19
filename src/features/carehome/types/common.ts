// src/features/carehome/types/common.ts

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

export interface Capacity {
  total: number;
  current: number;
  available: number;
  breakdown: {
    residential: number;
    nursing: number;
    dementia: number;
    respite: number;
    palliative: number;
  };
}

export interface Metrics {
  totalStaff: number;
  totalDepartments: number;
  occupancyRate: number;
  resourceUtilization: number;
  activeIncidents: number;
  pendingMaintenance: number;
  qualityScore: number;
  staffingRatio: number;
  residentSatisfaction: number;
  familySatisfaction: number;
}

export interface Stats {
  dailyOccupancy: Array<{
    date: string;
    count: number;
  }>;
  resourceUsage: Array<{
    resource: string;
    usage: number;
  }>;
  departmentMetrics: Array<{
    department: string;
    staffCount: number;
    occupancy: number;
  }>;
  incidentTrends: Array<{
    month: string;
    count: number;
    type: string;
  }>;
  satisfactionTrends: Array<{
    month: string;
    resident: number;
    family: number;
  }>;
}

export interface CareLevel {
  id: string;
  name: string;
  description: string;
  staffingRequirement: number;
  specialEquipment: string[];
  trainingRequired: string[];
  assessmentCriteria: string[];
}

export interface ServiceOffering {
  id: string;
  name: string;
  description: string;
  included: boolean;
  additionalCost?: number;
  availability: 'standard' | 'on-request' | 'premium';
}


