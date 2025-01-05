import { z } from 'zod';
import { NICategory, PayrollChangeType, Region, TaxYear } from './types';
import { ValidationError } from './errors';

const taxCodeRegex = /^(\d{1,4}[A-Z]|K\d{1,4}|BR|D0|D1|NT)(\s?X)?$/i;

export const employeeRatesSchema = z.object({
  taxCode: z.string().regex(taxCodeRegex, 'Invalid tax code format'),
  niCategory: z.nativeEnum(NICategory),
  pensionContribution: z.number().min(0).max(1).optional(),
  studentLoanPlan: z.enum(['1', '2', '4']).optional(),
  postgraduateLoan: z.boolean().optional()
});

export const payrollChangeSchema = z.object({
  entityId: z.string().min(1),
  type: z.nativeEnum(PayrollChangeType),
  method: z.enum(['POST', 'PUT', 'DELETE']),
  data: z.record(z.unknown())
});

export const payrollCalculationSchema = z.object({
  employeeId: z.string().min(1),
  grossPay: z.number().positive(),
  region: z.nativeEnum(Region),
  taxYear: z.nativeEnum(TaxYear),
  rates: employeeRatesSchema.optional()
});

export function validatePayrollCalculation(data: unknown) {
  try {
    return payrollCalculationSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!validationErrors[path]) {
          validationErrors[path] = [];
        }
        validationErrors[path].push(err.message);
      });
      throw new ValidationError('Invalid payroll calculation input', validationErrors);
    }
    throw error;
  }
}

export function validateEmployeeRates(data: unknown) {
  try {
    return employeeRatesSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!validationErrors[path]) {
          validationErrors[path] = [];
        }
        validationErrors[path].push(err.message);
      });
      throw new ValidationError('Invalid employee rates', validationErrors);
    }
    throw error;
  }
}

export function validatePayrollChange(data: unknown) {
  try {
    return payrollChangeSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!validationErrors[path]) {
          validationErrors[path] = [];
        }
        validationErrors[path].push(err.message);
      });
      throw new ValidationError('Invalid payroll change', validationErrors);
    }
    throw error;
  }
}
