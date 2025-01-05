/**
 * WriteCareNotes.com
 * @fileoverview Emergency API Validation Schemas
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import { z } from 'zod';
import { 
  EmergencyType, 
  EmergencyStatus, 
  EmergencySeverity 
} from '../types';

export const createIncidentSchema = z.object({
  body: z.object({
    type: z.enum([
      'MEDICAL',
      'MEDICATION',
      'FIRE',
      'SECURITY',
      'NATURAL_DISASTER',
      'INFRASTRUCTURE',
      'OTHER'
    ] as const),
    title: z.string().min(5).max(200),
    description: z.string().min(10).max(2000),
    location: z.string().min(2).max(200),
    careHomeId: z.string().uuid(),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const),
    affectedResidents: z.array(z.string().uuid()),
    responders: z.array(z.string().uuid()).min(1),
    protocolId: z.string().uuid().optional()
  })
});

export const updateIncidentSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum([
      'ACTIVE',
      'PENDING',
      'IN_PROGRESS',
      'RESOLVED',
      'ARCHIVED'
    ] as const).optional(),
    severity: z.enum([
      'CRITICAL',
      'HIGH',
      'MEDIUM',
      'LOW'
    ] as const).optional(),
    description: z.string().min(10).max(2000).optional(),
    affectedResidents: z.array(z.string().uuid()).optional(),
    responders: z.array(z.string().uuid()).min(1).optional(),
    resolvedAt: z.string().datetime().optional(),
    reviewedAt: z.string().datetime().optional(),
    reviewedBy: z.string().uuid().optional()
  })
});

export const recordActionSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    type: z.string().min(2).max(50),
    description: z.string().min(5).max(1000),
    performedBy: z.string().uuid(),
    status: z.enum(['COMPLETED', 'FAILED', 'SKIPPED'] as const),
    notes: z.string().max(1000).optional(),
    attachments: z.array(z.string().url()).optional(),
    metadata: z.record(z.string(), z.any()).optional()
  })
});

export const createProtocolSchema = z.object({
  body: z.object({
    type: z.enum([
      'MEDICAL',
      'MEDICATION',
      'FIRE',
      'SECURITY',
      'NATURAL_DISASTER',
      'INFRASTRUCTURE',
      'OTHER'
    ] as const),
    title: z.string().min(5).max(200),
    description: z.string().min(10).max(2000),
    steps: z.array(z.object({
      order: z.number().int().min(1),
      title: z.string().min(5).max(200),
      description: z.string().min(10).max(1000),
      isRequired: z.boolean(),
      timeLimit: z.number().int().min(1).optional(),
      assignedTo: z.array(z.string()).optional(),
      dependencies: z.array(z.string()).optional(),
      verificationRequired: z.boolean(),
      completionCriteria: z.array(z.string()).optional()
    })).min(1),
    requiredRoles: z.array(z.string()),
    autoNotify: z.array(z.string()),
    escalationPath: z.array(z.string()),
    reviewFrequency: z.number().int().min(1),
    attachments: z.array(z.string().url()).optional()
  })
});

export const createReportSchema = z.object({
  body: z.object({
    incidentId: z.string().uuid(),
    type: z.enum(['INITIAL', 'PROGRESS', 'FINAL', 'REVIEW'] as const),
    author: z.string().uuid(),
    content: z.string().min(10).max(5000),
    attachments: z.array(z.string().url()).optional(),
    status: z.enum(['DRAFT', 'SUBMITTED', 'REVIEWED', 'APPROVED'] as const),
    metadata: z.record(z.string(), z.any()).optional()
  })
});

export const updateReportStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum(['SUBMITTED', 'REVIEWED', 'APPROVED'] as const),
    reviewedBy: z.string().uuid().optional()
  })
}); 