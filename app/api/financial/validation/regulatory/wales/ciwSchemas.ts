/**
 * @fileoverview CIW (Care Inspectorate Wales) Validation Schemas
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod';

export const ciwReportSchema = z.object({
    organizationId: z.string().uuid(),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format'),
    format: z.enum(['pdf', 'csv']),
    template: z.string().optional(),
    language: z.enum(['en', 'cy']).optional().default('en')
});

export const ciwComplianceSchema = z.object({
    organizationId: z.string().uuid(),
    checkType: z.enum([
        'financial_records',
        'audit_trail',
        'welsh_language',
        'staff_qualifications',
        'resident_records',
        'medication_records',
        'incident_reports',
        'care_plans',
        'risk_assessments',
        'safeguarding'
    ]),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format').optional()
});

export function validateCIWReport(data: unknown) {
    const result = ciwReportSchema.safeParse(data);
    return {
        success: result.success,
        error: result.success ? null : result.error.message
    };
}

export function validateCIWCompliance(data: unknown) {
    const result = ciwComplianceSchema.safeParse(data);
    return {
        success: result.success,
        error: result.success ? null : result.error.message
    };
} 