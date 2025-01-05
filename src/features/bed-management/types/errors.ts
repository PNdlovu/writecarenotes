import { AppError } from '@/lib/errors'

export enum BedErrorCode {
  // Validation Errors
  INVALID_DATA = 'VALIDATION_ERROR',
  INVALID_STATUS_TRANSITION = 'INVALID_TRANSFER',
  INVALID_ASSIGNMENT = 'INVALID_TRANSFER',
  
  // Resource Errors
  NOT_FOUND = 'BED_NOT_FOUND',
  ALREADY_EXISTS = 'BED_ALREADY_EXISTS',
  ROOM_CAPACITY_EXCEEDED = 'ROOM_CAPACITY_EXCEEDED',
  
  // Occupancy Errors
  BED_OCCUPIED = 'BED_NOT_AVAILABLE',
  BED_RESERVED = 'BED_NOT_AVAILABLE',
  BED_UNAVAILABLE = 'BED_NOT_AVAILABLE',
  
  // Maintenance Errors
  MAINTENANCE_REQUIRED = 'MAINTENANCE_IN_PROGRESS',
  CLEANING_REQUIRED = 'MAINTENANCE_IN_PROGRESS',
  
  // System Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR'
}

export class BedError extends AppError {
  constructor(
    code: string,
    message: string,
    public context?: Record<string, any>
  ) {
    super(code, message)
    this.name = 'BedError'
  }
}

export class BedNotFoundError extends BedError {
  constructor(bedId: string) {
    super(BedErrorCode.NOT_FOUND, `Bed with ID ${bedId} not found`, { bedId })
  }
}

export class BedNotAvailableError extends BedError {
  constructor(bedId: string, currentStatus: string) {
    super(BedErrorCode.BED_OCCUPIED, `Bed ${bedId} is not available (current status: ${currentStatus})`, { bedId, currentStatus })
  }
}

export class InvalidTransferError extends BedError {
  constructor(message: string) {
    super(BedErrorCode.INVALID_STATUS_TRANSITION, message)
  }
}

export class MaintenanceInProgressError extends BedError {
  constructor(bedId: string) {
    super(BedErrorCode.MAINTENANCE_REQUIRED, `Bed ${bedId} is currently under maintenance`, { bedId })
  }
}

export class WaitlistEntryNotFoundError extends BedError {
  constructor(entryId: string) {
    super('WAITLIST_ENTRY_NOT_FOUND', `Waitlist entry ${entryId} not found`, { entryId })
  }
}

export class InvalidMaintenanceStateError extends BedError {
  constructor(maintenanceId: string, currentState: string, expectedState: string) {
    super(
      'INVALID_MAINTENANCE_STATE',
      `Maintenance ${maintenanceId} is in ${currentState} state, expected ${expectedState}`,
      { maintenanceId, currentState, expectedState }
    )
  }
}

export class InvalidTransferStateError extends BedError {
  constructor(transferId: string, currentState: string, expectedState: string) {
    super(
      'INVALID_TRANSFER_STATE',
      `Transfer ${transferId} is in ${currentState} state, expected ${expectedState}`,
      { transferId, currentState, expectedState }
    )
  }
}

export class UnauthorizedOperationError extends BedError {
  constructor(operation: string, reason: string) {
    super('UNAUTHORIZED_OPERATION', `Unauthorized to perform ${operation}: ${reason}`, { operation, reason })
  }
}

export class ValidationError extends BedError {
  constructor(message: string) {
    super(BedErrorCode.INVALID_DATA, message)
  }
}

export class ConcurrentOperationError extends BedError {
  constructor(operation: string, resourceId: string) {
    super(
      'CONCURRENT_OPERATION',
      `Cannot perform ${operation} on ${resourceId} due to concurrent operation`,
      { operation, resourceId }
    )
  }
}


