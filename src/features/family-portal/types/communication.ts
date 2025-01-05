export interface Message {
  id: string;
  residentId: string;
  senderId: string;
  recipientId: string;
  subject: string;
  content: string;
  createdAt: Date;
  readAt?: Date;
  category: MessageCategory;
  priority: MessagePriority;
  attachments?: Attachment[];
  thread?: {
    threadId: string;
    parentMessageId?: string;
  };
  metadata?: Record<string, any>;
}

export type MessageCategory =
  | 'CARE_UPDATE'
  | 'MEDICAL'
  | 'APPOINTMENT'
  | 'FINANCIAL'
  | 'GENERAL'
  | 'FEEDBACK'
  | 'DOCUMENT_REQUEST'
  | 'CONSENT_REQUEST';

export type MessagePriority = 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';

export interface Attachment {
  id: string;
  type: 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO';
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface VideoCall {
  id: string;
  residentId: string;
  familyMemberId: string;
  scheduledAt: Date;
  duration: number; // in minutes
  status: VideoCallStatus;
  type: 'SCHEDULED' | 'IMMEDIATE';
  participants: {
    id: string;
    name: string;
    role: string;
    joinedAt?: Date;
    leftAt?: Date;
  }[];
  recording?: {
    available: boolean;
    url?: string;
    duration?: number;
  };
}

export type VideoCallStatus =
  | 'SCHEDULED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'MISSED';


