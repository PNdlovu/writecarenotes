import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface TimeEntry {
  id: string;
  userId: string;
  type: 'clock-in' | 'clock-out' | 'break-start' | 'break-end';
  timestamp: Date;
  location?: string;
  notes?: string;
}

export const ClockInOut: React.FC = () => {
  const [notes, setNotes] = useState('');
  
  const { data: currentTimeEntry } = useQuery(
    ['timeEntry', 'current'],
    () => scheduleAPI.getCurrentTimeEntry(),
  );

  const clockMutation = useMutation(
    (type: TimeEntry['type']) => scheduleAPI.createTimeEntry({ type, notes }),
    {
      onSuccess: () => {
        setNotes('');
      },
    }
  );

  const isClockedIn = currentTimeEntry?.type === 'clock-in' || currentTimeEntry?.type === 'break-end';
  const isOnBreak = currentTimeEntry?.type === 'break-start';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Time & Attendance</h3>
        <div className="text-sm text-gray-500">
          {currentTimeEntry && (
            <span>Last action: {new Date(currentTimeEntry.timestamp).toLocaleTimeString()}</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            onClick={() => clockMutation.mutate(isClockedIn ? 'clock-out' : 'clock-in')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium ${
              isClockedIn
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isClockedIn ? 'Clock Out' : 'Clock In'}
          </button>

          <button
            onClick={() => clockMutation.mutate(isOnBreak ? 'break-end' : 'break-start')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium ${
              isOnBreak
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={!isClockedIn}
          >
            {isOnBreak ? 'End Break' : 'Start Break'}
          </button>
        </div>

        <div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes (optional)"
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {clockMutation.isError && (
          <div className="text-red-600 text-sm">
            Error recording time entry. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};
