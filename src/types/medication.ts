import { Medication, Resident, MedicationStatus } from '@prisma/client'

export type MedicationWithResident = {
  id: string
  residentId: string
  organizationId: string
  name: string
  dosage: string
  frequency: string
  startDate: Date
  endDate?: Date | null
  status: MedicationStatus
  createdAt: Date
  updatedAt: Date
  resident: {
    firstName: string
    lastName: string
    roomNumber: string | null
  }
}

export interface MedicationFormData {
  residentId: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate?: string
}


