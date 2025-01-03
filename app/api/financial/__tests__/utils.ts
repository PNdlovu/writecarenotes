import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { mockDeep } from 'vitest-mock-extended';
import { ValidationError, ComplianceError, SystemError } from '../utils/errors';

// Test data types
export interface TestOrganization {
    id: string;
    name: string;
    regulatoryBody: string;
    settings: Record<string, any>;
}

export interface TestTransaction {
    id: string;
    organizationId: string;
    amount: number;
    currency: string;
    type: string;
    status: string;
    metadata?: Record<string, any>;
}

export interface TestExchangeRate {
    id: string;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    provider: string;
    validFrom: Date;
    validTo: Date;
}

// Mock data generators
export function generateTestOrganization(overrides: Partial<TestOrganization> = {}): TestOrganization {
    return {
        id: `org_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Test Care Home',
        regulatoryBody: 'CQC',
        settings: {
            retentionPeriod: '6y',
            complianceChecks: ['financial_records']
        },
        ...overrides
    };
}

export function generateTestTransaction(overrides: Partial<TestTransaction> = {}): TestTransaction {
    return {
        id: `tx_${Math.random().toString(36).substr(2, 9)}`,
        organizationId: 'org_123',
        amount: 1000.00,
        currency: 'GBP',
        type: 'PAYMENT',
        status: 'COMPLETED',
        metadata: {
            category: 'CARE',
            subcategory: 'ACCOMMODATION'
        },
        ...overrides
    };
}

export function generateTestExchangeRate(overrides: Partial<TestExchangeRate> = {}): TestExchangeRate {
    return {
        id: `rate_${Math.random().toString(36).substr(2, 9)}`,
        fromCurrency: 'GBP',
        toCurrency: 'EUR',
        rate: 1.17,
        provider: 'test',
        validFrom: new Date(),
        validTo: new Date(Date.now() + 86400000),
        ...overrides
    };
}

// Database utilities
export async function setupTestDatabase(prisma: PrismaClient) {
    const organization = generateTestOrganization();
    const transaction = generateTestTransaction({ organizationId: organization.id });
    const exchangeRate = generateTestExchangeRate();

    await prisma.organization.create({ data: organization });
    await prisma.transaction.create({ data: transaction });
    await prisma.exchangeRate.create({ data: exchangeRate });

    return {
        organization,
        transaction,
        exchangeRate
    };
}

export async function cleanupTestDatabase(prisma: PrismaClient) {
    await prisma.transaction.deleteMany();
    await prisma.exchangeRate.deleteMany();
    await prisma.organization.deleteMany();
}

// Cache utilities
export async function setupTestCache(redis: Redis) {
    await redis.set('exchange_rate:GBP:EUR', JSON.stringify({
        rate: 1.17,
        timestamp: Date.now()
    }));

    await redis.set('exchange_rate:GBP:USD', JSON.stringify({
        rate: 1.27,
        timestamp: Date.now()
    }));
}

export async function cleanupTestCache(redis: Redis) {
    await redis.del([
        'exchange_rate:GBP:EUR',
        'exchange_rate:GBP:USD'
    ]);
}

// Mock utilities
export function createMockPrisma() {
    return mockDeep<PrismaClient>();
}

export function createMockRedis() {
    return {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
        disconnect: vi.fn()
    };
}

// Validation utilities
export function validateCurrencyCode(code: string): boolean {
    return /^[A-Z]{3}$/.test(code);
}

export function validateAmount(amount: number): boolean {
    return !isNaN(amount) && amount >= 0 && amount <= 1000000000;
}

export function validatePeriod(period: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(period);
}

// Error utilities
export function isValidationError(error: Error): boolean {
    return error instanceof ValidationError;
}

export function isComplianceError(error: Error): boolean {
    return error instanceof ComplianceError;
}

export function isSystemError(error: Error): boolean {
    return error instanceof SystemError;
}

// Test data assertions
export function assertTransaction(transaction: any) {
    expect(transaction).toEqual(
        expect.objectContaining({
            id: expect.any(String),
            amount: expect.any(Number),
            currency: expect.any(String),
            type: expect.any(String),
            status: expect.any(String)
        })
    );
}

export function assertExchangeRate(rate: any) {
    expect(rate).toEqual(
        expect.objectContaining({
            fromCurrency: expect.any(String),
            toCurrency: expect.any(String),
            rate: expect.any(Number),
            validFrom: expect.any(Date),
            validTo: expect.any(Date)
        })
    );
}

export function assertOrganization(organization: any) {
    expect(organization).toEqual(
        expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            regulatoryBody: expect.any(String),
            settings: expect.any(Object)
        })
    );
}

// Time utilities
export function mockDate(date: Date = new Date('2024-03-21T10:00:00Z')) {
    const RealDate = Date;
    (global as any).Date = class extends RealDate {
        constructor(...args: any[]) {
            if (args.length === 0) {
                return date;
            }
            return new RealDate(...args);
        }
        static now() {
            return date.getTime();
        }
    };
    return () => {
        global.Date = RealDate;
    };
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// File utilities
export async function createTempFile(content: string): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');
    const os = await import('os');

    const tempDir = os.tmpdir();
    const fileName = `test-${Math.random().toString(36).substr(2, 9)}`;
    const filePath = path.join(tempDir, fileName);

    await fs.writeFile(filePath, content);
    return filePath;
}

export async function cleanupTempFile(filePath: string) {
    const fs = await import('fs/promises');
    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error(`Failed to cleanup temp file: ${filePath}`, error);
    }
}

// PDF utilities
export async function extractPDFText(buffer: Buffer): Promise<string> {
    // Mock implementation for testing
    return buffer.toString();
}

export async function getPDFMetadata(buffer: Buffer): Promise<Record<string, any>> {
    // Mock implementation for testing
    return {
        title: 'Test Report',
        creator: 'WriteNotes Financial Module',
        keywords: ['financial', 'report']
    };
}

// CSV utilities
export function parseCSV(content: string): any[] {
    return content
        .split('\n')
        .map(line => line.split(','))
        .filter(row => row.length > 1)
        .map(row => ({
            [row[0]]: row[1]
        }));
}

// Regulatory compliance utilities
export const RETENTION_PERIODS = {
    CQC: '6y',
    CIW: '7y',
    CI: '5y',
    RQIA: '8y',
    HIQA: '7y'
};

export function validateRetentionPeriod(regulatoryBody: string, period: string): boolean {
    return period === RETENTION_PERIODS[regulatoryBody as keyof typeof RETENTION_PERIODS];
}

// Currency utilities
export const SUPPORTED_CURRENCIES = ['GBP', 'EUR', 'USD', 'IEP'];

export function isSupportedCurrency(currency: string): boolean {
    return SUPPORTED_CURRENCIES.includes(currency);
}

export function formatCurrency(amount: number, currency: string, locale: string = 'en-GB'): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    }).format(amount);
}

// Date utilities
export function formatDate(date: Date, locale: string = 'en-GB'): string {
    return new Intl.DateTimeFormat(locale).format(date);
}

// Locale utilities
export const SUPPORTED_LOCALES = {
    'en-GB': 'English (UK)',
    'en-IE': 'English (Ireland)',
    'cy': 'Welsh',
    'ga': 'Irish'
}; 
