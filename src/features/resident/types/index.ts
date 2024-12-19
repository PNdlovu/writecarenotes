import { CareLevel, ResidentStatus } from '@prisma/client';

export interface Resident {
  id: string;
  name: string;
  dateOfBirth: Date;
  nhsNumber?: string;
  careLevel: CareLevel;
  status: ResidentStatus;
  roomNumber?: string;
  admissionDate: Date;
  dischargeDate?: Date;
  careHomeId: string;
  carePlanId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResidentCreateDTO {
  name: string;
  dateOfBirth: Date;
  nhsNumber?: string;
  careLevel: CareLevel;
  roomNumber?: string;
  admissionDate: Date;
  careHomeId: string;
}

export interface ResidentUpdateDTO {
  name?: string;
  dateOfBirth?: Date;
  nhsNumber?: string;
  careLevel?: CareLevel;
  status?: ResidentStatus;
  roomNumber?: string;
  dischargeDate?: Date;
  carePlanId?: string;
}

export interface ResidentFilters {
  careHomeId?: string;
  status?: ResidentStatus;
  careLevel?: CareLevel;
  admissionDateFrom?: Date;
  admissionDateTo?: Date;
}


