import React from 'react';
import { Box, Card, Typography, Grid, LinearProgress } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

interface CareNeedPrediction {
  timeframe: 'shortTerm' | 'mediumTerm' | 'longTerm';
  predictions: Array<{
    category: string;
    likelihood: number;
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    recommendedActions: string[];
  }>;
}

interface PredictiveCareNeedsProps {
  predictions: {
    shortTerm: CareNeedPrediction[];
    mediumTerm: CareNeedPrediction[];
    longTerm: CareNeedPrediction[];
  };
}

const timeframeLabels = {
  shortTerm: '0-30 Days',
  mediumTerm: '1-6 Months',
  longTerm: '6+ Months'
};

const impactColors = {
  HIGH: '#f44336',
  MEDIUM: '#ff9800',
  LOW: '#2196f3'
};

export const PredictiveCareNeeds: React.FC<PredictiveCareNeedsProps> = ({ predictions }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Predictive Care Needs Analysis
      </Typography>
      <Timeline position="alternate">
        {Object.entries(predictions).map(([timeframe, predictionList]) => (
          <TimelineItem key={timeframe}>
            <TimelineSeparator>
              <TimelineDot color={timeframe === 'shortTerm' ? 'error' : timeframe === 'mediumTerm' ? 'warning' : 'info'} />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Card sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {timeframeLabels[timeframe]}
                </Typography>
                <Grid container spacing={2}>
                  {predictionList.map((prediction, index) => (
                    <Grid item xs={12} key={index}>
                      <Box mb={2}>
                        <Typography variant="subtitle1" gutterBottom>
                          {prediction.category}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <LinearProgress
                            variant="determinate"
                            value={prediction.likelihood * 100}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: impactColors[prediction.impact]
                              },
                              flexGrow: 1
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(prediction.likelihood * 100)}%
                          </Typography>
                        </Box>
                        <Typography color="text.secondary" paragraph>
                          {prediction.description}
                        </Typography>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Recommended Actions:
                          </Typography>
                          <ul>
                            {prediction.recommendedActions.map((action, i) => (
                              <li key={i}>
                                <Typography variant="body2">{action}</Typography>
                              </li>
                            ))}
                          </ul>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};
