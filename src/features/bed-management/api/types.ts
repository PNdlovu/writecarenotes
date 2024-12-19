// src/features/bed-management/api/types.ts

import type { z } from 'zod'
import type { 
  bedSchema, 
  bedAllocationSchema, 
  bedTransferSchema, 
  bedMaintenanceSchema,
  waitlistSchema
} from './validation'

// API Request/Response Types
export type BedRequest = z.infer<typeof bedSchema>
export type BedResponse = z.infer<typeof bedSchema> & {
  currentOccupant?: {
    id: string
    name: string
    admissionDate: Date
    careLevelRequired: string
  }
}

export type BedAllocationRequest = z.infer<typeof bedAllocationSchema>
export type BedAllocationResponse = z.infer<typeof bedAllocationSchema> & {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewer?: {
    id: string
    name: string
    role: string
  }
  reviewDate?: Date
  reviewNotes?: string
}

export type BedTransferRequest = z.infer<typeof bedTransferSchema>
export type BedTransferResponse = z.infer<typeof bedTransferSchema> & {
  id: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED'
  reviewer?: {
    id: string
    name: string
    role: string
  }
  reviewDate?: Date
  completionDate?: Date
  cancellationReason?: string
}

export type BedMaintenanceRequest = z.infer<typeof bedMaintenanceSchema>
export type BedMaintenanceResponse = z.infer<typeof bedMaintenanceSchema> & {
  id: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DELAYED'
  maintenanceStaff?: {
    id: string
    name: string
    specialization: string
  }
  inspector?: {
    id: string
    name: string
    certification: string
  }
  qualityScore?: number
  nextScheduledMaintenance?: Date
}

export type WaitlistRequest = z.infer<typeof waitlistSchema>
export type WaitlistResponse = z.infer<typeof waitlistSchema> & {
  id: string
  position: number
  resident: {
    id: string
    name: string
    currentBedId?: string
    currentCareLevel: string
  }
  estimatedAllocationDate?: Date
  lastUpdated: Date
}

// API Error Types
export interface BedAPIError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
  requestId?: string
  suggestedAction?: string
}

// API Success Response Types
export interface BedAPISuccess<T> {
  data: T
  metadata?: {
    timestamp: Date
    requestId: string
    processingTime: number
  }
}


