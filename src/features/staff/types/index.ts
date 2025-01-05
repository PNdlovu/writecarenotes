// Staff Types
export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  department: string;
  startDate: string;
  status: StaffStatus;
}

export enum StaffRole {
  CAREGIVER = 'CAREGIVER',
  NURSE = 'NURSE',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
}

export enum StaffStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
}

// Training Types
export interface Training {
  id: string;
  title: string;
  description: string;
  category: TrainingCategory;
  format: TrainingFormat;
  duration: number;
  required: boolean;
}

export enum TrainingCategory {
  ONBOARDING = 'ONBOARDING',
  COMPLIANCE = 'COMPLIANCE',
  SKILLS = 'SKILLS',
  SAFETY = 'SAFETY',
}

export enum TrainingFormat {
  ONLINE = 'ONLINE',
  IN_PERSON = 'IN_PERSON',
  HYBRID = 'HYBRID',
}

export interface TrainingAssignment {
  id: string;
  staffId: string;
  trainingId: string;
  dueDate: string;
  status: TrainingStatus;
  progress: TrainingProgress;
}

export enum TrainingStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
}

export enum TrainingProgress {
  ZERO = 0,
  TWENTY_FIVE = 25,
  FIFTY = 50,
  SEVENTY_FIVE = 75,
  HUNDRED = 100,
}

// Scheduling Types
export interface StaffSchedule {
  id: string;
  staffId: string;
  startTime: string;
  endTime: string;
  shiftType: ShiftType;
  status: ScheduleStatus;
}

export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  NIGHT = 'NIGHT',
  CUSTOM = 'CUSTOM',
}

export enum ScheduleStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface ShiftSwap {
  id: string;
  requesterId: string;
  recipientId: string;
  scheduleId: string;
  status: SwapStatus;
  requestDate: string;
}

export enum SwapStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface TimeOffRequest {
  id: string;
  staffId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: TimeOffStatus;
}

export enum TimeOffStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}


