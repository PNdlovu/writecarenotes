/**
 * @fileoverview Error handling utilities for the financial module
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import { ErrorResponse } from '../types';

export class ValidationError extends Error {
    public readonly code: string;
    public readonly details?: Record<string, any>;
    public readonly timestamp: Date;

    constructor(message: string, details?: Record<string, any>) {
        super(message);
        this.name = 'ValidationError';
        this.code = 'VALIDATION_ERROR';
        this.details = details;
        this.timestamp = new Date();
    }

    toResponse(): ErrorResponse {
        return {
            error: this.message,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}

export class ComplianceError extends Error {
    public readonly code: string;
    public readonly details: Record<string, any>;
    public readonly timestamp: Date;

    constructor(message: string, details: Record<string, any>) {
        super(message);
        this.name = 'ComplianceError';
        this.code = 'COMPLIANCE_ERROR';
        this.details = details;
        this.timestamp = new Date();
    }

    toResponse(): ErrorResponse {
        return {
            error: this.message,
            details: this.details,
            timestamp: this.timestamp
        };
    }
}

export class SystemError extends Error {
    public readonly code: string;
    public readonly cause?: Error;
    public readonly timestamp: Date;

    constructor(message: string, options?: { cause?: Error }) {
        super(message);
        this.name = 'SystemError';
        this.code = 'SYSTEM_ERROR';
        this.cause = options?.cause;
        this.timestamp = new Date();
    }

    toResponse(): ErrorResponse {
        return {
            error: this.message,
            details: this.cause ? {
                cause: this.cause.message,
                stack: process.env.NODE_ENV === 'development' ? this.cause.stack : undefined
            } : undefined,
            timestamp: this.timestamp
        };
    }
}

export class AuthorizationError extends Error {
    public readonly code: string;
    public readonly timestamp: Date;

    constructor(message: string) {
        super(message);
        this.name = 'AuthorizationError';
        this.code = 'AUTHORIZATION_ERROR';
        this.timestamp = new Date();
    }

    toResponse(): ErrorResponse {
        return {
            error: this.message,
            timestamp: this.timestamp
        };
    }
}

export class RegulatoryError extends Error {
    public readonly code: string;
    public readonly regulatoryBody: string;
    public readonly details: Record<string, any>;
    public readonly timestamp: Date;

    constructor(message: string, regulatoryBody: string, details: Record<string, any>) {
        super(message);
        this.name = 'RegulatoryError';
        this.code = 'REGULATORY_ERROR';
        this.regulatoryBody = regulatoryBody;
        this.details = details;
        this.timestamp = new Date();
    }

    toResponse(): ErrorResponse {
        return {
            error: this.message,
            details: {
                regulatoryBody: this.regulatoryBody,
                ...this.details
            },
            timestamp: this.timestamp
        };
    }
}

export function createErrorResponse(error: Error): ErrorResponse {
    if (error instanceof ValidationError ||
        error instanceof ComplianceError ||
        error instanceof SystemError ||
        error instanceof AuthorizationError ||
        error instanceof RegulatoryError) {
        return error.toResponse();
    }

    return {
        error: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? {
            name: error.name,
            message: error.message,
            stack: error.stack
        } : undefined,
        timestamp: new Date()
    };
}

export function isKnownError(error: Error): boolean {
    return error instanceof ValidationError ||
           error instanceof ComplianceError ||
           error instanceof SystemError ||
           error instanceof AuthorizationError ||
           error instanceof RegulatoryError;
}

export function enhanceError(error: Error, context: Record<string, any>): Error {
    const enhancedError = new Error(error.message);
    enhancedError.name = error.name;
    enhancedError.stack = error.stack;
    Object.assign(enhancedError, context);
    return enhancedError;
} 