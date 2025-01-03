/**
 * @fileoverview Currency operation handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { Redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { Metrics } from '@/lib/metrics';
import { ValidationError, SystemError } from '../../utils/errors';
import { validateCurrencyCode, validateAmount } from '../../validation/core/schemas';

interface ConversionRequest {
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    decimals?: number;
}

interface ConversionResult {
    original: {
        amount: number;
        currency: string;
    };
    converted: {
        amount: number;
        currency: string;
    };
    rate: number;
    timestamp: Date;
}

interface ExchangeRateUpdateRequest {
    provider: string;
    currencies: string[];
    providerInstance?: any;
}

interface CurrencySettings {
    primaryCurrency: string;
    supportedCurrencies: string[];
    autoUpdate: boolean;
    provider: string;
    providerConfig?: Record<string, any>;
}

const redis = new Redis();
const metrics = new Metrics();

export async function handleCurrencyConversion(request: ConversionRequest): Promise<ConversionResult> {
    try {
        // Validate request
        if (!validateCurrencyCode(request.fromCurrency) || !validateCurrencyCode(request.toCurrency)) {
            throw new ValidationError('Invalid currency code');
        }
        if (!validateAmount(request.amount)) {
            throw new ValidationError('Invalid amount');
        }

        // Try to get rate from cache
        const cacheKey = `exchange_rate:${request.fromCurrency}:${request.toCurrency}`;
        const cachedRate = await redis.get(cacheKey);

        let rate: number;
        if (cachedRate) {
            const parsed = JSON.parse(cachedRate);
            rate = parsed.rate;
            metrics.incrementCounter('cache_hit', { type: 'exchange_rate' });
        } else {
            // Fallback to database
            metrics.incrementCounter('cache_miss', { type: 'exchange_rate' });
            const exchangeRate = await prisma.exchangeRate.findFirst({
                where: {
                    fromCurrency: request.fromCurrency,
                    toCurrency: request.toCurrency,
                    validTo: {
                        gt: new Date()
                    }
                },
                orderBy: {
                    validFrom: 'desc'
                }
            });

            if (!exchangeRate) {
                throw new ValidationError('Exchange rate not available');
            }

            rate = exchangeRate.rate;

            // Cache the rate
            await redis.set(cacheKey, JSON.stringify({
                rate,
                timestamp: Date.now()
            }), 'EX', 3600); // 1 hour expiry
        }

        // Calculate converted amount
        const convertedAmount = Number((request.amount * rate).toFixed(request.decimals || 2));

        // Track metrics
        metrics.recordValue('conversion_amount', request.amount, {
            from_currency: request.fromCurrency,
            to_currency: request.toCurrency
        });

        return {
            original: {
                amount: request.amount,
                currency: request.fromCurrency
            },
            converted: {
                amount: convertedAmount,
                currency: request.toCurrency
            },
            rate,
            timestamp: new Date()
        };
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new SystemError('Currency conversion failed', { cause: error });
    }
}

export async function handleExchangeRateUpdate(request: ExchangeRateUpdateRequest) {
    try {
        const provider = request.providerInstance;
        const rates = await provider.getRates();
        let updated = 0;
        const errors = [];

        for (const [pair, rate] of Object.entries(rates)) {
            try {
                const [fromCurrency, toCurrency] = pair.split('/');
                
                // Validate rate
                if (typeof rate !== 'number' || rate <= 0) {
                    throw new ValidationError('Invalid rate value');
                }

                // Update database
                await prisma.exchangeRate.create({
                    data: {
                        fromCurrency,
                        toCurrency,
                        rate: rate as number,
                        provider: request.provider,
                        validFrom: new Date(),
                        validTo: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
                    }
                });

                // Update cache
                const cacheKey = `exchange_rate:${fromCurrency}:${toCurrency}`;
                await redis.set(cacheKey, JSON.stringify({
                    rate,
                    timestamp: Date.now()
                }), 'EX', 3600);

                updated++;
            } catch (error) {
                errors.push({ pair, error: error.message });
            }
        }

        return {
            updated,
            rates,
            timestamp: new Date(),
            status: errors.length ? 'partial' : 'success',
            errors: errors.length ? errors : undefined
        };
    } catch (error) {
        throw new SystemError('Exchange rate update failed', { cause: error });
    }
}

export async function handleCurrencySettings(request: {
    organizationId: string;
    settings: CurrencySettings;
}) {
    try {
        // Validate settings
        if (!request.settings.supportedCurrencies.includes(request.settings.primaryCurrency)) {
            throw new ValidationError('Primary currency must be in supported currencies');
        }

        // Update organization settings
        await prisma.organization.update({
            where: { id: request.organizationId },
            data: {
                settings: {
                    ...request.settings
                }
            }
        });

        return {
            updated: true,
            settings: request.settings
        };
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new SystemError('Failed to update currency settings', { cause: error });
    }
} 
