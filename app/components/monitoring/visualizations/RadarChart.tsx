/**
 * @fileoverview Radar Chart Component
 * @version 1.0.0
 * @created 2024-03-21
 */

import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { Container, Card, CardBody, Text } from '@/components/ui';

interface RadarMetric {
  name: string;
  value: number;
  threshold: number;
  weight: number;
}

interface RadarChartProps {
  title: string;
  metrics: RadarMetric[];
  maxValue?: number;
  showThresholds?: boolean;
  showWeights?: boolean;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  title,
  metrics,
  maxValue = 100,
  showThresholds = true,
  showWeights = false
}) => {
  const chartData = metrics.map(metric => ({
    metric: metric.name,
    value: metric.value,
    threshold: metric.threshold,
    weight: metric.weight,
    fullMark: maxValue
  }));

  return (
    <Card>
      <CardBody>
        <Text variant="h6" gutterBottom>
          {title}
        </Text>
        <Container sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <RechartsRadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, maxValue]} />
              
              {/* Current Values */}
              <Radar
                name="Current"
                dataKey="value"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />

              {/* Thresholds */}
              {showThresholds && (
                <Radar
                  name="Threshold"
                  dataKey="threshold"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
              )}

              {/* Weights */}
              {showWeights && (
                <Radar
                  name="Weight"
                  dataKey="weight"
                  stroke="#ffc658"
                  fill="#ffc658"
                  fillOpacity={0.3}
                />
              )}

              <Legend />
              <Tooltip />
            </RechartsRadarChart>
          </ResponsiveContainer>
        </Container>
      </CardBody>
    </Card>
  );
}; 