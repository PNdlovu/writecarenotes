'use client'

import { useContext, createContext } from 'react'
import { CareHome, Staff, Resident } from '../types/organization.types'

interface CareHomeContextType {
  careHome: CareHome | null
  staff: Staff[]
  residents: Resident[]
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  updateCareHome: (data: Partial<CareHome>) => Promise<void>
  addStaffMember: (staff: Staff) => Promise<void>
  removeStaffMember: (staffId: string) => Promise<void>
  addResident: (resident: Resident) => Promise<void>
  removeResident: (residentId: string) => Promise<void>
  getComplianceStatus: () => Promise<{
    cqcCompliant: boolean
    lastInspectionDate: Date | null
    outstandingActions: number
  }>
}

export const CareHomeContext = createContext<CareHomeContextType>({
  careHome: null,
  staff: [],
  residents: [],
  isLoading: true,
  error: null,
  refetch: async () => {},
  updateCareHome: async () => {},
  addStaffMember: async () => {},
  removeStaffMember: async () => {},
  addResident: async () => {},
  removeResident: async () => {},
  getComplianceStatus: async () => ({
    cqcCompliant: false,
    lastInspectionDate: null,
    outstandingActions: 0
  }),
})

export function useCareHome() {
  const context = useContext(CareHomeContext)
  if (context === undefined) {
    throw new Error('useCareHome must be used within a CareHomeProvider')
  }
  return context
}


