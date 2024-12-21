/**
 * WriteCareNotes.com
 * @fileoverview Error Handling Module
 * @version 1.0.0
 */

export class BaseError extends Error {
  constructor(
    message: string,
    public code: string,
    public httpStatus: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication failed') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 'AUTHORIZATION_ERROR', 403);
  }
}

export class NotFoundError extends BaseError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND_ERROR', 404);
  }
}

export class ConflictError extends BaseError {
  constructor(message: string) {
    super(message, 'CONFLICT_ERROR', 409);
  }
}

export class TenantError extends BaseError {
  constructor(message: string) {
    super(message, 'TENANT_ERROR', 400);
  }
}

export class ComplianceError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, 'COMPLIANCE_ERROR', 400, details);
  }
}

export class OfflineError extends BaseError {
  constructor(message: string) {
    super(message, 'OFFLINE_ERROR', 503);
  }
}

export class DatabaseError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, 'DATABASE_ERROR', 500, details);
  }
}

export class IntegrationError extends BaseError {
  constructor(service: string, message: string, details?: any) {
    super(
      `Integration error with ${service}: ${message}`,
      'INTEGRATION_ERROR',
      502,
      details
    );
  }
}

export class RateLimitError extends BaseError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
  }
}

export class ConfigurationError extends BaseError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', 500);
  }
}

export class MaintenanceError extends BaseError {
  constructor(message: string = 'System is under maintenance') {
    super(message, 'MAINTENANCE_ERROR', 503);
  }
}

export function handleError(error: any): BaseError {
  if (error instanceof BaseError) {
    return error;
  }

  // Handle known error types
  if (error.name === 'SequelizeValidationError') {
    return new ValidationError('Database validation failed', error.errors);
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    return new ConflictError('Duplicate entry detected');
  }

  if (error.code === 'ECONNREFUSED') {
    return new DatabaseError('Database connection failed');
  }

  // Default error
  return new BaseError(
    error.message || 'An unexpected error occurred',
    'INTERNAL_SERVER_ERROR',
    500,
    process.env.NODE_ENV === 'development' ? error : undefined
  );
}

export function isOperationalError(error: Error): boolean {
  if (error instanceof BaseError) {
    return true;
  }
  return false;
}

export function logError(error: Error): void {
  console.error('Error:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...(error instanceof BaseError ? { code: error.code, details: error.details } : {}),
  });
}

export function errorHandler(error: Error, req: any, res: any, next: any): void {
  logError(error);

  if (error instanceof BaseError) {
    res.status(error.httpStatus).json(error.toJSON());
    return;
  }

  // Handle unknown errors
  const internalError = handleError(error);
  res.status(internalError.httpStatus).json(internalError.toJSON());
}


