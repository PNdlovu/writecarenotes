import { z } from 'zod';

export enum PayPeriod {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY'
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PROCESSED = 'PROCESSED',
  CANCELLED = 'CANCELLED'
}

export enum TaxRegion {
  UK = 'UK',
  SCOTLAND = 'SCOTLAND',
  WALES = 'WALES',
  NORTHERN_IRELAND = 'NORTHERN_IRELAND',
  IRELAND = 'IRELAND'
}

export const RegionalTaxConfigSchema = z.object({
  region: z.nativeEnum(TaxRegion),
  taxYear: z.string(), // Format: "2023-2024"
  brackets: z.array(z.object({
    threshold: z.number(),
    rate: z.number(),
    name: z.string()
  })),
  personalAllowance: z.object({
    base: z.number(),
    maxIncome: z.number(),
    taperRate: z.number()
  }),
  nationalInsurance: z.object({
    employeeThresholds: z.array(z.object({
      threshold: z.number(),
      rate: z.number(),
      name: z.string()
    })),
    employerThresholds: z.array(z.object({
      threshold: z.number(),
      rate: z.number(),
      name: z.string()
    }))
  }).optional()
});

export type RegionalTaxConfig = z.infer<typeof RegionalTaxConfigSchema>;

export const PayrollSchema = z.object({
  id: z.string().cuid(),
  organizationId: z.string().cuid(),
  employeeId: z.string().cuid(),
  period: z.nativeEnum(PayPeriod),
  startDate: z.date(),
  endDate: z.date(),
  basicPay: z.number().min(0),
  overtimePay: z.number().min(0),
  deductions: z.number().min(0),
  tax: z.number().min(0),
  nationalInsurance: z.number().min(0),
  netPay: z.number().min(0),
  status: z.nativeEnum(PayrollStatus),
  taxRegion: z.nativeEnum(TaxRegion),
  taxYear: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  processedAt: z.date().optional(),
  processedBy: z.string().cuid().optional()
});

export type Payroll = z.infer<typeof PayrollSchema>;

export const PayrollCalculationSchema = z.object({
  employeeId: z.string().cuid(),
  period: z.nativeEnum(PayPeriod),
  startDate: z.date(),
  endDate: z.date(),
  hoursWorked: z.number().min(0),
  overtimeHours: z.number().min(0),
  hourlyRate: z.number().min(0),
  overtimeRate: z.number().min(0),
  deductions: z.array(z.object({
    type: z.string(),
    amount: z.number().min(0),
    description: z.string().optional()
  }))
});

export type PayrollCalculation = z.infer<typeof PayrollCalculationSchema>;


