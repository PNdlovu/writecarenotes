/**
 * @fileoverview Metric Aggregation Component
 * @version 1.0.0
 * @created 2024-03-21
 */

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Select,
  SelectItem,
  Button,
  Alert,
  Spinner,
  Chip,
  IconButton,
  Tooltip,
  Input,
  Grid
} from '@/components/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area
} from 'recharts';
import { DownloadIcon } from '@/components/icons';
import { monitoring, METRIC_TYPES } from '../../lib/monitoring';

interface AggregatedData {
  timestamp: number;
  value: number;
  min: number;
  max: number;
  avg: number;
  sum: number;
  count: number;
}

interface GroupedData {
  period: string;
  metrics: {
    [key: string]: AggregatedData;
  };
}

export const MetricAggregation: React.FC = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [groupBy, setGroupBy] = useState<'minute' | 'hour' | 'day' | 'week'>('hour');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aggregatedData, setAggregatedData] = useState<GroupedData[]>([]);

  useEffect(() => {
    if (selectedMetrics.length > 0) {
      fetchAggregatedData();
    }
  }, [selectedMetrics, timeRange, groupBy]);

  const fetchAggregatedData = async () => {
    try {
      setLoading(true);
      const endTime = Date.now();
      const periodInMs = {
        hour: 60 * 60 * 1000,
        day: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };
      const startTime = endTime - periodInMs[timeRange];

      const aggregations = await Promise.all(
        selectedMetrics.map(metric =>
          monitoring.getAggregatedMetrics(metric, startTime, endTime, groupBy)
        )
      );

      // Group data by time period
      const groupedData: { [key: string]: GroupedData } = {};
      aggregations.forEach((metricData, index) => {
        metricData.forEach(data => {
          const period = new Date(data.timestamp).toLocaleString();
          if (!groupedData[period]) {
            groupedData[period] = {
              period,
              metrics: {}
            };
          }
          groupedData[period].metrics[selectedMetrics[index]] = data;
        });
      });

      setAggregatedData(Object.values(groupedData));
      setError(null);
    } catch (err) {
      setError('Failed to fetch aggregated data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    const data = {
      timeRange,
      groupBy,
      metrics: selectedMetrics,
      aggregations: aggregatedData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metric-aggregations-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTrendChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Metric Trends
        </Typography>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={aggregatedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {selectedMetrics.map((metric, index) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={`metrics.${metric}.avg`}
                  name={`${metric.split('.').pop()} (Avg)`}
                  stroke={`hsl(${(index * 360) / selectedMetrics.length}, 70%, 50%)`}
                  dot={false}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderRangeChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Value Ranges
        </Typography>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={aggregatedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {selectedMetrics.map((metric, index) => (
                <React.Fragment key={metric}>
                  <Area
                    type="monotone"
                    dataKey={`metrics.${metric}.max`}
                    stackId={`range-${index}`}
                    name={`${metric.split('.').pop()} (Range)`}
                    fill={`hsla(${(index * 360) / selectedMetrics.length}, 70%, 50%, 0.1)`}
                    stroke={`hsla(${(index * 360) / selectedMetrics.length}, 70%, 50%, 0.5)`}
                  />
                  <Area
                    type="monotone"
                    dataKey={`metrics.${metric}.min`}
                    stackId={`range-${index}`}
                    fill={`hsla(${(index * 360) / selectedMetrics.length}, 70%, 50%, 0.1)`}
                    stroke={`hsla(${(index * 360) / selectedMetrics.length}, 70%, 50%, 0.5)`}
                  />
                </React.Fragment>
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const renderDistributionChart = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Value Distribution
        </Typography>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aggregatedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              {selectedMetrics.map((metric, index) => (
                <Bar
                  key={metric}
                  dataKey={`metrics.${metric}.count`}
                  name={`${metric.split('.').pop()} (Count)`}
                  fill={`hsl(${(index * 360) / selectedMetrics.length}, 70%, 50%)`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div style={{ padding: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <Typography variant="h4">
          Metric Aggregation
        </Typography>
        <div style={{ display: 'flex', gap: 2 }}>
          <Select
            size="small"
            style={{ minWidth: 120 }}
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <SelectItem value="hour">Last Hour</SelectItem>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
          </Select>

          <Select
            size="small"
            style={{ minWidth: 120 }}
            value={groupBy}
            label="Group By"
            onChange={(e) => setGroupBy(e.target.value as any)}
          >
            <SelectItem value="minute">Minute</SelectItem>
            <SelectItem value="hour">Hour</SelectItem>
            <SelectItem value="day">Day</SelectItem>
            <SelectItem value="week">Week</SelectItem>
          </Select>

          <Select
            size="small"
            style={{ minWidth: 200 }}
            multiple
            value={selectedMetrics}
            label="Metrics"
            onChange={(e) => setSelectedMetrics(e.target.value as string[])}
            renderValue={(selected) => (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={value.split('.').pop()} 
                    size="small" 
                  />
                ))}
              </div>
            )}
          >
            {Object.entries(METRIC_TYPES).map(([category, metrics]) => (
              Object.entries(metrics).map(([key, value]) => (
                <SelectItem key={value} value={value}>
                  {category} - {key}
                </SelectItem>
              ))
            ))}
          </Select>

          <Tooltip title="Export Data">
            <IconButton onClick={exportData} disabled={selectedMetrics.length === 0}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {error && (
        <Alert severity="error" style={{ marginBottom: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <Spinner />
        </div>
      ) : selectedMetrics.length === 0 ? (
        <Typography color="textSecondary" align="center">
          Select metrics to view aggregations
        </Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {renderTrendChart()}
          </Grid>
          <Grid item xs={12}>
            {renderRangeChart()}
          </Grid>
          <Grid item xs={12}>
            {renderDistributionChart()}
          </Grid>
        </Grid>
      )}
    </div>
  );
}; 
