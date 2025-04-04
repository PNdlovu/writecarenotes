import React from 'react';
import { Card } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

interface AssessmentTrend {
  date: string;
  value: number;
  category: string;
}

interface CompletionStats {
  onTime: number;
  late: number;
  missed: number;
}

interface RiskDistribution {
  high: number;
  medium: number;
  low: number;
}

interface Props {
  trends: AssessmentTrend[];
  completionStats: CompletionStats;
  riskDistribution: RiskDistribution;
  residentId: string;
  dateRange: [Date, Date];
}

const COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
  onTime: '#22c55e',
  late: '#f59e0b',
  missed: '#ef4444',
};

export function AssessmentAnalytics({
  trends,
  completionStats,
  riskDistribution,
  residentId,
  dateRange,
}: Props) {
  const completionData = [
    { name: 'On Time', value: completionStats.onTime },
    { name: 'Late', value: completionStats.late },
    { name: 'Missed', value: completionStats.missed },
  ];

  const riskData = [
    { name: 'High Risk', value: riskDistribution.high },
    { name: 'Medium Risk', value: riskDistribution.medium },
    { name: 'Low Risk', value: riskDistribution.low },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Assessment Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Completion Rate</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={completionData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {completionData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name.toLowerCase().replace(' ', '') as keyof typeof COLORS]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={riskData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {riskData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name.split(' ')[0].toLowerCase() as keyof typeof COLORS]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Completion Rate</p>
            <p className="text-2xl font-bold">
              {Math.round(
                (completionStats.onTime /
                  (completionStats.onTime +
                    completionStats.late +
                    completionStats.missed)) *
                  100
              )}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Average Time to Complete</p>
            <p className="text-2xl font-bold">
              {Math.round(
                trends.reduce((acc, curr) => acc + curr.value, 0) / trends.length
              )}{' '}
              minutes
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Risk Level</p>
            <p className="text-2xl font-bold">
              {Object.entries(riskDistribution).reduce(
                (a, b) => (b[1] > a[1] ? b : a)
              )[0].toUpperCase()}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
