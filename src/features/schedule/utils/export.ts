import { format } from 'date-fns';
import { ScheduleShiftWithStaff } from '../api/schedule-api';

export function exportToICalendar(shifts: ScheduleShiftWithStaff[]): string {
  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Scheduling App//EN',
    ...shifts.map((shift) => [
      'BEGIN:VEVENT',
      `UID:${shift.id}`,
      `DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTSTART:${format(new Date(shift.startTime), "yyyyMMdd'T'HHmmss'Z'")}`,
      `DTEND:${format(new Date(shift.endTime), "yyyyMMdd'T'HHmmss'Z'")}`,
      `SUMMARY:Shift - ${shift.staff.name}`,
      `DESCRIPTION:${shift.notes || ''}`,
      'END:VEVENT',
    ]).flat(),
    'END:VCALENDAR',
  ].join('\r\n');

  return icalContent;
}

export function exportToCSV(shifts: ScheduleShiftWithStaff[]): string {
  const headers = ['Date', 'Start Time', 'End Time', 'Staff', 'Notes'];
  const rows = shifts.map((shift) => [
    format(new Date(shift.startTime), 'yyyy-MM-dd'),
    format(new Date(shift.startTime), 'HH:mm'),
    format(new Date(shift.endTime), 'HH:mm'),
    shift.staff.name,
    shift.notes || '',
  ]);

  return [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');
}

export function exportToJSON(shifts: ScheduleShiftWithStaff[]): string {
  return JSON.stringify(
    shifts.map((shift) => ({
      date: format(new Date(shift.startTime), 'yyyy-MM-dd'),
      startTime: format(new Date(shift.startTime), 'HH:mm'),
      endTime: format(new Date(shift.endTime), 'HH:mm'),
      staff: shift.staff.name,
      notes: shift.notes || '',
    })),
    null,
    2
  );
}

interface ExternalCalendarConfig {
  type: 'google' | 'outlook' | 'apple';
  clientId?: string;
  clientSecret?: string;
}

export async function syncWithExternalCalendar(
  shifts: ScheduleShiftWithStaff[],
  config: ExternalCalendarConfig
): Promise<void> {
  // Implementation would depend on the specific calendar API
  switch (config.type) {
    case 'google':
      // Implement Google Calendar sync
      break;
    case 'outlook':
      // Implement Outlook Calendar sync
      break;
    case 'apple':
      // Implement Apple Calendar sync
      break;
  }
}
