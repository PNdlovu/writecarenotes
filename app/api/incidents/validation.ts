/**
 * @writecarenotes.com
 * @fileoverview Incident API request validation
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Validation functions for incident API requests. Implements Zod
 * schemas for validating incident and investigation data. Ensures
 * data integrity and type safety for all API operations in the
 * incident management system.
 */

import { z } from 'zod';
import { IncidentType, IncidentStatus, IncidentSeverity } from './types';

/**
 * Base incident schema
 */
export const incidentSchema = z.object({
  organizationId: z.string().uuid(),
  type: z.nativeEnum(IncidentType),
  severity: z.nativeEnum(IncidentSeverity),
  description: z.string().min(10).max(2000),
  location: z.string().min(1).max(200),
  dateTime: z.coerce.date(),
  reportedBy: z.object({
    id: z.string().uuid(),
    name: z.string(),
    role: z.string(),
  }),
  involvedResidents: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
    })
  ),
  involvedStaff: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      role: z.string(),
    })
  ),
  witnesses: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      role: z.string(),
    })
  ),
  immediateActions: z.array(z.string()),
  status: z.nativeEnum(IncidentStatus),
  notificationsSent: z.boolean(),
  safeguardingReferral: z.boolean(),
  cqcReportable: z.boolean(),
});

/**
 * Investigation schema
 */
export const investigationSchema = z.object({
  investigator: z.object({
    id: z.string().uuid(),
    name: z.string(),
    role: z.string(),
  }),
  findings: z.array(z.string()),
  rootCauses: z.array(z.string()),
  recommendations: z.array(z.string()),
  preventiveMeasures: z.array(z.string()),
  startDate: z.coerce.date(),
  completedDate: z.coerce.date().optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED']),
  witnesses: z
    .array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
        role: z.string(),
        statement: z.string(),
        dateInterviewed: z.coerce.date(),
      })
    )
    .optional(),
});

/**
 * Report generation schema
 */
export const reportSchema = z.object({
  type: z.enum(['STANDARD', 'CQC', 'DETAILED']),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  format: z.enum(['PDF', 'EXCEL', 'CSV']).optional(),
});

/**
 * Validate incident data
 */
export async function validateIncident(data: unknown) {
  return incidentSchema.parseAsync(data);
}

/**
 * Validate investigation data
 */
export async function validateInvestigation(data: unknown) {
  return investigationSchema.parseAsync(data);
}

/**
 * Validate report generation parameters
 */
export async function validateReportParams(data: unknown) {
  return reportSchema.parseAsync(data);
} 
