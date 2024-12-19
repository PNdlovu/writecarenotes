// src/features/carehome/index.ts
// Components
export { CareHomeDashboard } from './components/CareHomeDashboard';
export { OfflineStatusBar } from './components/OfflineStatusBar';
export { ComplianceStatus } from './components/compliance/ComplianceStatus';
export { CareHomeDetails } from './components/details/CareHomeDetails';
export { CareHomeForm } from './components/forms/CareHomeForm';
export { CareHomeList } from './components/list/CareHomeList';
export { CareHomeStats } from './components/stats/CareHomeStats';

// Hooks
export { useOfflineSync } from './hooks/useOfflineSync';
export { useRegionalCompliance } from './hooks/useRegionalCompliance';
export { useCareHomeData } from './hooks/useCareHomeData';
export { useComplianceManagement } from './hooks/useComplianceManagement';
export { useDepartmentManagement } from './hooks/useDepartmentManagement';
export { useStaffPerformance } from './hooks/useStaffPerformance';
export { usePerformanceMonitoring } from './hooks/usePerformanceMonitoring';
export { useQualityAssurance } from './hooks/useQualityAssurance';
export { useResourceManagement } from './hooks/useResourceManagement';
export { useResidentWellbeing } from './hooks/useResidentWellbeing';
export { useCareHome } from './hooks/useCareHome';
export { useCareHomeList } from './hooks/useCareHomeList';
export { useCareHomeStats } from './hooks/useCareHomeStats';

// Types
export * from './types/compliance';
export * from './types/carehome.types';
export * from './types/region.types';
export * from './types/errors';
export * from './types/resident';
export * from './types/care';
export * from './types/staff';
export * from './types/common';

// API
export { CareHomeAPI } from './api';

// Services
export { CareHomeService } from './services/CareHomeService';
export { TenantService } from './services/TenantService';
export { DataExportService } from './services/DataExportService';
export { ResidentService } from './services/ResidentService';
export { NotificationService, NotificationType, NotificationPriority, NotificationChannel } from './services/NotificationService';
export { CareHomeTypeService } from './services/careHomeTypeService';
export { RegionService } from './services/regionService';

/**
 * Feature Flags
 * Controls care home-level features
 */
export const CARE_HOME_FEATURES = {
  SPECIALIZED_CARE: true,      // Enable specialized care type support
  REGIONAL_SUPPORT: true,      // Enable regional requirements and compliance
  STAFFING_CALC: true,        // Enable staffing calculations
  CAPACITY_PLANNING: true,     // Enable capacity planning
  SERVICE_TRACKING: true,      // Enable service delivery tracking
  EQUIPMENT_MGMT: true,        // Enable specialized equipment management
}


