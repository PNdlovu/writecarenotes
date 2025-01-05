import { RegionalCharts } from './RegionalCharts';
import { ComplianceCharts } from './ComplianceCharts';
import { PerformanceCharts } from './PerformanceCharts';
import { OfstedCharts } from './OfstedCharts';
import { DashboardOverview } from './DashboardOverview';

export const DashboardVisualizations = {
  RegionalCharts,
  ComplianceCharts,
  PerformanceCharts,
  OfstedCharts,
  DashboardOverview,
} as const;

export * from './types'; 


