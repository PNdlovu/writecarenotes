/**
 * @writecarenotes.com
 * @fileoverview On-Call Phone System Service
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

import { AzureCommunicationServicesClient } from '@azure/communication-services';
import { BlobServiceClient } from '@azure/storage-blob';
import { OnCallSchedule, CallRecord } from '../types';

export class PhoneService {
    private static instance: PhoneService;
    private communicationClient: AzureCommunicationServicesClient;
    private storageClient: BlobServiceClient;

    private constructor() {
        this.communicationClient = new AzureCommunicationServicesClient(
            process.env.AZURE_COMMUNICATION_CONNECTION_STRING
        );
        this.storageClient = BlobServiceClient.fromConnectionString(
            process.env.AZURE_STORAGE_CONNECTION_STRING
        );
    }

    public static getInstance(): PhoneService {
        if (!PhoneService.instance) {
            PhoneService.instance = new PhoneService();
        }
        return PhoneService.instance;
    }

    // Call Handling
    public async handleIncomingCall(callerId: string): Promise<void> {
        try {
            // Get current schedule
            const schedule = await this.getCurrentSchedule();
            if (!schedule) {
                return this.routeToVoicemail(callerId);
            }

            // Attempt primary contact
            const primarySuccess = await this.routeCall(callerId, schedule.phoneNumber);
            if (primarySuccess) return;

            // Attempt backup if primary fails
            if (schedule.backupPhoneNumber) {
                const backupSuccess = await this.routeCall(callerId, schedule.backupPhoneNumber);
                if (backupSuccess) return;
            }

            // Route to voicemail if all attempts fail
            await this.routeToVoicemail(callerId);
        } catch (error) {
            console.error('Error handling incoming call:', error);
            await this.handleEmergencyFailover(callerId);
        }
    }

    private async routeCall(callerId: string, targetNumber: string): Promise<boolean> {
        try {
            const call = await this.communicationClient.calls.create({
                source: { phoneNumber: process.env.SYSTEM_PHONE_NUMBER },
                target: { phoneNumber: targetNumber },
                callbackUrl: process.env.CALL_STATUS_WEBHOOK_URL
            });

            await this.startRecording(call.id);
            return true;
        } catch (error) {
            console.error('Error routing call:', error);
            return false;
        }
    }

    private async routeToVoicemail(callerId: string): Promise<void> {
        try {
            const voicemailUrl = await this.getVoicemailPrompt();
            await this.communicationClient.calls.playAudio(voicemailUrl);
            await this.startRecording(`voicemail-${Date.now()}`);
        } catch (error) {
            console.error('Error routing to voicemail:', error);
            throw error;
        }
    }

    // Recording Management
    private async startRecording(callId: string): Promise<void> {
        try {
            await this.communicationClient.calls.startRecording(callId, {
                format: 'mp3',
                channelType: 'mixed'
            });
        } catch (error) {
            console.error('Error starting recording:', error);
            throw error;
        }
    }

    public async stopRecording(callId: string): Promise<string> {
        try {
            const recording = await this.communicationClient.calls.stopRecording(callId);
            const recordingUrl = await this.storeRecording(recording.id, callId);
            return recordingUrl;
        } catch (error) {
            console.error('Error stopping recording:', error);
            throw error;
        }
    }

    private async storeRecording(recordingId: string, callId: string): Promise<string> {
        try {
            const containerClient = this.storageClient.getContainerClient('call-recordings');
            const blobName = `${callId}/${recordingId}.mp3`;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            const recordingData = await this.communicationClient.recordings.download(recordingId);
            await blockBlobClient.uploadData(recordingData);

            return blockBlobClient.url;
        } catch (error) {
            console.error('Error storing recording:', error);
            throw error;
        }
    }

    // Schedule Management
    private async getCurrentSchedule(): Promise<OnCallSchedule | null> {
        try {
            const now = new Date();
            const schedules = await this.getSchedules();
            
            return schedules.find(schedule => 
                schedule.startTime <= now && schedule.endTime >= now
            ) || null;
        } catch (error) {
            console.error('Error getting current schedule:', error);
            throw error;
        }
    }

    public async getSchedules(): Promise<OnCallSchedule[]> {
        // Implementation to fetch schedules from database
        return [];
    }

    // Emergency Handling
    private async handleEmergencyFailover(callerId: string): Promise<void> {
        try {
            const emergencyNumbers = await this.getEmergencyContacts();
            
            for (const number of emergencyNumbers) {
                const success = await this.routeCall(callerId, number);
                if (success) return;
            }

            // If all emergency contacts fail, store missed call
            await this.logMissedCall(callerId);
        } catch (error) {
            console.error('Error in emergency failover:', error);
            throw error;
        }
    }

    private async getEmergencyContacts(): Promise<string[]> {
        // Implementation to fetch emergency contacts
        return [];
    }

    // Call Logging
    private async logMissedCall(callerId: string): Promise<void> {
        const record: CallRecord = {
            id: `call-${Date.now()}`,
            timestamp: new Date(),
            callerId,
            duration: 0,
            status: 'missed'
        };

        // Implementation to store call record
    }

    // Compliance
    public async generateAuditReport(startDate: Date, endDate: Date): Promise<any> {
        try {
            // Implementation for generating compliance reports
            return {};
        } catch (error) {
            console.error('Error generating audit report:', error);
            throw error;
        }
    }
} 