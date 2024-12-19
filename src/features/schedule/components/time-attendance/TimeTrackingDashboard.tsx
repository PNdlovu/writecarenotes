import React from 'react';
import { useQuery } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface TimeStats {
  regularHours: number;
  overtimeHours: number;
  breakTime: number;
  totalShifts: number;
  averageShiftLength: number;
  lateArrivals: number;
  earlyDepartures: number;
}

export const TimeTrackingDashboard: React.FC = () => {
  const { data: timeStats } = useQuery<TimeStats>(
    ['timeStats', 'current-week'],
    () => scheduleAPI.getTimeStats('current-week'),
  );

  const { data: recentEntries } = useQuery(
    ['timeEntries', 'recent'],
    () => scheduleAPI.getRecentTimeEntries(),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Regular Hours</h4>
          <div className="text-2xl font-semibold">{timeStats?.regularHours.toFixed(1)}h</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Overtime</h4>
          <div className="text-2xl font-semibold text-orange-600">
            {timeStats?.overtimeHours.toFixed(1)}h
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Break Time</h4>
          <div className="text-2xl font-semibold text-blue-600">
            {timeStats?.breakTime.toFixed(1)}h
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-gray-500">Total Shifts</div>
              <div className="text-lg font-medium">{timeStats?.totalShifts}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Avg. Shift Length</div>
              <div className="text-lg font-medium">
                {timeStats?.averageShiftLength.toFixed(1)}h
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Late Arrivals</div>
              <div className="text-lg font-medium text-red-600">{timeStats?.lateArrivals}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Early Departures</div>
              <div className="text-lg font-medium text-orange-600">
                {timeStats?.earlyDepartures}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentEntries?.map((entry) => (
                <div key={entry.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">
                      {entry.type.charAt(0).toUpperCase() + entry.type.slice(1).replace('-', ' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>
                  {entry.notes && (
                    <div className="text-sm text-gray-600 max-w-xs truncate">{entry.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
