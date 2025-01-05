import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { OptimizationRule, DemandForecast } from '../../types/enterprise';
import { scheduleAPI } from '../../api/scheduleAPI';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export const WorkforceOptimization: React.FC = () => {
  const [optimizationDialogOpen, setOptimizationDialogOpen] = useState(false);

  const { data: forecasts = [] } = useQuery<DemandForecast[]>(
    ['demandForecasts'],
    () => scheduleAPI.getDemandForecasts(),
  );

  const { data: rules = [] } = useQuery<OptimizationRule[]>(
    ['optimizationRules'],
    () => scheduleAPI.getOptimizationRules(),
  );

  const { data: metrics } = useQuery(
    ['optimizationMetrics'],
    () => scheduleAPI.getOptimizationMetrics(),
  );

  const handleOptimizeSchedule = async () => {
    try {
      await scheduleAPI.runScheduleOptimization();
      setOptimizationDialogOpen(false);
    } catch (error) {
      console.error('Error optimizing schedule:', error);
    }
  };

  const renderMetricCard = (title: string, value: number, target: number) => {
    const progress = (value / target) * 100;
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center mb-2">
          <span className="text-2xl font-bold mr-3">{value.toFixed(1)}%</span>
          <span className={`px-2 py-1 rounded-full text-sm ${
            progress >= target ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            Target: {target}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              progress >= target ? 'bg-green-500' : 'bg-yellow-500'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    );
  };

  const renderDemandForecast = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Demand Forecast</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecasts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="predictedDemand"
              stroke="#8884d8"
              name="Predicted Demand"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderStaffUtilization = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Staff Utilization</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={metrics?.utilization || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="actual" fill="#8884d8" name="Actual" />
            <Bar dataKey="target" fill="#82ca9d" name="Target" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderOptimizationRules = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Optimization Rules</h3>
      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-semibold">{rule.name}</h4>
            <p className="text-gray-600 text-sm">
              Priority: {rule.priority} | Weight: {rule.weight}
            </p>
            <span className="inline-block px-2 py-1 mt-2 text-sm rounded-full bg-blue-100 text-blue-800">
              {rule.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workforce Optimization</h2>
        <button
          onClick={() => setOptimizationDialogOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span className="material-icons-outlined">speed</span>
          Optimize Schedule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {renderMetricCard('Staff Utilization', metrics?.overallUtilization || 0, 85)}
        {renderMetricCard('Cost Efficiency', metrics?.costEfficiency || 0, 90)}
        {renderMetricCard('Coverage Rate', metrics?.coverageRate || 0, 95)}
        {renderMetricCard('Satisfaction Score', metrics?.satisfactionScore || 0, 80)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderDemandForecast()}
        {renderStaffUtilization()}
      </div>

      <div className="grid grid-cols-1">
        {renderOptimizationRules()}
      </div>

      {optimizationDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Schedule Optimization</h3>
            <p className="mb-4">Running the optimization will:</p>
            <ul className="list-disc pl-5 mb-4">
              <li>Analyze current staffing patterns</li>
              <li>Apply optimization rules and constraints</li>
              <li>Generate recommendations for schedule adjustments</li>
              <li>Calculate potential cost savings</li>
            </ul>
            <p className="text-yellow-600 mb-4">
              This process may take several minutes to complete.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setOptimizationDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleOptimizeSchedule}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Optimization
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
