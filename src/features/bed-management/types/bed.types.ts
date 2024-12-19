import { z } from 'zod'

// Priority levels for waitlist
export const priorityLevelSchema = z.enum([
  'URGENT',
  'HIGH',
  'MEDIUM',
  'LOW'
])

// Bed status with more granular states
export const bedStatusSchema = z.enum([
  'OCCUPIED',
  'AVAILABLE',
  'RESERVED',
  'MAINTENANCE',
  'CLEANING',
  'ISOLATION',
  'PENDING_TRANSFER',
  'BLOCKED'
])

export const bedTypeSchema = z.enum([
  'STANDARD',
  'BARIATRIC',
  'PROFILING',
  'LOW',
  'PRESSURE_RELIEF',
  'NURSING',
  'SPECIALIZED'
])

// Care level requirements
export const careLevelSchema = z.enum([
  'INDEPENDENT',
  'MINIMAL',
  'MODERATE',
  'HIGH',
  'INTENSIVE',
  'SPECIALIZED'
])

// Maintenance types
export const maintenanceTypeSchema = z.enum([
  'ROUTINE',
  'PREVENTIVE',
  'REPAIR',
  'DEEP_CLEANING',
  'INSPECTION',
  'EMERGENCY'
])

// Transfer reasons
export const transferReasonSchema = z.enum([
  'MEDICAL_NEED',
  'RESIDENT_REQUEST',
  'FACILITY_NEED',
  'CARE_LEVEL_CHANGE',
  'MAINTENANCE',
  'EMERGENCY'
])

// Bed features schema
export const bedFeaturesSchema = z.enum([
  'WINDOW',
  'ENSUITE',
  'NURSE_CALL',
  'TV',
  'PHONE',
  'WIFI',
  'HOIST',
  'OXYGEN',
  'AIR_CONDITIONING',
  'ADJUSTABLE_HEIGHT',
  'PRESSURE_MATTRESS',
  'BARIATRIC_EQUIPMENT'
])

// Maintenance schedule schema
export const maintenanceScheduleSchema = z.object({
  lastChecked: z.date(),
  nextDue: z.date(),
  type: maintenanceTypeSchema,
  assignedTo: z.string().uuid().optional(),
  issues: z.array(z.string()),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE']),
  notes: z.string().optional()
})

// Bed assignment schema
export const bedAssignmentSchema = z.object({
  residentId: z.string().uuid(),
  admissionDate: z.date(),
  expectedDepartureDate: z.date().optional(),
  careLevel: careLevelSchema,
  specialRequirements: z.array(z.string()),
  primaryCarer: z.string().uuid().optional(),
  notes: z.string().optional(),
  reviewDate: z.date().optional()
})

// Transfer request schema
export const transferRequestSchema = z.object({
  requestId: z.string().uuid(),
  fromBedId: z.string().uuid(),
  toBedId: z.string().uuid().optional(),
  residentId: z.string().uuid(),
  requestedBy: z.string().uuid(),
  requestDate: z.date(),
  reason: transferReasonSchema,
  priority: priorityLevelSchema,
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional(),
  approvedBy: z.string().uuid().optional(),
  approvalDate: z.date().optional(),
  scheduledDate: z.date().optional()
})

// Waitlist entry schema
export const waitlistEntrySchema = z.object({
  residentId: z.string().uuid(),
  requestDate: z.date(),
  priority: priorityLevelSchema,
  careLevel: careLevelSchema,
  preferredBedTypes: z.array(bedTypeSchema),
  specialRequirements: z.array(z.string()),
  status: z.enum(['ACTIVE', 'PLACED', 'CANCELLED', 'EXPIRED']),
  notes: z.string().optional(),
  estimatedPlacementDate: z.date().optional(),
  followUpDate: z.date().optional()
})

// Main bed schema
export const bedSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  careHomeId: z.string().uuid(),
  floor: z.string(),
  wing: z.string(),
  number: z.string(),
  type: bedTypeSchema,
  status: bedStatusSchema,
  features: z.array(bedFeaturesSchema),
  capacity: z.object({
    maxWeight: z.number().optional(),
    specialEquipment: z.array(z.string()).optional()
  }),
  maintenanceSchedule: maintenanceScheduleSchema.optional(),
  currentAssignment: bedAssignmentSchema.optional(),
  transferRequest: transferRequestSchema.optional(),
  notes: z.string().optional(),
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    createdBy: z.string().uuid(),
    updatedBy: z.string().uuid(),
    lastAuditDate: z.date().optional()
  })
})

// Statistics types
export const bedOccupancyStatsSchema = z.object({
  total: z.number(),
  occupied: z.number(),
  available: z.number(),
  reserved: z.number(),
  maintenance: z.number(),
  cleaning: z.number(),
  isolation: z.number(),
  pendingTransfer: z.number(),
  blocked: z.number(),
  occupancyRate: z.number(),
  maintenanceRate: z.number(),
  utilizationByType: z.record(z.string(), z.number()),
  averageLengthOfStay: z.number().optional(),
  turnoverRate: z.number().optional()
})

// Analytics Types
export interface BedOccupancyStats {
  totalBeds: number
  occupiedBeds: number
  occupancyRate: number
  averageWaitTime: number // in days
  byPriority: Record<string, number>
  byCareLevel: Record<string, number>
}

export interface BedMaintenanceStats {
  totalMaintenanceRequests: number
  completedMaintenance: number
  averageCompletionTime: number // in hours
  byType: Record<string, number>
  overdueCount: number
}

export interface BedTransferStats {
  totalTransfers: number
  completedTransfers: number
  averageProcessingTime: number // in hours
  byReason: Record<string, number>
  rejectionRate: number // percentage
}

// Notification Types
export type NotificationType = 
  | 'TRANSFER_REQUEST'
  | 'MAINTENANCE_DUE'
  | 'WAITLIST_MATCH'
  | 'BED_STATUS_CHANGE'
  | 'MAINTENANCE_COMPLETED'
  | 'TRANSFER_APPROVED'
  | 'TRANSFER_REJECTED'

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH'

// Audit Types
export type AuditableAction =
  | 'BED_CREATED'
  | 'BED_UPDATED'
  | 'BED_DELETED'
  | 'RESIDENT_ASSIGNED'
  | 'RESIDENT_REMOVED'
  | 'TRANSFER_REQUESTED'
  | 'TRANSFER_APPROVED'
  | 'TRANSFER_REJECTED'
  | 'TRANSFER_COMPLETED'
  | 'MAINTENANCE_SCHEDULED'
  | 'MAINTENANCE_STARTED'
  | 'MAINTENANCE_COMPLETED'
  | 'WAITLIST_ENTRY_CREATED'
  | 'WAITLIST_ENTRY_UPDATED'
  | 'WAITLIST_ENTRY_COMPLETED'

export interface AuditLogEntry {
  id: string
  action: AuditableAction
  bedId?: string
  residentId?: string
  transferId?: string
  maintenanceId?: string
  waitlistEntryId?: string
  performedById: string
  performedBy: {
    id: string
    name: string
    role: string
  }
  careHomeId: string
  tenantId: string
  beforeState: any
  afterState: any
  metadata: Record<string, any>
  createdAt: Date
  bed?: {
    id: string
    name: string
    type: string
  }
  resident?: {
    id: string
    name: string
  }
}

// Export types
export type PriorityLevel = z.infer<typeof priorityLevelSchema>
export type BedStatus = z.infer<typeof bedStatusSchema>
export type BedType = z.infer<typeof bedTypeSchema>
export type CareLevel = z.infer<typeof careLevelSchema>
export type MaintenanceType = z.infer<typeof maintenanceTypeSchema>
export type TransferReason = z.infer<typeof transferReasonSchema>
export type BedFeatures = z.infer<typeof bedFeaturesSchema>
export type MaintenanceSchedule = z.infer<typeof maintenanceScheduleSchema>
export type BedAssignment = z.infer<typeof bedAssignmentSchema>
export type TransferRequest = z.infer<typeof transferRequestSchema>
export type WaitlistEntry = z.infer<typeof waitlistEntrySchema>
export type Bed = z.infer<typeof bedSchema>
export type BedOccupancyStats = z.infer<typeof bedOccupancyStatsSchema>


