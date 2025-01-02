import { beforeAll, afterAll, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { mockDeep } from 'vitest-mock-extended';

// Mock external services
vi.mock('@prisma/client', () => ({
    PrismaClient: vi.fn(() => mockDeep<PrismaClient>())
}));

vi.mock('ioredis', () => ({
    default: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
        disconnect: vi.fn()
    }))
}));

// Mock external API providers
vi.mock('../services/exchangeRateProviders', () => ({
    getExchangeRateProvider: vi.fn(() => ({
        getRates: vi.fn()
    }))
}));

// Mock file system operations
vi.mock('fs/promises', () => ({
    writeFile: vi.fn(),
    readFile: vi.fn(),
    unlink: vi.fn()
}));

// Mock PDF generation
vi.mock('pdfkit', () => ({
    default: vi.fn(() => ({
        pipe: vi.fn(),
        text: vi.fn(),
        end: vi.fn()
    }))
}));

// Mock CSV generation
vi.mock('json2csv', () => ({
    Parser: vi.fn(() => ({
        parse: vi.fn()
    }))
}));

// Global test setup
let redis: Redis;
let prisma: PrismaClient;

beforeAll(async () => {
    // Initialize Redis client
    redis = new Redis(process.env.REDIS_URL as string);

    // Initialize Prisma client
    prisma = new PrismaClient();

    // Set up global mocks
    global.fetch = vi.fn();
    global.Request = vi.fn() as any;
    global.Response = vi.fn() as any;

    // Mock console methods
    console.log = vi.fn();
    console.error = vi.fn();
    console.warn = vi.fn();

    // Set up test data
    await setupTestData();
});

afterAll(async () => {
    // Clean up Redis connection
    await redis.disconnect();

    // Clean up Prisma connection
    await prisma.$disconnect();

    // Clean up test data
    await cleanupTestData();

    // Clear all mocks
    vi.clearAllMocks();
});

// Test data setup
async function setupTestData() {
    // Set up test organizations
    await prisma.organization.createMany({
        data: [
            {
                id: 'org_123',
                name: 'Test Care Home',
                regulatoryBody: 'CQC',
                settings: {
                    retentionPeriod: '6y',
                    complianceChecks: ['financial_records']
                }
            },
            {
                id: 'org_456',
                name: 'Test Care Home 2',
                regulatoryBody: 'CIW',
                settings: {
                    retentionPeriod: '7y',
                    languages: ['en', 'cy']
                }
            }
        ]
    });

    // Set up test exchange rates
    await prisma.exchangeRate.createMany({
        data: [
            {
                id: 'rate_1',
                fromCurrency: 'GBP',
                toCurrency: 'EUR',
                rate: 1.17,
                provider: 'test',
                validFrom: new Date(),
                validTo: new Date(Date.now() + 86400000)
            },
            {
                id: 'rate_2',
                fromCurrency: 'GBP',
                toCurrency: 'USD',
                rate: 1.27,
                provider: 'test',
                validFrom: new Date(),
                validTo: new Date(Date.now() + 86400000)
            }
        ]
    });

    // Set up test transactions
    await prisma.transaction.createMany({
        data: [
            {
                id: 'tx_1',
                organizationId: 'org_123',
                amount: 1000.00,
                currency: 'GBP',
                type: 'PAYMENT',
                status: 'COMPLETED',
                metadata: {
                    category: 'CARE',
                    subcategory: 'ACCOMMODATION'
                }
            },
            {
                id: 'tx_2',
                organizationId: 'org_123',
                amount: 500.00,
                currency: 'GBP',
                type: 'REFUND',
                status: 'COMPLETED',
                metadata: {
                    category: 'CARE',
                    subcategory: 'SERVICES'
                }
            }
        ]
    });

    // Cache test data in Redis
    await redis.set('exchange_rate:GBP:EUR', JSON.stringify({
        rate: 1.17,
        timestamp: Date.now()
    }));

    await redis.set('exchange_rate:GBP:USD', JSON.stringify({
        rate: 1.27,
        timestamp: Date.now()
    }));
}

// Test data cleanup
async function cleanupTestData() {
    // Clean up test organizations
    await prisma.organization.deleteMany({
        where: {
            id: {
                in: ['org_123', 'org_456']
            }
        }
    });

    // Clean up test exchange rates
    await prisma.exchangeRate.deleteMany({
        where: {
            id: {
                in: ['rate_1', 'rate_2']
            }
        }
    });

    // Clean up test transactions
    await prisma.transaction.deleteMany({
        where: {
            id: {
                in: ['tx_1', 'tx_2']
            }
        }
    });

    // Clean up Redis test data
    await redis.del([
        'exchange_rate:GBP:EUR',
        'exchange_rate:GBP:USD'
    ]);
}

// Global test utilities
global.delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

global.mockDate = (date: Date = new Date('2024-03-21T10:00:00Z')) => {
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
}; 