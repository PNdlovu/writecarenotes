/**
 * @writecarenotes.com
 * @fileoverview OnCall Types Definitions
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Type definitions for the OnCall module including interfaces
 * for calls, staff, schedules, compliance, and recordings.
 * Includes enums for statuses and priorities.
 */

// Region types
export type Region = 'england' | 'wales' | 'scotland' | 'northern_ireland' | 'ireland';

// Call related types
export type CallPriority = 'low' | 'normal' | 'high' | 'emergency';
export type CallStatus = 'pending' | 'active' | 'completed' | 'missed' | 'emergency';

export interface Call {
  id: string;
  phoneNumber: string;
  region: Region;
  priority: CallPriority;
  status: CallStatus;
  startTime: Date;
  endTime?: Date;
  staffId?: string;
  recordingId?: string;
  notes?: string;
  metadata: {
    deviceInfo?: string;
    location?: string;
    emergencyType?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Staff related types
export type StaffStatus = 'available' | 'on_call' | 'busy' | 'offline' | 'emergency';
export type StaffRole = 'nurse' | 'doctor' | 'care_worker' | 'manager' | 'emergency';

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  region: Region;
  status: StaffStatus;
  role: StaffRole;
  qualifications: string[];
  schedule: Schedule[];
  metadata: {
    languages?: string[];
    specialties?: string[];
    certifications?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Schedule related types
export type ScheduleType = 'regular' | 'on_call' | 'emergency' | 'backup';
export type ScheduleStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Schedule {
  id: string;
  staffId: string;
  type: ScheduleType;
  status: ScheduleStatus;
  startTime: Date;
  endTime: Date;
  region: Region;
  metadata: {
    notes?: string;
    coverage?: string;
    rotation?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Recording related types
export type RecordingStatus = 'pending' | 'active' | 'completed' | 'failed';
export type RecordingType = 'audio' | 'video' | 'transcript';

export interface Recording {
  id: string;
  callId: string;
  type: RecordingType;
  status: RecordingStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  fileUrl: string;
  transcriptionUrl?: string;
  metadata: {
    format?: string;
    size?: number;
    quality?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Compliance related types
export type ComplianceStatus = 'pending' | 'compliant' | 'non_compliant' | 'review_required';
export type ComplianceType = 'call' | 'staff' | 'schedule' | 'recording';

export interface Compliance {
  id: string;
  type: ComplianceType;
  status: ComplianceStatus;
  region: Region;
  referenceId: string;
  requirements: string[];
  violations?: string[];
  metadata: {
    reviewer?: string;
    reviewDate?: Date;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Audit related types
export type AuditAction = 'create' | 'update' | 'delete' | 'view';
export type AuditResource = 'call' | 'staff' | 'schedule' | 'recording' | 'compliance';

export interface AuditLog {
  id: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  userId: string;
  region: Region;
  metadata: {
    changes?: Record<string, any>;
    reason?: string;
    ip?: string;
  };
  createdAt: Date;
}

// Report related types
export type ReportType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type ReportStatus = 'pending' | 'generated' | 'failed';

export interface Report {
  id: string;
  type: ReportType;
  status: ReportStatus;
  region: Region;
  startDate: Date;
  endDate: Date;
  data: {
    calls?: number;
    emergencies?: number;
    staffUtilization?: number;
    complianceRate?: number;
  };
  metadata: {
    generator?: string;
    format?: string;
    size?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Filter types for queries
export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

export interface CallFilter extends DateRangeFilter {
  region?: Region;
  status?: CallStatus;
  priority?: CallPriority;
  staffId?: string;
}

export interface StaffFilter extends DateRangeFilter {
  region?: Region;
  status?: StaffStatus;
  role?: StaffRole;
}

export interface ScheduleFilter extends DateRangeFilter {
  region?: Region;
  type?: ScheduleType;
  status?: ScheduleStatus;
  staffId?: string;
}

export interface RecordingFilter extends DateRangeFilter {
  callId?: string;
  type?: RecordingType;
  status?: RecordingStatus;
}

export interface ComplianceFilter extends DateRangeFilter {
  region?: Region;
  type?: ComplianceType;
  status?: ComplianceStatus;
}

export interface AuditFilter extends DateRangeFilter {
  region?: Region;
  action?: AuditAction;
  resource?: AuditResource;
  userId?: string;
}

// Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    timestamp: Date;
    region?: Region;
    version?: string;
  };
} 