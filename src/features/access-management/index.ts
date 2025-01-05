/**
 * @fileoverview Access Management Module Exports
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

// Access Management Core
export * from './auth';
export * from './permissions';
export * from './roles';

// Access Features
export * from './access';

// Types
export * from './types';

// Context
export { AccessManagementContext, AccessManagementProvider } from './context/AccessManagementContext';

// Services
export { AccessManagementService } from './services/AccessManagementService';

// Hooks
export { useAccess } from './hooks/useAccess';
export { useAccessSettings } from './access/hooks';

// Higher-Order Components
export { withAccess } from './hoc/withAccess';

// Components
export { AccessPolicyManager } from './components/AccessPolicyManager';
export { EmergencyAccessManager } from './components/EmergencyAccessManager';
export { AuditLogViewer } from './components/AuditLogViewer';
export { AccessSettings } from './access/AccessSettings'; 