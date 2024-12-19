import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, differenceInMinutes } from 'date-fns';
import { scheduleAPI } from '../../api/schedule-api';

interface TimeEntry {
  id: string;
  userId: string;
  type: 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
  timestamp: string;
  location?: { lat: number; lng: number };
  notes?: string;
}

interface BreakRule {
  minimumHoursForBreak: number;
  breakDuration: number;
  paid: boolean;
}

interface AttendanceRecord {
  id: string;
  userId: string;
  shiftId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breaks: Array<{ start: string; end?: string }>;
  totalWorkedMinutes: number;
  status: 'ON_TIME' | 'LATE' | 'ABSENT' | 'EARLY_DEPARTURE';
  overtime: number;
}

export function TimeAttendance() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showBreakDialog, setShowBreakDialog] = useState(false);

  const { data: timeEntries = [] } = useQuery<TimeEntry[]>({
    queryKey: ['time-entries', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () =>
      scheduleAPI.getTimeEntries(format(selectedDate, 'yyyy-MM-dd')),
  });

  const { data: attendanceRecords = [] } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance-records', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () =>
      scheduleAPI.getAttendanceRecords(format(selectedDate, 'yyyy-MM-dd')),
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const position = await getCurrentPosition();
      return scheduleAPI.createTimeEntry({
        type: 'CLOCK_IN',
        location: position,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const position = await getCurrentPosition();
      return scheduleAPI.createTimeEntry({
        type: 'CLOCK_OUT',
        location: position,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });

  const breakMutation = useMutation({
    mutationFn: async (type: 'BREAK_START' | 'BREAK_END') => {
      const position = await getCurrentPosition();
      return scheduleAPI.createTimeEntry({
        type,
        location: position,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    },
  });

  const getCurrentPosition = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        resolve({ lat: 0, lng: 0 });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => resolve({ lat: 0, lng: 0 })
      );
    });
  };

  const getLastEntry = () => {
    return timeEntries[timeEntries.length - 1];
  };

  const isCurrentlyClockedIn = () => {
    const lastEntry = getLastEntry();
    return lastEntry && lastEntry.type === 'CLOCK_IN';
  };

  const isOnBreak = () => {
    const lastEntry = getLastEntry();
    return lastEntry && lastEntry.type === 'BREAK_START';
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Time & Attendance
        </h3>

        {/* Clock In/Out Actions */}
        <div className="mt-5 space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => clockInMutation.mutate()}
              disabled={isCurrentlyClockedIn()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              Clock In
            </button>
            <button
              onClick={() => clockOutMutation.mutate()}
              disabled={!isCurrentlyClockedIn() || isOnBreak()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              Clock Out
            </button>
            <button
              onClick={() =>
                breakMutation.mutate(
                  isOnBreak() ? 'BREAK_END' : 'BREAK_START'
                )
              }
              disabled={!isCurrentlyClockedIn()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isOnBreak() ? 'End Break' : 'Start Break'}
            </button>
          </div>
        </div>

        {/* Today's Timeline */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-900">Today's Timeline</h4>
          <div className="mt-4 space-y-2">
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center py-2 border-b"
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {entry.type.replace('_', ' ')}
                  </span>
                  {entry.notes && (
                    <p className="text-sm text-gray-500">{entry.notes}</p>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(entry.timestamp), 'h:mm a')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-900">
            Attendance Summary
          </h4>
          <div className="mt-4">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Date
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Clock In
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Clock Out
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Total Hours
                    </th>
                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                        {format(new Date(record.date), 'MMM d, yyyy')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {format(new Date(record.clockIn), 'h:mm a')}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {record.clockOut
                          ? format(new Date(record.clockOut), 'h:mm a')
                          : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {(record.totalWorkedMinutes / 60).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: AttendanceRecord['status']): string {
  switch (status) {
    case 'ON_TIME':
      return 'bg-green-100 text-green-800';
    case 'LATE':
      return 'bg-yellow-100 text-yellow-800';
    case 'ABSENT':
      return 'bg-red-100 text-red-800';
    case 'EARLY_DEPARTURE':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
