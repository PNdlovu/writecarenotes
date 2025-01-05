/**
 * @fileoverview Care Inspectorate (Scotland) Regulatory Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { Metrics } from '@/lib/metrics';
import { ValidationError, ComplianceError, SystemError } from '../../../utils/errors';
import { validateCareInspectorateReport } from '../../../validation/regulatory/scotland/careInspectorateSchemas';

interface CareInspectorateReportRequest {
    organizationId: string;
    period: string;
    format: 'pdf' | 'csv';
    template?: string;
    language?: 'en' | 'gd';  // English or Scottish Gaelic
}

interface CareInspectorateComplianceCheck {
    organizationId: string;
    checkType: string;
    period?: string;
}

const metrics = new Metrics();

export async function handleCareInspectorateReport(request: CareInspectorateReportRequest) {
    try {
        // Validate request
        const validationResult = validateCareInspectorateReport(request);
        if (!validationResult.success) {
            throw new ValidationError(validationResult.error);
        }

        // Get organization settings
        const organization = await prisma.organization.findUnique({
            where: { id: request.organizationId },
            select: {
                name: true,
                regulatoryBody: true,
                settings: true
            }
        });

        if (!organization) {
            throw new ValidationError('Organization not found');
        }

        if (organization.regulatoryBody !== 'CARE_INSPECTORATE') {
            throw new ValidationError('Organization is not regulated by Care Inspectorate');
        }

        // Get financial data for the period
        const transactions = await prisma.transaction.findMany({
            where: {
                organizationId: request.organizationId,
                createdAt: {
                    gte: new Date(request.period),
                    lt: new Date(new Date(request.period).getFullYear(), new Date(request.period).getMonth() + 1, 1)
                }
            },
            include: {
                resident: {
                    select: {
                        id: true,
                        name: true,
                        localAuthority: true,
                        fundingType: true,
                        carePackage: true
                    }
                }
            }
        });

        // Generate report
        const report = {
            id: `care_inspectorate_report_${Date.now()}`,
            status: 'completed',
            regulatoryBody: 'CARE_INSPECTORATE',
            period: request.period,
            format: request.format,
            language: request.language || 'en',
            metadata: {
                organizationName: organization.name,
                retentionPeriod: organization.settings.retentionPeriod || '5y',
                complianceStatus: 'compliant',
                transactionCount: transactions.length,
                totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
                residentCount: new Set(transactions.map(tx => tx.residentId)).size,
                localAuthorityBreakdown: calculateLocalAuthorityBreakdown(transactions),
                carePackageBreakdown: calculateCarePackageBreakdown(transactions),
                gaelicSupport: organization.settings.languages?.includes('gd') || false
            }
        };

        // Track metrics
        metrics.incrementCounter('regulatory_report_generated', {
            regulatory_body: 'CARE_INSPECTORATE',
            format: request.format,
            language: request.language || 'en'
        });

        return report;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new SystemError('Failed to generate Care Inspectorate report', { cause: error });
    }
}

export async function handleCareInspectorateComplianceCheck(request: CareInspectorateComplianceCheck) {
    try {
        // Get organization settings
        const organization = await prisma.organization.findUnique({
            where: { id: request.organizationId },
            select: {
                settings: true,
                regulatoryBody: true
            }
        });

        if (!organization) {
            throw new ValidationError('Organization not found');
        }

        if (organization.regulatoryBody !== 'CARE_INSPECTORATE') {
            throw new ValidationError('Organization is not regulated by Care Inspectorate');
        }

        // Perform compliance checks
        const checks = [
            {
                name: 'retention_period',
                status: organization.settings.retentionPeriod === '5y' ? 'passed' : 'failed',
                details: 'Care Inspectorate requires 5 years retention period'
            },
            {
                name: 'required_fields',
                status: await validateRequiredFields(request.organizationId),
                details: 'Checking required fields in financial records'
            },
            {
                name: 'audit_trail',
                status: await validateAuditTrail(request.organizationId),
                details: 'Verifying audit trail completeness'
            },
            {
                name: 'care_standards',
                status: await validateCareStandards(request.organizationId),
                details: 'Checking compliance with National Care Standards'
            }
        ];

        const failedChecks = checks.filter(check => check.status === 'failed');

        if (failedChecks.length > 0) {
            throw new ComplianceError('Compliance checks failed', {
                checks: failedChecks
            });
        }

        // Track metrics
        metrics.incrementCounter('compliance_check_completed', {
            regulatory_body: 'CARE_INSPECTORATE',
            status: 'compliant'
        });

        return {
            status: 'compliant',
            checks,
            timestamp: new Date()
        };
    } catch (error) {
        if (error instanceof ValidationError || error instanceof ComplianceError) {
            throw error;
        }
        throw new SystemError('Failed to perform Care Inspectorate compliance check', { cause: error });
    }
}

// Helper functions
function calculateLocalAuthorityBreakdown(transactions: any[]): Record<string, number> {
    return transactions.reduce((acc, tx) => {
        const authority = tx.resident?.localAuthority || 'Unknown';
        acc[authority] = (acc[authority] || 0) + tx.amount;
        return acc;
    }, {});
}

function calculateCarePackageBreakdown(transactions: any[]): Record<string, number> {
    return transactions.reduce((acc, tx) => {
        const packageType = tx.resident?.carePackage?.type || 'Unknown';
        acc[packageType] = (acc[packageType] || 0) + tx.amount;
        return acc;
    }, {});
}

async function validateRequiredFields(organizationId: string): Promise<'passed' | 'failed'> {
    const requiredFields = [
        'amount',
        'currency',
        'type',
        'status',
        'residentId',
        'localAuthority',
        'fundingType',
        'carePackage'
    ];

    const sampleTransaction = await prisma.transaction.findFirst({
        where: { organizationId },
        include: {
            resident: {
                include: {
                    carePackage: true
                }
            }
        }
    });

    if (!sampleTransaction) {
        return 'passed'; // No transactions to validate
    }

    const hasAllFields = requiredFields.every(field => 
        field in sampleTransaction || 
        (sampleTransaction.resident && field in sampleTransaction.resident) ||
        (sampleTransaction.resident?.carePackage && field in sampleTransaction.resident.carePackage)
    );

    return hasAllFields ? 'passed' : 'failed';
}

async function validateAuditTrail(organizationId: string): Promise<'passed' | 'failed'> {
    const auditLogs = await prisma.auditLog.findMany({
        where: {
            organizationId,
            createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
        }
    });

    // Check if there are audit logs for all transactions
    const transactions = await prisma.transaction.findMany({
        where: {
            organizationId,
            createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
        }
    });

    const transactionIds = new Set(transactions.map(tx => tx.id));
    const auditedTransactionIds = new Set(
        auditLogs
            .filter(log => log.entityType === 'TRANSACTION')
            .map(log => log.entityId)
    );

    return transactionIds.size === auditedTransactionIds.size ? 'passed' : 'failed';
}

async function validateCareStandards(organizationId: string): Promise<'passed' | 'failed'> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            settings: true,
            careStandards: true
        }
    });

    if (!organization?.careStandards) {
        return 'failed';
    }

    const requiredStandards = [
        'PERSONAL_CARE',
        'HEALTHCARE',
        'MEDICATION',
        'WELLBEING',
        'STAFFING',
        'MANAGEMENT'
    ];

    const hasAllStandards = requiredStandards.every(standard => 
        organization.careStandards.includes(standard)
    );

    return hasAllStandards ? 'passed' : 'failed';
} 
