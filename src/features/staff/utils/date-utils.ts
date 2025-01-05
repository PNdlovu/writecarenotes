import { format, parseISO, isValid } from 'date-fns';

export function formatScheduleTime(dateString: string): string {
  const date = parseISO(dateString);
  return isValid(date) ? format(date, 'PPp') : 'Invalid date';
}

export function getShiftTimes(date: Date, shiftType: string): { startTime: Date; endTime: Date } {
  const startTime = new Date(date);
  const endTime = new Date(date);

  switch (shiftType) {
    case 'MORNING':
      startTime.setHours(6, 0, 0);
      endTime.setHours(14, 0, 0);
      break;
    case 'AFTERNOON':
      startTime.setHours(14, 0, 0);
      endTime.setHours(22, 0, 0);
      break;
    case 'NIGHT':
      startTime.setHours(22, 0, 0);
      endTime.setHours(6, 0, 0);
      endTime.setDate(endTime.getDate() + 1);
      break;
    default:
      throw new Error('Invalid shift type');
  }

  return { startTime, endTime };
}

export function getDateRange(days: number): { startDate: Date; endDate: Date } {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  return { startDate, endDate };
}


