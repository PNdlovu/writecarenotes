import { StaffRole, RegulatoryBody } from '@prisma/client'

export const REGION_LOCALE_MAP = {
  england: 'en-GB',
  scotland: 'en-GB',
  wales: 'en-GB',
  nireland: 'en-GB',
} as const;

/**
 * Staff role labels for different regions
 * These are used for display purposes and translations
 */
export const staffRoleLabels: Record<StaffRole, string> = {
  CARE_WORKER: 'careWorker',
  SENIOR_CARE_WORKER: 'seniorCareWorker',
  NURSE: 'nurse',
  MANAGER: 'manager',
  DEPUTY_MANAGER: 'deputyManager',
  ADMINISTRATOR: 'administrator',
  ACTIVITIES_COORDINATOR: 'activitiesCoordinator',
  MAINTENANCE: 'maintenance',
  KITCHEN_STAFF: 'kitchenStaff',
  HOUSEKEEPING: 'housekeeping',
}

/**
 * Required qualifications by regulatory body
 * Maps each regulatory body to their required qualifications
 */
export const regulatoryQualifications: Record<RegulatoryBody, string[]> = {
  CQC: [ // Care Quality Commission (England)
    'Level 2 Diploma in Care',
    'Level 3 Diploma in Adult Care',
    'Level 4 NVQ in Leadership and Management for Care Services',
    'Registered Manager Award',
  ],
  CIW: [ // Care Inspectorate Wales
    'Level 2 Diploma in Health and Social Care',
    'Level 3 Diploma in Health and Social Care',
    'Level 5 Diploma in Leadership for Health and Social Care Services',
  ],
  CI: [ // Care Inspectorate (Scotland)
    'SVQ 2 in Social Services and Healthcare',
    'SVQ 3 in Social Services and Healthcare',
    'SVQ 4 in Social Services and Healthcare',
  ],
  RQIA: [ // Regulation and Quality Improvement Authority (Northern Ireland)
    'Level 2 Diploma in Health and Social Care',
    'Level 3 Diploma in Health and Social Care',
    'Level 5 Diploma in Leadership for Health and Social Care Services',
  ],
  HIQA: [ // Health Information and Quality Authority (Ireland)
    'QQI Level 5 in Healthcare Support',
    'QQI Level 6 in Healthcare Support',
    'QQI Level 7 in Healthcare Management',
  ],
}

/**
 * Supported languages for the application
 * Includes all official languages for the supported regions
 */
export const SUPPORTED_LOCALES = {
  'en-GB': 'English',
  'cy': 'Cymraeg',
  'gd': 'Gàidhlig',
  'ga': 'Gaeilge',
  'sco': 'Ulster Scots'
} as const;

/**
 * Currency codes for different regions
 */
export const regionalCurrencies = {
  GB: 'GBP', // United Kingdom
  IE: 'EUR', // Ireland
}

/**
 * Minimum staffing ratios by care type
 * Based on regulatory requirements
 */
export const minimumStaffingRatios = {
  RESIDENTIAL: {
    day: 1/6, // 1 staff member per 6 residents
    night: 1/10, // 1 staff member per 10 residents
  },
  NURSING: {
    day: 1/4, // 1 staff member per 4 residents
    night: 1/8, // 1 staff member per 8 residents
  },
  DEMENTIA: {
    day: 1/4,
    night: 1/6,
  },
}

/**
 * Required training modules by role
 * Maps staff roles to required training modules
 */
export const requiredTraining: Record<StaffRole, string[]> = {
  CARE_WORKER: [
    'manual_handling',
    'fire_safety',
    'health_and_safety',
    'infection_control',
    'safeguarding',
    'food_hygiene',
    'first_aid',
    'medication_awareness',
  ],
  SENIOR_CARE_WORKER: [
    'all_care_worker_modules',
    'leadership_and_management',
    'mentoring',
    'medication_management',
  ],
  NURSE: [
    'all_care_worker_modules',
    'clinical_skills',
    'wound_care',
    'medication_management',
    'end_of_life_care',
  ],
  MANAGER: [
    'all_senior_modules',
    'regulatory_compliance',
    'business_management',
    'hr_management',
    'quality_assurance',
  ],
  DEPUTY_MANAGER: [
    'all_senior_modules',
    'regulatory_compliance',
    'staff_supervision',
    'quality_assurance',
  ],
  ADMINISTRATOR: [
    'data_protection',
    'health_and_safety',
    'fire_safety',
    'safeguarding_awareness',
  ],
  ACTIVITIES_COORDINATOR: [
    'health_and_safety',
    'safeguarding',
    'first_aid',
    'activity_planning',
    'dementia_awareness',
  ],
  MAINTENANCE: [
    'health_and_safety',
    'fire_safety',
    'manual_handling',
    'maintenance_safety',
  ],
  KITCHEN_STAFF: [
    'food_hygiene',
    'health_and_safety',
    'fire_safety',
    'allergen_awareness',
    'nutrition',
  ],
  HOUSEKEEPING: [
    'health_and_safety',
    'infection_control',
    'coshh',
    'fire_safety',
  ],
}
