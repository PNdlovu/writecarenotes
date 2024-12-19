/**
 * @fileoverview Audit analytics and reports component
 * @version 1.0.0
 * @created 2024-03-21
 * @author Philani Ndlovu
 * @copyright Write Care Notes Ltd
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { AuditService } from '../../services/auditService';
import { 
  AuditLogAction, 
  AuditLogStatus,
  AuditLogFilter 
} from '../../types/audit.types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface TimeSeriesData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

interface ActionDistributionData {
  labels: string[];
  datasets: {
    data: number[];
    backgroundColor: string[];
  }[];
}

export function AuditAnalytics() {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData | null>(null);
  const [actionDistribution, setActionDistribution] = useState<ActionDistributionData | null>(null);
  const [statusDistribution, setStatusDistribution] = useState<ActionDistributionData | null>(null);

  const auditService = AuditService.getInstance();
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, dateRange]);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);

      const filter: AuditLogFilter = {
        startDate: dateRange.from,
        endDate: dateRange.to
      };

      // Get audit logs for the period
      const { logs } = await auditService.searchLogs(filter);

      // Process time series data
      const timeSeriesData = processTimeSeriesData(logs);
      setTimeSeriesData(timeSeriesData);

      // Process action distribution
      const actionData = processActionDistribution(logs);
      setActionDistribution(actionData);

      // Process status distribution
      const statusData = processStatusDistribution(logs);
      setStatusDistribution(statusData);

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processTimeSeriesData = (logs: any[]): TimeSeriesData => {
    const timeFormat = timeRange === 'day' ? 'HH:mm' 
      : timeRange === 'week' ? 'ddd' 
      : 'DD/MM';

    // Group logs by time interval
    const groupedData = logs.reduce((acc, log) => {
      const date = new Date(log.timestamp);
      const key = date.toLocaleString('en-GB', { 
        hour: timeRange === 'day' ? '2-digit' : undefined,
        minute: timeRange === 'day' ? '2-digit' : undefined,
        weekday: timeRange === 'week' ? 'short' : undefined,
        day: timeRange === 'month' ? '2-digit' : undefined,
        month: timeRange === 'month' ? '2-digit' : undefined
      });

      if (!acc[key]) acc[key] = 0;
      acc[key]++;
      return acc;
    }, {});

    return {
      labels: Object.keys(groupedData),
      datasets: [{
        label: 'Activity',
        data: Object.values(groupedData),
        borderColor: '#0F52BA',
        backgroundColor: 'rgba(15, 82, 186, 0.1)'
      }]
    };
  };

  const processActionDistribution = (logs: any[]): ActionDistributionData => {
    const actionCounts = logs.reduce((acc, log) => {
      if (!acc[log.action]) acc[log.action] = 0;
      acc[log.action]++;
      return acc;
    }, {});

    return {
      labels: Object.keys(actionCounts),
      datasets: [{
        data: Object.values(actionCounts),
        backgroundColor: [
          '#0F52BA', // NHS Blue
          '#005EB8', // Care Quality Blue
          '#00A499', // Healthcare Green
          '#FFB81C', // Alert Yellow
          '#DA291C'  // Emergency Red
        ]
      }]
    };
  };

  const processStatusDistribution = (logs: any[]): ActionDistributionData => {
    const statusCounts = logs.reduce((acc, log) => {
      if (!acc[log.status]) acc[log.status] = 0;
      acc[log.status]++;
      return acc;
    }, {});

    return {
      labels: Object.keys(statusCounts),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          '#00A499', // Success (Green)
          '#DA291C'  // Failure (Red)
        ]
      }]
    };
  };

  return (
    <div className="space-y-6 p-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select
            value={timeRange}
            onValueChange={(value: 'day' | 'week' | 'month') => setTimeRange(value)}
          >
            <Select.Option value="day">Last 24 Hours</Select.Option>
            <Select.Option value="week">Last 7 Days</Select.Option>
            <Select.Option value="month">Last 30 Days</Select.Option>
          </Select>
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={setDateRange}
          />
        </div>
        <Button
          variant="outline"
          onClick={loadAnalytics}
          disabled={isLoading}
        >
          {isLoading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.refresh className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Activity Timeline */}
        <Card className="p-4">
          <h3 className="mb-4 text-lg font-medium">Activity Timeline</h3>
          {timeSeriesData && (
            <Line
              data={timeSeriesData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
              height={300}
            />
          )}
        </Card>

        {/* Action Distribution */}
        <Card className="p-4">
          <h3 className="mb-4 text-lg font-medium">Action Distribution</h3>
          {actionDistribution && (
            <Pie
              data={actionDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
              height={300}
            />
          )}
        </Card>

        {/* Status Distribution */}
        <Card className="p-4">
          <h3 className="mb-4 text-lg font-medium">Status Distribution</h3>
          {statusDistribution && (
            <Bar
              data={statusDistribution}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }}
              height={300}
            />
          )}
        </Card>

        {/* Key Metrics */}
        <Card className="p-4">
          <h3 className="mb-4 text-lg font-medium">Key Metrics</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold">
                {statusDistribution ? 
                  `${Math.round((statusDistribution.datasets[0].data[0] || 0) / 
                    statusDistribution.datasets[0].data.reduce((a, b) => a + b, 0) * 100)}%`
                  : '0%'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Most Common Action</p>
              <p className="text-2xl font-bold">
                {actionDistribution?.labels[0] || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Events</p>
              <p className="text-2xl font-bold">
                {timeSeriesData?.datasets[0].data.reduce((a, b) => a + b, 0) || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Peak Activity</p>
              <p className="text-2xl font-bold">
                {timeSeriesData?.labels[
                  timeSeriesData.datasets[0].data.indexOf(
                    Math.max(...timeSeriesData.datasets[0].data)
                  )
                ] || 'N/A'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 


