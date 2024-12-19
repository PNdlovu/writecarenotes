import React from 'react';
import { useQuery } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface BalanceMetrics {
  userId: string;
  userName: string;
  metrics: {
    weeklyWorkHours: number;
    overtimeHours: number;
    personalTimeOff: number;
    vacationDays: {
      used: number;
      remaining: number;
    };
    flexibilityScore: number;
    workLifeScore: number;
  };
  schedule: {
    regularShifts: number;
    weekendShifts: number;
    holidayShifts: number;
    preferredShifts: number;
    totalShifts: number;
  };
  preferences: {
    id: string;
    type: string;
    status: 'met' | 'partially-met' | 'unmet';
    importance: 'low' | 'medium' | 'high';
  }[];
}

interface TimeOffRequest {
  id: string;
  type: 'vacation' | 'personal' | 'sick' | 'other';
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'denied';
  notes?: string;
}

export const WorkLifeBalance: React.FC = () => {
  const { data: balanceMetrics } = useQuery<BalanceMetrics>(
    ['work-life', 'metrics'],
    () => scheduleAPI.getWorkLifeMetrics(),
  );

  const { data: timeOffRequests } = useQuery<TimeOffRequest[]>(
    ['work-life', 'time-off'],
    () => scheduleAPI.getTimeOffRequests(),
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPreferenceStatus = (status: string) => {
    switch (status) {
      case 'met':
        return 'bg-green-100 text-green-800';
      case 'partially-met':
        return 'bg-yellow-100 text-yellow-800';
      case 'unmet':
        return 'bg-red-100 text-red-800';
    }
  };

  const getRequestStatus = (status: TimeOffRequest['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      {balanceMetrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Work-Life Score</h4>
              <div className={`text-3xl font-bold ${getScoreColor(balanceMetrics.metrics.workLifeScore)}`}>
                {balanceMetrics.metrics.workLifeScore}%
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Weekly Hours</h4>
              <div className="text-2xl font-semibold">
                {balanceMetrics.metrics.weeklyWorkHours}h
              </div>
              <div className="text-sm text-orange-600 mt-1">
                +{balanceMetrics.metrics.overtimeHours}h overtime
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Vacation Days</h4>
              <div className="text-2xl font-semibold">
                {balanceMetrics.metrics.vacationDays.remaining}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {balanceMetrics.metrics.vacationDays.used} used
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Flexibility Score</h4>
              <div className={`text-2xl font-semibold ${getScoreColor(balanceMetrics.metrics.flexibilityScore)}`}>
                {balanceMetrics.metrics.flexibilityScore}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Schedule Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Regular Shifts</span>
                    <span>
                      {balanceMetrics.schedule.regularShifts}/
                      {balanceMetrics.schedule.totalShifts}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(balanceMetrics.schedule.regularShifts /
                          balanceMetrics.schedule.totalShifts) *
                          100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Weekend Shifts</span>
                    <span>
                      {balanceMetrics.schedule.weekendShifts}/
                      {balanceMetrics.schedule.totalShifts}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-600 h-2 rounded-full"
                      style={{
                        width: `${(balanceMetrics.schedule.weekendShifts /
                          balanceMetrics.schedule.totalShifts) *
                          100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Holiday Shifts</span>
                    <span>
                      {balanceMetrics.schedule.holidayShifts}/
                      {balanceMetrics.schedule.totalShifts}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${(balanceMetrics.schedule.holidayShifts /
                          balanceMetrics.schedule.totalShifts) *
                          100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Preferred Shifts</span>
                    <span>
                      {balanceMetrics.schedule.preferredShifts}/
                      {balanceMetrics.schedule.totalShifts}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${(balanceMetrics.schedule.preferredShifts /
                          balanceMetrics.schedule.totalShifts) *
                          100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Schedule Preferences</h3>
              <div className="space-y-4">
                {balanceMetrics.preferences.map((pref) => (
                  <div
                    key={pref.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{pref.type}</div>
                      <div
                        className={`text-sm ${
                          pref.importance === 'high'
                            ? 'text-red-600'
                            : pref.importance === 'medium'
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}
                      >
                        {pref.importance} priority
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getPreferenceStatus(
                        pref.status
                      )}`}
                    >
                      {pref.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Time Off Requests</h3>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                New Request
              </button>
            </div>
            <div className="space-y-4">
              {timeOffRequests?.map((request) => (
                <div
                  key={request.id}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium capitalize">{request.type}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(request.startDate).toLocaleDateString()} -{' '}
                      {new Date(request.endDate).toLocaleDateString()}
                    </div>
                    {request.notes && (
                      <div className="text-sm text-gray-500 mt-1">{request.notes}</div>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getRequestStatus(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
