import { z } from 'zod';

export enum QualityMetricType {
  RESIDENT_SATISFACTION = 'RESIDENT_SATISFACTION',
  STAFF_SATISFACTION = 'STAFF_SATISFACTION',
  INCIDENT_RATE = 'INCIDENT_RATE',
  MEDICATION_ERRORS = 'MEDICATION_ERRORS',
  CARE_PLAN_COMPLIANCE = 'CARE_PLAN_COMPLIANCE',
  STAFF_TURNOVER = 'STAFF_TURNOVER',
  TRAINING_COMPLETION = 'TRAINING_COMPLETION',
  INSPECTION_SCORE = 'INSPECTION_SCORE',
  COMPLAINT_RESOLUTION = 'COMPLAINT_RESOLUTION',
  HEALTH_OUTCOMES = 'HEALTH_OUTCOMES'
}

export enum InspectionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FOLLOW_UP_REQUIRED = 'FOLLOW_UP_REQUIRED'
}

export enum ComplianceLevel {
  COMPLIANT = 'COMPLIANT',
  PARTIALLY_COMPLIANT = 'PARTIALLY_COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  NOT_ASSESSED = 'NOT_ASSESSED'
}

export enum ImprovementPriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export const QualityMetricSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(QualityMetricType),
  careHomeId: z.string(),
  value: z.number(),
  target: z.number(),
  timestamp: z.date(),
  period: z.string(),
  notes: z.string().optional(),
  trend: z.number().optional(),
  actionRequired: z.boolean()
});

export const QualityInspectionSchema = z.object({
  id: z.string(),
  careHomeId: z.string(),
  inspectionType: z.string(),
  status: z.nativeEnum(InspectionStatus),
  scheduledDate: z.date(),
  completedDate: z.date().optional(),
  inspector: z.string(),
  findings: z.array(z.object({
    category: z.string(),
    compliance: z.nativeEnum(ComplianceLevel),
    observation: z.string(),
    recommendation: z.string().optional(),
    dueDate: z.date().optional()
  })),
  overallScore: z.number().optional(),
  attachments: z.array(z.string()).optional(),
  followUpActions: z.array(z.string()).optional()
});

export const ImprovementPlanSchema = z.object({
  id: z.string(),
  careHomeId: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.nativeEnum(ImprovementPriority),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']),
  startDate: z.date(),
  targetDate: z.date(),
  completedDate: z.date().optional(),
  responsiblePerson: z.string(),
  tasks: z.array(z.object({
    id: z.string(),
    description: z.string(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
    assignedTo: z.string(),
    dueDate: z.date(),
    completedDate: z.date().optional(),
    notes: z.string().optional()
  })),
  metrics: z.array(z.object({
    metricType: z.nativeEnum(QualityMetricType),
    baseline: z.number(),
    target: z.number(),
    current: z.number().optional()
  })),
  budget: z.number().optional(),
  risks: z.array(z.string()).optional(),
  outcomes: z.array(z.string()).optional()
});

export const QualityAuditSchema = z.object({
  id: z.string(),
  careHomeId: z.string(),
  auditType: z.string(),
  auditDate: z.date(),
  auditor: z.string(),
  scope: z.array(z.string()),
  findings: z.array(z.object({
    area: z.string(),
    observation: z.string(),
    compliance: z.nativeEnum(ComplianceLevel),
    risk: z.enum(['HIGH', 'MEDIUM', 'LOW']),
    recommendation: z.string(),
    actionRequired: z.boolean()
  })),
  recommendations: z.array(z.string()),
  followUpDate: z.date().optional(),
  attachments: z.array(z.string()).optional()
});

export type QualityMetric = z.infer<typeof QualityMetricSchema>;
export type QualityInspection = z.infer<typeof QualityInspectionSchema>;
export type ImprovementPlan = z.infer<typeof ImprovementPlanSchema>;
export type QualityAudit = z.infer<typeof QualityAuditSchema>;
