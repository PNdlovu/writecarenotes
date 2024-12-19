import { z } from 'zod';

export const conditionSchema = z.object({
  type: z.enum(['VITAL_SIGN', 'LAB_VALUE', 'SYMPTOM_SCORE']),
  parameter: z.string().min(1),
  operator: z.enum(['<', '>', '=', '>=', '<=']),
  value: z.number(),
  met: z.boolean().optional(),
});

export const titrationStepSchema = z.object({
  id: z.string(),
  dose: z.number().positive(),
  unit: z.string(),
  duration: z.number().positive(),
  conditions: z.array(conditionSchema),
  completed: z.boolean().optional(),
});

export const taperingStepSchema = z.object({
  id: z.string(),
  dose: z.number().positive(),
  unit: z.string(),
  duration: z.number().positive(),
  frequency: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  completed: z.boolean(),
  notes: z.string().optional(),
});

export const ivMedicationSchema = z.object({
  id: z.string(),
  name: z.string(),
  concentration: z.string(),
  diluent: z.string(),
  pH: z.number(),
  osmolarity: z.number(),
  storageRequirements: z.string(),
  stabilityHours: z.number().positive(),
  lightSensitive: z.boolean(),
  refrigerationRequired: z.boolean(),
});

export const compatibilityResultSchema = z.object({
  compatible: z.boolean(),
  reason: z.string().optional(),
  recommendations: z.array(z.string()).optional(),
  physicalCompatibility: z.object({
    precipitation: z.boolean(),
    colorChange: z.boolean(),
    gasFormation: z.boolean(),
  }).optional(),
  chemicalCompatibility: z.object({
    pHCompatible: z.boolean(),
    degradationRisk: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  }).optional(),
  stabilityHours: z.number().optional(),
  specialHandling: z.array(z.string()).optional(),
});

export function validateMedicationData<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

export function sanitizeMedicationInput(input: string): string {
  // Remove any potentially dangerous characters or HTML
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[^\w\s-.,()]/g, '') // Only allow alphanumeric, spaces, and basic punctuation
    .trim();
}

export function validateDosage(dose: number, min: number, max: number): boolean {
  return dose >= min && dose <= max;
}

export function validateDateRange(startDate: string, endDate: string): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end && !isNaN(start.getTime()) && !isNaN(end.getTime());
}


