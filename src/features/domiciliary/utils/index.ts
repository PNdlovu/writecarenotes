/**
 * @writecarenotes.com
 * @fileoverview Utility functions for domiciliary care module
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Utility functions and helpers for the domiciliary care module,
 * providing common operations for visit management, scheduling,
 * and compliance tracking.
 *
 * Features:
 * - Visit scheduling utilities
 * - Route optimization helpers
 * - Data validation functions
 * - Format conversion utilities
 * - Compliance check helpers
 *
 * Mobile-First Considerations:
 * - Optimized for mobile performance
 * - Battery-efficient calculations
 * - Offline-capable operations
 * - Location utilities
 * - Device state helpers
 *
 * Enterprise Features:
 * - Error handling
 * - Logging integration
 * - Performance monitoring
 * - Security validation
 * - Audit trail support
 */

import { type Visit, type VisitTask, type GeoLocation } from '../types';
import { 
  VISIT_DURATION,
  MOBILE_CONFIG,
  PERFORMANCE,
  ERROR_CODES 
} from '../constants';

// Visit Management Utilities
export function isVisitOverlapping(visit1: Visit, visit2: Visit): boolean {
  const start1 = new Date(visit1.scheduledStart);
  const end1 = new Date(visit1.scheduledEnd);
  const start2 = new Date(visit2.scheduledStart);
  const end2 = new Date(visit2.scheduledEnd);

  return start1 < end2 && end1 > start2;
}

export function calculateVisitDuration(visit: Visit): number {
  const start = new Date(visit.scheduledStart);
  const end = new Date(visit.scheduledEnd);
  return Math.round((end.getTime() - start.getTime()) / (60 * 1000)); // in minutes
}

export function validateVisitDuration(duration: number): boolean {
  return duration >= VISIT_DURATION.MIN && duration <= VISIT_DURATION.MAX;
}

// Task Management Utilities
export function calculateTaskCompletion(tasks: VisitTask[]): number {
  if (!tasks.length) return 0;
  const completed = tasks.filter(task => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
}

export function sortTasksByPriority(tasks: VisitTask[]): VisitTask[] {
  const priorityOrder = {
    MEDICATION: 1,
    PERSONAL_CARE: 2,
    NUTRITION: 3,
    MOBILITY: 4,
    DOMESTIC: 5,
    SOCIAL: 6
  };

  return [...tasks].sort((a, b) => 
    (priorityOrder[a.type] || 99) - (priorityOrder[b.type] || 99)
  );
}

// Location Utilities
export function calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (loc1.latitude * Math.PI) / 180;
  const φ2 = (loc2.latitude * Math.PI) / 180;
  const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // distance in meters
}

export function isLocationAccurate(location: GeoLocation): boolean {
  return location.accuracy !== undefined && 
         location.accuracy <= MOBILE_CONFIG.LOCATION_ACCURACY.HIGH;
}

// Performance Utilities
export function measureResponseTime<T>(
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = performance.now();
  
  return operation().then(result => ({
    result,
    duration: performance.now() - start
  }));
}

export function isPerformanceCritical(duration: number): boolean {
  return duration > PERFORMANCE.RESPONSE_TIME.CRITICAL;
}

// Error Handling Utilities
export class DomiciliaryError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DomiciliaryError';
  }

  static visitNotFound(visitId: string): DomiciliaryError {
    return new DomiciliaryError(
      ERROR_CODES.VISIT.NOT_FOUND,
      `Visit not found: ${visitId}`
    );
  }

  static invalidVisitStatus(status: string): DomiciliaryError {
    return new DomiciliaryError(
      ERROR_CODES.VISIT.INVALID_STATUS,
      `Invalid visit status: ${status}`
    );
  }

  static staffNotAvailable(staffId: string): DomiciliaryError {
    return new DomiciliaryError(
      ERROR_CODES.STAFF.NOT_AVAILABLE,
      `Staff member not available: ${staffId}`
    );
  }
}

// Validation Utilities
export function validateVisit(visit: Visit): string[] {
  const errors: string[] = [];

  if (!visit.clientId) {
    errors.push('Client ID is required');
  }

  if (!visit.scheduledStart || !visit.scheduledEnd) {
    errors.push('Visit schedule is required');
  }

  if (!validateVisitDuration(calculateVisitDuration(visit))) {
    errors.push('Visit duration is invalid');
  }

  if (!visit.tasks || visit.tasks.length === 0) {
    errors.push('At least one task is required');
  }

  if (!visit.staff || visit.staff.length === 0) {
    errors.push('At least one staff member is required');
  }

  return errors;
}

// Format Utilities
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 
    ? `${hours}h ${mins}m`
    : `${mins}m`;
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  });
}

// Compliance Utilities
export function generateAuditTrail(
  action: string,
  details: Record<string, unknown>
): string {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    action,
    details,
    user: 'system' // Replace with actual user context
  });
} 