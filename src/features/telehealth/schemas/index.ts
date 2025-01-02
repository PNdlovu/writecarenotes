import { z } from 'zod';

export const ConsultationSchema = z.object({
  patientId: z.string().min(1),
  providerId: z.string().min(1),
  scheduledTime: z.string().datetime(),
  type: z.enum(['ROUTINE', 'EMERGENCY', 'FOLLOW_UP']),
  notes: z.string().optional()
});

export const VideoSessionSchema = z.object({
  consultationId: z.string().min(1),
  participants: z.array(z.string().min(1)).min(2)
});

export const MonitoringSchema = z.object({
  patientId: z.string().min(1),
  deviceId: z.string().min(1),
  metrics: z.array(z.enum(['HEART_RATE', 'BLOOD_PRESSURE', 'TEMPERATURE', 'OXYGEN_SATURATION']))
});

export const DocumentSchema = z.object({
  consultationId: z.string().min(1),
  type: z.enum(['PRESCRIPTION', 'REFERRAL', 'NOTES', 'TEST_RESULTS']),
  content: z.string().min(1)
});

export const ReportSchema = z.object({
  type: z.enum(['CONSULTATION_SUMMARY', 'MONITORING_SUMMARY', 'COMPLIANCE_REPORT']),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  filters: z.record(z.any()).optional()
}); 