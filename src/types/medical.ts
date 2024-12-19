export interface MedicalRecord {
  id: string;
  type: string;
  date: string;
  provider: string;
  description: string;
  status: string;
}

export interface MedicationStock {
  quantity: number;
  unit: string;
  reorderLevel: number;
}

export interface MedicationAdministration {
  id: string;
  givenAt: Date;
  givenBy: string;
  dosage: string;
  notes?: string | null;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date | null;
  endDate: Date | null;
  prescribedBy: string;
  status: 'Active' | 'Inactive';
  stock: MedicationStock | null;
  recentAdministrations: MedicationAdministration[];
}

export interface MedicalRecordsResponse {
  medications: Medication[];
  records: MedicalRecord[];
}


