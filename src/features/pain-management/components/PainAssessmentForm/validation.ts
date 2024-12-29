/**
 * @fileoverview Pain Assessment Form Validation
 * @version 1.0.0
 * @created 2024-03-21
 * @author [Your Name]
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod';
import { PainScale, PainType } from '../../types';

export const painAssessmentSchema = z.object({
  painScale: z.nativeEnum(PainScale),
  painScore: z.number()
    .min(0, 'Pain score must be between 0 and 10')
    .max(10, 'Pain score must be between 0 and 10'),
  painType: z.nativeEnum(PainType),
  location: z.array(z.string())
    .min(1, 'At least one pain location must be specified'),
  characteristics: z.array(z.string())
    .optional(),
  triggers: z.array(z.string())
    .optional(),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
}); 