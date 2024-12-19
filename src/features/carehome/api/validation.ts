import { z } from 'zod';
import { careHomeIdSchema, dateRangeSchema, updateCareHomeSchema } from './types';

export async function validateCareHomeId(careHomeId: string) {
  return careHomeIdSchema.parseAsync({ careHomeId });
}

export async function validateDateRange(startDate: string, endDate: string) {
  return dateRangeSchema.parseAsync({ startDate, endDate });
}

export async function validateUpdateCareHome(data: unknown) {
  return updateCareHomeSchema.parseAsync(data);
}

export function handleValidationError(error: z.ZodError) {
  return {
    status: 400,
    body: {
      error: 'Validation Error',
      details: error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message
      }))
    }
  };
}


