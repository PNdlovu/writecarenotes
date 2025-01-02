/**
 * @fileoverview Test suite for the financial module
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import { prisma } from '@/lib/prisma';
import { handleHIQAReport, handleHIQAComplianceCheck } from '../handlers/regulatory/ireland/hiqaHandlers';
import { handleRQIAReport, handleRQIAComplianceCheck } from '../handlers/regulatory/northern-ireland/rqiaHandlers';
import { handleCIWReport, handleCIWComplianceCheck } from '../handlers/regulatory/wales/ciwHandlers';
import { handleCQCReport, handleCQCComplianceCheck } from '../handlers/regulatory/england/cqcHandlers';
import { handleCareInspectorateReport, handleCareInspectorateComplianceCheck } from '../handlers/regulatory/scotland/careInspectorateHandlers';
import { ValidationError, ComplianceError } from '../utils/errors';
import { FinancialMetrics } from '../utils/metrics';
import { AuditLogger } from '../utils/audit';

// Mock dependencies
jest.mock('@/lib/prisma');
jest.mock('../utils/metrics');
jest.mock('../utils/audit');

describe('Financial Module Tests', () => {
    let mockOrganization;
    let mockTransactions;
    let mockAuditLogs;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Setup mock data
        mockOrganization = {
            id: 'org-123',
            name: 'Test Care Home',
            regulatoryBody: 'HIQA',
            settings: {
                retentionPeriod: '6y',
                languages: ['en', 'ga']
            },
            serviceType: 'NURSING_HOME',
            registrationNumber: 'REG123'
        };

        mockTransactions = [
            {
                id: 'tx-1',
                amount: 1000,
                currency: 'EUR',
                type: 'INCOME',
                status: 'COMPLETED',
                resident: {
                    id: 'res-1',
                    name: 'John Doe',
                    hseArea: 'Dublin North',
                    nursingHomeSupport: {
                        status: 'APPROVED'
                    }
                }
            }
        ];

        mockAuditLogs = [
            {
                id: 'audit-1',
                entityType: 'TRANSACTION',
                entityId: 'tx-1'
            }
        ];

        // Setup prisma mocks
        (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrganization);
        (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);
        (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockAuditLogs);
    });

    describe('HIQA Handlers', () => {
        test('should generate HIQA report successfully', async () => {
            const request = {
                organizationId: 'org-123',
                period: '2024-03',
                format: 'pdf' as const,
                language: 'en' as const
            };

            const report = await handleHIQAReport(request);

            expect(report).toBeDefined();
            expect(report.regulatoryBody).toBe('HIQA');
            expect(report.metadata.registrationNumber).toBe('REG123');
            expect(report.metadata.complianceStatus).toBe('compliant');
        });

        test('should perform HIQA compliance check successfully', async () => {
            const request = {
                organizationId: 'org-123',
                checkType: 'financial_records'
            };

            const result = await handleHIQAComplianceCheck(request);

            expect(result).toBeDefined();
            expect(result.status).toBe('compliant');
            expect(result.checks).toHaveLength(6);
        });

        test('should handle invalid organization for HIQA report', async () => {
            (prisma.organization.findUnique as jest.Mock).mockResolvedValue(null);

            const request = {
                organizationId: 'invalid-org',
                period: '2024-03',
                format: 'pdf' as const
            };

            await expect(handleHIQAReport(request)).rejects.toThrow(ValidationError);
        });
    });

    describe('RQIA Handlers', () => {
        beforeEach(() => {
            mockOrganization.regulatoryBody = 'RQIA';
            (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrganization);
        });

        test('should generate RQIA report successfully', async () => {
            const request = {
                organizationId: 'org-123',
                period: '2024-03',
                format: 'pdf' as const,
                language: 'en' as const
            };

            const report = await handleRQIAReport(request);

            expect(report).toBeDefined();
            expect(report.regulatoryBody).toBe('RQIA');
            expect(report.metadata.trustAreaBreakdown).toBeDefined();
        });

        test('should validate trust area reporting', async () => {
            const request = {
                organizationId: 'org-123',
                checkType: 'trust_area_reporting'
            };

            const result = await handleRQIAComplianceCheck(request);
            expect(result.status).toBe('compliant');
        });
    });

    describe('CIW Handlers', () => {
        beforeEach(() => {
            mockOrganization.regulatoryBody = 'CIW';
            (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrganization);
        });

        test('should support Welsh language in reports', async () => {
            const request = {
                organizationId: 'org-123',
                period: '2024-03',
                format: 'pdf' as const,
                language: 'cy' as const
            };

            const report = await handleCIWReport(request);
            expect(report.language).toBe('cy');
        });

        test('should validate bilingual support', async () => {
            const request = {
                organizationId: 'org-123',
                checkType: 'bilingual_support'
            };

            const result = await handleCIWComplianceCheck(request);
            expect(result.checks.find(c => c.name === 'bilingual_support')).toBeDefined();
        });
    });

    describe('Care Inspectorate Handlers', () => {
        beforeEach(() => {
            mockOrganization.regulatoryBody = 'CARE_INSPECTORATE';
            (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrganization);
        });

        test('should support Scottish Gaelic in reports', async () => {
            const request = {
                organizationId: 'org-123',
                period: '2024-03',
                format: 'pdf' as const,
                language: 'gd' as const
            };

            const report = await handleCareInspectorateReport(request);
            expect(report.language).toBe('gd');
        });

        test('should validate care standards', async () => {
            const request = {
                organizationId: 'org-123',
                checkType: 'care_standards'
            };

            const result = await handleCareInspectorateComplianceCheck(request);
            expect(result.checks.find(c => c.name === 'care_standards')).toBeDefined();
        });
    });

    describe('CQC Handlers', () => {
        beforeEach(() => {
            mockOrganization.regulatoryBody = 'CQC';
            (prisma.organization.findUnique as jest.Mock).mockResolvedValue(mockOrganization);
        });

        test('should generate CQC report successfully', async () => {
            const request = {
                organizationId: 'org-123',
                period: '2024-03',
                format: 'pdf' as const
            };

            const report = await handleCQCReport(request);
            expect(report.regulatoryBody).toBe('CQC');
            expect(report.metadata.retentionPeriod).toBe('6y');
        });

        test('should validate required fields', async () => {
            const request = {
                organizationId: 'org-123',
                checkType: 'required_fields'
            };

            const result = await handleCQCComplianceCheck(request);
            expect(result.checks.find(c => c.name === 'required_fields')).toBeDefined();
        });
    });

    describe('Metrics and Audit Logging', () => {
        const metrics = FinancialMetrics.getInstance();
        const auditLogger = AuditLogger.getInstance();

        test('should record transaction metrics', () => {
            const recordTransactionMetric = jest.spyOn(metrics, 'recordTransactionMetric');

            metrics.recordTransactionMetric(1000, {
                regulatory_body: 'HIQA',
                transaction_type: 'INCOME',
                currency: 'EUR'
            });

            expect(recordTransactionMetric).toHaveBeenCalled();
        });

        test('should log compliance checks', async () => {
            const logComplianceCheck = jest.spyOn(auditLogger, 'logComplianceCheck');

            await auditLogger.logComplianceCheck(
                'org-123',
                'user-123',
                'HIQA',
                'financial_records',
                'passed',
                {}
            );

            expect(logComplianceCheck).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        test('should handle validation errors', async () => {
            const request = {
                organizationId: 'org-123',
                period: 'invalid-period',
                format: 'pdf' as const
            };

            await expect(handleHIQAReport(request)).rejects.toThrow(ValidationError);
        });

        test('should handle compliance errors', async () => {
            mockOrganization.settings.retentionPeriod = '1y'; // Invalid retention period

            const request = {
                organizationId: 'org-123',
                checkType: 'retention_period'
            };

            await expect(handleHIQAComplianceCheck(request)).rejects.toThrow(ComplianceError);
        });
    });
}); 