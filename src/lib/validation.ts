/**
 * @fileoverview Validation Utilities
 * @version 1.0.0
 * @created 2024-12-12
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Utilities for data validation using Zod
 */

import { z } from 'zod';
import { DomainError } from './errors';

/**
 * Validates data against a Zod schema
 * @param schema Zod schema to validate against
 * @param data Data to validate
 * @throws {DomainError} If validation fails
 */
export async function validateSchema<T>(schema: z.Schema<T>, data: unknown): Promise<T> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new DomainError(
        'Validation failed',
        'VALIDATION_ERROR',
        {
          errors: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        }
      );
    }
    throw error;
  }
}

/**
 * Validates a date range
 * @param from Start date
 * @param to End date
 * @throws {DomainError} If validation fails
 */
export function validateDateRange(from: Date, to: Date): void {
  if (from > to) {
    throw new DomainError(
      'Invalid date range',
      'VALIDATION_ERROR',
      { message: 'Start date must be before end date' }
    );
  }
}

/**
 * Validates pagination parameters
 * @param page Page number
 * @param limit Items per page
 * @throws {DomainError} If validation fails
 */
export function validatePagination(page: number, limit: number): void {
  if (page < 1) {
    throw new DomainError(
      'Invalid page number',
      'VALIDATION_ERROR',
      { message: 'Page number must be greater than 0' }
    );
  }

  if (limit < 1 || limit > 100) {
    throw new DomainError(
      'Invalid page limit',
      'VALIDATION_ERROR',
      { message: 'Page limit must be between 1 and 100' }
    );
  }
}

/**
 * Validates an email address
 * @param email Email address to validate
 * @throws {DomainError} If validation fails
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new DomainError(
      'Invalid email address',
      'VALIDATION_ERROR',
      { message: 'Please provide a valid email address' }
    );
  }
}

/**
 * Validates a phone number
 * @param phone Phone number to validate
 * @throws {DomainError} If validation fails
 */
export function validatePhone(phone: string): void {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(phone)) {
    throw new DomainError(
      'Invalid phone number',
      'VALIDATION_ERROR',
      { message: 'Please provide a valid phone number' }
    );
  }
}


