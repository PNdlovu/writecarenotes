/**
 * @writecarenotes.com
 * @fileoverview Recording Repository for On-Call Phone System
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Repository for managing recording records in the database.
 */

import { BaseRepository } from './BaseRepository';
import { Recording, RecordingStatus, Region } from '../types';

export class RecordingRepository extends BaseRepository<Recording> {
    protected tableName = 'recordings';
    private static instance: RecordingRepository;

    private constructor() {
        super();
    }

    public static getInstance(): RecordingRepository {
        if (!RecordingRepository.instance) {
            RecordingRepository.instance = new RecordingRepository();
        }
        return RecordingRepository.instance;
    }

    public async createRecording(recording: Omit<Recording, 'id' | 'createdAt' | 'updatedAt'>): Promise<Recording> {
        return this.create(recording);
    }

    public async updateRecording(recordingId: string, updates: Partial<Recording>): Promise<Recording> {
        return this.update(recordingId, updates);
    }

    public async getRecordingById(recordingId: string): Promise<Recording | null> {
        return this.findById(recordingId);
    }

    public async listRecordings(filters?: {
        callId?: string;
        startDate?: Date;
        endDate?: Date;
        region?: Region;
        status?: RecordingStatus;
    }): Promise<Recording[]> {
        return this.findMany(filters || {});
    }

    public async deleteRecording(recordingId: string): Promise<void> {
        return this.delete(recordingId);
    }

    public async getActiveRecordingForCall(callId: string): Promise<Recording | null> {
        const recordings = await this.findMany({
            callId,
            status: 'recording'
        });
        return recordings[0] || null;
    }
} 