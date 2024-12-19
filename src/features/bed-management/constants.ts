// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  BED_LIST: 60, // 1 minute
  BED_DETAILS: 300, // 5 minutes
  OCCUPANCY_STATS: 3600, // 1 hour
  MAINTENANCE_SCHEDULE: 1800, // 30 minutes
  WAITLIST: 60 // 1 minute
} as const

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
} as const

// Timeouts (in milliseconds)
export const TIMEOUTS = {
  TRANSFER_APPROVAL: 72 * 60 * 60 * 1000, // 72 hours
  MAINTENANCE_COMPLETION: 24 * 60 * 60 * 1000, // 24 hours
  WAITLIST_EXPIRY: 30 * 24 * 60 * 60 * 1000 // 30 days
} as const

// Feature flags
export const FEATURES = {
  ENABLE_WAITLIST: true,
  ENABLE_MAINTENANCE: true,
  ENABLE_TRANSFERS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_AUDIT_LOG: true
} as const

// Rate limits (requests per minute)
export const RATE_LIMITS = {
  GET_REQUESTS: 60,
  POST_REQUESTS: 30,
  PUT_REQUESTS: 30,
  DELETE_REQUESTS: 10
} as const

// Maintenance intervals (in days)
export const MAINTENANCE_INTERVALS = {
  ROUTINE: 30,
  DEEP_CLEANING: 90,
  EQUIPMENT_CHECK: 60,
  SAFETY_INSPECTION: 180
} as const

// Priority levels for different operations
export const PRIORITY_WEIGHTS = {
  EMERGENCY: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25
} as const

// Notification settings
export const NOTIFICATIONS = {
  MAINTENANCE_DUE_DAYS: 7, // Days before maintenance to notify
  TRANSFER_REMINDER_HOURS: 24, // Hours before transfer deadline to remind
  WAITLIST_UPDATE_DAYS: 7 // Days between waitlist status updates
} as const

// Analytics settings
export const ANALYTICS = {
  DEFAULT_DATE_RANGE_DAYS: 30,
  MAX_DATE_RANGE_DAYS: 365,
  CACHE_DURATION: 3600 // 1 hour
} as const

// Audit settings
export const AUDIT = {
  RETENTION_DAYS: 365,
  BATCH_SIZE: 1000
} as const


