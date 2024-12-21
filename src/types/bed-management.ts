/**
 * WriteCareNotes.com
 * @fileoverview Bed Management Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Phibu Cloud Solutions Ltd.
 */

export interface BedStatus {
  id: string
  number: string
  status: 'OCCUPIED' | 'AVAILABLE' | 'MAINTENANCE' | 'CLEANING'
  resident?: {
    id: string
    name: string
  }
  lastUpdated: Date
}

export interface OccupancyMetric {
  total: number
  occupied: number
  available: number
  maintenance: number
  occupancyRate: number
  trend: {
    period: string
    rate: number
  }[]
}

export interface MaintenanceRecord {
  id: string
  bedId: string
  type: 'ROUTINE' | 'REPAIR' | 'DEEP_CLEAN'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
  scheduledDate: Date
  completedDate?: Date
  notes?: string
} 