/**
 * @writecarenotes.com
 * @fileoverview Call Repository for On-Call Phone System
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Repository for managing call records in the database.
 */

import { BaseRepository } from './BaseRepository';
import { Call, CallStatus, Region } from '../types';

export class CallRepository extends BaseRepository<Call> {
    protected tableName = 'calls';
    private static instance: CallRepository;

    private constructor() {
        super();
    }

    public static getInstance(): CallRepository {
        if (!CallRepository.instance) {
            CallRepository.instance = new CallRepository();
        }
        return CallRepository.instance;
    }

    public async createCall(call: Omit<Call, 'id' | 'createdAt' | 'updatedAt'>): Promise<Call> {
        return this.create(call);
    }

    public async updateCall(callId: string, updates: Partial<Call>): Promise<Call> {
        return this.update(callId, updates);
    }

    public async getCallById(callId: string): Promise<Call | null> {
        return this.findById(callId);
    }

    public async listCalls(filters?: {
        status?: CallStatus;
        startDate?: Date;
        endDate?: Date;
        region?: Region;
    }): Promise<Call[]> {
        return this.findMany(filters || {});
    }

    public async deleteCall(callId: string): Promise<void> {
        return this.delete(callId);
    }
} 