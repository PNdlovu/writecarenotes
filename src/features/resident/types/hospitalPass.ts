import { Resident } from './resident';

export interface HospitalPass {
  id: string;
  residentId: string;
  resident?: Resident;
  hospitalName: string;
  department?: string;
  appointmentDateTime: Date;
  expectedReturnDateTime?: Date;
  reason: string;
  accompaniedBy?: string;
  transportMethod: 'AMBULANCE' | 'PRIVATE' | 'TAXI' | 'OTHER';
  transportNotes?: string;
  medications?: boolean;
  medicationNotes?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface CreateHospitalPassInput {
  residentId: string;
  hospitalName: string;
  department?: string;
  appointmentDateTime: Date;
  expectedReturnDateTime?: Date;
  reason: string;
  accompaniedBy?: string;
  transportMethod: HospitalPass['transportMethod'];
  transportNotes?: string;
  medications?: boolean;
  medicationNotes?: string;
}

export interface UpdateHospitalPassInput extends Partial<CreateHospitalPassInput> {
  id: string;
  status?: HospitalPass['status'];
}
