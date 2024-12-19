/**
 * @fileoverview Error Handling
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Custom error types and error handling utilities
 */

export type ErrorType =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONFLICT_ERROR'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'DATABASE_ERROR'
  | 'FAMILY_MEMBERS_RETRIEVAL_ERROR'
  | 'FAMILY_MEMBER_UPDATE_ERROR'
  | 'CARE_NOTES_RETRIEVAL_ERROR'
  | 'CARE_NOTE_CREATION_ERROR'
  | 'VISIT_SCHEDULING_ERROR'
  | 'VISITS_RETRIEVAL_ERROR'
  | 'DOCUMENT_UPLOAD_ERROR'
  | 'DOCUMENTS_RETRIEVAL_ERROR'
  | 'MEMORY_CREATION_ERROR'
  | 'MEMORIES_RETRIEVAL_ERROR'
  | 'EMERGENCY_CONTACTS_RETRIEVAL_ERROR'
  | 'EMERGENCY_CONTACT_UPDATE_ERROR'
  | 'CARE_TEAM_RETRIEVAL_ERROR'
  | 'CARE_TEAM_MEMBER_RETRIEVAL_ERROR'
  | 'VISIT_METRICS_RETRIEVAL_ERROR'
  | 'COMMUNICATION_METRICS_RETRIEVAL_ERROR'
  | 'FAMILY_ENGAGEMENT_METRICS_RETRIEVAL_ERROR';

export class DomainError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'DomainError';
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      type: this.type,
      cause: this.cause,
    };
  }
}

export function isOperationalError(error: Error): boolean {
  if (error instanceof DomainError) {
    return [
      'VALIDATION_ERROR',
      'AUTHENTICATION_ERROR',
      'AUTHORIZATION_ERROR',
      'NOT_FOUND_ERROR',
      'CONFLICT_ERROR',
    ].includes(error.type);
  }
  return false;
}

export function handleError(error: Error): void {
  if (isOperationalError(error)) {
    // Log operational error and continue
    console.error('Operational error:', error);
  } else {
    // Log programming or system error and crash
    console.error('System error:', error);
    process.exit(1);
  }
}

export function formatErrorResponse(error: Error) {
  if (error instanceof DomainError) {
    return {
      error: {
        type: error.type,
        message: error.message,
        details: error.cause,
      },
    };
  }

  // For unknown errors, return a generic error message
  return {
    error: {
      type: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
    },
  };
}


