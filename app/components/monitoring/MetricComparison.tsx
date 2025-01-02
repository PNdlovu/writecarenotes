/**
 * @fileoverview Metric Comparison Component
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
  Container,
  Grid
} from '@/components/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { IconAdd, IconDelete, IconDownload } from '@/components/icons';
import { monitoring, METRIC_TYPES } from '../../lib/monitoring';

interface MetricData {
  timestamp: number;
  value: number;
}

interface ComparisonMetric {
  metric: string;
  color: string;
  data: MetricData[];
}

const COLORS = [
  '#2196f3',
  '#f44336',
  '#4caf50',
  '#ff9800',
  '#9c27b0',
  '#00bcd4',
  '#ff5722',
  '#795548'
];

export const MetricComparison: React.FC = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<ComparisonMetric[]>([]);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedMetrics.length > 0) {
      fetchMetricData();
    }
  }, [selectedMetrics, timeRange]);

  const fetchMetricData = async () => {
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

      const updatedMetrics = await Promise.all(
        selectedMetrics.map(async (metric) => ({
          ...metric,
          data: await monitoring.getMetrics(metric.metric, startTime, endTime)
        }))
      );

      setSelectedMetrics(updatedMetrics);
      setError(null);
    } catch (err) {
      setError('Failed to fetch metric data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMetric = () => {
    if (selectedMetrics.length >= COLORS.length) {
      setError('Maximum number of metrics reached');
      return;
    }

    setSelectedMetrics([
      ...selectedMetrics,
      {
        metric: '',
        color: COLORS[selectedMetrics.length],
        data: []
      }
    ]);
  };

  const handleRemoveMetric = (index: number) => {
    setSelectedMetrics(metrics => metrics.filter((_, i) => i !== index));
  };

  const handleMetricChange = (index: number, metricKey: string) => {
    setSelectedMetrics(metrics => 
      metrics.map((m, i) => 
        i === index ? { ...m, metric: metricKey } : m
      )
    );
  };

  const exportData = () => {
    const data = selectedMetrics.map(metric => ({
      metric: metric.metric,
      data: metric.data.map(d => ({
        timestamp: new Date(d.timestamp).toISOString(),
        value: d.value
      }))
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metric-comparison-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getChartData = () => {
    const allTimestamps = new Set<number>();
    selectedMetrics.forEach(metric => 
      metric.data.forEach(d => allTimestamps.add(d.timestamp))
    );

    return Array.from(allTimestamps)
      .sort((a, b) => a - b)
      .map(timestamp => {
        const point: any = { timestamp };
        selectedMetrics.forEach(metric => {
          const dataPoint = metric.data.find(d => d.timestamp === timestamp);
          point[metric.metric] = dataPoint?.value;
        });
        return point;
      });
  };

  return (
    <Container sx={{ p: 3 }}>
      <Container sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Metric Comparison
        </Typography>
        <Container sx={{ display: 'flex', gap: 2 }}>
          <Select size="small" sx={{ minWidth: 120 }}>
            <SelectItem value="hour">Last Hour</SelectItem>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
          </Select>

          <Tooltip title="Export Data">
            <IconButton onClick={exportData} disabled={selectedMetrics.length === 0}>
              <IconDownload />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            startIcon={<IconAdd />}
            onClick={handleAddMetric}
            disabled={selectedMetrics.length >= COLORS.length}
          >
            Add Metric
          </Button>
        </Container>
      </Container>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Selected Metrics
              </Typography>
              <Container sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {selectedMetrics.map((metric, index) => (
                  <Container key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Select fullWidth size="small">
                      <SelectItem value={metric.metric} label={`Metric ${index + 1}`}>
                        {Object.entries(METRIC_TYPES).map(([category, metrics]) => (
                          Object.entries(metrics).map(([key, value]) => (
                            <SelectItem key={value} value={value}>
                              {category} - {key}
                            </SelectItem>
                          ))
                        ))}
                      </SelectItem>
                    </Select>
                    <IconButton 
                      size="small" 
                      onClick={() => handleRemoveMetric(index)}
                      sx={{ color: metric.color }}
                    >
                      <IconDelete />
                    </IconButton>
                  </Container>
                ))}
              </Container>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={9}>
          <Card>
            <CardContent>
              {loading ? (
                <Container sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <Spinner />
                </Container>
              ) : selectedMetrics.length === 0 ? (
                <Typography color="textSecondary" align="center">
                  Add metrics to compare
                </Typography>
              ) : (
                <Container sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="timestamp"
                        tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                      />
                      <YAxis />
                      <RechartsTooltip
                        labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
                      />
                      <Legend />
                      <Brush dataKey="timestamp" height={30} stroke="#8884d8" />
                      {selectedMetrics.map((metric) => (
                        <Line
                          key={metric.metric}
                          type="monotone"
                          dataKey={metric.metric}
                          stroke={metric.color}
                          dot={false}
                          name={metric.metric.split('.').pop()}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Container>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}; 