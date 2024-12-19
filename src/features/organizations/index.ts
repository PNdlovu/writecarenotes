/**
 * Organizations Module Public API
 * Core module for managing multiple care homes under an organization
 */

// Types
export * from './types/organization.types'
export * from './types/analytics.types'
export * from './types/errors'
export * from './types/audit.types'
export * from './types/security.types'
export * from './types/telemetry.types'

// Core Organization Services
export { OrganizationService } from './services/organizationService'
export { OrganizationAnalyticsService } from './services/analyticsService'
export { OrganizationOfflineService } from './services/offlineService'
export { SecurityService } from './services/securityService'
export { AuditService } from './services/auditService'
export { TelemetryService } from './services/telemetryService'

// Core Organization Components
export { OrganizationDashboard } from './components/dashboard/OrganizationDashboard'
export { OrganizationSettings } from './components/settings/OrganizationSettings'
export { OrganizationAnalyticsDashboard } from './components/analytics/OrganizationAnalyticsDashboard'
export { OrganizationErrorBoundary } from './components/error/OrganizationErrorBoundary'

// Context and Hooks
export { OrganizationContext, type OrganizationContextType } from './hooks/useOrganizationContext'
export { useOrganization } from './hooks/useOrganization'
export { useOrganizationAnalytics } from './hooks/useOrganizationAnalytics'
export { OrganizationProvider } from './providers/OrganizationProvider'

// Server Utilities
export { getOrganization, getOrganizationFromRequest } from './lib/server'

/**
 * Feature Flags
 * Controls organization-level features
 */
export const ORGANIZATION_FEATURES = {
  MULTI_CARE_HOME: true,       // Enable multiple care home management
  OFFLINE_SUPPORT: true,       // Enable offline capabilities
  ANALYTICS: true,             // Enable analytics features
  AUDIT_LOGGING: true,         // Enable audit logging
  SECURITY_POLICIES: true,     // Enable security policy enforcement
  TELEMETRY: true,            // Enable telemetry and monitoring
}


