/**
 * @fileoverview Transaction operation handlers
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { prisma } from '@/lib/prisma';
import { Metrics } from '@/lib/metrics';
import { ValidationError, SystemError } from '../../utils/errors';
import { validateTransaction } from '../../validation/core/schemas';

interface TransactionRequest {
    organizationId: string;
    amount: number;
    currency: string;
    type: string;
    metadata?: Record<string, any>;
    residentId?: string;
}

interface TransactionQueryParams {
    organizationId: string;
    startDate?: Date;
    endDate?: Date;
    type?: string;
    status?: string;
    residentId?: string;
    page?: number;
    limit?: number;
}

const metrics = new Metrics();

export async function handleCreateTransaction(request: TransactionRequest) {
    try {
        // Validate transaction
        const validationResult = validateTransaction(request);
        if (!validationResult.success) {
            throw new ValidationError(validationResult.error);
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                organizationId: request.organizationId,
                amount: request.amount,
                currency: request.currency,
                type: request.type,
                status: 'COMPLETED',
                metadata: request.metadata,
                residentId: request.residentId
            }
        });

        // Track metrics
        metrics.recordValue('transaction_amount', request.amount, {
            currency: request.currency,
            type: request.type,
            organization_id: request.organizationId
        });

        return {
            id: transaction.id,
            status: 'success',
            transaction
        };
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new SystemError('Failed to create transaction', { cause: error });
    }
}

export async function handleGetTransactions(params: TransactionQueryParams) {
    try {
        const {
            organizationId,
            startDate,
            endDate,
            type,
            status,
            residentId,
            page = 1,
            limit = 50
        } = params;

        // Build query
        const where = {
            organizationId,
            ...(startDate && endDate && {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }),
            ...(type && { type }),
            ...(status && { status }),
            ...(residentId && { residentId })
        };

        // Get total count
        const total = await prisma.transaction.count({ where });

        // Get transactions
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            skip: (page - 1) * limit,
            take: limit,
            include: {
                resident: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return {
            transactions,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        };
    } catch (error) {
        throw new SystemError('Failed to get transactions', { cause: error });
    }
}

export async function handleUpdateTransaction(transactionId: string, updates: Partial<TransactionRequest>) {
    try {
        // Validate updates
        const validationResult = validateTransaction(updates, true);
        if (!validationResult.success) {
            throw new ValidationError(validationResult.error);
        }

        // Update transaction
        const transaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: updates
        });

        return {
            id: transaction.id,
            status: 'success',
            transaction
        };
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new SystemError('Failed to update transaction', { cause: error });
    }
}

export async function handleDeleteTransaction(transactionId: string) {
    try {
        // Check if transaction exists
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) {
            throw new ValidationError('Transaction not found');
        }

        // Delete transaction
        await prisma.transaction.delete({
            where: { id: transactionId }
        });

        return {
            id: transactionId,
            status: 'success'
        };
    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        throw new SystemError('Failed to delete transaction', { cause: error });
    }
}

export async function handleBulkTransactions(transactions: TransactionRequest[]) {
    try {
        const results = [];
        const errors = [];

        for (const transaction of transactions) {
            try {
                const result = await handleCreateTransaction(transaction);
                results.push(result);
            } catch (error) {
                errors.push({
                    transaction,
                    error: error.message
                });
            }
        }

        return {
            status: errors.length ? 'partial' : 'success',
            successful: results.length,
            failed: errors.length,
            results,
            errors: errors.length ? errors : undefined
        };
    } catch (error) {
        throw new SystemError('Failed to process bulk transactions', { cause: error });
    }
} 
