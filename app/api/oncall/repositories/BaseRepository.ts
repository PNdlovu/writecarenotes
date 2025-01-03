/**
 * @writecarenotes.com
 * @fileoverview Base Repository for On-Call Phone System
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Base repository class providing common CRUD operations for all entities.
 */

import { prisma } from '../../../../src/lib/prisma';
import { BaseEntity, Region } from '../types';

export abstract class BaseRepository<T extends BaseEntity> {
    protected abstract tableName: string;

    protected async create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
        const result = await prisma[this.tableName].create({
            data: {
                ...entity,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
        return result as T;
    }

    protected async update(id: string, updates: Partial<T>): Promise<T> {
        const result = await prisma[this.tableName].update({
            where: { id },
            data: {
                ...updates,
                updatedAt: new Date()
            }
        });
        return result as T;
    }

    protected async findById(id: string): Promise<T | null> {
        const result = await prisma[this.tableName].findUnique({
            where: { id }
        });
        return result as T | null;
    }

    protected async findMany(filters: {
        region?: Region;
        startDate?: Date;
        endDate?: Date;
        [key: string]: any;
    }): Promise<T[]> {
        const { startDate, endDate, ...otherFilters } = filters;
        const dateFilter = startDate && endDate ? {
            AND: [
                { startTime: { gte: startDate } },
                { endTime: { lte: endDate } }
            ]
        } : {};

        const result = await prisma[this.tableName].findMany({
            where: {
                ...otherFilters,
                ...dateFilter
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return result as T[];
    }

    protected async delete(id: string): Promise<void> {
        await prisma[this.tableName].delete({
            where: { id }
        });
    }

    protected async transaction<R>(operation: () => Promise<R>): Promise<R> {
        return prisma.$transaction(operation);
    }
} 