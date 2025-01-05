/**
 * @writecarenotes.com
 * @fileoverview Main entry point for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Main entry point for the domiciliary care module, exporting all
 * components, services, hooks, types, and utilities. Provides a
 * centralized access point for all module functionality.
 *
 * Features:
 * - Visit management
 * - Staff coordination
 * - Task management
 * - Location tracking
 * - Compliance monitoring
 *
 * Mobile-First Considerations:
 * - Optimized bundle size
 * - Lazy loading support
 * - Performance monitoring
 * - Offline capabilities
 * - Device adaptability
 *
 * Enterprise Features:
 * - Regional compliance
 * - Security measures
 * - Audit logging
 * - Error handling
 * - Analytics integration
 */

// Types
export type {
  Visit,
  VisitTask,
  AssignedStaff,
  GeoLocation,
  ComplianceRecord,
  DomiciliaryCarePlan
} from './types';

// Constants
export {
  SUPPORTED_REGIONS,
  REGULATORY_BODIES,
  VISIT_DURATION,
  VISIT_STATUS_LABELS,
  TASK_TYPE_LABELS,
  STAFF_ROLE_LABELS,
  STAFF_STATUS_LABELS,
  COMPLIANCE_TYPE_LABELS,
  MOBILE_CONFIG,
  PERFORMANCE,
  INTEGRATION_TIMEOUTS,
  ERROR_CODES
} from './constants';

// Components
export {
  // Visit Management
  VisitCard,
  VisitList,
  VisitDetails,
  VisitForm,
  VisitCalendar,
  VisitFilters,
  
  // Staff Management
  StaffAssignment,
  StaffList,
  StaffAvailability,
  StaffSchedule,
  
  // Task Management
  TaskList,
  TaskItem,
  TaskForm,
  TaskCompletion,
  
  // Location
  LocationMap,
  RouteView,
  LocationHistory,
  
  // Compliance
  ComplianceChecklist,
  ComplianceStatus,
  ComplianceReport,
  
  // Common
  OfflineIndicator,
  LoadingSpinner,
  ErrorBoundary,
  RegionSelector,
  PerformanceMonitor
} from './components';

// Services
export {
  VisitService,
  StaffService,
  ComplianceService,
  TaskService
} from './services';

// Hooks
export {
  useVisit,
  useVisitList,
  useStaffAssignment,
  useLocationTracking,
  useTaskManagement,
  usePerformanceMonitoring,
  useOfflineSync
} from './hooks';

// Utils
export {
  isVisitOverlapping,
  calculateVisitDuration,
  validateVisitDuration,
  calculateTaskCompletion,
  sortTasksByPriority,
  calculateDistance,
  isLocationAccurate,
  measureResponseTime,
  isPerformanceCritical,
  DomiciliaryError,
  validateVisit,
  formatDuration,
  formatDateTime,
  generateAuditTrail
} from './utils'; 