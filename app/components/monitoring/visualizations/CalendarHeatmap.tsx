/**
 * @fileoverview Calendar Heatmap Component
 * @version 1.0.0
 * @created 2024-03-21
 */

import React from 'react';
import { Card, CardContent, Text } from '@/components/ui';
import { ResponsiveCalendar } from '@nivo/calendar';

interface CalendarData {
  day: string; // format: 'YYYY-MM-DD'
  value: number;
}

interface CalendarHeatmapProps {
  title: string;
  data: CalendarData[];
  from: string;
  to: string;
  emptyColor?: string;
  colors?: string[];
  minValue?: number;
  maxValue?: number;
  dayBorderWidth?: number;
  dayBorderColor?: string;
  daySpacing?: number;
  legendFormat?: (value: number) => string;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  title,
  data,
  from,
  to,
  emptyColor = '#eeeeee',
  colors = ['#61cdbb', '#97e3d5', '#e8c1a0', '#f47560'],
  minValue,
  maxValue,
  dayBorderWidth = 1,
  dayBorderColor = '#ffffff',
  daySpacing = 2,
  legendFormat = value => `${value}`
}) => {
  return (
    <Card>
      <CardContent>
        <Text variant="h6" gutterBottom>
          {title}
        </Text>
        <div style={{ height: 200 }}>
          <ResponsiveCalendar
            data={data}
            from={from}
            to={to}
            emptyColor={emptyColor}
            colors={colors}
            minValue={minValue}
            maxValue={maxValue}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            yearSpacing={40}
            monthBorderColor="#ffffff"
            dayBorderWidth={dayBorderWidth}
            dayBorderColor={dayBorderColor}
            daySpacing={daySpacing}
            legends={[
              {
                anchor: 'bottom-right',
                direction: 'row',
                translateY: 36,
                itemCount: 4,
                itemWidth: 42,
                itemHeight: 36,
                itemsSpacing: 14,
                itemDirection: 'right-to-left'
              }
            ]}
            tooltip={(data) => (
              <div
                style={{
                  background: 'white',
                  padding: '9px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                <Text variant="body2">
                  {new Date(data.day).toLocaleDateString()}
                </Text>
                <Text variant="body2" color="textSecondary">
                  Value: {legendFormat(data.value)}
                </Text>
              </div>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}; 
