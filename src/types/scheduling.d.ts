import { Staff, Organization, Document } from '@prisma/client'

// Shift Patterns
export interface ShiftPattern {
  id: string
  name: string
  description?: string
  organizationId: string
  createdAt: Date
  updatedAt: Date
  organization?: Organization
  staffAssignments?: StaffShiftAssignment[]
  shifts?: Shift[]
}

export interface StaffShiftAssignment {
  id: string
  staffId: string
  shiftPatternId: string
  startDate: Date
  endDate?: Date
  createdAt: Date
  updatedAt: Date
  staff?: Staff
  shiftPattern?: ShiftPattern
}

export interface Shift {
  id: string
  shiftPatternId: string
  dayOfWeek: number // 0-6 for Sunday-Saturday
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  minimumStaff: number
  preferredStaff: number
  notes?: string
  createdAt: Date
  updatedAt: Date
  shiftPattern?: ShiftPattern
  breaks?: StaffBreak[]
}

// Staff Breaks
export interface StaffBreak {
  id: string
  shiftId: string
  staffId: string
  plannedStart: Date
  plannedEnd: Date
  actualStart?: Date
  actualEnd?: Date
  status: BreakStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
  shift?: Shift
  staff?: Staff
}

export enum BreakStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  MISSED = 'MISSED',
  CANCELLED = 'CANCELLED'
}

// Staff Availability
export interface StaffAvailability {
  id: string
  staffId: string
  organizationId: string
  date: Date
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  availabilityType: AvailabilityType
  notes?: string
  recurringPatternId?: string
  createdAt: Date
  updatedAt: Date
  staff?: Staff
  organization?: Organization
  recurringPattern?: AvailabilityPattern
}

export enum AvailabilityType {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  PREFERRED = 'PREFERRED'
}

export interface AvailabilityPattern {
  id: string
  staffId: string
  organizationId: string
  dayOfWeek: number // 0-6 for Sunday-Saturday
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  repeatFrequency: RepeatFrequency
  startDate: Date
  endDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
  staff?: Staff
  organization?: Organization
}

export enum RepeatFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY'
}

// Leave Requests
export interface LeaveRequest {
  id: string
  staffId: string
  organizationId: string
  startDate: Date
  endDate: Date
  leaveType: LeaveType
  status: LeaveStatus
  reason?: string
  notes?: string
  durationInDays: number
  approverId?: string
  approvedAt?: Date
  documents?: Document[]
  createdAt: Date
  updatedAt: Date
  staff?: Staff
  approver?: Staff
  organization?: Organization
}

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  COMPASSIONATE = 'COMPASSIONATE',
  UNPAID = 'UNPAID',
  OTHER = 'OTHER'
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

// Request/Response Types
export interface CreateShiftPatternRequest {
  name: string
  description?: string
  shifts: Omit<Shift, 'id' | 'shiftPatternId' | 'createdAt' | 'updatedAt'>[]
  staffAssignments?: Omit<StaffShiftAssignment, 'id' | 'shiftPatternId' | 'createdAt' | 'updatedAt'>[]
}

export interface UpdateShiftPatternRequest {
  id: string
  name?: string
  description?: string
  shifts?: Partial<Shift>[]
  staffAssignments?: Partial<StaffShiftAssignment>[]
}

export interface CreateAvailabilityRequest {
  staffId: string
  dates: string[] // ISO date strings
  startTime: string
  endTime: string
  availabilityType: AvailabilityType
  notes?: string
  recurringPattern?: Omit<AvailabilityPattern, 'id' | 'staffId' | 'organizationId' | 'createdAt' | 'updatedAt'>
}

export interface CreateLeaveRequestRequest {
  staffId: string
  startDate: string // ISO date string
  endDate: string // ISO date string
  leaveType: LeaveType
  reason?: string
  notes?: string
  documents?: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>[]
}

export interface UpdateLeaveRequestRequest {
  id: string
  startDate?: string
  endDate?: string
  leaveType?: LeaveType
  status?: LeaveStatus
  reason?: string
  notes?: string
  approverId?: string
  documents?: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>[]
} 


