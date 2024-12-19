// src/features/bed-management/api/validation.ts

import { z } from 'zod'
import { BedType, BedStatus, CareLevel, MaintenanceType, PriorityLevel } from '../types/bed.types'

export const bedSchema = z.object({
  id: z.string().uuid().optional(),
  number: z.string(),
  type: z.nativeEnum(BedType),
  status: z.nativeEnum(BedStatus),
  floor: z.number().int().positive(),
  wing: z.string(),
  features: z.array(z.string()),
  lastMaintenanceDate: z.date().optional(),
  nextMaintenanceDate: z.date().optional(),
  notes: z.string().optional(),
  careLevel: z.nativeEnum(CareLevel),
  isIsolation: z.boolean().default(false),
  hasOxygenSupply: z.boolean().default(false),
  hasCallBell: z.boolean().default(true),
  maxWeight: z.number().optional(),
  dimensions: z.object({
    length: z.number(),
    width: z.number(),
    height: z.number()
  }).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

export const bedAllocationSchema = z.object({
  bedId: z.string().uuid(),
  residentId: z.string().uuid(),
  startDate: z.date(),
  endDate: z.date().optional(),
  reason: z.string(),
  priority: z.nativeEnum(PriorityLevel),
  specialRequirements: z.array(z.string()).optional(),
  careLevelRequired: z.nativeEnum(CareLevel),
  medicalEquipmentNeeded: z.array(z.string()).optional(),
  dietaryRequirements: z.array(z.string()).optional(),
  mobilityAssistance: z.boolean().default(false),
  isolationRequired: z.boolean().default(false),
  approvedBy: z.string().uuid().optional(),
  notes: z.string().optional()
})

export const bedTransferSchema = z.object({
  sourceBedId: z.string().uuid(),
  targetBedId: z.string().uuid(),
  residentId: z.string().uuid(),
  scheduledDate: z.date(),
  reason: z.string(),
  priority: z.nativeEnum(PriorityLevel),
  requiresSpecialEquipment: z.boolean().default(false),
  equipmentDetails: z.array(z.string()).optional(),
  staffAssigned: z.array(z.string().uuid()).optional(),
  approvedBy: z.string().uuid().optional(),
  notes: z.string().optional()
})

export const bedMaintenanceSchema = z.object({
  bedId: z.string().uuid(),
  type: z.nativeEnum(MaintenanceType),
  scheduledDate: z.date(),
  completedDate: z.date().optional(),
  priority: z.nativeEnum(PriorityLevel),
  description: z.string(),
  partsRequired: z.array(z.string()).optional(),
  estimatedDuration: z.number().optional(), // in minutes
  actualDuration: z.number().optional(), // in minutes
  cost: z.number().optional(),
  assignedTo: z.string().uuid().optional(),
  inspectedBy: z.string().uuid().optional(),
  notes: z.string().optional(),
  images: z.array(z.string()).optional(), // URLs to maintenance images
  followUpRequired: z.boolean().default(false),
  followUpNotes: z.string().optional()
})

export const waitlistSchema = z.object({
  residentId: z.string().uuid(),
  preferredBedType: z.nativeEnum(BedType),
  priority: z.nativeEnum(PriorityLevel),
  requestDate: z.date(),
  careLevelRequired: z.nativeEnum(CareLevel),
  specialRequirements: z.array(z.string()).optional(),
  preferredFloor: z.number().optional(),
  preferredWing: z.string().optional(),
  medicalEquipmentNeeded: z.array(z.string()).optional(),
  notes: z.string().optional(),
  estimatedWaitTime: z.number().optional(), // in days
  status: z.enum(['ACTIVE', 'FULFILLED', 'CANCELLED']),
  fulfilledDate: z.date().optional(),
  assignedBedId: z.string().uuid().optional()
})


