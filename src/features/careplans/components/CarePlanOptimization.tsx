import React from 'react';
import {
  Box,
  Card,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UpdateIcon from '@mui/icons-material/Update';
import EventIcon from '@mui/icons-material/Event';
import OptimizeIcon from '@mui/icons-material/Optimize';
import GroupIcon from '@mui/icons-material/Group';

interface OptimizationSuggestion {
  immediateChanges: {
    suggestions: string[];
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    impact: string;
  };
  scheduledUpdates: {
    updates: Array<{
      description: string;
      dueDate: string;
      priority: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
  };
  resourceOptimization: {
    suggestions: string[];
    potentialSavings: string;
    implementationEffort: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  staffingRecommendations: {
    recommendations: Array<{
      role: string;
      change: 'INCREASE' | 'DECREASE' | 'MAINTAIN';
      justification: string;
    }>;
  };
}

interface CarePlanOptimizationProps {
  suggestions: OptimizationSuggestion;
}

const priorityColors = {
  HIGH: 'error',
  MEDIUM: 'warning',
  LOW: 'success'
};

export const CarePlanOptimization: React.FC<CarePlanOptimizationProps> = ({
  suggestions
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Care Plan Optimization
      </Typography>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={2}>
            <UpdateIcon color="primary" />
            <Typography variant="subtitle1">Immediate Changes</Typography>
            <Chip
              label={suggestions.immediateChanges.priority}
              color={priorityColors[suggestions.immediateChanges.priority]}
              size="small"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {suggestions.immediateChanges.suggestions.map((suggestion, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={suggestion}
                  secondary={`Impact: ${suggestions.immediateChanges.impact}`}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={2}>
            <EventIcon color="primary" />
            <Typography variant="subtitle1">Scheduled Updates</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {suggestions.scheduledUpdates.updates.map((update, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={update.description}
                  secondary={`Due: ${update.dueDate}`}
                />
                <Chip
                  label={update.priority}
                  color={priorityColors[update.priority]}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={2}>
            <OptimizeIcon color="primary" />
            <Typography variant="subtitle1">Resource Optimization</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography color="text.secondary" gutterBottom>
            Potential Savings: {suggestions.resourceOptimization.potentialSavings}
          </Typography>
          <Typography color="text.secondary" gutterBottom>
            Implementation Effort:{' '}
            <Chip
              label={suggestions.resourceOptimization.implementationEffort}
              color={priorityColors[suggestions.resourceOptimization.implementationEffort]}
              size="small"
            />
          </Typography>
          <List dense>
            {suggestions.resourceOptimization.suggestions.map((suggestion, index) => (
              <ListItem key={index}>
                <ListItemText primary={suggestion} />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box display="flex" alignItems="center" gap={2}>
            <GroupIcon color="primary" />
            <Typography variant="subtitle1">Staffing Recommendations</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List dense>
            {suggestions.staffingRecommendations.recommendations.map((rec, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${rec.role}: ${rec.change}`}
                  secondary={rec.justification}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
