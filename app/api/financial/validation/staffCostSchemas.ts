/**
 * @fileoverview Staff Cost Validation Schemas
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod';

export const staffCostBaseSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  department: z.string(),
  costCenter: z.string(),
});

export const agencyStaffCostsSchema = staffCostBaseSchema.extend({
  type: z.literal('agency-costs'),
  agencyName: z.string(),
  staffType: z.enum(['nurse', 'carer', 'specialist']),
  hourlyRate: z.number().positive(),
  hoursWorked: z.number().positive(),
  totalCost: z.number().positive(),
});

export const staffingRatiosSchema = staffCostBaseSchema.extend({
  type: z.literal('staffing-ratios'),
  shiftType: z.enum(['day', 'night', 'weekend']),
  staffType: z.enum(['nurse', 'carer', 'specialist']),
  residentsPerStaff: z.number().positive(),
  minimumStaffRequired: z.number().positive(),
});

export const qualificationPayRatesSchema = staffCostBaseSchema.extend({
  type: z.literal('qualification-pay'),
  qualification: z.string(),
  baseRate: z.number().positive(),
  experienceMultiplier: z.number().positive(),
  specialityBonus: z.number().positive().optional(),
});

export const staffCostRecordSchema = z.discriminatedUnion('type', [
  agencyStaffCostsSchema,
  staffingRatiosSchema,
  qualificationPayRatesSchema,
]); 
