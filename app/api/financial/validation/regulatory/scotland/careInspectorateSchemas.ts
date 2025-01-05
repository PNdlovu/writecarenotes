/**
 * @fileoverview Care Inspectorate (Scotland) Validation Schemas
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod';

export const careInspectorateReportSchema = z.object({
    organizationId: z.string().uuid(),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format'),
    format: z.enum(['pdf', 'csv']),
    template: z.string().optional(),
    language: z.enum(['en', 'gd']).optional().default('en')  // English or Scottish Gaelic
});

export const careInspectorateComplianceSchema = z.object({
    organizationId: z.string().uuid(),
    checkType: z.enum([
        'financial_records',
        'audit_trail',
        'care_standards',
        'staff_qualifications',
        'resident_records',
        'medication_records',
        'incident_reports',
        'care_plans',
        'risk_assessments',
        'safeguarding',
        'health_safety',
        'infection_control',
        'nutrition_hydration',
        'activities',
        'complaints',
        'quality_assurance'
    ]),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format').optional()
});

export function validateCareInspectorateReport(data: unknown) {
    const result = careInspectorateReportSchema.safeParse(data);
    return {
        success: result.success,
        error: result.success ? null : result.error.message
    };
}

export function validateCareInspectorateCompliance(data: unknown) {
    const result = careInspectorateComplianceSchema.safeParse(data);
    return {
        success: result.success,
        error: result.success ? null : result.error.message
    };
} 
