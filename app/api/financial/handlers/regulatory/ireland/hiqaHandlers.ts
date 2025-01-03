/**
 * @fileoverview HIQA (Health Information and Quality Authority) Regulatory Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { Metrics } from '@/lib/metrics';
import { ValidationError, ComplianceError, SystemError } from '../../../utils/errors';
import { validateHIQAReport } from '../../../validation/regulatory/ireland/hiqaSchemas';

interface HIQAReportRequest {
    organizationId: string;
    period: string;
    format: 'pdf' | 'csv';
    template?: string;
    language?: 'en' | 'ga';  // English or Irish
}

interface HIQAComplianceCheck {
    organizationId: string;
    checkType: string;
    period?: string;
}

const metrics = new Metrics();

export async function handleHIQAReport(request: HIQAReportRequest) {
    try {
        // Validate request
        const validationResult = validateHIQAReport(request);
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
                serviceType: true,
                registrationNumber: true
            }
        });

        if (!organization) {
            throw new ValidationError('Organization not found');
        }

        if (organization.regulatoryBody !== 'HIQA') {
            throw new ValidationError('Organization is not regulated by HIQA');
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
                        hseArea: true,
                        nursingHomeSupport: true
                    }
                }
            }
        });

        // Generate report
        const report = {
            id: `hiqa_report_${Date.now()}`,
            status: 'completed',
            regulatoryBody: 'HIQA',
            period: request.period,
            format: request.format,
            language: request.language || 'en',
            metadata: {
                organizationName: organization.name,
                registrationNumber: organization.registrationNumber,
                serviceType: organization.serviceType,
                retentionPeriod: organization.settings.retentionPeriod || '6y',
                complianceStatus: 'compliant',
                transactionCount: transactions.length,
                totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
                residentCount: new Set(transactions.map(tx => tx.residentId)).size,
                hseAreaBreakdown: calculateHSEAreaBreakdown(transactions),
                carePackageBreakdown: calculateCarePackageBreakdown(transactions),
                nursingHomeSupportBreakdown: calculateNursingHomeSupportBreakdown(transactions),
                irishLanguageSupport: organization.settings.languages?.includes('ga') || false
            }
        };

        // Track metrics
        metrics.incrementCounter('regulatory_report_generated', {
            regulatory_body: 'HIQA',
            format: request.format,
            language: request.language || 'en'
        });

        return report;
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new SystemError('Failed to generate HIQA report', { cause: error });
    }
}

export async function handleHIQAComplianceCheck(request: HIQAComplianceCheck) {
    try {
        // Get organization settings
        const organization = await prisma.organization.findUnique({
            where: { id: request.organizationId },
            select: {
                settings: true,
                regulatoryBody: true,
                serviceType: true,
                nationalStandards: true,
                registrationNumber: true
            }
        });

        if (!organization) {
            throw new ValidationError('Organization not found');
        }

        if (organization.regulatoryBody !== 'HIQA') {
            throw new ValidationError('Organization is not regulated by HIQA');
        }

        // Perform compliance checks
        const checks = [
            {
                name: 'retention_period',
                status: organization.settings.retentionPeriod === '6y' ? 'passed' : 'failed',
                details: 'HIQA requires 6 years retention period'
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
                name: 'national_standards',
                status: await validateNationalStandards(request.organizationId),
                details: 'Checking compliance with National Standards'
            },
            {
                name: 'hse_area_reporting',
                status: await validateHSEAreaReporting(request.organizationId),
                details: 'Verifying HSE Area reporting compliance'
            },
            {
                name: 'nursing_home_support',
                status: await validateNursingHomeSupport(request.organizationId),
                details: 'Checking Nursing Home Support Scheme compliance'
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
            regulatory_body: 'HIQA',
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
        throw new SystemError('Failed to perform HIQA compliance check', { cause: error });
    }
}

// Helper functions
function calculateHSEAreaBreakdown(transactions: any[]): Record<string, number> {
    return transactions.reduce((acc, tx) => {
        const hseArea = tx.resident?.hseArea || 'Unknown';
        acc[hseArea] = (acc[hseArea] || 0) + tx.amount;
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

function calculateNursingHomeSupportBreakdown(transactions: any[]): Record<string, number> {
    return transactions.reduce((acc, tx) => {
        const supportType = tx.resident?.nursingHomeSupport?.type || 'Unknown';
        acc[supportType] = (acc[supportType] || 0) + tx.amount;
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
        'hseArea',
        'fundingType',
        'carePackage',
        'nursingHomeSupport'
    ];

    const sampleTransaction = await prisma.transaction.findFirst({
        where: { organizationId },
        include: {
            resident: {
                include: {
                    carePackage: true,
                    nursingHomeSupport: true
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
        (sampleTransaction.resident?.carePackage && field in sampleTransaction.resident.carePackage) ||
        (sampleTransaction.resident?.nursingHomeSupport && field in sampleTransaction.resident.nursingHomeSupport)
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

async function validateNationalStandards(organizationId: string): Promise<'passed' | 'failed'> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            nationalStandards: true,
            serviceType: true
        }
    });

    if (!organization?.nationalStandards) {
        return 'failed';
    }

    const requiredStandards = [
        'GOVERNANCE_MANAGEMENT',
        'HEALTHCARE_NEEDS',
        'SAFE_SERVICES',
        'HEALTH_WELLBEING',
        'WORKFORCE',
        'USE_RESOURCES',
        'USE_INFORMATION',
        'RESPONSIVE_WORKFORCE'
    ];

    const hasAllStandards = requiredStandards.every(standard => 
        organization.nationalStandards.includes(standard)
    );

    return hasAllStandards ? 'passed' : 'failed';
}

async function validateHSEAreaReporting(organizationId: string): Promise<'passed' | 'failed'> {
    const residents = await prisma.resident.findMany({
        where: { organizationId },
        select: { hseArea: true }
    });

    const hasHSEArea = residents.every(resident => resident.hseArea);
    return hasHSEArea ? 'passed' : 'failed';
}

async function validateNursingHomeSupport(organizationId: string): Promise<'passed' | 'failed'> {
    const residents = await prisma.resident.findMany({
        where: { organizationId },
        include: {
            nursingHomeSupport: true
        }
    });

    const hasValidSupport = residents.every(resident => 
        resident.nursingHomeSupport && 
        resident.nursingHomeSupport.status === 'APPROVED'
    );

    return hasValidSupport ? 'passed' : 'failed';
} 
