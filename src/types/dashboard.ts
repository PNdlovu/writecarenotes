export interface CareHomeData {
  id: string;
  name: string;
  type: string;
  registrationNumber: string;
  lastInspection: string;
  capacity: number;
  manager: string;
  rating: 'Outstanding' | 'Good' | 'Requires Improvement' | 'Inadequate';
  lastUpdated: string;
}

export interface MetricData {
  value: number;
  trend: number;
}

export interface BedOccupancy extends MetricData {
  total: number;
  occupied: number;
}

export interface StaffCoverage extends MetricData {
  required: number;
  present: number;
}

export interface CareCompliance extends MetricData {
  total: number;
  completed: number;
}

export interface Incidents extends MetricData {
  critical: number;
  moderate: number;
}

export interface DashboardMetrics {
  bedOccupancy: BedOccupancy;
  staffCoverage: StaffCoverage;
  careCompliance: CareCompliance;
  incidents: Incidents;
}

export interface CareMetric {
  name: string;
  value: number;
  total?: number;
  unit?: string;
  status: 'success' | 'warning' | 'error';
}

export interface ComplianceDeadline {
  name: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  type: 'inspection' | 'training' | 'policy' | 'assessment';
  assignedTo: string;
  notes?: string;
}

export interface PerformanceTrend {
  label: string;
  data: number[];
}

export interface PerformanceData {
  labels: string[];
  datasets: PerformanceTrend[];
}

export type DateRange = '24h' | '7d' | '30d' | '90d' | 'custom';

export interface DashboardFilters {
  dateRange: DateRange;
  metrics: string[];
  unit?: string;
  showTrends?: boolean;
} 