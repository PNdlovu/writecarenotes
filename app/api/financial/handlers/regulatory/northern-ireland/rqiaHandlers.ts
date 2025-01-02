/**
 * @fileoverview RQIA (Regulation and Quality Improvement Authority) Regulatory Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { Metrics } from '@/lib/metrics';
import { ValidationError, ComplianceError, SystemError } from '../../../utils/errors';
import { validateRQIAReport } from '../../../validation/regulatory/northern-ireland/rqiaSchemas';

interface RQIAReportRequest {
    organizationId: string;
    period: string;
    format: 'pdf' | 'csv';
    template?: string;
    language?: 'en' | 'ga';  // English or Irish
}

interface RQIAComplianceCheck {
    organizationId: string;
    checkType: string;
    period?: string;
}

const metrics = new Metrics();

export async function handleRQIAReport(request: RQIAReportRequest) {
    try {
        // Validate request
        const validationResult = validateRQIAReport(request);
        if (!validationResult.success) {
            throw new ValidationError(validationResult.error);
        }

        // Get organization settings
        const organization = await prisma.organization.findUnique({
            where: { id: request.organizationId },
            select: {
                name: true,
                regulatoryBody: true,
                settings: true,
                serviceType: true
            }
        });

        if (!organization) {
            throw new ValidationError('Organization not found');
        }

        if (organization.regulatoryBody !== 'RQIA') {
            throw new ValidationError('Organization is not regulated by RQIA');
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
                        carePackage: true,
                        trustArea: true
                    }
                }
            }
        });

        // Generate report
        const report = {
            id: `rqia_report_${Date.now()}`,
            status: 'completed',
            regulatoryBody: 'RQIA',
            period: request.period,
            format: request.format,
            language: request.language || 'en',
            metadata: {
                organizationName: organization.name,
                serviceType: organization.serviceType,
                retentionPeriod: organization.settings.retentionPeriod || '8y',
                complianceStatus: 'compliant',
                transactionCount: transactions.length,
                totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
                residentCount: new Set(transactions.map(tx => tx.residentId)).size,
                trustAreaBreakdown: calculateTrustAreaBreakdown(transactions),
                carePackageBreakdown: calculateCarePackageBreakdown(transactions),
                irishLanguageSupport: organization.settings.languages?.includes('ga') || false
            }
        };

        // Track metrics
        metrics.incrementCounter('regulatory_report_generated', {
            regulatory_body: 'RQIA',
            format: request.format,
            language: request.language || 'en'
        });

        return report;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new SystemError('Failed to generate RQIA report', { cause: error });
    }
}

export async function handleRQIAComplianceCheck(request: RQIAComplianceCheck) {
    try {
        // Get organization settings
        const organization = await prisma.organization.findUnique({
            where: { id: request.organizationId },
            select: {
                settings: true,
                regulatoryBody: true,
                serviceType: true,
                minimumStandards: true
            }
        });

        if (!organization) {
            throw new ValidationError('Organization not found');
        }

        if (organization.regulatoryBody !== 'RQIA') {
            throw new ValidationError('Organization is not regulated by RQIA');
        }

        // Perform compliance checks
        const checks = [
            {
                name: 'retention_period',
                status: organization.settings.retentionPeriod === '8y' ? 'passed' : 'failed',
                details: 'RQIA requires 8 years retention period'
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
                name: 'minimum_standards',
                status: await validateMinimumStandards(request.organizationId),
                details: 'Checking compliance with RQIA Minimum Standards'
            },
            {
                name: 'trust_area_reporting',
                status: await validateTrustAreaReporting(request.organizationId),
                details: 'Verifying Trust Area reporting compliance'
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
            regulatory_body: 'RQIA',
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
        throw new SystemError('Failed to perform RQIA compliance check', { cause: error });
    }
}

// Helper functions
function calculateTrustAreaBreakdown(transactions: any[]): Record<string, number> {
    return transactions.reduce((acc, tx) => {
        const trustArea = tx.resident?.trustArea || 'Unknown';
        acc[trustArea] = (acc[trustArea] || 0) + tx.amount;
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
        'trustArea',
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

async function validateMinimumStandards(organizationId: string): Promise<'passed' | 'failed'> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            minimumStandards: true,
            serviceType: true
        }
    });

    if (!organization?.minimumStandards) {
        return 'failed';
    }

    const requiredStandards = [
        'FINANCIAL_MANAGEMENT',
        'RECORD_KEEPING',
        'STAFF_TRAINING',
        'CARE_DELIVERY',
        'QUALITY_IMPROVEMENT',
        'SAFEGUARDING'
    ];

    const hasAllStandards = requiredStandards.every(standard => 
        organization.minimumStandards.includes(standard)
    );

    return hasAllStandards ? 'passed' : 'failed';
}

async function validateTrustAreaReporting(organizationId: string): Promise<'passed' | 'failed'> {
    const residents = await prisma.resident.findMany({
        where: { organizationId },
        select: { trustArea: true }
    });

    const hasTrustArea = residents.every(resident => resident.trustArea);
    return hasTrustArea ? 'passed' : 'failed';
} 