import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { scheduleAPI } from '../api/schedule-api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface ScheduleMetrics {
  totalShifts: number;
  totalHours: number;
  swapRequests: number;
  conflictRate: number;
  staffUtilization: Record<string, number>;
  shiftDistribution: Record<string, number>;
}

export function ScheduleAnalytics() {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  const { data: metrics } = useQuery<ScheduleMetrics>({
    queryKey: ['schedule-metrics', startDate, endDate],
    queryFn: () =>
      scheduleAPI.getScheduleMetrics(startDate.toISOString(), endDate.toISOString()),
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff'],
    queryFn: () => scheduleAPI.getStaffMembers(),
  });

  if (!metrics || !staffData) return <div>Loading...</div>;

  const utilizationData = Object.entries(metrics.staffUtilization).map(
    ([staffId, hours]) => ({
      name: staffData.find((s) => s.id === staffId)?.name || staffId,
      hours,
    })
  );

  const distributionData = Object.entries(metrics.shiftDistribution).map(
    ([time, count]) => ({
      time,
      shifts: count,
    })
  );

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-6">
        Schedule Analytics
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Shifts
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.totalShifts}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Hours
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.totalHours}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Swap Requests
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {metrics.swapRequests}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Conflict Rate
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {(metrics.conflictRate * 100).toFixed(1)}%
            </dd>
          </div>
        </div>
      </div>

      {/* Staff Utilization Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Staff Utilization
        </h3>
        <div className="h-80">
          <BarChart
            width={800}
            height={300}
            data={utilizationData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours" fill="#4F46E5" />
          </BarChart>
        </div>
      </div>

      {/* Shift Distribution Chart */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Shift Distribution
        </h3>
        <div className="h-80">
          <BarChart
            width={800}
            height={300}
            data={distributionData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="shifts" fill="#2563EB" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
