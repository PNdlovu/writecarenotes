/**
 * @fileoverview Monitoring System Types
 * @version 1.0.0
 * @created 2024-03-21
 */

export const METRIC_TYPES = {
  CARE_HOME: {
    // Resident Metrics
    RESIDENTS_OCCUPANCY: 'residents.occupancy',
    RESIDENTS_INCIDENTS: 'residents.incidents',
    RESIDENTS_SATISFACTION: 'residents.satisfaction',
    RESIDENTS_WELLBEING: 'residents.wellbeing',
    RESIDENTS_ACTIVITIES: 'residents.activities',
    RESIDENTS_NUTRITION: 'residents.nutrition',
    RESIDENTS_HYDRATION: 'residents.hydration',
    RESIDENTS_MOBILITY: 'residents.mobility',
    RESIDENTS_SOCIAL: 'residents.social',
    RESIDENTS_MENTAL_HEALTH: 'residents.mental_health',

    // Staff Metrics
    STAFF_TO_RESIDENT_RATIO: 'staff.ratio',
    STAFF_TRAINING_COMPLIANCE: 'staff.training',
    STAFF_TURNOVER: 'staff.turnover',
    STAFF_SATISFACTION: 'staff.satisfaction',
    STAFF_ATTENDANCE: 'staff.attendance',
    STAFF_PERFORMANCE: 'staff.performance',
    STAFF_QUALIFICATIONS: 'staff.qualifications',
    STAFF_DEVELOPMENT: 'staff.development',
    STAFF_SUPERVISION: 'staff.supervision',
    STAFF_WORKLOAD: 'staff.workload',

    // Medication Metrics
    MEDICATION_ERRORS: 'medication.errors',
    MEDICATION_STOCK_LEVELS: 'medication.stock',
    MEDICATION_COMPLIANCE: 'medication.compliance',
    MEDICATION_REVIEWS: 'medication.reviews',
    MEDICATION_STORAGE: 'medication.storage',
    MEDICATION_DISPOSAL: 'medication.disposal',
    MEDICATION_ADMINISTRATION: 'medication.administration',
    MEDICATION_DOCUMENTATION: 'medication.documentation',
    MEDICATION_TRAINING: 'medication.training',
    MEDICATION_AUDITS: 'medication.audits',

    // Clinical Metrics
    FALLS_INCIDENTS: 'clinical.falls',
    PRESSURE_ULCERS: 'clinical.pressure_ulcers',
    INFECTIONS: 'clinical.infections',
    HOSPITAL_ADMISSIONS: 'clinical.hospital_admissions',
    CLINICAL_ASSESSMENTS: 'clinical.assessments',
    CLINICAL_INTERVENTIONS: 'clinical.interventions',
    CLINICAL_OUTCOMES: 'clinical.outcomes',
    CLINICAL_DOCUMENTATION: 'clinical.documentation',
    CLINICAL_REVIEWS: 'clinical.reviews',
    CLINICAL_INCIDENTS: 'clinical.incidents',

    // Compliance Metrics
    CQC_COMPLIANCE: 'compliance.cqc',
    DOCUMENTATION_COMPLIANCE: 'compliance.documentation',
    INCIDENT_REPORTING_COMPLIANCE: 'compliance.incident_reporting',
    TRAINING_COMPLIANCE: 'compliance.training',
    POLICY_COMPLIANCE: 'compliance.policy',
    AUDIT_COMPLIANCE: 'compliance.audit',
    REGULATORY_COMPLIANCE: 'compliance.regulatory',
    SAFETY_COMPLIANCE: 'compliance.safety',
    INFECTION_CONTROL_COMPLIANCE: 'compliance.infection_control',
    DATA_PROTECTION_COMPLIANCE: 'compliance.data_protection',

    // Financial Metrics
    OCCUPANCY_REVENUE: 'financial.occupancy_revenue',
    STAFF_COSTS: 'financial.staff_costs',
    OPERATIONAL_COSTS: 'financial.operational_costs',
    MEDICATION_COSTS: 'financial.medication_costs',
    MAINTENANCE_COSTS: 'financial.maintenance_costs',
    TRAINING_COSTS: 'financial.training_costs',
    PROFIT_MARGIN: 'financial.profit_margin',
    CASH_FLOW: 'financial.cash_flow',
    BUDGET_VARIANCE: 'financial.budget_variance',
    COST_PER_RESIDENT: 'financial.cost_per_resident',

    // Environmental Metrics
    BUILDING_MAINTENANCE: 'environment.maintenance',
    CLEANLINESS: 'environment.cleanliness',
    SAFETY_CHECKS: 'environment.safety_checks',
    EQUIPMENT_MAINTENANCE: 'environment.equipment',
    TEMPERATURE_CONTROL: 'environment.temperature',
    LIGHTING: 'environment.lighting',
    ACCESSIBILITY: 'environment.accessibility',
    SECURITY: 'environment.security',
    WASTE_MANAGEMENT: 'environment.waste',
    INFECTION_CONTROL: 'environment.infection_control',

    // Quality of Life Metrics
    RESIDENT_DIGNITY: 'quality.dignity',
    RESIDENT_CHOICE: 'quality.choice',
    RESIDENT_PRIVACY: 'quality.privacy',
    RESIDENT_INDEPENDENCE: 'quality.independence',
    RESIDENT_RELATIONSHIPS: 'quality.relationships',
    RESIDENT_ACTIVITIES_ENGAGEMENT: 'quality.activities_engagement',
    RESIDENT_FEEDBACK: 'quality.feedback',
    RESIDENT_COMPLAINTS: 'quality.complaints',
    RESIDENT_SATISFACTION_SURVEYS: 'quality.satisfaction_surveys',
    RESIDENT_FAMILY_ENGAGEMENT: 'quality.family_engagement',

    // Service Delivery Metrics
    CARE_PLAN_COMPLIANCE: 'service.care_plan_compliance',
    ASSESSMENT_TIMELINESS: 'service.assessment_timeliness',
    HANDOVER_QUALITY: 'service.handover_quality',
    RESPONSE_TIMES: 'service.response_times',
    SERVICE_IMPROVEMENTS: 'service.improvements',
    INCIDENT_RESOLUTION: 'service.incident_resolution',
    COMPLAINT_RESOLUTION: 'service.complaint_resolution',
    SERVICE_CONTINUITY: 'service.continuity',
    SERVICE_COORDINATION: 'service.coordination',
    SERVICE_INNOVATION: 'service.innovation'
  }
} as const;

export type MetricType = typeof METRIC_TYPES.CARE_HOME[keyof typeof METRIC_TYPES.CARE_HOME];

export interface MetricValue {
  timestamp: number;
  value: number;
  threshold: number;
}

export interface Anomaly {
  metric: MetricType;
  timestamp: number;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high';
}

export interface Incident {
  id: string;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved';
  timestamp: number;
  resolution?: {
    description: string;
    timestamp: number;
    by: string;
  };
}

export interface Alert {
  id: string;
  metric: MetricType;
  threshold: number;
  condition: 'above' | 'below' | 'equals';
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'acknowledged' | 'resolved';
  timestamp: number;
  value: number;
  message: string;
  acknowledgement?: {
    by: string;
    timestamp: number;
    comment: string;
  };
} 