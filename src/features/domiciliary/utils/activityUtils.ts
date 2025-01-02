/**
 * @writecarenotes.com
 * @fileoverview Utility functions for domiciliary care activity management
 * @version 1.0.0
 * @created 2024-03-21
 * @updated 2024-03-21
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Provides utility functions for activity scheduling, validation,
 * and conflict detection in domiciliary care.
 */

import { DomiciliaryActivityType } from '@prisma/client';
import { parseISO, addMinutes, isWithinInterval, format } from 'date-fns';

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
}

export interface ActivityConflict {
  existingActivity: {
    id: string;
    title: string;
    startTime: string;
    duration: number;
  };
  newActivity: {
    title: string;
    startTime: string;
    duration: number;
  };
  conflictType: 'OVERLAP' | 'INSUFFICIENT_BREAK' | 'STAFF_CONFLICT';
}

/**
 * Validates if a time slot is within operating hours
 */
export function isWithinOperatingHours(
  timeSlot: TimeSlot,
  operatingHours: { startTime: string; endTime: string; dayOfWeek: number }[]
): boolean {
  const day = timeSlot.startTime.getDay();
  const dayHours = operatingHours.find(h => h.dayOfWeek === day);
  
  if (!dayHours) return false;

  const opStart = parseISO(`${format(timeSlot.startTime, 'yyyy-MM-dd')}T${dayHours.startTime}`);
  const opEnd = parseISO(`${format(timeSlot.startTime, 'yyyy-MM-dd')}T${dayHours.endTime}`);

  return (
    isWithinInterval(timeSlot.startTime, { start: opStart, end: opEnd }) &&
    isWithinInterval(timeSlot.endTime, { start: opStart, end: opEnd })
  );
}

/**
 * Checks for activity time conflicts
 */
export function findActivityConflicts(
  newActivity: {
    title: string;
    startTime: string;
    duration: number;
    staffingRequirements?: string[];
  },
  existingActivities: {
    id: string;
    title: string;
    startTime: string;
    duration: number;
    staffingRequirements?: string[];
  }[]
): ActivityConflict[] {
  const conflicts: ActivityConflict[] = [];
  const newStart = parseISO(newActivity.startTime);
  const newEnd = addMinutes(newStart, newActivity.duration);

  for (const existing of existingActivities) {
    const existingStart = parseISO(existing.startTime);
    const existingEnd = addMinutes(existingStart, existing.duration);

    // Check for time overlap
    if (
      isWithinInterval(newStart, { start: existingStart, end: existingEnd }) ||
      isWithinInterval(newEnd, { start: existingStart, end: existingEnd }) ||
      isWithinInterval(existingStart, { start: newStart, end: newEnd })
    ) {
      conflicts.push({
        existingActivity: existing,
        newActivity,
        conflictType: 'OVERLAP'
      });
      continue;
    }

    // Check for insufficient break time (minimum 15 minutes)
    const breakAfterExisting = Math.abs(newStart.getTime() - existingEnd.getTime()) / 1000 / 60;
    const breakBeforeExisting = Math.abs(existingStart.getTime() - newEnd.getTime()) / 1000 / 60;
    
    if (breakAfterExisting < 15 || breakBeforeExisting < 15) {
      conflicts.push({
        existingActivity: existing,
        newActivity,
        conflictType: 'INSUFFICIENT_BREAK'
      });
      continue;
    }

    // Check for staff conflicts
    if (
      newActivity.staffingRequirements?.length &&
      existing.staffingRequirements?.length &&
      newActivity.staffingRequirements.some(staff => 
        existing.staffingRequirements?.includes(staff)
      )
    ) {
      conflicts.push({
        existingActivity: existing,
        newActivity,
        conflictType: 'STAFF_CONFLICT'
      });
    }
  }

  return conflicts;
}

/**
 * Generates recurring activity schedule
 */
export function generateRecurringSchedule(
  baseActivity: {
    title: string;
    startTime: string;
    duration: number;
    frequency: string;
  },
  recurrencePattern: {
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    daysOfWeek?: number[];
    endDate: Date;
  }
): { startTime: string; duration: number }[] {
  const schedule: { startTime: string; duration: number }[] = [];
  const startDate = parseISO(baseActivity.startTime);
  const endDate = recurrencePattern.endDate;

  let currentDate = startDate;
  while (currentDate <= endDate) {
    if (recurrencePattern.type === 'DAILY') {
      schedule.push({
        startTime: currentDate.toISOString(),
        duration: baseActivity.duration
      });
      currentDate = addMinutes(currentDate, 24 * 60 * recurrencePattern.interval);
    } else if (recurrencePattern.type === 'WEEKLY' && recurrencePattern.daysOfWeek) {
      const dayOfWeek = currentDate.getDay();
      if (recurrencePattern.daysOfWeek.includes(dayOfWeek)) {
        schedule.push({
          startTime: currentDate.toISOString(),
          duration: baseActivity.duration
        });
      }
      currentDate = addMinutes(currentDate, 24 * 60);
    }
    // Add monthly pattern if needed
  }

  return schedule;
}

/**
 * Calculates travel time between activities
 */
export function calculateTravelTime(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): number {
  // Simple estimation - replace with actual routing service
  const R = 6371; // Earth's radius in km
  const dLat = toRad(destination.latitude - origin.latitude);
  const dLon = toRad(destination.longitude - origin.longitude);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(origin.latitude)) * Math.cos(toRad(destination.latitude)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  // Rough estimate: 3 minutes per km
  return Math.ceil(distance * 3);
}

function toRad(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Groups activities by type for efficient scheduling
 */
export function groupActivitiesByType(
  activities: { activityType: DomiciliaryActivityType; duration: number }[]
): Record<DomiciliaryActivityType, number> {
  return activities.reduce((acc, activity) => {
    acc[activity.activityType] = (acc[activity.activityType] || 0) + activity.duration;
    return acc;
  }, {} as Record<DomiciliaryActivityType, number>);
}

/**
 * Validates staffing requirements for activities
 */
export function validateStaffingRequirements(
  activity: {
    activityType: DomiciliaryActivityType;
    requiresSpecialistStaff: boolean;
    staffingRequirements?: string[];
  },
  availableStaff: {
    id: string;
    qualifications: string[];
    specialties: string[];
  }[]
): boolean {
  if (!activity.requiresSpecialistStaff && !activity.staffingRequirements?.length) {
    return true;
  }

  return activity.staffingRequirements?.every(requirement =>
    availableStaff.some(staff =>
      staff.qualifications.includes(requirement) ||
      staff.specialties.includes(requirement)
    )
  ) ?? false;
} 