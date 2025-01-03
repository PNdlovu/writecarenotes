/**
 * @writecarenotes.com
 * @fileoverview Recording Service for On-Call Phone System
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing call recordings in the On-Call Phone System.
 * Handles recording storage, retrieval, and compliance requirements.
 */

import { BlobServiceClient } from '@azure/storage-blob';
import { Recording, Region, RecordingStatus } from '../types';
import { RecordingRepository } from '../repositories/RecordingRepository';
import { ComplianceRepository } from '../repositories/ComplianceRepository';

export class RecordingService {
    private static instance: RecordingService;
    private blobServiceClient: BlobServiceClient;
    private containerName = 'call-recordings';
    private recordingRepository: RecordingRepository;
    private complianceRepository: ComplianceRepository;

    private constructor() {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING || '');
        this.recordingRepository = RecordingRepository.getInstance();
        this.complianceRepository = ComplianceRepository.getInstance();
    }

    public static getInstance(): RecordingService {
        if (!RecordingService.instance) {
            RecordingService.instance = new RecordingService();
        }
        return RecordingService.instance;
    }

    public async startRecording(callId: string, region: Region): Promise<Recording> {
        // Create recording record
        const recording = await this.recordingRepository.createRecording({
            callId,
            status: 'recording',
            startTime: new Date(),
            organizationId: 'TODO', // Get from context
            region
        });

        // Create container if not exists
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        await containerClient.createIfNotExists();

        return recording;
    }

    public async stopRecording(recordingId: string): Promise<void> {
        const recording = await this.recordingRepository.getRecordingById(recordingId);
        if (!recording) {
            throw new Error('Recording not found');
        }

        // Update recording status
        const updatedRecording = await this.recordingRepository.updateRecording(recordingId, {
            status: 'completed',
            endTime: new Date()
        });
        if (!updatedRecording) {
            throw new Error('Failed to update recording');
        }

        // Validate compliance
        await this.validateRecordingCompliance(recording);
    }

    public async getRecording(recordingId: string): Promise<Recording> {
        const recording = await this.recordingRepository.getRecordingById(recordingId);
        if (!recording) {
            throw new Error('Recording not found');
        }
        return recording;
    }

    public async listRecordings(filters?: {
        callId?: string;
        startDate?: Date;
        endDate?: Date;
        region?: Region;
        status?: RecordingStatus;
    }): Promise<Recording[]> {
        return this.recordingRepository.listRecordings(filters);
    }

    private async uploadRecording(recordingId: string, data: Buffer): Promise<string> {
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        const blobClient = containerClient.getBlockBlobClient(`${recordingId}.wav`);
        
        await blobClient.upload(data, data.length);
        const url = blobClient.url;

        const updatedRecording = await this.recordingRepository.updateRecording(recordingId, { fileUrl: url });
        if (!updatedRecording) {
            throw new Error('Failed to update recording with URL');
        }

        return url;
    }

    private async deleteRecording(recordingId: string): Promise<void> {
        const recording = await this.recordingRepository.getRecordingById(recordingId);
        if (!recording || !recording.fileUrl) {
            return;
        }

        // Delete from blob storage
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        const blobClient = containerClient.getBlockBlobClient(`${recordingId}.wav`);
        await blobClient.delete();

        // Update recording status
        const updatedRecording = await this.recordingRepository.updateRecording(recordingId, {
            status: 'failed',
            fileUrl: undefined
        });
        if (!updatedRecording) {
            throw new Error('Failed to update recording after deletion');
        }
    }

    private async validateRecordingCompliance(recording: Recording): Promise<boolean> {
        const isCompliant = await this.complianceRepository.getRegionalCompliance(recording.region);
        if (!isCompliant.isCompliant) {
            const updatedRecording = await this.recordingRepository.updateRecording(recording.id, {
                status: 'failed'
            });
            if (!updatedRecording) {
                throw new Error('Failed to update recording compliance status');
            }
            return false;
        }
        return true;
    }
} 