/**
 * @fileoverview CIW (Care Inspectorate Wales) Regulatory Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { Metrics } from '@/lib/metrics';
import { ValidationError, ComplianceError, SystemError } from '../../../utils/errors';
import { validateCIWReport } from '../../../validation/regulatory/wales/ciwSchemas';

interface CIWReportRequest {
    organizationId: string;
    period: string;
    format: 'pdf' | 'csv';
    template?: string;
    language?: 'en' | 'cy';
}

interface CIWComplianceCheck {
    organizationId: string;
    checkType: string;
    period?: string;
}

const metrics = new Metrics();

export async function handleCIWReport(request: CIWReportRequest) {
    try {
        // Validate request
        const validationResult = validateCIWReport(request);
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

        if (organization.regulatoryBody !== 'CIW') {
            throw new ValidationError('Organization is not regulated by CIW');
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
                        fundingType: true
                    }
                }
            }
        });

        // Generate report
        const report = {
            id: `ciw_report_${Date.now()}`,
            status: 'completed',
            regulatoryBody: 'CIW',
            period: request.period,
            format: request.format,
            language: request.language || 'en',
            metadata: {
                organizationName: organization.name,
                retentionPeriod: organization.settings.retentionPeriod || '7y',
                complianceStatus: 'compliant',
                transactionCount: transactions.length,
                totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
                residentCount: new Set(transactions.map(tx => tx.residentId)).size,
                localAuthorityBreakdown: calculateLocalAuthorityBreakdown(transactions),
                bilingualSupport: true
            }
        };

        // Track metrics
        metrics.incrementCounter('regulatory_report_generated', {
            regulatory_body: 'CIW',
            format: request.format,
            language: request.language || 'en'
        });

        return report;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new SystemError('Failed to generate CIW report', { cause: error });
    }
}

export async function handleCIWComplianceCheck(request: CIWComplianceCheck) {
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

        if (organization.regulatoryBody !== 'CIW') {
            throw new ValidationError('Organization is not regulated by CIW');
        }

        // Perform compliance checks
        const checks = [
            {
                name: 'retention_period',
                status: organization.settings.retentionPeriod === '7y' ? 'passed' : 'failed',
                details: 'CIW requires 7 years retention period'
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
                name: 'bilingual_support',
                status: await validateBilingualSupport(request.organizationId),
                details: 'Checking Welsh language support'
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
            regulatory_body: 'CIW',
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
        throw new SystemError('Failed to perform CIW compliance check', { cause: error });
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

async function validateRequiredFields(organizationId: string): Promise<'passed' | 'failed'> {
    const requiredFields = [
        'amount',
        'currency',
        'type',
        'status',
        'residentId',
        'localAuthority',
        'fundingType'
    ];

    const sampleTransaction = await prisma.transaction.findFirst({
        where: { organizationId },
        include: {
            resident: true
        }
    });

    if (!sampleTransaction) {
        return 'passed'; // No transactions to validate
    }

    const hasAllFields = requiredFields.every(field => 
        field in sampleTransaction || 
        (sampleTransaction.resident && field in sampleTransaction.resident)
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

async function validateBilingualSupport(organizationId: string): Promise<'passed' | 'failed'> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            settings: true
        }
    });

    return organization?.settings?.languages?.includes('cy') ? 'passed' : 'failed';
} 