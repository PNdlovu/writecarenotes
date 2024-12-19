/**
 * @fileoverview Assessment error types and handling
 * @version 1.0.0
 * @created 2024-03-21
 * @author Write Care Notes Team
 * @copyright Write Care Notes Ltd
 */

import { t } from '@/lib/i18n';

/**
 * Enumeration of all possible assessment error codes
 * @readonly
 */
export enum AssessmentErrorCode {
  // Not Found Errors
  NOT_FOUND = 'ASSESSMENT.NOT_FOUND',
  TEMPLATE_NOT_FOUND = 'ASSESSMENT.TEMPLATE_NOT_FOUND',
  SECTION_NOT_FOUND = 'ASSESSMENT.SECTION_NOT_FOUND',
  
  // Status Errors
  INVALID_STATUS = 'ASSESSMENT.INVALID_STATUS',
  INVALID_TRANSITION = 'ASSESSMENT.INVALID_TRANSITION',
  
  // Validation Errors
  VALIDATION_ERROR = 'ASSESSMENT.VALIDATION_ERROR',
  REQUIRED_FIELD_MISSING = 'ASSESSMENT.REQUIRED_FIELD_MISSING',
  INVALID_DATE = 'ASSESSMENT.INVALID_DATE',
  INVALID_ANSWER_TYPE = 'ASSESSMENT.INVALID_ANSWER_TYPE',
  
  // Permission Errors
  UNAUTHORIZED = 'ASSESSMENT.UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS = 'ASSESSMENT.INSUFFICIENT_PERMISSIONS',
  
  // Business Logic Errors
  DUPLICATE_ASSESSMENT = 'ASSESSMENT.DUPLICATE',
  INCOMPLETE_ASSESSMENT = 'ASSESSMENT.INCOMPLETE',
  WITNESS_REQUIRED = 'ASSESSMENT.WITNESS_REQUIRED',
  ATTACHMENTS_REQUIRED = 'ASSESSMENT.ATTACHMENTS_REQUIRED',
  LOCKED_FOR_EDITING = 'ASSESSMENT.LOCKED_FOR_EDITING',
  
  // System Errors
  SYSTEM_ERROR = 'ASSESSMENT.SYSTEM_ERROR',
  NETWORK_ERROR = 'ASSESSMENT.NETWORK_ERROR',
  DATABASE_ERROR = 'ASSESSMENT.DATABASE_ERROR'
}

/**
 * Custom error class for assessment-related errors
 * Includes support for i18n and error tracking
 */
export class AssessmentError extends Error {
  constructor(
    public code: AssessmentErrorCode,
    public params?: Record<string, any>,
    public cause?: Error
  ) {
    super(t(`errors.${code}`, params));
    this.name = 'AssessmentError';
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AssessmentError);
    }
  }

  /**
   * Get localized error message
   */
  public getLocalizedMessage(): string {
    return t(`errors.${this.code}`, this.params);
  }

  /**
   * Convert error to JSON for logging
   */
  public toJSON(): Record<string, any> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      localizedMessage: this.getLocalizedMessage(),
      params: this.params,
      cause: this.cause?.message,
      stack: this.stack
    };
  }
}


