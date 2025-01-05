import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Progress } from "@/components/ui/Progress/Progress";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { OfflineAnalytics } from '../../services/offline/analytics';
import { BatchSyncService } from '../../services/offline/batchSync';
import { SettingsService } from '../../services/analytics/SettingsService';
import { AlertService } from '../../services/analytics/AlertService';
import { ExportService } from '../../services/analytics/ExportService';
import { AggregationService } from '../../services/analytics/AggregationService';
import { SettingsDialog } from './SettingsDialog';
import { AlertsPanel } from './AlertsPanel';
import { InsightsPanel } from './InsightsPanel';
import { DownloadIcon } from 'lucide-react';
import {
  AnalyticsData,
  TimeRange,
  MetricCardProps,
  ChartData,
  ErrorState,
  AggregatedData
} from './types';
import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon, RefreshIcon } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const UPDATE_INTERVAL = 5000; // 5 seconds

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [aggregatedData, setAggregatedData] = useState<AggregatedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('24h');
  const [refreshKey, setRefreshKey] = useState(0);
  const [settings, setSettings] = useState(SettingsService.getInstance().getSettings());

  const analytics = OfflineAnalytics.getInstance();
  const batchSync = BatchSyncService.getInstance();
  const alertService = AlertService.getInstance();
  const exportService = ExportService.getInstance();
  const aggregationService = AggregationService.getInstance();

  const fetchData = useCallback(async () => {
    try {
      const timeRanges = {
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
      };

      setLoading(true);
      setError(null);

      const startTime = Date.now() - timeRanges[selectedTimeRange];
      const events = await analytics.getEvents(startTime);
      const metrics = await analytics.getStorageMetrics();

      setData({
        events,
        metrics,
        syncStatus: {
          pendingCount: batchSync.getPendingCount(),
          processingCount: batchSync.getProcessingCount(),
          failedCount: events.filter(e => e.type === 'error').length,
          completedCount: events.filter(e => 
            e.type === 'sync' && e.data.action === 'complete'
          ).length
        }
      });
    } catch (err) {
      setError({
        message: err.message || 'Failed to fetch analytics data',
        code: err.code,
        timestamp: Date.now()
      });
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData, refreshKey]);

  useEffect(() => {
    if (data?.events) {
      const newAggregatedData = aggregationService.aggregateEvents(data.events);
      setAggregatedData(newAggregatedData);
    }
  }, [data]);

  const handleExport = async () => {
    if (!data) return;

    try {
      await exportService.exportData(data.events, {
        format: settings.exportFormat,
        filename: 'analytics_export',
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error Loading Analytics</AlertTitle>
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

  if (loading && !data) {
    return <AnalyticsSkeleton />;
  }

  if (!data) {
    return null;
  }

  const eventsByType = data.events.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const eventTimeline = data.events.reduce((acc, event) => {
    const date = format(event.timestamp, 'yyyy-MM-dd HH:mm');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timelineData: ChartData[] = Object.entries(eventTimeline).map(([date, count]) => ({
    date,
    count
  }));

  const pieData = Object.entries(eventsByType).map(([name, value]) => ({
    name,
    value
  }));

  const successRate = data.syncStatus.completedCount / 
    (data.syncStatus.completedCount + data.syncStatus.failedCount) * 100;

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
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
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as TimeRange)}
            className="border rounded px-2 py-1"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="sync">Sync Status</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Total Events"
                  value={data.metrics.eventCount}
                  subtitle="Total tracked events"
                  trend={{
                    value: 5.2,
                    label: "vs last period",
                    direction: "up"
                  }}
                />
                <MetricCard
                  title="Storage Used"
                  value={`${(data.metrics.totalSize / 1024 / 1024).toFixed(2)} MB`}
                  subtitle="Total storage usage"
                  trend={{
                    value: 2.1,
                    label: "growth rate",
                    direction: "up"
                  }}
                />
                <MetricCard
                  title="Sync Queue"
                  value={data.syncStatus.pendingCount}
                  subtitle="Items waiting to sync"
                  trend={{
                    value: data.syncStatus.processingCount,
                    label: "processing",
                    direction: "neutral"
                  }}
                />
                <MetricCard
                  title="Success Rate"
                  value={`${successRate.toFixed(1)}%`}
                  subtitle="Sync success rate"
                  trend={{
                    value: data.syncStatus.failedCount,
                    label: "failed syncs",
                    direction: successRate > 95 ? "up" : "down"
                  }}
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Event Timeline</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#8884d8" 
                        name="Events"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ... rest of the tabs implementation ... */}
          </Tabs>
        </div>
        <div className="lg:col-span-1">
          {aggregatedData && <InsightsPanel data={aggregatedData} />}
        </div>
      </div>

      {/* ... rest of the existing JSX ... */}
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

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4 p-4">
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
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
