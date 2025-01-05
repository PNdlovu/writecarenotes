/**
 * @writecarenotes.com
 * @fileoverview Constants for incident management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Constant values and configuration settings for the incident
 * management system. Includes pagination settings, timeouts,
 * and other configuration values used across the module.
 */

export const INCIDENT_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  },
  TIMEOUTS: {
    AUTOSAVE_DELAY: 3000, // 3 seconds
    SYNC_INTERVAL: 30000, // 30 seconds
    NOTIFICATION_DISPLAY: 5000, // 5 seconds
  },
  LIMITS: {
    MAX_ATTACHMENTS: 10,
    MAX_WITNESSES: 20,
    MAX_ACTIONS: 50,
    DESCRIPTION_MAX_LENGTH: 2000,
  },
  REGULATORY: {
    CQC_NOTIFICATION_DEADLINE: 24, // hours
    SAFEGUARDING_DEADLINE: 4, // hours
    INVESTIGATION_DEADLINE: 72, // hours
  },
} as const;

export const SEVERITY_COLORS = {
  CRITICAL: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  MAJOR: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  MINOR: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
  },
} as const;

export const STATUS_COLORS = {
  REPORTED: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
  },
  INVESTIGATING: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  RESOLVED: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
  CLOSED: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  },
} as const; 