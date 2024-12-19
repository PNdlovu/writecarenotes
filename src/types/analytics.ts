import { Organization } from './models';

export interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: number; // percentage change
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface PerformanceMetrics {
  staffUtilization: number;
  bedOccupancy: number;
  averageLength: number; // average length of stay
  incidentRate: number;
  satisfactionScore: number;
  qualityScore: number;
}

export interface ResourceMetrics {
  staffingLevels: {
    current: number;
    required: number;
    department: string;
  }[];
  equipmentUtilization: {
    type: string;
    utilizationRate: number;
    maintenanceRate: number;
  }[];
  suppliesInventory: {
    category: string;
    currentStock: number;
    reorderPoint: number;
  }[];
}

export interface FinancialMetrics {
  revenue: number;
  expenses: number;
  occupancyRevenue: number;
  staffingCosts: number;
  suppliesCosts: number;
  operationalCosts: number;
}

export interface ComplianceMetrics {
  overallScore: number;
  inspectionResults: {
    date: Date;
    score: number;
    findings: string[];
  }[];
  incidentReports: {
    total: number;
    resolved: number;
    pending: number;
  };
  trainingCompliance: number;
}

export interface OrganizationAnalytics {
  organizationId: string;
  timeframe: {
    start: Date;
    end: Date;
  };
  performance: PerformanceMetrics;
  resources: ResourceMetrics;
  financial: FinancialMetrics;
  compliance: ComplianceMetrics;
  customMetrics: AnalyticsMetric[];
}


