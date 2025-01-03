/**
 * @writecarenotes.com
 * @fileoverview OnCall Module Types
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 */

export type Region = 'england' | 'wales' | 'scotland' | 'northern_ireland' | 'ireland';

export interface StaffMember {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  qualifications: string[];
  availability: StaffAvailability;
  status: StaffStatus;
  emergencyContact: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffAvailability {
  schedule: {
    startTime: Date;
    endTime: Date;
  }[];
  exceptions: {
    startTime: Date;
    endTime: Date;
    reason: string;
  }[];
  preferences: {
    maxShiftsPerWeek?: number;
    preferredShiftLength?: number;
    preferredDays?: string[];
  };
}

export type StaffStatus = 'available' | 'on_call' | 'busy' | 'offline' | 'emergency';

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isBackupStaff?: boolean;
}

export interface Call {
  id: string;
  organizationId: string;
  phoneNumber: string;
  region: Region;
  status: CallStatus;
  priority: CallPriority;
  staffId?: string;
  recordingId?: string;
  notes?: string;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CallStatus = 'pending' | 'active' | 'completed' | 'missed' | 'emergency';
export type CallPriority = 'low' | 'normal' | 'high' | 'emergency';

export interface Recording {
  id: string;
  callId: string;
  organizationId: string;
  status: RecordingStatus;
  url?: string;
  duration?: number;
  startTime: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type RecordingStatus = 'recording' | 'completed' | 'failed' | 'deleted';

export interface Schedule {
  id: string;
  organizationId: string;
  staffId: string;
  type: ScheduleType;
  startTime: Date;
  endTime: Date;
  status: ScheduleStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ScheduleType = 'regular' | 'on_call' | 'backup' | 'emergency';
export type ScheduleStatus = 'draft' | 'published' | 'active' | 'completed' | 'cancelled';

export interface ComplianceResult {
  valid: boolean;
  score: number;
  issues: ComplianceIssue[];
  recommendations?: string[];
  timestamp: Date;
}

export interface ComplianceIssue {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  regulation?: string;
  suggestedFix?: string;
}

export interface ComplianceReport {
  id: string;
  organizationId: string;
  period: {
    start: Date;
    end: Date;
  };
  results: ComplianceResult[];
  summary: {
    totalIssues: number;
    criticalIssues: number;
    overallScore: number;
  };
  createdAt: Date;
}

export interface DateRange {
  start: Date;
  end: Date;
} 