/**
 * @fileoverview Pain Management Schemas
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 *
 * Description:
 * Zod schemas for pain management validation
 */

import { z } from 'zod';

export const PainInterventionSchema = z.object({
  type: z.enum([
    'MEDICATION',
    'POSITIONING',
    'HEAT',
    'COLD',
    'MASSAGE',
    'DISTRACTION',
    'REST',
    'OTHER'
  ]),
  description: z.string(),
  administeredBy: z.string(),
  startTime: z.string().datetime(),
  effectiveness: z.number().min(0).max(10),
  notes: z.string().optional()
});

export const PainAssessmentSchema = z.object({
  residentId: z.string(),
  assessedBy: z.string(),
  painScore: z.number().min(0).max(10),
  painLocation: z.string(),
  assessmentDate: z.string().datetime(),
  triggers: z.array(z.string()).optional(),
  interventions: z.array(PainInterventionSchema).optional(),
  notes: z.string().optional()
}); 