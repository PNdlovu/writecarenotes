import { ScheduleShiftWithStaff } from '../api/schedule-api';
import { isOverlapping } from 'date-fns';

export interface ShiftValidationError {
  type: 'CONFLICT' | 'AVAILABILITY' | 'HOURS_LIMIT';
  message: string;
  conflictingShift?: ScheduleShiftWithStaff;
}

export function validateShift(
  newShift: {
    startTime: string;
    endTime: string;
    staffId: string;
  },
  existingShifts: ScheduleShiftWithStaff[],
  maxHoursPerWeek = 40
): ShiftValidationError[] {
  const errors: ShiftValidationError[] = [];
  const newShiftStart = new Date(newShift.startTime);
  const newShiftEnd = new Date(newShift.endTime);

  // Check for conflicts with existing shifts
  const staffShifts = existingShifts.filter(
    (shift) => shift.staff.id === newShift.staffId
  );

  for (const shift of staffShifts) {
    const shiftStart = new Date(shift.startTime);
    const shiftEnd = new Date(shift.endTime);

    if (
      isOverlapping(
        { start: newShiftStart, end: newShiftEnd },
        { start: shiftStart, end: shiftEnd }
      )
    ) {
      errors.push({
        type: 'CONFLICT',
        message: `Shift conflicts with existing shift on ${shiftStart.toLocaleDateString()}`,
        conflictingShift: shift,
      });
    }
  }

  // Calculate total hours for the week
  const weekStart = new Date(newShiftStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekShifts = staffShifts.filter((shift) => {
    const shiftDate = new Date(shift.startTime);
    return shiftDate >= weekStart && shiftDate < weekEnd;
  });

  const totalHours =
    weekShifts.reduce((total, shift) => {
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0) +
    (newShiftEnd.getTime() - newShiftStart.getTime()) / (1000 * 60 * 60);

  if (totalHours > maxHoursPerWeek) {
    errors.push({
      type: 'HOURS_LIMIT',
      message: `Exceeds maximum ${maxHoursPerWeek} hours per week (total: ${Math.round(
        totalHours
      )} hours)`,
    });
  }

  return errors;
}

export function validateBatchShifts(
  batchData: {
    startTime: string;
    endTime: string;
    staffIds: string[];
    daysOfWeek: number[];
  },
  existingShifts: ScheduleShiftWithStaff[],
  startDate: Date,
  endDate: Date
): Record<string, ShiftValidationError[]> {
  const validationResults: Record<string, ShiftValidationError[]> = {};

  for (const staffId of batchData.staffIds) {
    const staffErrors: ShiftValidationError[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      if (batchData.daysOfWeek.includes(currentDate.getDay())) {
        const shiftStart = new Date(currentDate);
        const [hours, minutes] = batchData.startTime.split(':');
        shiftStart.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        const shiftEnd = new Date(currentDate);
        const [endHours, endMinutes] = batchData.endTime.split(':');
        shiftEnd.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);

        const errors = validateShift(
          {
            startTime: shiftStart.toISOString(),
            endTime: shiftEnd.toISOString(),
            staffId,
          },
          existingShifts
        );

        staffErrors.push(...errors);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (staffErrors.length > 0) {
      validationResults[staffId] = staffErrors;
    }
  }

  return validationResults;
}
