/**
 * @fileoverview Organization Feature Exports
 * @version 1.0.0
 * @created 2024-03-21
 */

// Types
export * from './types/organization.types';

// API Client
export * from './api/client';

// Services
export { OrganizationService } from './services/organizationService';
export { OrganizationAnalyticsService } from './services/analyticsService';

// Hooks
export { useOrganization } from './hooks/useOrganization';
export { useOrganizationContext } from './hooks/useOrganizationContext';
export { useOrganizationAnalytics } from './hooks/useOrganizationAnalytics';
export { useSubscription } from './hooks/useSubscription';
export { useTenant } from './hooks/useTenant';
export { useCareHome } from './hooks/useCareHome';

// Components
export { OrganizationSettings } from './components/settings';
export { OrganizationDashboard } from './components/dashboard';
export { OrganizationAnalytics } from './components/analytics';
export { OrganizationError } from './components/error';

// Providers
export { OrganizationProvider } from './providers/OrganizationProvider';

// Validations
export { validateOrganization } from './validations/organizationValidation';

// Middleware
export { organizationSecurity } from './middleware/security';
export { organizationRateLimiting } from './middleware/rateLimiting';

// Utils
export { migrateOrganization } from './utils/migration';

// Analytics
export { organizationMetrics } from './analytics/metrics';

// Monitoring
export { healthChecks } from './monitoring/healthChecks';

/**
 * Feature Flags
 * Controls organization-level features
 */
export const ORGANIZATION_FEATURES = {
  MULTI_CARE_HOME: true,      // Enable multiple care home management
  OFFLINE_SUPPORT: true,      // Enable offline capabilities
  ANALYTICS: true,            // Enable analytics features
  AUDIT_LOGGING: true,        // Enable audit logging
  SECURITY_POLICIES: true,    // Enable security policy enforcement
  TELEMETRY: true,           // Enable telemetry and monitoring
} as const;

/**
 * Configuration Constants
 */
export const ORGANIZATION_CONFIG = {
  MAX_CARE_HOMES: 100,        // Maximum number of care homes per organization
  MAX_USERS: 1000,           // Maximum number of users per organization
  STORAGE_QUOTA: '10GB',     // Storage quota per organization
  SYNC_INTERVAL: 5 * 60000,  // Sync interval in milliseconds (5 minutes)
  CACHE_TTL: 3600,          // Cache time-to-live in seconds (1 hour)
  RATE_LIMITS: {
    API_CALLS: 1000,        // API calls per minute
    EXPORTS: 10,           // Exports per hour
    IMPORTS: 10            // Imports per hour
  }
} as const;


