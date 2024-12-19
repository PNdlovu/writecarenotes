import React from 'react';
import { useQuery } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface FatigueMetrics {
  userId: string;
  userName: string;
  metrics: {
    consecutiveShifts: number;
    totalHoursWeek: number;
    nightShifts: number;
    restPeriods: number;
    rotationSpeed: 'slow' | 'moderate' | 'fast';
    workloadIntensity: 'low' | 'moderate' | 'high';
  };
  risks: {
    type: 'fatigue' | 'stress' | 'rotation' | 'workload';
    level: 'low' | 'moderate' | 'high';
    description: string;
  }[];
  recommendations: {
    id: string;
    type: 'rest' | 'schedule' | 'workload';
    description: string;
    priority: 'low' | 'medium' | 'high';
  }[];
}

interface TeamMetrics {
  department: string;
  averageHours: number;
  fatigueRisk: number;
  stressLevel: number;
  staffAtRisk: number;
  totalStaff: number;
}

export const FatigueMonitor: React.FC = () => {
  const { data: personalMetrics } = useQuery<FatigueMetrics>(
    ['fatigue', 'personal'],
    () => scheduleAPI.getPersonalFatigueMetrics(),
  );

  const { data: teamMetrics } = useQuery<TeamMetrics[]>(
    ['fatigue', 'team'],
    () => scheduleAPI.getTeamFatigueMetrics(),
  );

  const getRiskColor = (level: 'low' | 'moderate' | 'high') => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
    }
  };

  const getMetricStatus = (value: number, threshold: number) =>
    value > threshold ? 'text-red-600' : 'text-green-600';

  return (
    <div className="space-y-6">
      {personalMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-4">Work Pattern</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Consecutive Shifts</span>
                <span
                  className={getMetricStatus(personalMetrics.metrics.consecutiveShifts, 5)}
                >
                  {personalMetrics.metrics.consecutiveShifts}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Weekly Hours</span>
                <span
                  className={getMetricStatus(personalMetrics.metrics.totalHoursWeek, 40)}
                >
                  {personalMetrics.metrics.totalHoursWeek}h
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Night Shifts</span>
                <span
                  className={getMetricStatus(personalMetrics.metrics.nightShifts, 3)}
                >
                  {personalMetrics.metrics.nightShifts}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-4">Risk Assessment</h4>
            <div className="space-y-3">
              {personalMetrics.risks.map((risk) => (
                <div key={risk.type} className="flex justify-between items-center">
                  <span className="capitalize">{risk.type}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getRiskColor(risk.level)}`}>
                    {risk.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-4">Work Intensity</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Rotation Speed</span>
                <span className="capitalize">{personalMetrics.metrics.rotationSpeed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Workload</span>
                <span className="capitalize">
                  {personalMetrics.metrics.workloadIntensity}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Rest Periods</span>
                <span>{personalMetrics.metrics.restPeriods}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Team Fatigue Overview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Hours
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fatigue Risk
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stress Level
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff at Risk
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamMetrics?.map((team) => (
                  <tr key={team.department}>
                    <td className="px-6 py-4 whitespace-nowrap">{team.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {team.averageHours}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getRiskColor(
                          team.fatigueRisk > 0.7
                            ? 'high'
                            : team.fatigueRisk > 0.3
                            ? 'moderate'
                            : 'low'
                        )}`}
                      >
                        {(team.fatigueRisk * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getRiskColor(
                          team.stressLevel > 0.7
                            ? 'high'
                            : team.stressLevel > 0.3
                            ? 'moderate'
                            : 'low'
                        )}`}
                      >
                        {(team.stressLevel * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {team.staffAtRisk}/{team.totalStaff}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {personalMetrics?.recommendations && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-4">
            {personalMetrics.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div
                  className={`w-2 h-2 mt-2 rounded-full ${
                    rec.priority === 'high'
                      ? 'bg-red-500'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                ></div>
                <div>
                  <div className="font-medium capitalize">{rec.type} Recommendation</div>
                  <p className="text-gray-600">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
