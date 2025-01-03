/**
 * @fileoverview CQC (Care Quality Commission) Regulatory Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { Metrics } from '@/lib/metrics';
import { ValidationError, ComplianceError, SystemError } from '../../../utils/errors';
import { validateCQCReport } from '../../../validation/regulatory/england/cqcSchemas';

interface CQCReportRequest {
    organizationId: string;
    period: string;
    format: 'pdf' | 'csv';
    template?: string;
}

interface CQCComplianceCheck {
    organizationId: string;
    checkType: string;
    period?: string;
}

const metrics = new Metrics();

export async function handleCQCReport(request: CQCReportRequest) {
    try {
        // Validate request
        const validationResult = validateCQCReport(request);
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

        if (organization.regulatoryBody !== 'CQC') {
            throw new ValidationError('Organization is not regulated by CQC');
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
                        name: true
                    }
                }
            }
        });

        // Generate report
        const report = {
            id: `cqc_report_${Date.now()}`,
            status: 'completed',
            regulatoryBody: 'CQC',
            period: request.period,
            format: request.format,
            metadata: {
                organizationName: organization.name,
                retentionPeriod: organization.settings.retentionPeriod || '6y',
                complianceStatus: 'compliant',
                transactionCount: transactions.length,
                totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
                residentCount: new Set(transactions.map(tx => tx.residentId)).size
            }
        };

        // Track metrics
        metrics.incrementCounter('regulatory_report_generated', {
            regulatory_body: 'CQC',
            format: request.format
        });

        return report;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new SystemError('Failed to generate CQC report', { cause: error });
    }
}

export async function handleCQCComplianceCheck(request: CQCComplianceCheck) {
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

        if (organization.regulatoryBody !== 'CQC') {
            throw new ValidationError('Organization is not regulated by CQC');
        }

        // Perform compliance checks
        const checks = [
            {
                name: 'retention_period',
                status: organization.settings.retentionPeriod === '6y' ? 'passed' : 'failed',
                details: 'CQC requires 6 years retention period'
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
            regulatory_body: 'CQC',
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
        throw new SystemError('Failed to perform CQC compliance check', { cause: error });
    }
}

// Helper functions
async function validateRequiredFields(organizationId: string): Promise<'passed' | 'failed'> {
    const requiredFields = [
        'amount',
        'currency',
        'type',
        'status',
        'residentId'
    ];

    const sampleTransaction = await prisma.transaction.findFirst({
        where: { organizationId }
    });

    if (!sampleTransaction) {
        return 'passed'; // No transactions to validate
    }

    return requiredFields.every(field => field in sampleTransaction) ? 'passed' : 'failed';
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
