export type ConsultationType = 'ROUTINE' | 'EMERGENCY' | 'FOLLOWUP';
export type ParticipantRole = 'DOCTOR' | 'NURSE' | 'CAREGIVER' | 'FAMILY';
export type VideoQuality = 'HD' | 'SD';
export type VitalType = 'HEART_RATE' | 'BLOOD_PRESSURE' | 'TEMPERATURE' | 'OXYGEN' | 'GLUCOSE';
export type DocumentType = 'CONSULTATION_NOTES' | 'PRESCRIPTION' | 'TEST_RESULTS' | 'CARE_PLAN';
export type ReportType = 'CONSULTATION' | 'VITAL_SIGNS' | 'AUDIT';
export type ReportFormat = 'PDF' | 'CSV' | 'JSON';

export interface Participant {
  id: string;
  role: ParticipantRole;
}

export interface Attachment {
  type: string;
  url: string;
}

export interface Consultation {
  id: string;
  residentId: string;
  type: ConsultationType;
  scheduledTime: string;
  participants: Participant[];
  notes?: string;
  attachments?: Attachment[];
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  metadata?: {
    region: string;
    organization: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface VideoSession {
  id: string;
  consultationId: string;
  configuration: {
    quality: VideoQuality;
    recording: boolean;
    maxDuration: number;
  };
  token: string;
  urls: {
    join: string;
    recording?: string;
  };
  status: 'CREATED' | 'ACTIVE' | 'ENDED';
}

export interface MonitoringSession {
  id: string;
  residentId: string;
  deviceId: string;
  vitals: VitalType[];
  interval: number;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED';
  readings?: {
    type: VitalType;
    value: number;
    unit: string;
    timestamp: string;
  }[];
}

export interface Document {
  id: string;
  type: DocumentType;
  consultationId: string;
  description: string;
  content: string;
  url: string;
  metadata: {
    author: string;
    date: string;
  };
}

export interface Report {
  id: string;
  type: ReportType;
  parameters: {
    residentId: string;
    from: string;
    to: string;
    format: ReportFormat;
  };
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  url?: string;
  expiresAt?: string;
} 