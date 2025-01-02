/**
 * @fileoverview RQIA (Regulation and Quality Improvement Authority) Validation Schemas
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod';

export const rqiaReportSchema = z.object({
    organizationId: z.string().uuid(),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format'),
    format: z.enum(['pdf', 'csv']),
    template: z.string().optional(),
    language: z.enum(['en', 'ga']).optional().default('en')  // English or Irish
});

export const rqiaComplianceSchema = z.object({
    organizationId: z.string().uuid(),
    checkType: z.enum([
        'financial_records',
        'audit_trail',
        'minimum_standards',
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
        'quality_assurance',
        'trust_area_reporting',
        'service_user_agreements',
        'staff_supervision',
        'training_records'
    ]),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format').optional()
});

export function validateRQIAReport(data: unknown) {
    const result = rqiaReportSchema.safeParse(data);
    return {
        success: result.success,
        error: result.success ? null : result.error.message
    };
}

export function validateRQIACompliance(data: unknown) {
    const result = rqiaComplianceSchema.safeParse(data);
    return {
        success: result.success,
        error: result.success ? null : result.error.message
    };
} 