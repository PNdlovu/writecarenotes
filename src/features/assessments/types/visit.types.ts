import { CARE_SETTING } from './assessment.types';

export enum VISIT_STATUS {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  MISSED = 'MISSED'
}

export enum VISIT_TYPE {
  INITIAL_ASSESSMENT = 'INITIAL_ASSESSMENT',
  FOLLOW_UP = 'FOLLOW_UP',
  REVIEW = 'REVIEW',
  EMERGENCY = 'EMERGENCY',
  ROUTINE = 'ROUTINE'
}

export interface VisitWindow {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  preferredDays: string[]; // Monday, Tuesday, etc.
}

export interface Visit {
  id: string;
  assessmentId: string;
  residentId: string;
  assessorId: string;
  visitType: VISIT_TYPE;
  status: VISIT_STATUS;
  scheduledDateTime: Date;
  estimatedDuration: number; // in minutes
  actualStartTime?: Date;
  actualEndTime?: Date;
  careSetting: CARE_SETTING;
  location: {
    address: string;
    postcode: string;
    accessNotes?: string;
  };
  notes?: string;
  requirements?: string[];
  mobileEquipmentNeeded?: string[];
  previousVisitId?: string;
  cancelReason?: string;
  rescheduleCount?: number;
}

export interface VisitPreferences {
  preferredTimes: VisitWindow[];
  blackoutDates?: Date[];
  specialRequirements?: string[];
  preferredAssessors?: string[];
  communicationPreferences?: {
    reminderType: 'SMS' | 'EMAIL' | 'PHONE' | 'NONE';
    reminderSchedule: number; // hours before visit
    alternativeContact?: {
      name: string;
      relationship: string;
      phone?: string;
      email?: string;
    };
  };
}

export interface VisitMetrics {
  totalScheduled: number;
  completed: number;
  cancelled: number;
  missed: number;
  averageDuration: number;
  onTimePercentage: number;
  satisfactionScore?: number;
}
