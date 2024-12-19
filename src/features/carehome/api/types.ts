import { z } from 'zod';
import { Region, ComplianceStatus } from '../types/compliance';
import type { CareHomeWithRelations, CreateCareHomeDTO } from '../types/carehome.types';

// Request Schemas
export const careHomeIdSchema = z.object({
  careHomeId: z.string().uuid()
});

export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime()
});

export const updateCareHomeSchema = z.object({
  name: z.string().min(1),
  address: z.string(),
  region: z.nativeEnum(Region),
  capacity: z.number().positive(),
  contactDetails: z.object({
    phone: z.string(),
    email: z.string().email(),
    website: z.string().url().optional()
  }),
  services: z.array(z.string()),
  facilities: z.array(z.string())
});

// Response Types
export type CareHomeResponse = CareHomeWithRelations & {
  complianceStatus: ComplianceStatus;
  lastUpdated: string;
};

export interface MetricsResponse {
  id: string;
  timestamp: string;
  metrics: {
    occupancy: number;
    staffingLevels: number;
    incidentRate: number;
    complianceScore: number;
    satisfactionScore: number;
  };
  trends: {
    weekly: MetricTrend;
    monthly: MetricTrend;
    quarterly: MetricTrend;
  };
}

interface MetricTrend {
  occupancy: number[];
  staffingLevels: number[];
  incidentRate: number[];
  complianceScore: number[];
  satisfactionScore: number[];
}

export interface ComplianceResponse {
  id: string;
  timestamp: string;
  status: ComplianceStatus;
  report: {
    overallScore: number;
    categories: {
      safety: number;
      care: number;
      staffing: number;
      management: number;
      environment: number;
    };
    findings: Array<{
      category: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      action: string;
      dueDate: string;
    }>;
  };
  nextReviewDate: string;
}


