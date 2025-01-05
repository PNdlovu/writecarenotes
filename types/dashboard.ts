/**
 * @writecarenotes.com
 * @fileoverview Dashboard types and interfaces
 * @version 1.0.0
 * @created 2024-01-03
 * @updated 2024-01-03
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

export interface CareHomeData {
  id: string;
  name: string;
  type: string;
  rating: string;
  registrationNumber: string;
  lastInspection: string;
  manager: string;
  address: string;
  phone: string;
  email: string;
  capacity: number;
  currentOccupancy: number;
}

export interface DashboardMetrics {
  bedOccupancy: {
    value: number;
    trend: number;
    occupied: number;
    total: number;
  };
  staffCoverage: {
    value: number;
    trend: number;
    present: number;
    required: number;
  };
  careCompliance: {
    value: number;
    trend: number;
    completed: number;
    total: number;
  };
  incidents: {
    value: number;
    trend: number;
    critical: number;
    moderate: number;
  };
}

export interface CareMetric {
  name: string;
  value: number;
  target: number;
  trend: number;
  status: 'success' | 'warning' | 'error';
}

export interface ComplianceDeadline {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'overdue' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface PerformanceData {
  metrics: {
    name: string;
    data: number[];
    target: number;
  }[];
  labels: string[];
}

export interface DashboardAction {
  name: string;
  path: string;
  icon: any;
  ariaLabel: string;
} 