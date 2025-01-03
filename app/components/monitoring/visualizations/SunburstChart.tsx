/**
 * @fileoverview Sunburst Chart Component
 * @version 1.0.0
 * @created 2024-03-21
 */

import React from 'react';
import { Container, Card, CardBody, Text } from '@/components/ui';
import { ResponsiveSunburst } from '@nivo/sunburst';

interface SunburstNode {
  id: string;
  value: number;
  color?: string;
  children?: SunburstNode[];
}

interface SunburstChartProps {
  title: string;
  data: SunburstNode;
  valueFormat?: string;
  colorScheme?: string;
  cornerRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  enableArcLabels?: boolean;
  arcLabel?: string | ((arc: any) => string);
  arcLabelsRadiusOffset?: number;
  arcLabelsSkipAngle?: number;
  arcLabelsTextColor?: string;
  interactive?: boolean;
  motionConfig?: 'default' | 'gentle' | 'wobbly' | 'stiff';
  onClick?: (node: any) => void;
}

export const SunburstChart: React.FC<SunburstChartProps> = ({
  title,
  data,
  valueFormat = ".2s",
  colorScheme = "nivo",
  cornerRadius = 2,
  borderWidth = 1,
  borderColor = "white",
  enableArcLabels = true,
  arcLabel = "formattedValue",
  arcLabelsRadiusOffset = 0.5,
  arcLabelsSkipAngle = 10,
  arcLabelsTextColor = { from: 'color', modifiers: [['darker', 2]] },
  interactive = true,
  motionConfig = 'gentle',
  onClick
}) => {
  return (
    <Card>
      <CardBody>
        <Text variant="h6" gutterBottom>
          {title}
        </Text>
        <Container sx={{ height: 400 }}>
          <ResponsiveSunburst
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            id="id"
            value="value"
            valueFormat={valueFormat}
            cornerRadius={cornerRadius}
            borderWidth={borderWidth}
            borderColor={borderColor}
            colors={{ scheme: colorScheme }}
            childColor={{
              from: 'color',
              modifiers: [['brighter', 0.3]]
            }}
            enableArcLabels={enableArcLabels}
            arcLabel={arcLabel}
            arcLabelsRadiusOffset={arcLabelsRadiusOffset}
            arcLabelsSkipAngle={arcLabelsSkipAngle}
            arcLabelsTextColor={arcLabelsTextColor}
            animate={true}
            motionConfig={motionConfig}
            isInteractive={interactive}
            onClick={onClick}
            tooltip={({ id, value, color }) => (
              <Container
                sx={{
                  background: 'white',
                  padding: '9px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                <Text variant="body2" sx={{ color }}>
                  {id}
                </Text>
                <Text variant="body2" color="textSecondary">
                  Value: {value}
                </Text>
              </Container>
            )}
          />
        </Container>
      </CardBody>
    </Card>
  );
}; 
