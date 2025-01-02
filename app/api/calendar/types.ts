/**
 * @fileoverview Type definitions for calendar events
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

export type Region = 'england' | 'wales' | 'scotland' | 'northern-ireland' | 'ireland';
export type Language = 'en' | 'cy' | 'gd' | 'ga';

export interface CalendarEvent {
  id: string;
  title: string;
  titleTranslations?: Record<Language, string>;
  date: string;
  type: 'appointment' | 'activity' | 'medication' | 'assessment';
  description?: string;
  descriptionTranslations?: Record<Language, string>;
  residentId?: string;
  residentName?: string;
  staffId?: string;
  staffName?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  region: Region;
  regulatoryBody: 'CQC' | 'CIW' | 'CI' | 'HIQA' | 'RQIA';
  regulatoryRequirements?: {
    assessmentType?: string;
    frequency?: string;
    lastCompleted?: string;
    nextDue?: string;
  };
  recurrence?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
  category?: 'care' | 'health' | 'social' | 'administrative';
  priority: 'routine' | 'important' | 'urgent';
  offline?: {
    synced: boolean;
    lastSyncedAt?: string;
    localUpdates?: Array<{
      timestamp: string;
      changes: Partial<CalendarEvent>;
    }>;
  };
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
  }>;
  audit: {
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    version: number;
    changes: Array<{
      timestamp: string;
      userId: string;
      field: string;
      oldValue: any;
      newValue: any;
    }>;
  };
  notifications?: Array<{
    type: 'email' | 'sms' | 'push' | 'system';
    recipients: string[];
    scheduledFor: string;
    sent?: boolean;
    sentAt?: string;
  }>;
  organizationId: string;
  facilityId: string;
  departmentId?: string;
  metadata?: Record<string, any>;
}

export interface CreateEventData {
  title: string;
  titleTranslations?: Record<Language, string>;
  date: string;
  type: CalendarEvent['type'];
  description?: string;
  descriptionTranslations?: Record<Language, string>;
  residentId?: string;
  staffId?: string;
  region: Region;
  regulatoryBody: CalendarEvent['regulatoryBody'];
  regulatoryRequirements?: CalendarEvent['regulatoryRequirements'];
  recurrence?: CalendarEvent['recurrence'];
  category?: CalendarEvent['category'];
  priority: CalendarEvent['priority'];
  attachments?: Omit<CalendarEvent['attachments'][0], 'id' | 'uploadedAt' | 'uploadedBy'>[];
  notifications?: Omit<CalendarEvent['notifications'][0], 'sent' | 'sentAt'>[];
  facilityId: string;
  departmentId?: string;
  metadata?: Record<string, any>;
} 