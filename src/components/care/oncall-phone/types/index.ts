/**
 * @writecarenotes.com
 * @fileoverview On-Call Phone System Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

export interface CallRecord {
    id: string;
    timestamp: Date;
    callerId: string;
    duration: number;
    recordingUrl?: string;
    transcription?: string;
    status: CallStatus;
    handledBy?: string;
    notes?: string;
    priority?: CallPriority;
    category?: CallCategory;
    followUpRequired?: boolean;
    followUpNotes?: string;
    relatedIncidentId?: string;
}

export interface OnCallSchedule {
    id: string;
    staffId: string;
    phoneNumber: string;
    startTime: Date;
    endTime: Date;
    backupStaffId?: string;
    backupPhoneNumber?: string;
    type: ScheduleType;
    notes?: string;
    region?: string;
    department?: string;
    qualificationRequired?: string[];
}

export interface CallRouting {
    id: string;
    scheduleId: string;
    priority: CallPriority;
    fallbackRules: FallbackRule[];
    escalationRules: EscalationRule[];
    timeoutSeconds: number;
    recordingRequired: boolean;
    transcriptionRequired: boolean;
    notificationRules: NotificationRule[];
}

export interface FallbackRule {
    order: number;
    type: 'backup' | 'voicemail' | 'emergency';
    phoneNumber?: string;
    staffId?: string;
    message?: string;
}

export interface EscalationRule {
    condition: 'timeout' | 'busy' | 'no-answer' | 'emergency';
    action: 'next-staff' | 'emergency' | 'voicemail';
    timeoutSeconds?: number;
    notifyManagement?: boolean;
}

export interface NotificationRule {
    event: 'missed-call' | 'voicemail' | 'emergency' | 'follow-up';
    method: 'sms' | 'email' | 'push';
    recipients: string[];
    template: string;
    priority: 'high' | 'normal' | 'low';
}

export interface CallAudit {
    id: string;
    callId: string;
    timestamp: Date;
    action: AuditAction;
    performedBy: string;
    details: string;
    systemVersion: string;
    ipAddress?: string;
    deviceInfo?: string;
}

export interface ComplianceReport {
    id: string;
    startDate: Date;
    endDate: Date;
    type: 'CQC' | 'Ofsted' | 'Internal';
    metrics: {
        totalCalls: number;
        averageResponseTime: number;
        missedCalls: number;
        emergencyCalls: number;
        escalations: number;
    };
    compliance: {
        recordingCompliance: number;
        responseTimeCompliance: number;
        documentationCompliance: number;
    };
    recommendations?: string[];
}

export type CallStatus = 
    | 'answered'
    | 'voicemail'
    | 'missed'
    | 'in-progress'
    | 'escalated'
    | 'completed'
    | 'failed';

export type CallPriority = 
    | 'emergency'
    | 'urgent'
    | 'normal'
    | 'low';

export type CallCategory =
    | 'medical'
    | 'behavioral'
    | 'maintenance'
    | 'family'
    | 'administrative'
    | 'other';

export type ScheduleType = 
    | 'primary'
    | 'backup'
    | 'emergency'
    | 'specialist';

export type AuditAction =
    | 'call-start'
    | 'call-end'
    | 'recording-start'
    | 'recording-end'
    | 'voicemail'
    | 'escalation'
    | 'transfer'
    | 'note-added'
    | 'follow-up-created';

// Configuration Types
export interface SystemConfig {
    recording: {
        enabled: boolean;
        format: 'mp3' | 'wav';
        retentionDays: number;
        storageLocation: string;
    };
    voicemail: {
        enabled: boolean;
        maxDuration: number;
        transcription: boolean;
    };
    notifications: {
        providers: ('sms' | 'email' | 'push')[];
        templates: Record<string, string>;
    };
    compliance: {
        recordingRequired: boolean;
        minimumResponseTime: number;
        documentationRequired: string[];
        retentionPolicy: RetentionPolicy;
    };
}

export interface RetentionPolicy {
    callRecordings: number; // days
    voicemail: number; // days
    transcriptions: number; // days
    auditLogs: number; // days
    reports: number; // days
} 