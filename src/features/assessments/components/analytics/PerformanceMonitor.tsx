import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';
import { OfflineAnalytics } from '../../services/offline/analytics';
import { BatchSyncService } from '../../services/offline/batchSync';
import { SettingsService } from '../../services/analytics/SettingsService';
import { AlertService } from '../../services/analytics/AlertService';
import { ExportService } from '../../services/analytics/ExportService';
import { SettingsDialog } from './SettingsDialog';
import { AlertsPanel } from './AlertsPanel';
import { DownloadIcon } from 'lucide-react';
import {
  PerformanceData,
  PerformanceMetrics,
  MetricCardProps,
  ErrorState
} from './types';
import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon, RefreshIcon } from 'lucide-react';

const UPDATE_INTERVAL = 5000; // 5 seconds

export function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    avgSyncDuration: 0,
    maxSyncDuration: 0,
    storageGrowthRate: 0,
    errorRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [settings, setSettings] = useState(SettingsService.getInstance().getSettings());

  const analytics = OfflineAnalytics.getInstance();
  const batchSync = BatchSyncService.getInstance();
  const alertService = AlertService.getInstance();
  const exportService = ExportService.getInstance();

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get events from the last 24 hours
      const events = await analytics.getEvents(Date.now() - 24 * 60 * 60 * 1000);
      const metrics = await analytics.getStorageMetrics();

      // Process sync completion events
      const syncEvents = events.filter(e => 
        e.type === 'sync' && e.data.action === 'complete'
      );

      const newData: PerformanceData[] = syncEvents.map(event => ({
        timestamp: event.timestamp,
        syncDuration: event.data.duration || 0,
        storageSize: metrics.totalSize,
        eventCount: metrics.eventCount,
        errorCount: events.filter(e => 
          e.type === 'error' && 
          e.timestamp <= event.timestamp
        ).length
      }));

      // Calculate metrics
      const avgSyncDuration = newData.reduce(
        (acc, curr) => acc + curr.syncDuration, 
        0
      ) / newData.length || 0;

      const maxSyncDuration = Math.max(
        ...newData.map(d => d.syncDuration),
        0
      );

      const storageGrowthRate = newData.length > 1 
        ? (newData[newData.length - 1].storageSize - newData[0].storageSize) / 
          (newData[newData.length - 1].timestamp - newData[0].timestamp)
        : 0;

      const errorRate = newData.length > 0
        ? newData[newData.length - 1].errorCount / newData.length
        : 0;

      // Check thresholds for alerts
      alertService.checkThreshold('syncDuration', maxSyncDuration);
      alertService.checkThreshold('errorRate', errorRate);
      alertService.checkThreshold('storageGrowth', storageGrowthRate);
      alertService.checkThreshold('syncQueue', batchSync.getPendingCount());

      setPerformanceData(newData);
      setMetrics({
        avgSyncDuration,
        maxSyncDuration,
        storageGrowthRate,
        errorRate
      });
    } catch (err) {
      setError({
        message: err.message || 'Failed to fetch performance data',
        code: err.code,
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = async () => {
    try {
      await exportService.exportData(performanceData, {
        format: settings.exportFormat,
        filename: 'performance_export',
        includeTimestamp: true
      });
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const handleExportChart = async (chartId: string) => {
    const chartElement = document.querySelector(`#${chartId}`);
    if (!chartElement) return;

    try {
      await exportService.exportChart(
        chartElement as HTMLElement,
        `${chartId}_${format(new Date(), 'yyyyMMdd_HHmmss')}`
      );
    } catch (error) {
      console.error('Failed to export chart:', error);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    const interval = setInterval(fetchPerformanceData, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchPerformanceData, refreshKey]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Performance Data</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
        <Button 
          onClick={() => setRefreshKey(k => k + 1)}
          className="mt-2"
        >
          <RefreshIcon className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </Alert>
    );
  }

  if (loading && performanceData.length === 0) {
    return <PerformanceSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Performance Monitor</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <AlertsPanel />
          <SettingsDialog />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRefreshKey(k => k + 1)}
          >
            <RefreshIcon className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Avg Sync Duration"
          value={`${(metrics.avgSyncDuration / 1000).toFixed(2)}s`}
          subtitle="Average sync completion time"
          trend={{
            value: (metrics.maxSyncDuration - metrics.avgSyncDuration) / 1000,
            label: "max difference",
            direction: "neutral"
          }}
        />
        <MetricCard
          title="Max Sync Duration"
          value={`${(metrics.maxSyncDuration / 1000).toFixed(2)}s`}
          subtitle="Longest sync duration"
          trend={{
            value: metrics.avgSyncDuration / metrics.maxSyncDuration * 100,
            label: "% of max",
            direction: "down"
          }}
        />
        <MetricCard
          title="Storage Growth"
          value={`${(metrics.storageGrowthRate / 1024).toFixed(2)} KB/s`}
          subtitle="Storage growth rate"
          trend={{
            value: performanceData.length > 0 
              ? performanceData[performanceData.length - 1].storageSize / 1024 / 1024
              : 0,
            label: "MB total",
            direction: "up"
          }}
        />
        <MetricCard
          title="Error Rate"
          value={`${(metrics.errorRate * 100).toFixed(1)}%`}
          subtitle="Sync error rate"
          trend={{
            value: performanceData.length > 0 
              ? performanceData[performanceData.length - 1].errorCount
              : 0,
            label: "total errors",
            direction: metrics.errorRate > 0.05 ? "down" : "up"
          }}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync Performance</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => format(value, 'HH:mm')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(value, 'PPpp')}
                formatter={(value: number) => 
                  `${(value / 1000).toFixed(2)}s`
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="syncDuration"
                stroke="#8884d8"
                name="Sync Duration"
              />
            </LineChart>
          </ResponsiveContainer>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportChart('sync-performance-chart')}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export Chart
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage Growth</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => format(value, 'HH:mm')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(value, 'PPpp')}
                formatter={(value: number) => 
                  `${(value / 1024 / 1024).toFixed(2)} MB`
                }
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="storageSize"
                stroke="#82ca9d"
                fill="#82ca9d"
                name="Storage Size"
              />
            </AreaChart>
          </ResponsiveContainer>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportChart('storage-growth-chart')}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export Chart
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Tracking</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(value) => format(value, 'HH:mm')}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => format(value, 'PPpp')}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="errorCount"
                stroke="#ff7300"
                name="Errors"
              />
            </LineChart>
          </ResponsiveContainer>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportChart('error-tracking-chart')}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export Chart
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ title, value, subtitle, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-sm text-gray-500">{subtitle}</p>
        {trend && (
          <div className="mt-2 flex items-center gap-1">
            {trend.direction === 'up' && <ArrowUpIcon className="text-green-500 h-4 w-4" />}
            {trend.direction === 'down' && <ArrowDownIcon className="text-red-500 h-4 w-4" />}
            {trend.direction === 'neutral' && <ArrowRightIcon className="text-gray-500 h-4 w-4" />}
            <span className="text-sm">
              {trend.value} {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PerformanceSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px]" />
              <Skeleton className="h-4 w-[120px] mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
