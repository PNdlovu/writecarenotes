import { describe, expect, test, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { handleCQCReport } from '../handlers/regulatory/england/cqcHandlers';
import { handleCIWReport } from '../handlers/regulatory/wales/ciwHandlers';
import { handleCareInspectorateReport } from '../handlers/regulatory/scotland/ciHandlers';
import { handleRQIAReport } from '../handlers/regulatory/northernireland/rqiaHandlers';
import { handleHIQAReport } from '../handlers/regulatory/ireland/hiqaHandlers';
import { ValidationError, ComplianceError } from '../utils/errors';

// Mock Prisma
const prisma = mockDeep<PrismaClient>();

// Reset all mocks before each test
beforeEach(() => {
    mockReset(prisma);
    vi.clearAllMocks();
});

describe('CQC (England) Regulatory Handler', () => {
    test('should generate CQC report for valid organization', async () => {
        // Mock data
        const organizationId = 'org_123';
        const period = '2024-Q1';
        
        // Mock database responses
        prisma.organization.findUnique.mockResolvedValue({
            id: 'org_123',
            name: 'Test Care Home',
            regulatoryBody: 'CQC',
            settings: {
                retentionPeriod: '6y',
                complianceChecks: ['financial_records']
            }
        });

        prisma.transaction.findMany.mockResolvedValue([
            {
                id: 'tx_1',
                amount: 1000.00,
                currency: 'GBP',
                type: 'PAYMENT',
                status: 'COMPLETED',
                createdAt: new Date('2024-03-01')
            }
        ]);

        // Execute handler
        const result = await handleCQCReport({
            organizationId,
            period,
            format: 'pdf'
        });

        // Assertions
        expect(result).toEqual({
            id: expect.any(String),
            status: 'completed',
            regulatoryBody: 'CQC',
            period: '2024-Q1',
            format: 'pdf',
            url: expect.any(String),
            metadata: {
                retentionPeriod: '6y',
                complianceStatus: 'compliant'
            }
        });
    });

    test('should include required CQC fields in report', async () => {
        const result = await handleCQCReport({
            organizationId: 'org_123',
            period: '2024-Q1',
            format: 'pdf'
        });

        expect(result.metadata).toEqual(
            expect.objectContaining({
                transactionTracking: expect.any(Boolean),
                auditTrail: expect.any(Boolean),
                residentFinancials: expect.any(Boolean)
            })
        );
    });
});

describe('CIW (Wales) Regulatory Handler', () => {
    test('should generate bilingual CIW report', async () => {
        // Mock data
        const organizationId = 'org_123';
        const period = '2024-Q1';
        
        // Mock database responses
        prisma.organization.findUnique.mockResolvedValue({
            id: 'org_123',
            name: 'Test Care Home',
            regulatoryBody: 'CIW',
            settings: {
                retentionPeriod: '7y',
                languages: ['en', 'cy']
            }
        });

        // Execute handler
        const result = await handleCIWReport({
            organizationId,
            period,
            format: 'pdf',
            language: 'cy'
        });

        // Assertions
        expect(result).toEqual({
            id: expect.any(String),
            status: 'completed',
            regulatoryBody: 'CIW',
            period: '2024-Q1',
            format: 'pdf',
            language: 'cy',
            url: expect.any(String),
            metadata: {
                retentionPeriod: '7y',
                complianceStatus: 'compliant',
                bilingualSupport: true
            }
        });
    });

    test('should include Welsh local authority references', async () => {
        const result = await handleCIWReport({
            organizationId: 'org_123',
            period: '2024-Q1',
            format: 'pdf'
        });

        expect(result.metadata).toEqual(
            expect.objectContaining({
                localAuthorityReference: expect.any(String),
                fundingSource: expect.any(String)
            })
        );
    });
});

describe('Care Inspectorate (Scotland) Regulatory Handler', () => {
    test('should generate Care Inspectorate report with NHS integration', async () => {
        // Mock data
        const organizationId = 'org_123';
        const period = '2024-Q1';
        
        // Mock database responses
        prisma.organization.findUnique.mockResolvedValue({
            id: 'org_123',
            name: 'Test Care Home',
            regulatoryBody: 'CI',
            settings: {
                retentionPeriod: '5y',
                nhsIntegration: true
            }
        });

        // Execute handler
        const result = await handleCareInspectorateReport({
            organizationId,
            period,
            format: 'pdf'
        });

        // Assertions
        expect(result).toEqual({
            id: expect.any(String),
            status: 'completed',
            regulatoryBody: 'CI',
            period: '2024-Q1',
            format: 'pdf',
            url: expect.any(String),
            metadata: {
                retentionPeriod: '5y',
                complianceStatus: 'compliant',
                nhsIntegration: true
            }
        });
    });

    test('should include health board metrics', async () => {
        const result = await handleCareInspectorateReport({
            organizationId: 'org_123',
            period: '2024-Q1',
            format: 'pdf'
        });

        expect(result.metadata).toEqual(
            expect.objectContaining({
                healthBoardCode: expect.any(String),
                nhsFunding: expect.any(Number)
            })
        );
    });
});

describe('RQIA (Northern Ireland) Regulatory Handler', () => {
    test('should generate RQIA report with trust details', async () => {
        // Mock data
        const organizationId = 'org_123';
        const period = '2024-Q1';
        
        // Mock database responses
        prisma.organization.findUnique.mockResolvedValue({
            id: 'org_123',
            name: 'Test Care Home',
            regulatoryBody: 'RQIA',
            settings: {
                retentionPeriod: '8y',
                hscTrust: 'Belfast'
            }
        });

        // Execute handler
        const result = await handleRQIAReport({
            organizationId,
            period,
            format: 'pdf'
        });

        // Assertions
        expect(result).toEqual({
            id: expect.any(String),
            status: 'completed',
            regulatoryBody: 'RQIA',
            period: '2024-Q1',
            format: 'pdf',
            url: expect.any(String),
            metadata: {
                retentionPeriod: '8y',
                complianceStatus: 'compliant',
                hscTrust: 'Belfast'
            }
        });
    });

    test('should include cross-border care details', async () => {
        const result = await handleRQIAReport({
            organizationId: 'org_123',
            period: '2024-Q1',
            format: 'pdf'
        });

        expect(result.metadata).toEqual(
            expect.objectContaining({
                crossBorderCare: expect.any(Boolean),
                trustFunding: expect.any(Number)
            })
        );
    });
});

describe('HIQA (Ireland) Regulatory Handler', () => {
    test('should generate HIQA report with HSE details', async () => {
        // Mock data
        const organizationId = 'org_123';
        const period = '2024-Q1';
        
        // Mock database responses
        prisma.organization.findUnique.mockResolvedValue({
            id: 'org_123',
            name: 'Test Care Home',
            regulatoryBody: 'HIQA',
            settings: {
                retentionPeriod: '7y',
                hseRegion: 'Dublin North'
            }
        });

        // Execute handler
        const result = await handleHIQAReport({
            organizationId,
            period,
            format: 'pdf'
        });

        // Assertions
        expect(result).toEqual({
            id: expect.any(String),
            status: 'completed',
            regulatoryBody: 'HIQA',
            period: '2024-Q1',
            format: 'pdf',
            url: expect.any(String),
            metadata: {
                retentionPeriod: '7y',
                complianceStatus: 'compliant',
                hseRegion: 'Dublin North'
            }
        });
    });

    test('should include Fair Deal scheme details', async () => {
        const result = await handleHIQAReport({
            organizationId: 'org_123',
            period: '2024-Q1',
            format: 'pdf'
        });

        expect(result.metadata).toEqual(
            expect.objectContaining({
                fairDealScheme: expect.any(Boolean),
                hseReference: expect.any(String)
            })
        );
    });
});

describe('Regulatory Compliance Validation', () => {
    test('should validate retention periods by region', async () => {
        const testCases = [
            { body: 'CQC', period: '6y', valid: true },
            { body: 'CQC', period: '5y', valid: false },
            { body: 'CIW', period: '7y', valid: true },
            { body: 'CI', period: '5y', valid: true },
            { body: 'RQIA', period: '8y', valid: true },
            { body: 'HIQA', period: '7y', valid: true }
        ];

        for (const testCase of testCases) {
            const result = await handleComplianceCheck({
                regulatoryBody: testCase.body,
                retentionPeriod: testCase.period
            });

            if (testCase.valid) {
                expect(result.status).toBe('compliant');
            } else {
                expect(result.status).toBe('non_compliant');
            }
        }
    });

    test('should validate required fields by region', async () => {
        const testCases = [
            { 
                body: 'CQC',
                fields: ['transaction_id', 'amount', 'date'],
                valid: true
            },
            {
                body: 'CIW',
                fields: ['transaction_id', 'amount', 'local_authority'],
                valid: true
            },
            {
                body: 'CI',
                fields: ['transaction_id', 'amount', 'health_board'],
                valid: true
            },
            {
                body: 'RQIA',
                fields: ['transaction_id', 'amount', 'trust_reference'],
                valid: true
            },
            {
                body: 'HIQA',
                fields: ['transaction_id', 'amount', 'hse_reference'],
                valid: true
            }
        ];

        for (const testCase of testCases) {
            const result = await handleComplianceCheck({
                regulatoryBody: testCase.body,
                fields: testCase.fields
            });

            if (testCase.valid) {
                expect(result.status).toBe('compliant');
            } else {
                expect(result.status).toBe('non_compliant');
            }
        }
    });
}); 
