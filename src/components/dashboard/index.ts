/**
 * WriteCareNotes.com
 * @fileoverview Dashboard component exports and type definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

// Core Dashboard Components
export { default as DashboardView } from './DashboardView';
export * from './DashboardMetrics';
export * from './Overview';
export * from './RecentActivities';
export * from './RecentActivity';
export * from './RegionalMetrics';
export * from './UpcomingTasks';

// Visualization Components
export * from './visualizations';

// Type Definitions
export type { 
  // Core Types
  MetricData, 
  LocaleConfig, 
  ChartConfig,
  PerformanceData,
  ComplianceMetrics,
  
  // Audit & Validation Types
  AuditLog,
  DataValidation,
  
  // Access Control Types
  AccessControl,
  
  // Chart Types
  ChartProps,
  DrillDownConfig,
  ExportOptions,
  
  // Regional Types
  RegionData,
  RegionalData,
  
  // Performance Types
  PerformanceMetrics,
  
  // Ofsted Types
  OfstedRating,
  OfstedMetrics,
  
  // Configuration Types
  CacheConfig,
  OfflineConfig,
  ErrorConfig
} from './visualizations/types';

// Constants and Configurations
export const DASHBOARD_CONFIG = {
  defaultRegion: 'UK',
  supportedRegions: ['UK', 'IE'],
  refreshInterval: 30000, // 30 seconds
  cacheExpiry: 3600000,  // 1 hour
  maxOfflineData: 1000,  // Maximum number of records to store offline
  supportedLanguages: ['en-GB', 'en-IE', 'cy-GB', 'ga-IE'],
  defaultCurrency: 'GBP',
  alternativeCurrencies: ['EUR'],
  complianceFrameworks: {
    UK: ['CQC', 'CIW', 'RQIA', 'Care Inspectorate'],
    IE: ['HIQA']
  }
} as const;

// Utility Functions
export const getDashboardConfig = (region: string) => ({
  ...DASHBOARD_CONFIG,
  currentRegion: region,
  currency: region === 'IE' ? 'EUR' : 'GBP',
  language: region === 'IE' ? 'en-IE' : 'en-GB',
  complianceFramework: DASHBOARD_CONFIG.complianceFrameworks[region as keyof typeof DASHBOARD_CONFIG.complianceFrameworks]
});


