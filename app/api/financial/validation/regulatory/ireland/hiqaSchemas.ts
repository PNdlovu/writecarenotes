/**
 * @fileoverview HIQA (Health Information and Quality Authority) Validation Schemas
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { z } from 'zod';

export const hiqaReportSchema = z.object({
    organizationId: z.string().uuid(),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format'),
    format: z.enum(['pdf', 'csv']),
    template: z.string().optional(),
    language: z.enum(['en', 'ga']).optional().default('en')  // English or Irish
});

export const hiqaComplianceSchema = z.object({
    organizationId: z.string().uuid(),
    checkType: z.enum([
        'financial_records',
        'audit_trail',
        'national_standards',
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
        'hse_area_reporting',
        'nursing_home_support',
        'staff_supervision',
        'training_records',
        'governance_management',
        'healthcare_needs',
        'safe_services',
        'health_wellbeing',
        'workforce',
        'use_resources',
        'use_information',
        'responsive_workforce'
    ]),
    period: z.string().regex(/^\d{4}-\d{2}$/, 'Period must be in YYYY-MM format').optional()
});

export function validateHIQAReport(data: unknown) {
    const result = hiqaReportSchema.safeParse(data);
    return {
        success: result.success,
        error: result.success ? null : result.error.message
    };
}

export function validateHIQACompliance(data: unknown) {
    const result = hiqaComplianceSchema.safeParse(data);
    return {
        success: result.success,
        error: result.success ? null : result.error.message
    };
} 