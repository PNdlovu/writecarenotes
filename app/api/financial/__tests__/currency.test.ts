import { describe, expect, test, beforeEach } from 'vitest';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { handleCurrencyConversion } from '../handlers/core/currencyHandlers';
import { handleExchangeRateUpdate } from '../handlers/core/currencyHandlers';
import { handleCurrencySettings } from '../handlers/core/currencyHandlers';
import { ValidationError } from '../utils/errors';

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

    test('should handle currency conversion with decimal places', async () => {
        redis.get.mockResolvedValue(JSON.stringify({ rate: 1.17453 }));

        const result = await handleCurrencyConversion({
            amount: 1000.00,
            fromCurrency: 'GBP',
            toCurrency: 'EUR',
            decimals: 4
        });

        expect(result.converted.amount).toBe(1174.5300);
    });

    test('should fallback to database when cache fails', async () => {
        // Mock cache miss
        redis.get.mockResolvedValue(null);

        // Mock database response
        prisma.exchangeRate.findFirst.mockResolvedValue({
            id: 'rate_1',
            fromCurrency: 'GBP',
            toCurrency: 'EUR',
            rate: 1.17,
            validFrom: new Date(),
            validTo: new Date()
        });

        const result = await handleCurrencyConversion({
            amount: 1000.00,
            fromCurrency: 'GBP',
            toCurrency: 'EUR'
        });

        expect(result.rate).toBe(1.17);
        expect(prisma.exchangeRate.findFirst).toHaveBeenCalled();
    });

    test('should throw ValidationError for unsupported currency', async () => {
        await expect(handleCurrencyConversion({
            amount: 1000.00,
            fromCurrency: 'XXX',
            toCurrency: 'GBP'
        })).rejects.toThrow(ValidationError);
    });
});

describe('Exchange Rate Update Handler', () => {
    test('should update exchange rates from provider', async () => {
        // Mock external rate provider
        const mockProvider = {
            getRates: vi.fn().mockResolvedValue({
                'GBP/EUR': 1.17,
                'GBP/USD': 1.27
            })
        };

        // Execute handler
        const result = await handleExchangeRateUpdate({
            provider: 'mock',
            currencies: ['GBP', 'EUR', 'USD'],
            providerInstance: mockProvider
        });

        // Assertions
        expect(result).toEqual({
            updated: 2,
            rates: {
                'GBP/EUR': 1.17,
                'GBP/USD': 1.27
            },
            timestamp: expect.any(Date)
        });

        // Verify cache updates
        expect(redis.set).toHaveBeenCalledTimes(2);
    });

    test('should handle rate update failures gracefully', async () => {
        const mockProvider = {
            getRates: vi.fn().mockRejectedValue(new Error('API error'))
        };

        const result = await handleExchangeRateUpdate({
            provider: 'mock',
            currencies: ['GBP', 'EUR'],
            providerInstance: mockProvider
        });

        expect(result.status).toBe('partial');
        expect(result.errors).toHaveLength(1);
    });

    test('should validate exchange rate values', async () => {
        const mockProvider = {
            getRates: vi.fn().mockResolvedValue({
                'GBP/EUR': -1.17, // Invalid negative rate
                'GBP/USD': 1.27
            })
        };

        const result = await handleExchangeRateUpdate({
            provider: 'mock',
            currencies: ['GBP', 'EUR', 'USD'],
            providerInstance: mockProvider
        });

        expect(result.updated).toBe(1);
        expect(result.errors).toHaveLength(1);
    });
});

describe('Currency Settings Handler', () => {
    test('should update organization currency settings', async () => {
        // Mock organization data
        prisma.organization.findUnique.mockResolvedValue({
            id: 'org_123',
            name: 'Test Org',
            settings: {
                currencies: ['GBP']
            }
        });

        // Execute handler
        const result = await handleCurrencySettings({
            organizationId: 'org_123',
            settings: {
                primaryCurrency: 'GBP',
                supportedCurrencies: ['GBP', 'EUR', 'USD'],
                autoUpdate: true,
                provider: 'default'
            }
        });

        // Assertions
        expect(result).toEqual({
            updated: true,
            settings: {
                primaryCurrency: 'GBP',
                supportedCurrencies: ['GBP', 'EUR', 'USD'],
                autoUpdate: true,
                provider: 'default'
            }
        });

        // Verify database update
        expect(prisma.organization.update).toHaveBeenCalled();
    });

    test('should validate primary currency is in supported currencies', async () => {
        await expect(handleCurrencySettings({
            organizationId: 'org_123',
            settings: {
                primaryCurrency: 'USD',
                supportedCurrencies: ['GBP', 'EUR'],
                autoUpdate: true,
                provider: 'default'
            }
        })).rejects.toThrow(ValidationError);
    });

    test('should handle currency provider configuration', async () => {
        const result = await handleCurrencySettings({
            organizationId: 'org_123',
            settings: {
                primaryCurrency: 'GBP',
                supportedCurrencies: ['GBP', 'EUR'],
                autoUpdate: true,
                provider: 'custom',
                providerConfig: {
                    apiKey: 'test_key',
                    updateInterval: 3600
                }
            }
        });

        expect(result.settings.providerConfig).toBeDefined();
        expect(result.settings.providerConfig.apiKey).toBe('test_key');
    });
});

describe('Currency Operations Performance', () => {
    test('should handle concurrent conversion requests', async () => {
        // Mock exchange rate data
        redis.get.mockResolvedValue(JSON.stringify({ rate: 1.17 }));

        // Execute multiple conversions concurrently
        const results = await Promise.all(
            Array.from({ length: 10 }, () => 
                handleCurrencyConversion({
                    amount: 1000.00,
                    fromCurrency: 'GBP',
                    toCurrency: 'EUR'
                })
            )
        );

        expect(results).toHaveLength(10);
        results.forEach(result => {
            expect(result.converted.amount).toBe(1170.00);
        });
    });

    test('should handle rate limit exceeded', async () => {
        // Mock rate limit exceeded
        redis.get
            .mockRejectedValueOnce(new Error('Rate limit exceeded'))
            .mockResolvedValue(JSON.stringify({ rate: 1.17 }));

        const result = await handleCurrencyConversion({
            amount: 1000.00,
            fromCurrency: 'GBP',
            toCurrency: 'EUR'
        });

        expect(result).toBeDefined();
        expect(prisma.exchangeRate.findFirst).toHaveBeenCalled();
    });
});

describe('Currency Data Validation', () => {
    test('should validate currency codes', async () => {
        const testCases = [
            { code: 'GBP', valid: true },
            { code: 'EUR', valid: true },
            { code: 'USD', valid: true },
            { code: 'INVALID', valid: false },
            { code: '123', valid: false },
            { code: '', valid: false }
        ];

        for (const testCase of testCases) {
            const result = await handleCurrencyConversion({
                amount: 1000.00,
                fromCurrency: testCase.code,
                toCurrency: 'GBP'
            }).catch(e => e);

            if (testCase.valid) {
                expect(result).not.toBeInstanceOf(ValidationError);
            } else {
                expect(result).toBeInstanceOf(ValidationError);
            }
        }
    });

    test('should validate amount ranges', async () => {
        const testCases = [
            { amount: 1000.00, valid: true },
            { amount: 0, valid: true },
            { amount: -1000.00, valid: false },
            { amount: 1000000000.00, valid: false },
            { amount: NaN, valid: false }
        ];

        for (const testCase of testCases) {
            const result = await handleCurrencyConversion({
                amount: testCase.amount,
                fromCurrency: 'GBP',
                toCurrency: 'EUR'
            }).catch(e => e);

            if (testCase.valid) {
                expect(result).not.toBeInstanceOf(ValidationError);
            } else {
                expect(result).toBeInstanceOf(ValidationError);
            }
        }
    });
}); 
