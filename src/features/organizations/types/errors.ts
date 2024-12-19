/**
 * @fileoverview Organization Error Types
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

export class OrganizationError extends Error {
  constructor(
    message: string,
    public code: OrganizationErrorCode,
    public context?: Record<string, any>
  ) {
    super(message)
    this.name = 'OrganizationError'
  }
}

export enum OrganizationErrorCode {
  // Validation Errors
  INVALID_DATA = 'INVALID_DATA',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  INVALID_SETTINGS = 'INVALID_SETTINGS',
  
  // Access Errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TENANT_MISMATCH = 'TENANT_MISMATCH',
  
  // Resource Errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  
  // Regional Errors
  UNSUPPORTED_REGION = 'UNSUPPORTED_REGION',
  UNSUPPORTED_LANGUAGE = 'UNSUPPORTED_LANGUAGE',
  INVALID_REGULATORY_BODY = 'INVALID_REGULATORY_BODY',
  
  // Compliance Errors
  LICENSE_EXPIRED = 'LICENSE_EXPIRED',
  COMPLIANCE_VIOLATION = 'COMPLIANCE_VIOLATION',
  AUDIT_REQUIRED = 'AUDIT_REQUIRED',
  
  // Billing Errors
  PAYMENT_REQUIRED = 'PAYMENT_REQUIRED',
  SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED',
  PLAN_LIMIT_EXCEEDED = 'PLAN_LIMIT_EXCEEDED',
  
  // Offline Errors
  SYNC_FAILED = 'SYNC_FAILED',
  STORAGE_LIMIT_EXCEEDED = 'STORAGE_LIMIT_EXCEEDED',
  OFFLINE_DISABLED = 'OFFLINE_DISABLED',
  
  // System Errors
  DATABASE_ERROR = 'DATABASE_ERROR',
  CACHE_ERROR = 'CACHE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}

export class OrganizationValidationError extends OrganizationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, OrganizationErrorCode.INVALID_DATA, context)
    this.name = 'OrganizationValidationError'
  }
}

export class OrganizationNotFoundError extends OrganizationError {
  constructor(organizationId: string) {
    super(
      `Organization not found: ${organizationId}`,
      OrganizationErrorCode.NOT_FOUND,
      { organizationId }
    )
    this.name = 'OrganizationNotFoundError'
  }
}

export class OrganizationAccessError extends OrganizationError {
  constructor(message: string, code: OrganizationErrorCode, context?: Record<string, any>) {
    super(message, code, context)
    this.name = 'OrganizationAccessError'
  }
}

export class OrganizationComplianceError extends OrganizationError {
  constructor(message: string, code: OrganizationErrorCode, context?: Record<string, any>) {
    super(message, code, context)
    this.name = 'OrganizationComplianceError'
  }
}

export class OrganizationBillingError extends OrganizationError {
  constructor(message: string, code: OrganizationErrorCode, context?: Record<string, any>) {
    super(message, code, context)
    this.name = 'OrganizationBillingError'
  }
}

export class OrganizationOfflineError extends OrganizationError {
  constructor(message: string, code: OrganizationErrorCode, context?: Record<string, any>) {
    super(message, code, context)
    this.name = 'OrganizationOfflineError'
  }
} 


