/**
 * @writecarenotes.com
 * @fileoverview Constants for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Centralized constants for the domiciliary care module, including
 * configuration values, enums, and static data. Implements regional
 * variations and compliance requirements.
 *
 * Features:
 * - Regional configuration constants
 * - Compliance requirement values
 * - UI configuration constants
 * - Integration endpoints
 * - Error messages and codes
 *
 * Mobile-First Considerations:
 * - Device-specific configurations
 * - Network state thresholds
 * - Offline mode settings
 * - Touch interaction values
 * - Performance thresholds
 *
 * Enterprise Features:
 * - Environment-based configuration
 * - Regional compliance values
 * - Security thresholds
 * - Integration timeouts
 * - Audit requirements
 */

import { type Region } from '@/types/region';

// Regional Configuration
export const SUPPORTED_REGIONS: Region[] = [
  'ENGLAND',
  'WALES',
  'SCOTLAND',
  'NORTHERN_IRELAND',
  'IRELAND'
];

export const REGULATORY_BODIES = {
  ENGLAND: 'CQC',
  WALES: 'CIW',
  SCOTLAND: 'CARE_INSPECTORATE',
  NORTHERN_IRELAND: 'RQIA',
  IRELAND: 'HIQA'
} as const;

// Visit Management
export const VISIT_DURATION = {
  MIN: 15, // minutes
  DEFAULT: 30,
  MAX: 240
} as const;

export const VISIT_STATUS_LABELS = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  MISSED: 'Missed',
  LATE: 'Running Late'
} as const;

export const TASK_TYPE_LABELS = {
  PERSONAL_CARE: 'Personal Care',
  MEDICATION: 'Medication',
  MOBILITY: 'Mobility Support',
  NUTRITION: 'Nutrition & Hydration',
  DOMESTIC: 'Domestic Tasks',
  SOCIAL: 'Social Support'
} as const;

// Staff Management
export const STAFF_ROLE_LABELS = {
  CARE_WORKER: 'Care Worker',
  SENIOR_CARE_WORKER: 'Senior Care Worker',
  COORDINATOR: 'Care Coordinator',
  SUPERVISOR: 'Care Supervisor'
} as const;

export const STAFF_STATUS_LABELS = {
  ASSIGNED: 'Assigned',
  CONFIRMED: 'Confirmed',
  EN_ROUTE: 'En Route',
  ON_SITE: 'On Site',
  COMPLETED: 'Completed'
} as const;

// Compliance
export const COMPLIANCE_TYPE_LABELS = {
  VISIT_VERIFICATION: 'Visit Verification',
  MEDICATION_ADMINISTRATION: 'Medication Administration',
  INCIDENT_REPORT: 'Incident Report',
  SAFEGUARDING_ALERT: 'Safeguarding Alert'
} as const;

// Mobile Configuration
export const MOBILE_CONFIG = {
  LOCATION_ACCURACY: {
    HIGH: 10, // meters
    MEDIUM: 50,
    LOW: 100
  },
  OFFLINE_SYNC: {
    RETRY_INTERVAL: 5 * 60 * 1000, // 5 minutes
    MAX_RETRIES: 12,
    BATCH_SIZE: 50
  },
  TOUCH_TARGETS: {
    MIN_SIZE: 44, // pixels
    SPACING: 8
  }
} as const;

// Performance Thresholds
export const PERFORMANCE = {
  RESPONSE_TIME: {
    CRITICAL: 1000, // milliseconds
    WARNING: 3000,
    ERROR: 5000
  },
  CACHE_DURATION: {
    STATIC: 24 * 60 * 60 * 1000, // 24 hours
    DYNAMIC: 5 * 60 * 1000 // 5 minutes
  }
} as const;

// Integration Timeouts
export const INTEGRATION_TIMEOUTS = {
  DEFAULT: 30000, // milliseconds
  LONG_RUNNING: 120000,
  BACKGROUND: 300000
} as const;

// Error Codes
export const ERROR_CODES = {
  VISIT: {
    NOT_FOUND: 'VISIT_001',
    INVALID_STATUS: 'VISIT_002',
    SCHEDULING_CONFLICT: 'VISIT_003'
  },
  STAFF: {
    NOT_AVAILABLE: 'STAFF_001',
    INVALID_ROLE: 'STAFF_002',
    LOCATION_REQUIRED: 'STAFF_003'
  },
  COMPLIANCE: {
    MISSING_VERIFICATION: 'COMP_001',
    INCOMPLETE_RECORDS: 'COMP_002',
    REGULATORY_BREACH: 'COMP_003'
  }
} as const; 