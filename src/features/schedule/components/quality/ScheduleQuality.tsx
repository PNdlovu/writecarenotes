import React from 'react';
import { useQuery } from 'react-query';
import { scheduleAPI } from '../../api/schedule-api';

interface QualityMetric {
  id: string;
  name: string;
  score: number;
  target: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  trend: 'up' | 'down' | 'stable';
  details?: string;
}

interface CoverageAnalysis {
  department: string;
  required: number;
  scheduled: number;
  coverage: number;
  skillsMet: number;
  totalSkills: number;
}

interface ServiceLevel {
  timeSlot: string;
  target: number;
  actual: number;
  status: 'above' | 'meeting' | 'below';
}

export const ScheduleQuality: React.FC = () => {
  const { data: qualityMetrics } = useQuery<QualityMetric[]>(
    ['quality', 'metrics'],
    () => scheduleAPI.getQualityMetrics(),
  );

  const { data: coverageAnalysis } = useQuery<CoverageAnalysis[]>(
    ['quality', 'coverage'],
    () => scheduleAPI.getCoverageAnalysis(),
  );

  const { data: serviceLevels } = useQuery<ServiceLevel[]>(
    ['quality', 'sla'],
    () => scheduleAPI.getServiceLevels(),
  );

  const getScoreColor = (status: QualityMetric['status']) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'fair':
        return 'text-yellow-600';
      case 'poor':
        return 'text-red-600';
    }
  };

  const getTrendIcon = (trend: QualityMetric['trend']) => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'stable':
        return '→';
    }
  };

  const getServiceLevelColor = (status: ServiceLevel['status']) => {
    switch (status) {
      case 'above':
        return 'text-green-600';
      case 'meeting':
        return 'text-blue-600';
      case 'below':
        return 'text-red-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {qualityMetrics?.map((metric) => (
          <div key={metric.id} className="bg-white rounded-lg shadow p-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">{metric.name}</h4>
            <div className="flex items-end gap-2">
              <div className={`text-2xl font-semibold ${getScoreColor(metric.status)}`}>
                {metric.score.toFixed(1)}
              </div>
              <div className="text-sm text-gray-500">/ {metric.target.toFixed(1)}</div>
              <div
                className={`ml-2 text-sm ${
                  metric.trend === 'up'
                    ? 'text-green-600'
                    : metric.trend === 'down'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}
              >
                {getTrendIcon(metric.trend)}
              </div>
            </div>
            {metric.details && (
              <div className="mt-2 text-sm text-gray-600">{metric.details}</div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Coverage Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Coverage
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Skills Met
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Ratio
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {coverageAnalysis?.map((dept) => (
                  <tr key={dept.department}>
                    <td className="px-6 py-4 whitespace-nowrap">{dept.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span
                        className={`${
                          dept.coverage >= 1
                            ? 'text-green-600'
                            : dept.coverage >= 0.8
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {(dept.coverage * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {dept.skillsMet}/{dept.totalSkills}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {dept.scheduled}/{dept.required}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Service Level Achievement</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceLevels?.map((level) => (
            <div key={level.timeSlot} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{level.timeSlot}</span>
                <span className={`text-sm ${getServiceLevelColor(level.status)}`}>
                  {level.actual}% / {level.target}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    level.status === 'above'
                      ? 'bg-green-600'
                      : level.status === 'meeting'
                      ? 'bg-blue-600'
                      : 'bg-red-600'
                  }`}
                  style={{ width: `${level.actual}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
