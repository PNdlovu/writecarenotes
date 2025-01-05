/**
 * WriteCareNotes.com
 * @fileoverview Waitlist Validation Utilities
 * @version 1.0.0
 * @created 2024-03-21
 * @author Phibu Cloud Solutions Ltd
 * @copyright Phibu Cloud Solutions Ltd
 */

import type { WaitlistEntry, WaitlistPriority, WaitlistStatus, CareNeed } from '../types';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateWaitlistEntry(data: Partial<WaitlistEntry>): ValidationResult {
  const errors: string[] = [];

  // Required fields
  if (!data.careHomeId) errors.push('Care home ID is required');
  if (!data.residentId) errors.push('Resident ID is required');
  if (!data.priority) errors.push('Priority is required');
  if (!data.status) errors.push('Status is required');
  if (!data.requestDate) errors.push('Request date is required');
  if (!data.careNeeds || data.careNeeds.length === 0) {
    errors.push('At least one care need is required');
  }

  // Priority validation
  if (data.priority && !isValidPriority(data.priority)) {
    errors.push('Invalid priority level');
  }

  // Status validation
  if (data.status && !isValidStatus(data.status)) {
    errors.push('Invalid status');
  }

  // Care needs validation
  if (data.careNeeds && !Array.isArray(data.careNeeds)) {
    errors.push('Care needs must be an array');
  } else if (data.careNeeds) {
    data.careNeeds.forEach(need => {
      if (!isValidCareNeed(need)) {
        errors.push(`Invalid care need: ${need}`);
      }
    });
  }

  // Date validations
  if (data.requestDate && !isValidDate(data.requestDate)) {
    errors.push('Invalid request date format');
  }
  if (data.preferredMoveInDate && !isValidDate(data.preferredMoveInDate)) {
    errors.push('Invalid preferred move-in date format');
  }
  if (data.preferredMoveInDate && data.requestDate) {
    const moveIn = new Date(data.preferredMoveInDate);
    const request = new Date(data.requestDate);
    if (moveIn < request) {
      errors.push('Preferred move-in date cannot be before request date');
    }
  }

  // Room preferences validation
  if (data.roomPreferences && !Array.isArray(data.roomPreferences)) {
    errors.push('Room preferences must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function isValidPriority(priority: string): priority is WaitlistPriority {
  const validPriorities: WaitlistPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
  return validPriorities.includes(priority as WaitlistPriority);
}

function isValidStatus(status: string): status is WaitlistStatus {
  const validStatuses: WaitlistStatus[] = [
    'PENDING',
    'ASSESSMENT_SCHEDULED',
    'ASSESSMENT_COMPLETED',
    'APPROVED',
    'DECLINED',
    'CANCELLED',
    'PLACED'
  ];
  return validStatuses.includes(status as WaitlistStatus);
}

function isValidCareNeed(need: string): need is CareNeed {
  const validNeeds: CareNeed[] = [
    'RESIDENTIAL',
    'NURSING',
    'DEMENTIA',
    'RESPITE',
    'PALLIATIVE',
    'MENTAL_HEALTH',
    'LEARNING_DISABILITY',
    'PHYSICAL_DISABILITY'
  ];
  return validNeeds.includes(need as CareNeed);
}

function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
} 