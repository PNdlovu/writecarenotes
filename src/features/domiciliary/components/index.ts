/**
 * @writecarenotes.com
 * @fileoverview Component exports for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Exports all React components for the domiciliary care module,
 * providing a centralized access point for UI components and
 * ensuring consistent usage across the module.
 *
 * Features:
 * - Visit management components
 * - Staff coordination components
 * - Task management components
 * - Location tracking components
 * - Offline indicators
 *
 * Mobile-First Considerations:
 * - Touch-friendly interactions
 * - Responsive layouts
 * - Performance optimized
 * - Network state indicators
 * - Device capability checks
 *
 * Enterprise Features:
 * - Accessibility compliance
 * - Error boundaries
 * - Performance monitoring
 * - Regional support
 * - Security features
 */

// Visit Management Components
export { VisitCard } from './visits/VisitCard';
export { VisitList } from './visits/VisitList';
export { VisitDetails } from './visits/VisitDetails';
export { VisitForm } from './visits/VisitForm';
export { VisitCalendar } from './visits/VisitCalendar';
export { VisitFilters } from './visits/VisitFilters';

// Staff Management Components
export { StaffAssignment } from './staff/StaffAssignment';
export { StaffList } from './staff/StaffList';
export { StaffAvailability } from './staff/StaffAvailability';
export { StaffSchedule } from './staff/StaffSchedule';

// Task Management Components
export { TaskList } from './tasks/TaskList';
export { TaskItem } from './tasks/TaskItem';
export { TaskForm } from './tasks/TaskForm';
export { TaskCompletion } from './tasks/TaskCompletion';

// Location Components
export { LocationMap } from './location/LocationMap';
export { RouteView } from './location/RouteView';
export { LocationHistory } from './location/LocationHistory';

// Compliance Components
export { ComplianceChecklist } from './compliance/ComplianceChecklist';
export { ComplianceStatus } from './compliance/ComplianceStatus';
export { ComplianceReport } from './compliance/ComplianceReport';

// Common Components
export { OfflineIndicator } from './common/OfflineIndicator';
export { LoadingSpinner } from './common/LoadingSpinner';
export { ErrorBoundary } from './common/ErrorBoundary';
export { RegionSelector } from './common/RegionSelector';
export { PerformanceMonitor } from './common/PerformanceMonitor'; 