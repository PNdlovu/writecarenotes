export interface Resident {
  id: string;
  name: string;
  dateOfBirth: string;
  room: string;
  careLevel: 'High Care' | 'Medium Care' | 'Low Care';
  status: 'Active' | 'Temporary Leave' | 'Discharged';
  admissionDate: string;
  medicalHistory?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes?: string;
}

export interface CreateResidentData {
  name: string;
  dateOfBirth: string;
  room: string;
  careLevel: Resident['careLevel'];
  status: Resident['status'];
  admissionDate: string;
  medicalHistory?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  notes?: string;
}
