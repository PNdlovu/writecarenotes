/**
 * @fileoverview Regional Compliance Dashboard Handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { FinancialMetrics } from '../../utils/metrics';
import { AuditLogger } from '../../utils/audit';
import { ValidationError, ComplianceError } from '../../utils/errors';
import type {
    ComplianceDashboard,
    ComplianceMetrics,
    ComplianceDeadline,
    ComplianceAction,
    ComplianceSubmission,
    ComplianceStatus,
    RegulatoryBody
} from '../../types/compliance';

const metrics = FinancialMetrics.getInstance();
const auditLogger = AuditLogger.getInstance();

export async function getComplianceDashboard(
    organizationId: string,
    userId: string
): Promise<ComplianceDashboard> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
        include: {
            complianceMetrics: true,
            complianceDeadlines: {
                where: {
                    dueDate: {
                        gte: new Date()
                    }
                },
                orderBy: {
                    dueDate: 'asc'
                }
            },
            complianceActions: {
                where: {
                    status: {
                        in: ['OPEN', 'IN_PROGRESS']
                    }
                }
            },
            complianceSubmissions: {
                orderBy: {
                    submissionDate: 'desc'
                },
                take: 5
            }
        }
    });

    if (!organization) {
        throw new ValidationError('Organization not found');
    }

    // Calculate overall compliance status
    const overallStatus = calculateOverallStatus(organization.complianceMetrics);

    const dashboard: ComplianceDashboard = {
        organizationId,
        lastUpdated: new Date(),
        overallStatus,
        regulatoryBody: organization.regulatoryBody as RegulatoryBody,
        metrics: organization.complianceMetrics,
        upcomingDeadlines: organization.complianceDeadlines,
        outstandingActions: organization.complianceActions,
        recentSubmissions: organization.complianceSubmissions
    };

    // Record metric
    metrics.recordComplianceMetric(
        organization.regulatoryBody,
        'DASHBOARD_VIEW',
        overallStatus === 'COMPLIANT' ? 'passed' : 'failed'
    );

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'VIEW_COMPLIANCE_DASHBOARD',
        'COMPLIANCE',
        organizationId,
        {
            regulatoryBody: organization.regulatoryBody,
            overallStatus
        }
    );

    return dashboard;
}

export async function updateComplianceMetrics(
    organizationId: string,
    userId: string,
    data: Partial<ComplianceMetrics>
): Promise<ComplianceMetrics> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
    });

    if (!organization) {
        throw new ValidationError('Organization not found');
    }

    // Update metrics
    const updatedMetrics = await prisma.complianceMetrics.update({
        where: { organizationId },
        data
    });

    // Record metric
    metrics.recordComplianceMetric(
        organization.regulatoryBody,
        'METRICS_UPDATE',
        updatedMetrics.financialViability.status === 'COMPLIANT' ? 'passed' : 'failed'
    );

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'UPDATE_COMPLIANCE_METRICS',
        'COMPLIANCE_METRICS',
        organizationId,
        {
            changes: Object.keys(data).map(key => ({
                metric: key,
                value: data[key]
            }))
        }
    );

    return updatedMetrics;
}

export async function createComplianceDeadline(
    organizationId: string,
    userId: string,
    data: Omit<ComplianceDeadline, 'id'>
): Promise<ComplianceDeadline> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
    });

    if (!organization) {
        throw new ValidationError('Organization not found');
    }

    // Create deadline
    const deadline = await prisma.complianceDeadline.create({
        data: {
            ...data,
            organizationId
        }
    });

    // Record metric
    metrics.recordComplianceMetric(
        organization.regulatoryBody,
        'DEADLINE_CREATION',
        'passed',
        {
            deadline_type: data.type,
            priority: data.priority
        }
    );

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'CREATE_COMPLIANCE_DEADLINE',
        'COMPLIANCE_DEADLINE',
        deadline.id,
        {
            type: data.type,
            dueDate: data.dueDate,
            priority: data.priority
        }
    );

    return deadline;
}

export async function createComplianceAction(
    organizationId: string,
    userId: string,
    data: Omit<ComplianceAction, 'id'>
): Promise<ComplianceAction> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
    });

    if (!organization) {
        throw new ValidationError('Organization not found');
    }

    // Create action
    const action = await prisma.complianceAction.create({
        data: {
            ...data,
            organizationId
        }
    });

    // Record metric
    metrics.recordComplianceMetric(
        organization.regulatoryBody,
        'ACTION_CREATION',
        'passed',
        {
            action_type: data.type,
            priority: data.priority
        }
    );

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'CREATE_COMPLIANCE_ACTION',
        'COMPLIANCE_ACTION',
        action.id,
        {
            type: data.type,
            dueDate: data.dueDate,
            priority: data.priority
        }
    );

    return action;
}

export async function submitComplianceReturn(
    organizationId: string,
    userId: string,
    data: Omit<ComplianceSubmission, 'id' | 'submissionDate' | 'status'>
): Promise<ComplianceSubmission> {
    const organization = await prisma.organization.findUnique({
        where: { id: organizationId }
    });

    if (!organization) {
        throw new ValidationError('Organization not found');
    }

    // Create submission
    const submission = await prisma.complianceSubmission.create({
        data: {
            ...data,
            organizationId,
            submissionDate: new Date(),
            status: 'SUBMITTED'
        }
    });

    // Record metric
    metrics.recordComplianceMetric(
        organization.regulatoryBody,
        'RETURN_SUBMISSION',
        'passed',
        {
            submission_type: data.type
        }
    );

    // Audit log
    await auditLogger.logFinancialAction(
        organizationId,
        userId,
        'SUBMIT_COMPLIANCE_RETURN',
        'COMPLIANCE_SUBMISSION',
        submission.id,
        {
            type: data.type,
            documents: data.documents
        }
    );

    return submission;
}

function calculateOverallStatus(metrics: ComplianceMetrics): ComplianceStatus {
    const statuses = [
        metrics.financialViability.status,
        metrics.staffingCompliance.status
    ];

    if (statuses.includes('CRITICAL')) {
        return 'CRITICAL';
    }
    if (statuses.includes('MAJOR_ISSUES')) {
        return 'MAJOR_ISSUES';
    }
    if (statuses.includes('MINOR_ISSUES')) {
        return 'MINOR_ISSUES';
    }
    if (statuses.includes('UNDER_REVIEW')) {
        return 'UNDER_REVIEW';
    }
    return 'COMPLIANT';
} 