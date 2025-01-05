/**
 * @fileoverview Advanced Metrics Component
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
  Tabs,
  TabPanel,
  Container,
} from '@/components/ui';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { HeatMapGrid } from '@nivo/heatmap';
import { Line } from 'react-chartjs-2';
import { monitoring, METRIC_TYPES } from '../../lib/monitoring';

interface MetricData {
  timestamp: number;
  value: number;
}

interface CorrelationData {
  metric1: string;
  metric2: string;
  correlation: number;
  scatterData: Array<{ x: number; y: number }>;
}

interface ForecastData {
  timestamp: number;
  actual: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Container sx={{ p: 3 }}>{children}</Container>}
  </div>
);

export const AdvancedMetrics: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [correlationData, setCorrelationData] = useState<CorrelationData[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  useEffect(() => {
    if (selectedMetrics.length > 0) {
      fetchData();
    }
  }, [selectedMetrics, timeRange]);

  const fetchData = async () => {
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

      // Fetch metric data
      const metricsData = await Promise.all(
        selectedMetrics.map(metric => 
          monitoring.getMetrics(metric, startTime, endTime)
        )
      );

      // Calculate correlations
      const correlations = calculateCorrelations(metricsData, selectedMetrics);
      setCorrelationData(correlations);

      // Generate heatmap data
      const heatmap = generateHeatmapData(correlations);
      setHeatmapData(heatmap);

      // Generate forecasts
      const forecasts = await Promise.all(
        selectedMetrics.map(metric =>
          monitoring.getForecast(metric, startTime, endTime)
        )
      );
      setForecastData(forecasts.flat());

      setError(null);
    } catch (err) {
      setError('Failed to fetch metric data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCorrelations = (
    metricsData: MetricData[][],
    metricNames: string[]
  ): CorrelationData[] => {
    const correlations: CorrelationData[] = [];

    for (let i = 0; i < metricsData.length; i++) {
      for (let j = i + 1; j < metricsData.length; j++) {
        const data1 = metricsData[i];
        const data2 = metricsData[j];

        // Calculate Pearson correlation
        const correlation = calculatePearsonCorrelation(
          data1.map(d => d.value),
          data2.map(d => d.value)
        );

        // Generate scatter plot data
        const scatterData = data1.map((d, index) => ({
          x: d.value,
          y: data2[index]?.value
        }));

        correlations.push({
          metric1: metricNames[i],
          metric2: metricNames[j],
          correlation,
          scatterData
        });
      }
    }

    return correlations;
  };

  const calculatePearsonCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt(
      (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
    );

    return denominator === 0 ? 0 : numerator / denominator;
  };

  const generateHeatmapData = (correlations: CorrelationData[]) => {
    const uniqueMetrics = Array.from(
      new Set(correlations.flatMap(c => [c.metric1, c.metric2]))
    );

    return uniqueMetrics.map(metric1 => ({
      metric: metric1,
      ...Object.fromEntries(
        uniqueMetrics.map(metric2 => [
          metric2,
          metric1 === metric2
            ? 1
            : correlations.find(
                c =>
                  (c.metric1 === metric1 && c.metric2 === metric2) ||
                  (c.metric1 === metric2 && c.metric2 === metric1)
              )?.correlation || 0
        ])
      )
    }));
  };

  const renderCorrelationScatterPlots = () => (
    <Container sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
      {correlationData.map((correlation, index) => (
        <Card key={index}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {correlation.metric1.split('.').pop()} vs {correlation.metric2.split('.').pop()}
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              Correlation: {correlation.correlation.toFixed(3)}
            </Typography>
            <Container sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="x" 
                    name={correlation.metric1.split('.').pop()} 
                    type="number" 
                  />
                  <YAxis 
                    dataKey="y" 
                    name={correlation.metric2.split('.').pop()} 
                    type="number" 
                  />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter
                    name={`${correlation.metric1} vs ${correlation.metric2}`}
                    data={correlation.scatterData}
                    fill="#8884d8"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </Container>
          </CardContent>
        </Card>
      ))}
    </Container>
  );

  const renderHeatmap = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Correlation Heatmap
        </Typography>
        <Container sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <HeatMapGrid
              data={heatmapData}
              keys={selectedMetrics.map(m => m.split('.').pop() || '')}
              indexBy="metric"
              colors={{
                type: 'diverging',
                divergeAt: 0.5,
                scheme: 'red_yellow_blue'
              }}
              axisTop={{
                tickRotation: -45
              }}
              axisRight={null}
              cellOpacity={1}
              labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
              cellShape="circle"
              enableLabels
              cellHoverOtherId={null}
              theme={{
                tooltip: {
                  container: {
                    background: 'white',
                    color: 'inherit',
                    fontSize: 'inherit',
                    borderRadius: '2px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.25)',
                    padding: '5px 9px'
                  }
                }
              }}
            />
          </ResponsiveContainer>
        </Container>
      </CardContent>
    </Card>
  );

  const renderForecasts = () => (
    <Container sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
      {selectedMetrics.map((metric, index) => {
        const metricForecasts = forecastData.filter(f => f.metric === metric);
        return (
          <Card key={index}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {metric.split('.').pop()} Forecast
              </Typography>
              <Container sx={{ height: 300 }}>
                <Line
                  data={{
                    labels: metricForecasts.map(f => 
                      new Date(f.timestamp).toLocaleTimeString()
                    ),
                    datasets: [
                      {
                        label: 'Actual',
                        data: metricForecasts.map(f => f.actual),
                        borderColor: '#2196f3',
                        fill: false
                      },
                      {
                        label: 'Predicted',
                        data: metricForecasts.map(f => f.predicted),
                        borderColor: '#4caf50',
                        borderDash: [5, 5],
                        fill: false
                      },
                      {
                        label: 'Confidence Interval',
                        data: metricForecasts.map(f => f.upperBound),
                        borderColor: 'rgba(76, 175, 80, 0.1)',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: '+1'
                      },
                      {
                        label: 'Confidence Interval',
                        data: metricForecasts.map(f => f.lowerBound),
                        borderColor: 'rgba(76, 175, 80, 0.1)',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: false
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Time'
                        }
                      },
                      y: {
                        display: true,
                        title: {
                          display: true,
                          text: 'Value'
                        }
                      }
                    }
                  }}
                />
              </Container>
            </CardContent>
          </Card>
        );
      })}
    </Container>
  );

  return (
    <Container sx={{ p: 3 }}>
      <Container sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Advanced Metric Analysis
        </Typography>
        <Container sx={{ display: 'flex', gap: 2 }}>
          <Select
            size="small"
            sx={{ minWidth: 120 }}
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <SelectItem value="hour">Last Hour</SelectItem>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
          </Select>
        </Container>
      </Container>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Correlations" />
          <Tab label="Heatmap" />
          <Tab label="Forecasting" />
        </Tabs>
      </Card>

      {loading ? (
        <Container sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <Spinner />
        </Container>
      ) : (
        <>
          <TabPanel value={selectedTab} index={0}>
            {renderCorrelationScatterPlots()}
          </TabPanel>
          <TabPanel value={selectedTab} index={1}>
            {renderHeatmap()}
          </TabPanel>
          <TabPanel value={selectedTab} index={2}>
            {renderForecasts()}
          </TabPanel>
        </>
      )}
    </Container>
  );
}; 
