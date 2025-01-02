import { describe, expect, test, beforeEach, afterEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { handleFinancialSummary } from '../handlers/core/summaryHandlers';
import { handleCurrencyConversion } from '../handlers/core/currencyHandlers';
import { handleExportGeneration } from '../handlers/core/exportHandlers';
import { handleComplianceCheck } from '../handlers/core/complianceHandlers';
import { handleAuditLog } from '../handlers/core/auditHandlers';
import { ValidationError, ComplianceError, SystemError } from '../utils/errors';

// Mock Prisma
const prisma = mockDeep<PrismaClient>();

// Mock Redis for caching
const redis = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn()
};

// Reset all mocks before each test
beforeEach(() => {
    mockReset(prisma);
    vi.clearAllMocks();
});

describe('Financial Summary Handler', () => {
    test('should generate financial summary for valid organization', async () => {
        // Mock data
        const organizationId = 'org_123';
        const period = '2024-03';
        
        // Mock database responses
        prisma.transaction.findMany.mockResolvedValue([
            {
                id: 'tx_1',
                amount: 1000.00,
                currency: 'GBP',
                type: 'PAYMENT',
                status: 'COMPLETED',
                createdAt: new Date('2024-03-01')
            },
            {
                id: 'tx_2',
                amount: 500.00,
                currency: 'GBP',
                type: 'REFUND',
                status: 'COMPLETED',
                createdAt: new Date('2024-03-02')
            }
        ]);

        // Execute handler
        const result = await handleFinancialSummary({
            organizationId,
            period,
            currency: 'GBP'
        });

        // Assertions
        expect(result).toEqual({
            period: '2024-03',
            currency: 'GBP',
            totalTransactions: 2,
            totalAmount: 1500.00,
            breakdown: {
                PAYMENT: 1000.00,
                REFUND: 500.00
            }
        });
    });

    test('should throw ValidationError for invalid period', async () => {
        await expect(handleFinancialSummary({
            organizationId: 'org_123',
            period: 'invalid',
            currency: 'GBP'
        })).rejects.toThrow(ValidationError);
    });
});

describe('Currency Conversion Handler', () => {
    test('should convert amount between supported currencies', async () => {
        // Mock exchange rate data
        redis.get.mockResolvedValue(JSON.stringify({ rate: 1.17 }));

        // Execute handler
        const result = await handleCurrencyConversion({
            amount: 1000.00,
            fromCurrency: 'GBP',
            toCurrency: 'EUR'
        });

        // Assertions
        expect(result).toEqual({
            original: {
                amount: 1000.00,
                currency: 'GBP'
            },
            converted: {
                amount: 1170.00,
                currency: 'EUR'
            },
            rate: 1.17,
            timestamp: expect.any(Date)
        });
    });

    test('should throw ValidationError for unsupported currency', async () => {
        await expect(handleCurrencyConversion({
            amount: 1000.00,
            fromCurrency: 'XXX',
            toCurrency: 'GBP'
        })).rejects.toThrow(ValidationError);
    });
});

describe('Export Generation Handler', () => {
    test('should generate CSV export for valid data', async () => {
        // Mock data
        const organizationId = 'org_123';
        const period = '2024-03';
        
        // Mock database responses
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
        const result = await handleExportGeneration({
            organizationId,
            period,
            format: 'csv',
            template: 'default'
        });

        // Assertions
        expect(result).toEqual({
            id: expect.any(String),
            status: 'completed',
            format: 'csv',
            url: expect.any(String),
            expiresAt: expect.any(Date)
        });
    });

    test('should throw ValidationError for invalid export format', async () => {
        await expect(handleExportGeneration({
            organizationId: 'org_123',
            period: '2024-03',
            format: 'invalid',
            template: 'default'
        })).rejects.toThrow(ValidationError);
    });
});

describe('Compliance Check Handler', () => {
    test('should validate compliance for valid organization', async () => {
        // Mock data
        const organizationId = 'org_123';
        
        // Mock database responses
        prisma.organization.findUnique.mockResolvedValue({
            id: 'org_123',
            name: 'Test Org',
            regulatoryBody: 'CQC',
            settings: {
                retentionPeriod: '6y',
                complianceChecks: ['financial_records', 'audit_trails']
            }
        });

        // Execute handler
        const result = await handleComplianceCheck({
            organizationId,
            checkType: 'financial_records'
        });

        // Assertions
        expect(result).toEqual({
            status: 'compliant',
            checks: [
                {
                    name: 'retention_period',
                    status: 'passed',
                    details: expect.any(String)
                },
                {
                    name: 'required_fields',
                    status: 'passed',
                    details: expect.any(String)
                }
            ],
            timestamp: expect.any(Date)
        });
    });

    test('should throw ComplianceError for non-compliant check', async () => {
        await expect(handleComplianceCheck({
            organizationId: 'org_123',
            checkType: 'invalid'
        })).rejects.toThrow(ComplianceError);
    });
});

describe('Audit Log Handler', () => {
    test('should create audit log entry for valid action', async () => {
        // Mock data
        const organizationId = 'org_123';
        const userId = 'user_123';
        const action = 'REPORT_GENERATED';
        
        // Execute handler
        const result = await handleAuditLog({
            organizationId,
            userId,
            action,
            entityType: 'REPORT',
            entityId: 'report_123',
            changes: {
                status: ['pending', 'completed']
            }
        });

        // Assertions
        expect(result).toEqual({
            id: expect.any(String),
            organizationId,
            userId,
            action,
            entityType: 'REPORT',
            entityId: 'report_123',
            changes: {
                status: ['pending', 'completed']
            },
            createdAt: expect.any(Date)
        });

        // Verify database call
        expect(prisma.auditLog.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                organizationId,
                userId,
                action
            })
        });
    });

    test('should throw ValidationError for invalid action', async () => {
        await expect(handleAuditLog({
            organizationId: 'org_123',
            userId: 'user_123',
            action: 'INVALID_ACTION',
            entityType: 'REPORT',
            entityId: 'report_123',
            changes: {}
        })).rejects.toThrow(ValidationError);
    });
});

describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
        // Mock database error
        prisma.transaction.findMany.mockRejectedValue(new Error('Database error'));

        // Execute handler and expect SystemError
        await expect(handleFinancialSummary({
            organizationId: 'org_123',
            period: '2024-03',
            currency: 'GBP'
        })).rejects.toThrow(SystemError);
    });

    test('should handle cache errors gracefully', async () => {
        // Mock cache error
        redis.get.mockRejectedValue(new Error('Cache error'));

        // Execute handler and verify fallback to database
        const result = await handleCurrencyConversion({
            amount: 1000.00,
            fromCurrency: 'GBP',
            toCurrency: 'EUR'
        });

        expect(result).toBeDefined();
        expect(prisma.exchangeRate.findFirst).toHaveBeenCalled();
    });
}); 