import { z } from 'zod';

export enum VitalType {
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  HEART_RATE = 'HEART_RATE',
  TEMPERATURE = 'TEMPERATURE',
  RESPIRATORY_RATE = 'RESPIRATORY_RATE',
  OXYGEN_SATURATION = 'OXYGEN_SATURATION',
  BLOOD_GLUCOSE = 'BLOOD_GLUCOSE',
  WEIGHT = 'WEIGHT',
  HEIGHT = 'HEIGHT'
}

export enum ReferralStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ReferralPriority {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  EMERGENCY = 'EMERGENCY'
}

export const VitalRecordSchema = z.object({
  id: z.string(),
  residentId: z.string(),
  type: z.nativeEnum(VitalType),
  value: z.number(),
  unit: z.string(),
  timestamp: z.date(),
  recordedBy: z.string(),
  notes: z.string().optional(),
  abnormal: z.boolean(),
  followUpRequired: z.boolean()
});

export const MedicalHistorySchema = z.object({
  id: z.string(),
  residentId: z.string(),
  condition: z.string(),
  diagnosisDate: z.date(),
  status: z.enum(['ACTIVE', 'RESOLVED', 'CHRONIC']),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
  notes: z.string(),
  lastUpdated: z.date(),
  updatedBy: z.string()
});

export const SpecialistReferralSchema = z.object({
  id: z.string(),
  residentId: z.string(),
  specialistType: z.string(),
  reason: z.string(),
  priority: z.nativeEnum(ReferralPriority),
  status: z.nativeEnum(ReferralStatus),
  referredBy: z.string(),
  referralDate: z.date(),
  appointmentDate: z.date().optional(),
  notes: z.string().optional(),
  followUpRequired: z.boolean(),
  followUpNotes: z.string().optional()
});

export const ClinicalAssessmentSchema = z.object({
  id: z.string(),
  residentId: z.string(),
  assessmentType: z.string(),
  assessmentDate: z.date(),
  completedBy: z.string(),
  score: z.number().optional(),
  findings: z.string(),
  recommendations: z.array(z.string()),
  nextAssessmentDate: z.date(),
  attachments: z.array(z.string()).optional()
});

export type VitalRecord = z.infer<typeof VitalRecordSchema>;
export type MedicalHistory = z.infer<typeof MedicalHistorySchema>;
export type SpecialistReferral = z.infer<typeof SpecialistReferralSchema>;
export type ClinicalAssessment = z.infer<typeof ClinicalAssessmentSchema>;
