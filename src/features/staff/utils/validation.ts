import { z } from 'zod';
import { ShiftType, TrainingFormat, TrainingCategory } from '../types';

export const staffSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Role is required'),
  department: z.string().min(1, 'Department is required'),
});

export const trainingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  category: z.nativeEnum(TrainingCategory),
  format: z.nativeEnum(TrainingFormat),
  duration: z.number().min(1, 'Duration must be greater than 0'),
  required: z.boolean(),
});

export const scheduleSchema = z.object({
  staffId: z.string().min(1, 'Staff member is required'),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  shiftType: z.nativeEnum(ShiftType),
});

export function validateStaff(data: unknown) {
  return staffSchema.safeParse(data);
}

export function validateTraining(data: unknown) {
  return trainingSchema.safeParse(data);
}

export function validateSchedule(data: unknown) {
  return scheduleSchema.safeParse(data);
}


