/**
 * @fileoverview Enhanced audit logging utility for the financial module
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { AuditLog } from '../types';
import { FinancialMetrics } from './metrics';

const metrics = FinancialMetrics.getInstance();

export class AuditLogger {
    private static instance: AuditLogger;
    private readonly batchSize: number = 100;
    private auditQueue: AuditLog[] = [];
    private flushTimeout: NodeJS.Timeout | null = null;

    private constructor() {}

    public static getInstance(): AuditLogger {
        if (!AuditLogger.instance) {
            AuditLogger.instance = new AuditLogger();
        }
        return AuditLogger.instance;
    }

    public async logFinancialAction(
        organizationId: string,
        userId: string,
        action: string,
        entityType: string,
        entityId: string,
        details: Record<string, any>,
        regulatoryBody?: string
    ): Promise<void> {
        const auditLog: AuditLog = {
            id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            organizationId,
            userId,
            action,
            entityType,
            entityId,
            details: {
                ...details,
                regulatoryBody,
                timestamp: new Date().toISOString()
            },
            createdAt: new Date()
        };

        this.queueAuditLog(auditLog);

        // Track metric
        metrics.recordAuditMetric(action, entityType, regulatoryBody, {
            organization_id: organizationId
        });
    }

    public async logComplianceCheck(
        organizationId: string,
        userId: string,
        regulatoryBody: string,
        checkType: string,
        status: 'passed' | 'failed',
        details: Record<string, any>
    ): Promise<void> {
        await this.logFinancialAction(
            organizationId,
            userId,
            'COMPLIANCE_CHECK',
            'COMPLIANCE',
            `${regulatoryBody}_${checkType}`,
            {
                regulatoryBody,
                checkType,
                status,
                ...details
            },
            regulatoryBody
        );
    }

    public async logReportGeneration(
        organizationId: string,
        userId: string,
        regulatoryBody: string,
        reportType: string,
        format: string,
        details: Record<string, any>
    ): Promise<void> {
        await this.logFinancialAction(
            organizationId,
            userId,
            'REPORT_GENERATION',
            'REPORT',
            `${regulatoryBody}_${reportType}`,
            {
                regulatoryBody,
                reportType,
                format,
                ...details
            },
            regulatoryBody
        );
    }

    public async logTransactionAction(
        organizationId: string,
        userId: string,
        action: 'CREATE' | 'UPDATE' | 'DELETE',
        transactionId: string,
        details: Record<string, any>
    ): Promise<void> {
        await this.logFinancialAction(
            organizationId,
            userId,
            `TRANSACTION_${action}`,
            'TRANSACTION',
            transactionId,
            details
        );
    }

    public async logDataAccess(
        organizationId: string,
        userId: string,
        dataType: string,
        accessType: 'READ' | 'WRITE',
        details: Record<string, any>
    ): Promise<void> {
        await this.logFinancialAction(
            organizationId,
            userId,
            `DATA_${accessType}`,
            dataType,
            `${organizationId}_${dataType}`,
            details
        );
    }

    public async logSecurityEvent(
        organizationId: string,
        userId: string,
        eventType: string,
        severity: 'LOW' | 'MEDIUM' | 'HIGH',
        details: Record<string, any>
    ): Promise<void> {
        await this.logFinancialAction(
            organizationId,
            userId,
            'SECURITY_EVENT',
            'SECURITY',
            `${eventType}_${Date.now()}`,
            {
                eventType,
                severity,
                ...details
            }
        );
    }

    private queueAuditLog(auditLog: AuditLog): void {
        this.auditQueue.push(auditLog);

        if (this.auditQueue.length >= this.batchSize) {
            this.flush();
        } else if (!this.flushTimeout) {
            // Set a timeout to flush if queue doesn't fill up
            this.flushTimeout = setTimeout(() => this.flush(), 5000);
        }
    }

    private async flush(): Promise<void> {
        if (this.auditQueue.length === 0) return;

        if (this.flushTimeout) {
            clearTimeout(this.flushTimeout);
            this.flushTimeout = null;
        }

        const logsToFlush = [...this.auditQueue];
        this.auditQueue = [];

        try {
            await prisma.$transaction(async (tx) => {
                for (const log of logsToFlush) {
                    await tx.auditLog.create({
                        data: {
                            organizationId: log.organizationId,
                            userId: log.userId,
                            action: log.action,
                            entityType: log.entityType,
                            entityId: log.entityId,
                            details: log.details,
                            createdAt: log.createdAt
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Failed to flush audit logs:', error);
            // Requeue failed logs
            this.auditQueue = [...this.auditQueue, ...logsToFlush];
            throw error;
        }
    }
} 