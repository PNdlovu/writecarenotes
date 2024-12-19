/**
 * Bed Management Feature
 * @module features/bed-management
 */

// Export components
export * from './components/lists/BedList'
export * from './components/details/BedDetails'
export * from './components/forms/BedForm'

// Export services
export * from './services'

// Export hooks
export * from './hooks/useFeature'
export * from './hooks/useActions'
export * from './hooks/useBedManagement'
export * from './hooks/useBedMaintenance'
export * from './hooks/useBedTransfer'

// Export API types
export * from './api/types'

// Export domain types
export * from './types/bed.types'
export * from './types/errors'

// Export constants
export * from './constants'

// Re-export common types for convenience
export type {
  BedAllocationOptions,
  BedMaintenanceSchedule,
  BedTransferRequest,
  WaitlistEntry,
  BedStatus,
  BedType,
  BedOccupancyStats
} from './types/bed.types'


