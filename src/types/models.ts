export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  FAMILY = 'FAMILY',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum ResidentStatus {
  ACTIVE = 'ACTIVE',
  TEMPORARY_LEAVE = 'TEMPORARY_LEAVE',
  HOSPITAL = 'HOSPITAL',
  DISCHARGED = 'DISCHARGED',
  DECEASED = 'DECEASED'
}

export enum CarePlanType {
  PERSONAL_CARE = 'PERSONAL_CARE',
  MEDICAL = 'MEDICAL',
  DIETARY = 'DIETARY',
  MOBILITY = 'MOBILITY',
  SOCIAL = 'SOCIAL'
}

export enum CarePlanStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED'
}

export enum MedicationStatus {
  SCHEDULED = 'SCHEDULED',
  ADMINISTERED = 'ADMINISTERED',
  MISSED = 'MISSED',
  DISCONTINUED = 'DISCONTINUED'
}

export enum StaffRole {
  CARE_MANAGER = 'CARE_MANAGER',
  NURSE = 'NURSE',
  CARE_WORKER = 'CARE_WORKER',
  ACTIVITIES_COORDINATOR = 'ACTIVITIES_COORDINATOR'
}

export enum ShiftStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ParticipationStatus {
  SCHEDULED = 'SCHEDULED',
  ATTENDED = 'ATTENDED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED'
}

export enum CareLevel {
  INDEPENDENT = 'INDEPENDENT',
  LOW_ASSISTANCE = 'LOW_ASSISTANCE',
  MODERATE_ASSISTANCE = 'MODERATE_ASSISTANCE',
  HIGH_ASSISTANCE = 'HIGH_ASSISTANCE',
  TOTAL_ASSISTANCE = 'TOTAL_ASSISTANCE'
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  country: 'UK' | 'IE';
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  password: string;
  role: UserRole;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  roomNumber?: string;
  admissionDate: Date;
  status: ResidentStatus;
  organizationId: string;
  careLevel: CareLevel;
  gpId: string;
  dietaryNeeds?: string;
  allergies?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarePlan {
  id: string;
  residentId: string;
  organizationId: string;
  type: CarePlanType;
  details: Record<string, any>;
  startDate: Date;
  endDate?: Date;
  status: CarePlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  residentId: string;
  organizationId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  status: MedicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: StaffRole;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Shift {
  id: string;
  staffId: string;
  organizationId: string;
  startTime: Date;
  endTime: Date;
  status: ShiftStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityParticipant {
  id: string;
  activityId: string;
  residentId: string;
  status: ParticipationStatus;
  createdAt: Date;
  updatedAt: Date;
}


