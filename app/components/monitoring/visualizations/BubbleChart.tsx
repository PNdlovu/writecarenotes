/**
 * @fileoverview Bubble Chart Component
 * @version 1.0.0
 * @created 2024-03-21
 */

import React from 'react';
import { Container, Card, CardBody, Text } from '@/components/ui';
import { ResponsiveBubble } from '@nivo/circle-packing';

interface BubbleNode {
  id: string;
  value: number;
  color?: string;
  children?: BubbleNode[];
}

interface BubbleChartProps {
  title: string;
  data: BubbleNode;
  valueFormat?: string;
  colorScheme?: string;
  padding?: number;
  borderWidth?: number;
  borderColor?: string;
  enableLabel?: boolean;
  labelTextColor?: string;
  labelSkipRadius?: number;
  interactive?: boolean;
  motionConfig?: 'default' | 'gentle' | 'wobbly' | 'stiff';
  onClick?: (node: any) => void;
}

export const BubbleChart: React.FC<BubbleChartProps> = ({
  title,
  data,
  valueFormat = ".2s",
  colorScheme = "nivo",
  padding = 4,
  borderWidth = 1,
  borderColor = { from: 'color', modifiers: [['darker', 0.3]] },
  enableLabel = true,
  labelTextColor = { from: 'color', modifiers: [['darker', 2]] },
  labelSkipRadius = 8,
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
          <ResponsiveBubble
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            identity="id"
            value="value"
            valueFormat={valueFormat}
            colors={{ scheme: colorScheme }}
            padding={padding}
            borderWidth={borderWidth}
            borderColor={borderColor}
            enableLabel={enableLabel}
            labelTextColor={labelTextColor}
            labelSkipRadius={labelSkipRadius}
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
