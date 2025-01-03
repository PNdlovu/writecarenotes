/**
 * @writecarenotes.com
 * @fileoverview On-Call Call Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Service for managing phone calls in the On-Call Phone System.
 * Handles incoming calls, call routing, recording, and call history.
 * Integrates with core communication services.
 */

import { CommunicationClient } from '@azure/communication-common';
import { BlobServiceClient } from '@azure/storage-blob';
import { Call, CallStatus, Region } from '../types';
import { CallRepository } from '../repositories/CallRepository';
import { StaffRepository } from '../repositories/StaffRepository';
import { RecordingRepository } from '../repositories/RecordingRepository';
import { StaffManagement } from '../../../../src/features/staff/services/staffManagement';
import { CommunicationService } from '../../../../src/features/telehealth/services/communicationService';

export class OnCallCallService {
    private static instance: OnCallCallService;
    private communicationClient: CommunicationClient;
    private blobServiceClient: BlobServiceClient;
    private callRepository: CallRepository;
    private staffRepository: StaffRepository;
    private recordingRepository: RecordingRepository;
    private staffManagement: StaffManagement;
    private communicationService: CommunicationService;

    private constructor() {
        // Initialize Azure clients
        this.communicationClient = new CommunicationClient(process.env.AZURE_COMMUNICATION_CONNECTION_STRING || '');
        this.blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING || '');
        
        // Initialize repositories
        this.callRepository = CallRepository.getInstance();
        this.staffRepository = StaffRepository.getInstance();
        this.recordingRepository = RecordingRepository.getInstance();

        // Initialize core services
        this.staffManagement = new StaffManagement();
        this.communicationService = new CommunicationService();
    }

    public static getInstance(): OnCallCallService {
        if (!OnCallCallService.instance) {
            OnCallCallService.instance = new OnCallCallService();
        }
        return OnCallCallService.instance;
    }

    public async handleIncomingCall(phoneNumber: string, region: Region): Promise<Call> {
        // Create initial call record
        const call = await this.callRepository.createCall({
            phoneNumber,
            region,
            status: 'pending',
            priority: 'normal',
            startTime: new Date(),
            organizationId: await this.getOrganizationId()
        });

        // Start recording using core communication service
        const recordingId = await this.startRecording(call.id);
        const updatedCall = await this.callRepository.updateCall(call.id, { recordingId });
        if (!updatedCall) {
            throw new Error('Failed to update call with recording ID');
        }

        // Find available staff using core staff management
        const availableStaff = await this.staffRepository.getAvailableStaff({ region });
        if (availableStaff.length > 0) {
            const finalCall = await this.callRepository.updateCall(call.id, {
                staffId: availableStaff[0].id,
                status: 'active'
            });
            if (!finalCall) {
                throw new Error('Failed to update call with staff assignment');
            }

            // Update staff profile with call assignment
            await this.staffManagement.upsertStaffProfile({
                organizationId: finalCall.organizationId,
                userId: availableStaff[0].id,
                role: 'on_call',
                notes: `Assigned to call ${finalCall.id}`
            }, availableStaff[0].id);

            return finalCall;
        } else {
            const missedCall = await this.callRepository.updateCall(call.id, { status: 'missed' });
            if (!missedCall) {
                throw new Error('Failed to update call as missed');
            }
            return missedCall;
        }
    }

    public async endCall(callId: string): Promise<void> {
        const call = await this.callRepository.getCallById(callId);
        if (!call) {
            throw new Error('Call not found');
        }

        // Stop recording if exists
        if (call.recordingId) {
            await this.stopRecording(call.recordingId);
        }

        // Update call status
        const updatedCall = await this.callRepository.updateCall(callId, {
            status: 'completed',
            endTime: new Date()
        });
        if (!updatedCall) {
            throw new Error('Failed to update call as completed');
        }

        // Update staff availability if assigned
        if (updatedCall.staffId) {
            await this.staffManagement.upsertStaffProfile({
                organizationId: updatedCall.organizationId,
                userId: updatedCall.staffId,
                role: 'on_call',
                notes: `Completed call ${updatedCall.id}`
            }, updatedCall.staffId);
        }
    }

    public async getCallDetails(callId: string): Promise<Call> {
        const call = await this.callRepository.getCallById(callId);
        if (!call) {
            throw new Error('Call not found');
        }
        return call;
    }

    public async listCalls(filters?: {
        status?: CallStatus;
        startDate?: Date;
        endDate?: Date;
        region?: Region;
    }): Promise<Call[]> {
        return this.callRepository.listCalls(filters);
    }

    private async startRecording(callId: string): Promise<string> {
        const recording = await this.recordingRepository.createRecording({
            callId,
            status: 'recording',
            startTime: new Date(),
            organizationId: await this.getOrganizationId(),
            region: 'england' // Get from call
        });

        // Start recording using core communication service
        await this.communicationService.startRecording({
            recordingId: recording.id,
            callId,
            format: 'wav'
        });

        return recording.id;
    }

    private async stopRecording(recordingId: string): Promise<void> {
        const updatedRecording = await this.recordingRepository.updateRecording(recordingId, {
            status: 'completed',
            endTime: new Date()
        });
        if (!updatedRecording) {
            throw new Error('Failed to update recording as completed');
        }

        // Stop recording using core communication service
        await this.communicationService.stopRecording(recordingId);
    }

    private async getOrganizationId(): Promise<string> {
        // TODO: Get from context
        return 'TODO';
    }
} 