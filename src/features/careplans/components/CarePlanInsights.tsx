import React from 'react';
import { Box, Card, Typography, Chip, List, ListItem, ListItemText } from '@mui/material';
import { CarePlanInsight } from '../services/advancedCarePlanService';

interface CarePlanInsightsProps {
  insights: CarePlanInsight[];
}

const priorityColors = {
  HIGH: 'error',
  MEDIUM: 'warning',
  LOW: 'info'
};

const typeIcons = {
  RISK: '⚠️',
  IMPROVEMENT: '📈',
  DECLINE: '📉',
  PATTERN: '🔄'
};

export const CarePlanInsights: React.FC<CarePlanInsightsProps> = ({ insights }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Care Plan Insights
      </Typography>
      <List>
        {insights.map((insight, index) => (
          <Card key={index} sx={{ mb: 2, p: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography variant="subtitle1">
                {typeIcons[insight.type]} {insight.category}
              </Typography>
              <Chip
                label={insight.priority}
                color={priorityColors[insight.priority] as any}
                size="small"
              />
              <Chip
                label={`${Math.round(insight.confidence * 100)}% confidence`}
                variant="outlined"
                size="small"
              />
            </Box>
            <Typography color="text.secondary" paragraph>
              {insight.description}
            </Typography>
            <Box mb={2}>
              <Typography variant="subtitle2">Evidence:</Typography>
              <List dense>
                {insight.evidence.map((item, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={item} />
                  </ListItem>
                ))}
              </List>
            </Box>
            <Box>
              <Typography variant="subtitle2">Suggested Actions:</Typography>
              <List dense>
                {insight.suggestedActions.map((action, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={action} />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Card>
        ))}
      </List>
    </Box>
  );
};
