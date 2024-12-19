// src/features/carehome/types/staff.ts

export type StaffRole = 
  | 'CARE_MANAGER'
  | 'DEPUTY_MANAGER'
  | 'REGISTERED_NURSE'
  | 'SENIOR_CARER'
  | 'CARE_ASSISTANT'
  | 'ACTIVITIES_COORDINATOR'
  | 'PHYSIOTHERAPIST'
  | 'OCCUPATIONAL_THERAPIST'
  | 'CHEF'
  | 'KITCHEN_ASSISTANT'
  | 'HOUSEKEEPER'
  | 'MAINTENANCE'
  | 'ADMINISTRATOR'
  | 'RECEPTIONIST';

export type ShiftType = 
  | 'EARLY'
  | 'LATE'
  | 'NIGHT'
  | 'LONG_DAY'
  | 'RELIEF'
  | 'ON_CALL';

export interface StaffMember {
  id: string;
  userId: string;
  careHomeId: string;
  role: StaffRole;
  startDate: Date;
  contractType: 'FULL_TIME' | 'PART_TIME' | 'BANK' | 'AGENCY';
  hoursPerWeek: number;
  qualifications: Qualification[];
  training: TrainingRecord[];
  schedule: ShiftSchedule[];
  performance: PerformanceRecord[];
  documents: StaffDocument[];
}

export interface Qualification {
  id: string;
  name: string;
  institution: string;
  dateAchieved: Date;
  expiryDate?: Date;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'EXPIRED';
  document?: string;
}

export interface TrainingRecord {
  id: string;
  courseId: string;
  courseName: string;
  type: 'MANDATORY' | 'OPTIONAL' | 'PROFESSIONAL_DEVELOPMENT';
  completionDate: Date;
  expiryDate?: Date;
  score?: number;
  certificate?: string;
  provider: string;
}

export interface ShiftSchedule {
  id: string;
  date: Date;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  department: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface PerformanceRecord {
  id: string;
  date: Date;
  type: 'REVIEW' | 'INCIDENT' | 'COMMENDATION' | 'COMPLAINT';
  description: string;
  reviewer: string;
  rating?: number;
  goals: string[];
  followUpDate?: Date;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface StaffDocument {
  id: string;
  type: 'CONTRACT' | 'ID' | 'DBS' | 'REFERENCE' | 'TRAINING_CERT' | 'OTHER';
  title: string;
  uploadDate: Date;
  expiryDate?: Date;
  status: 'VALID' | 'EXPIRING' | 'EXPIRED';
  url: string;
}

export interface StaffingRequirement {
  id: string;
  shift: ShiftType;
  department: string;
  minimumStaff: number;
  requiredRoles: Array<{
    role: StaffRole;
    count: number;
  }>;
  specialRequirements?: string[];
}

export interface TimeOffRequest {
  id: string;
  staffId: string;
  startDate: Date;
  endDate: Date;
  type: 'HOLIDAY' | 'SICK' | 'PERSONAL' | 'TRAINING' | 'OTHER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  approvedBy?: string;
  approvalDate?: Date;
}


